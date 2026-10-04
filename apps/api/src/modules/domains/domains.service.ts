import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql, type SQL } from 'drizzle-orm';
import { isUnderPreviewBase } from '../../common/preview/preview-url';
import { type Database, DATABASE } from '../../database/database.module';
import { EmailOutboxService } from '../email/application/email-outbox.service';
import { isDefinitiveDomainPurchaseFailure } from '../email/domain/email-kinds';
import {
  DNS_PROVIDER_PORT,
  type DnsProviderName,
  type DnsProviderPort,
  type DnsRecord,
} from './domain/dns-provider.port';
import {
  REGISTRAR_PORT,
  type RegisteredDomain,
  type RegistrarPort,
  type RegistrationState,
} from './domain/registrar.port';
import {
  ConnectDomainResponseDto,
  DomainJobStatusDto,
  DomainQuoteResponseDto,
  DomainSearchResultDto,
  DomainStatusResponseDto,
  type DnsStatus,
  type DomainJobErrorCode,
  type DomainJobStatus,
  type DomainSourceValue,
} from './dto/domains.response.dto';
import { PurchaseDomainDto } from './dto/purchase-domain.dto';
import {
  DomainAgreementsRequiredException,
  DomainJobNotFoundException,
  DomainNotAllowedException,
  DomainNotAvailableException,
  DomainNotCoveredByPlanException,
  DomainPriceChangedException,
  DomainPurchaseInProgressException,
  DomainsTenantNotFoundException,
  PurchasePipelineException,
  TenantAlreadyHasDomainException,
} from './domains.exceptions';
import { classifyProviderFailure } from './provider-failure';
import { VercelDomainsService } from './vercel-domains.service';

const SEARCH_TLDS = ['com', 'com.mx', 'mx', 'net', 'org'];

// Openprovider only stores 900/3600/10800/21600/43200/86400; anything else becomes 86400.
const DNS_TTL = 900;

// Openprovider has no registration agreements, so Lattiz's own terms are the only one.
const LATTIZ_TERMS = {
  agreementType: 'LATTIZ_TERMS',
  title: 'Términos y condiciones de Lattiz',
  url: 'https://www.lattiz.app/terms',
};

const REGISTRATION_POLL_INTERVAL_MS = 3000;
const REGISTRATION_POLL_MAX_ATTEMPTS = 20;

// A running purchase touches its job row at every step, so silence this long means its process died.
const STALE_JOB_MINUTES = 10;
// Cloudflare Free allows one activation check per zone per hour.
const ACTIVATION_CHECK_INTERVAL_MINUTES = 60;

interface DomainRow {
  id: string;
  tenant_id: string;
  domain: string;
  source: DomainSourceValue;
  tld: string;
  registrar_domain_id: string | null;
  annual_cost_usd_cents: number;
  period_years: number;
  expires_at: string | Date | null;
  dns_status: DnsStatus;
  vercel_domain_id: string | null;
  vercel_mapped: boolean;
  ssl_active: boolean;
  is_mock: boolean;
  purchase_completed_at: string | Date | null;
  suspended_at: string | Date | null;
  released_at: string | Date | null;
  dns_provider: DnsProviderName | null;
  dns_zone_id: string | null;
}

interface JobRow {
  id: string;
  domain: string;
  status: DomainJobStatus;
  steps_completed: string[];
  error_code: DomainJobErrorCode | null;
  error_step: string | null;
}

interface PipelineParams {
  period: number;
  /** Set when the domain is already in the registrar account: resume instead of registering again. */
  registered: RegisteredDomain | null;
}

/**
 * Orchestrates the registrar (purchase), the DNS provider, Vercel (mapping + SSL) and the DB.
 * State is persisted BEFORE each external call so a dead process can retry safely.
 */
@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);
  private readonly maxCostCents: number;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(REGISTRAR_PORT) private readonly registrar: RegistrarPort,
    @Inject(DNS_PROVIDER_PORT) private readonly dns: DnsProviderPort,
    private readonly vercel: VercelDomainsService,
    private readonly emails: EmailOutboxService,
    configService: ConfigService,
  ) {
    this.maxCostCents = parseInt(
      configService.get<string>('DOMAIN_MAX_COST_USD_CENTS') ?? '2000',
      10,
    );
  }

  // ── Search ────────────────────────────────────────────────────────────────
  async searchDomains(query: string): Promise<DomainSearchResultDto[]> {
    const base = query
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9-]/g, '');
    const candidates = SEARCH_TLDS.map((tld) => `${base}.${tld}`);

    // One call per candidate so a slow or failing TLD (.mx) never hides the others.
    const results = await Promise.allSettled(
      candidates.map((d) => this.registrar.checkAvailability(d)),
    );

    const found: DomainSearchResultDto[] = [];
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        this.logger.warn(
          `Availability check failed for ${candidates[i]}: ${String(r.reason)}`,
        );
        return;
      }
      const price = r.value.priceUsdCents;
      found.push({
        domain: candidates[i],
        available: r.value.available,
        priceUsdCents: price ?? 0,
        coveredByPlan: price !== null && price <= this.maxCostCents,
      });
    });
    return found;
  }

  // ── Quote ─────────────────────────────────────────────────────────────────
  async getQuote(domain: string): Promise<DomainQuoteResponseDto> {
    const { available } = await this.registrar.checkAvailability(domain);
    const [price, renewalPrice] = available
      ? await Promise.all([
          this.registrar.getPriceUsdCents(domain, 'create'),
          this.registrar.getPriceUsdCents(domain, 'renew'),
        ])
      : [0, 0];
    return {
      domain,
      available,
      priceUsdCents: price,
      renewalPriceUsdCents: renewalPrice,
      coveredByPlan: available && price <= this.maxCostCents,
      requiredAgreements: [LATTIZ_TERMS],
      irreversible: true,
    };
  }

  // ── Purchase — async pipeline ─────────────────────────────────────────────
  /** Returns a jobId immediately; the pipeline runs in the background. */
  async initiatePurchase(
    userSub: string,
    params: PurchaseDomainDto,
  ): Promise<{ jobId: string }> {
    const accepted = new Set(params.agreementTypes);
    if (accepted.size !== 1 || !accepted.has(LATTIZ_TERMS.agreementType)) {
      throw new DomainAgreementsRequiredException();
    }

    const tenantId = await this.getTenantIdByUserSub(userSub);

    // Claimed before anything destructive: a double click or concurrent request must not run a second pipeline.
    const claim = await this.claimPurchaseJob(tenantId, params.domain);
    if (!claim.created) return { jobId: claim.jobId };
    const { jobId } = claim;

    let registered: RegisteredDomain | null;
    try {
      registered = await this.preparePurchase(tenantId, params);
    } catch (err) {
      // Rejected synchronously: the caller gets the HTTP error and never sees this job.
      await this.discardJob(jobId);
      throw err;
    }

    void this.runPurchasePipeline(jobId, tenantId, params.domain, {
      period: 1,
      registered,
    });

    return { jobId };
  }

  /** Validates the purchase and persists its row; returns the registrar-side domain when resuming. */
  private async preparePurchase(
    tenantId: string,
    params: PurchaseDomainDto,
  ): Promise<RegisteredDomain | null> {
    let existing = await this.getDomainByTenant(tenantId);
    // A released domain no longer belongs to the tenant, so it must not block a new one.
    if (existing?.released_at) {
      await this.deleteDomainRecord(existing, { keepZone: false });
      existing = null;
    }
    if (existing?.purchase_completed_at) {
      throw new TenantAlreadyHasDomainException();
    }

    // Find-before-create: a domain already in our account is either this tenant's
    // interrupted purchase (resume, no new charge) or someone else's (reject).
    const found = await this.registrar.findDomain(params.domain);
    const registered = found && found.status !== 'failed' ? found : null;
    if (registered && existing?.domain !== params.domain) {
      throw new DomainNotAvailableException(params.domain);
    }

    const quote = registered
      ? null
      : await this.assertPurchasable(params.domain, params.priceUsdCents);

    if (existing && !registered) {
      await this.deleteDomainRecord(existing, {
        keepZone: existing.domain === params.domain,
      });
    }

    if (quote) {
      // Persisted BEFORE registering so a dead process leaves a resumable row.
      await this.createDomainRecord({
        tenantId,
        domain: params.domain,
        tld: '.' + params.domain.split('.').slice(1).join('.'),
        priceUsdCents: quote.priceUsdCents,
        renewalPriceUsdCents: quote.renewalPriceUsdCents,
        agreementTypes: params.agreementTypes,
        agreedAt: params.agreedAt,
        isMock: this.registrar.isMockMode,
        source: 'lattiz_managed',
      });
    }
    return registered;
  }

  /** Re-checks availability and price right before spending money. */
  private async assertPurchasable(
    domain: string,
    acceptedPriceUsdCents: number,
  ): Promise<{ priceUsdCents: number; renewalPriceUsdCents: number }> {
    const { available } = await this.registrar.checkAvailability(domain);
    if (!available) throw new DomainNotAvailableException(domain);

    const [priceUsdCents, renewalPriceUsdCents] = await Promise.all([
      this.registrar.getPriceUsdCents(domain, 'create'),
      this.registrar.getPriceUsdCents(domain, 'renew'),
    ]);
    if (priceUsdCents > acceptedPriceUsdCents) {
      throw new DomainPriceChangedException(
        priceUsdCents,
        acceptedPriceUsdCents,
      );
    }
    if (priceUsdCents > this.maxCostCents) {
      throw new DomainNotCoveredByPlanException();
    }
    return { priceUsdCents, renewalPriceUsdCents };
  }

  // ── Pipeline (background, no HTTP context) ────────────────────────────────
  private async runPurchasePipeline(
    jobId: string,
    tenantId: string,
    domain: string,
    params: PipelineParams,
  ): Promise<void> {
    const step = async (
      name: DomainJobStatus,
      fn: () => Promise<void>,
    ): Promise<void> => {
      await this.updateJobStatus(jobId, name);
      try {
        await fn();
        await this.addCompletedStep(jobId, name);
      } catch (err) {
        const code = failureCode(name, err);
        // Technical detail stays in the logs; the job only carries the stable code.
        this.logger.error(
          `Pipeline step "${name}" failed for job ${jobId} (${code}): ${String(err)}`,
        );
        // Row state first: a terminal job is the signal that nothing is still being written.
        await this.setDnsStatus(domain, 'error');
        await this.failJob(jobId, name, code);
        if (isDefinitiveDomainPurchaseFailure(code)) {
          await this.emails.enqueueForTenant(
            'domain_purchase_failed',
            tenantId,
            { domain },
            `domain_purchase_failed:${jobId}`,
          );
        }
        throw err;
      }
    };

    try {
      await step('purchasing', async () => {
        // Zone first so the registrar delegates to the nameservers this DNS provider assigned.
        const nameservers = await this.prepareZone(domain, params.registered);
        const registration =
          params.registered ??
          (await this.register(domain, params.period, nameservers));
        // Persist the registrar id BEFORE polling so a crash can't orphan a paid domain.
        await this.setRegistrarDomainId(domain, registration.id);
        const done = await this.waitForRegistration(registration);
        if (done.status === 'failed') {
          // The registrar itself says the registration is dead: nothing was bought.
          await this.abandonZone(domain);
          throw new PurchasePipelineException(
            await this.rejectionCode(domain),
            'Registrar reported the registration as FAILED',
          );
        }
        await this.markDomainActive(domain, done.renewalDate);
      });

      await step('configuring_dns', async () => {
        await this.setDnsStatus(domain, 'configuring');
        await this.dns.upsertRecords(
          domain,
          await this.buildDnsRecords(domain),
        );
        await this.setDnsStatus(domain, 'propagating');
      });

      await step('registering_vercel', async () => {
        const result = await this.vercel.addDomain(domain);
        await this.markVercelMapped(domain, result.name);
        await this.updateTenantDomain(tenantId, domain);
      });

      await this.updateJobStatus(jobId, 'completed');
      this.logger.log(
        `Domain provisioning completed: ${domain} (job: ${jobId})`,
      );
    } catch {
      // Error already logged and persisted by step().
    }
  }

  /** Finds or creates the DNS zone and records it on the row; nothing has been bought yet if this fails. */
  private async prepareZone(
    domain: string,
    registered: RegisteredDomain | null,
  ): Promise<string[]> {
    let zone;
    try {
      zone = await this.dns.ensureZone(domain);
    } catch (err) {
      throw this.providerFailure(err, 'DNS zone creation', {
        transient: 'DNS_PROVIDER_UNAVAILABLE',
        rejected: 'DNS_ZONE_REJECTED',
      });
    }
    if (registered) {
      const previous = await this.query<{ dns_zone_id: string | null }>(
        sql`SELECT dns_zone_id FROM public.domains WHERE domain = ${domain}`,
      );
      const previousId = previous[0]?.dns_zone_id ?? null;
      // A recreated zone gets new nameservers; re-delegate BEFORE storing its id so a failed update is retried on resume.
      if (previousId !== zone.zoneId) {
        this.logger.warn(
          `[dns] Zone for already-registered ${domain} changed (${previousId ?? 'none'} -> ${zone.zoneId}); updating registrar nameservers.`,
        );
        try {
          await this.registrar.setNameservers(registered.id, zone.nameservers);
        } catch (err) {
          throw this.providerFailure(err, 'Nameserver update', {
            transient: 'REGISTRAR_UNAVAILABLE',
            rejected: 'REGISTRATION_PENDING',
          });
        }
      }
    }
    await this.setDnsZone(domain, this.dns.provider, zone.zoneId);
    return zone.nameservers;
  }

  private async register(
    domain: string,
    periodYears: number,
    nameservers: string[],
  ): Promise<RegisteredDomain> {
    try {
      return await this.registrar.registerDomain({
        domain,
        periodYears,
        nameservers,
      });
    } catch (err) {
      throw await this.registrationFailure(domain, err);
    }
  }

  /**
   * The zone is deleted ONLY when it is certain no domain exists in our registrar account:
   * a refused request AND a lookup that finds nothing. Timeouts, 5xx and failed lookups keep it
   * for the resume path (or the sweeper), because the registration may have gone through.
   */
  private async registrationFailure(
    domain: string,
    err: unknown,
  ): Promise<Error> {
    const kind = classifyProviderFailure(err);
    const detail = `Domain registration failed: ${String(err)}`;
    if (kind === 'unknown') return err as Error;
    if (kind === 'transient') {
      return new PurchasePipelineException('REGISTRAR_UNAVAILABLE', detail);
    }

    const held = await this.registrarHoldsDomain(domain);
    if (held === null) {
      return new PurchasePipelineException(
        kind === 'config'
          ? 'SERVICE_CONFIGURATION_ERROR'
          : 'REGISTRAR_UNAVAILABLE',
        detail,
      );
    }
    // The registrar errored but the domain is in our account: it is being (or was) registered.
    if (held)
      return new PurchasePipelineException('REGISTRATION_PENDING', detail);

    await this.abandonZone(domain);
    return new PurchasePipelineException(
      kind === 'config'
        ? 'SERVICE_CONFIGURATION_ERROR'
        : await this.rejectionCode(domain),
      detail,
    );
  }

  /** True/false from the registrar, null when it cannot be asked. */
  private async registrarHoldsDomain(domain: string): Promise<boolean | null> {
    try {
      const found = await this.registrar.findDomain(domain);
      return found !== null && found.status !== 'failed';
    } catch (err) {
      this.logger.warn(
        `[purchase] Could not verify ${domain} at the registrar: ${String(err)}`,
      );
      return null;
    }
  }

  /** A refused registration of a name that is no longer free means someone else took it first. */
  private async rejectionCode(domain: string): Promise<DomainJobErrorCode> {
    try {
      const { available } = await this.registrar.checkAvailability(domain);
      return available ? 'REGISTRATION_REJECTED' : 'DOMAIN_NO_LONGER_AVAILABLE';
    } catch {
      return 'REGISTRATION_REJECTED';
    }
  }

  /** Deletes the zone of a purchase that definitively died. Failures are logged; the sweeper is the safety net. */
  private async abandonZone(domain: string): Promise<void> {
    try {
      await this.dns.deleteZone(domain);
      await this.clearDnsZone(domain);
    } catch (err) {
      this.logger.warn(
        `[purchase] Could not delete the zone of failed purchase ${domain} (sweeper will retry): ${String(err)}`,
      );
    }
  }

  /** Maps a provider failure to a pipeline exception; non-provider errors pass through unclassified. */
  private providerFailure(
    err: unknown,
    what: string,
    codes: { transient: DomainJobErrorCode; rejected: DomainJobErrorCode },
  ): Error {
    const kind = classifyProviderFailure(err);
    if (kind === 'unknown') return err as Error;
    const code =
      kind === 'config'
        ? 'SERVICE_CONFIGURATION_ERROR'
        : kind === 'rejected'
          ? codes.rejected
          : codes.transient;
    return new PurchasePipelineException(
      code,
      `${what} failed: ${String(err)}`,
    );
  }

  private async waitForRegistration(
    registration: RegisteredDomain,
  ): Promise<RegistrationState> {
    let state: RegistrationState = registration;
    for (let attempt = 0; state.status === 'pending'; attempt++) {
      if (attempt >= REGISTRATION_POLL_MAX_ATTEMPTS) {
        // Ambiguous: the registry may still complete it, so the zone stays and a retry resumes.
        throw new PurchasePipelineException(
          'REGISTRATION_PENDING',
          'Registrar registration still pending after the polling window',
        );
      }
      await sleep(REGISTRATION_POLL_INTERVAL_MS);
      try {
        state = await this.registrar.getRegistrationStatus(registration.id);
      } catch (err) {
        // The domain exists but we cannot read its state: keep everything.
        throw this.providerFailure(err, 'Registration status check', {
          transient: 'REGISTRAR_UNAVAILABLE',
          rejected: 'REGISTRAR_UNAVAILABLE',
        });
      }
    }
    return state;
  }

  /** Apex gets an A record and www a CNAME, using Vercel's recommended targets for this project. */
  private async buildDnsRecords(domain: string): Promise<DnsRecord[]> {
    const { ipv4, cname } = await this.vercel.getDnsTargets(domain);
    return [
      { type: 'A', name: '@', value: ipv4, ttl: DNS_TTL },
      { type: 'CNAME', name: 'www', value: cname, ttl: DNS_TTL },
    ];
  }

  // ── Connect a domain the tenant already owns ──────────────────────────────
  // No registrar involved — Lattiz only maps the domain in Vercel and hands the
  // tenant the DNS records to create at their registrar.
  async initiateConnect(
    userSub: string,
    domain: string,
  ): Promise<ConnectDomainResponseDto> {
    // Wildcard-covered: it would shadow the tenant's own preview address.
    if (isUnderPreviewBase(domain)) throw new DomainNotAllowedException();
    const tenantId = await this.getTenantIdByUserSub(userSub);

    const existing = await this.getDomainByTenant(tenantId);
    if (existing) {
      if (existing.purchase_completed_at && !existing.released_at) {
        throw new TenantAlreadyHasDomainException();
      }
      // Leftover of an incomplete attempt or a released domain — replace it.
      await this.deleteDomainRecord(existing, { keepZone: false });
    }

    const tld = '.' + domain.split('.').slice(1).join('.');
    const jobId = await this.createDomainJob(tenantId, domain, 'connect');

    await this.createDomainRecord({
      tenantId,
      domain,
      tld,
      priceUsdCents: null,
      renewalPriceUsdCents: null,
      agreementTypes: [],
      agreedAt: null,
      isMock: false,
      source: 'user_provided',
    });

    try {
      await this.updateJobStatus(jobId, 'registering_vercel');
      await this.vercel.addDomain(domain);
      await this.addCompletedStep(jobId, 'registering_vercel');
    } catch (err) {
      this.logger.error(
        `Connect failed for ${domain} (job ${jobId}): ${String(err)}`,
      );
      await this.failJob(jobId, 'registering_vercel', 'VERCEL_SETUP_FAILED');
      await this.setDnsStatus(domain, 'error');
      throw err;
    }

    await this.markVercelMapped(domain, domain);
    await this.setDnsStatus(domain, 'propagating');
    await this.updateTenantDomain(tenantId, domain);
    await this.updateJobStatus(jobId, 'completed');
    this.logger.log(`Domain connected: ${domain} (job: ${jobId})`);

    return { jobId, dnsInstructions: await this.buildDnsRecords(domain) };
  }

  // ── Job status (frontend polls this) ──────────────────────────────────────
  async getJobStatus(
    userSub: string,
    jobId: string,
  ): Promise<DomainJobStatusDto> {
    const tenantId = await this.getTenantIdByUserSub(userSub);
    const rows = await this.query<JobRow>(
      sql`SELECT id, domain, status, steps_completed, error_code, error_step
          FROM public.domain_jobs
          WHERE id = ${jobId}::uuid AND tenant_id = ${tenantId}::uuid
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new DomainJobNotFoundException();

    return {
      jobId: row.id,
      domain: row.domain,
      status: row.status,
      stepsCompleted: row.steps_completed,
      errorCode: row.error_code,
      errorStep: row.error_step,
    };
  }

  // ── Domain status (DNS propagation check) ─────────────────────────────────
  async checkDnsStatus(
    userSub: string,
  ): Promise<DomainStatusResponseDto | null> {
    const tenantId = await this.getTenantIdByUserSub(userSub);
    const domain = await this.getDomainByTenant(tenantId);
    // A released domain no longer belongs to the tenant.
    if (!domain || domain.released_at) return null;
    if (domain.dns_status === 'active') return toStatusDto(domain);

    if (domain.dns_status === 'propagating') {
      if (await this.dnsPropagated(domain.domain)) {
        // Vercel provisions SSL automatically once DNS validates.
        await this.query(
          sql`UPDATE public.domains
              SET dns_status = 'active', ssl_active = true
              WHERE domain = ${domain.domain}`,
        );
        await this.emails.enqueueForTenant(
          'domain_ready',
          tenantId,
          { domain: domain.domain },
          `domain_ready:${domain.id}`,
        );
        const fresh = await this.getDomainByTenant(tenantId);
        return fresh ? toStatusDto(fresh) : null;
      }
      await this.requestActivationCheckIfDue(domain);
    }

    return toStatusDto(domain);
  }

  /** Best-effort nudge so Cloudflare notices the nameserver change sooner; never fails the status poll. */
  private async requestActivationCheckIfDue(domain: DomainRow): Promise<void> {
    if (
      this.dns.provider !== 'cloudflare' ||
      domain.dns_provider !== this.dns.provider ||
      !domain.dns_zone_id
    ) {
      return;
    }
    try {
      // Claimed in the DB so concurrent polls and restarts still make at most one call per interval.
      const claimed = await this.query<{ id: string }>(
        sql`UPDATE public.domains
            SET dns_activation_checked_at = now()
            WHERE id = ${domain.id}::uuid
              AND (dns_activation_checked_at IS NULL
                   OR dns_activation_checked_at < now() - make_interval(mins => ${ACTIVATION_CHECK_INTERVAL_MINUTES}))
            RETURNING id`,
      );
      if (claimed.length === 0) return;
      await this.dns.requestActivationCheck(domain.domain);
    } catch (err) {
      this.logger.warn(
        `[dns] Activation check for ${domain.domain} failed (non-fatal): ${String(err)}`,
      );
    }
  }

  private async dnsPropagated(domain: string): Promise<boolean> {
    try {
      return await this.vercel.isDomainConfigured(domain);
    } catch {
      // DNS check failure is not critical — stay in 'propagating'.
      return false;
    }
  }

  // ── Suspension / relaunch ─────────────────────────────────────────────
  /**
   * Takes the tenant's site offline after their subscription lapsed by removing
   * only the Vercel mapping. The domains row, `tenants.domain` and the DNS
   * records all stay intact so `relaunchDomain` can restore service without
   * re-running the purchase/connect wizard. Idempotent.
   */
  async suspendDomainForTenant(tenantId: string): Promise<void> {
    const domain = await this.getDomainByTenant(tenantId);
    if (!domain || domain.released_at) return;

    // Non-fatal: removeDomain does not throw on an already-unmapped domain.
    try {
      await this.vercel.removeDomain(domain.domain);
    } catch (err) {
      this.logger.warn(
        `[suspend] Vercel unmap failed for ${domain.domain} (non-fatal): ${String(err)}`,
      );
    }

    // The registrar is deliberately untouched: the DNS records must survive for relaunch,
    // and autorenew is already off so an abandoned name lapses on its own.
    await this.markDomainSuspended(domain.id, tenantId);
    this.logger.log(
      `[suspend] Domain ${domain.domain} suspended for tenant ${tenantId}`,
    );
  }

  /**
   * Re-registers a suspended domain with Vercel. DNS was never touched, so this
   * skips the registrar entirely. Idempotent — shared by the billing webhooks, the
   * reconcile cron and `POST /domains/relaunch`. Throws on Vercel failure so
   * each caller picks its own retry policy.
   */
  async relaunchDomain(
    tenantId: string,
  ): Promise<{ relaunched: boolean; domain: string | null }> {
    const domain = await this.getDomainByTenant(tenantId);
    if (!domain) return { relaunched: false, domain: null };
    if (!domain.suspended_at || domain.released_at) {
      return { relaunched: false, domain: domain.domain };
    }

    this.logger.log(`[relaunch] Restoring Vercel mapping for ${domain.domain}`);
    if (!(await this.vercel.hasDomain(domain.domain))) {
      await this.vercel.addDomain(domain.domain);
    }
    await this.markDomainRelaunched(domain.id, tenantId, domain.domain);

    this.logger.log(`[relaunch] Success: ${domain.domain}`);
    return { relaunched: true, domain: domain.domain };
  }

  async relaunchDomainForUser(
    userSub: string,
  ): Promise<{ relaunched: boolean; domain: string | null }> {
    return this.relaunchDomain(await this.getTenantIdByUserSub(userSub));
  }

  // ── Release (the domain definitively leaves Lattiz) ──────────────────────
  /**
   * For a domain that is no longer ours to serve: lapse or non-renewal, definitive cancellation,
   * account deletion. Unmaps Vercel, deletes the DNS zone and marks the row released. Unlike
   * suspension this is NOT reversible by `relaunchDomain`. Idempotent; throws if the zone cannot be
   * deleted so the caller can retry (the row is only marked once the zone is gone).
   */
  async releaseDomain(
    tenantId: string,
  ): Promise<{ released: boolean; domain: string | null }> {
    const domain = await this.getDomainByTenant(tenantId);
    if (!domain) return { released: false, domain: null };

    try {
      await this.vercel.removeDomain(domain.domain);
    } catch (err) {
      this.logger.warn(
        `[release] Vercel unmap failed for ${domain.domain} (non-fatal): ${String(err)}`,
      );
    }
    await this.deleteStoredZone(domain);
    await this.markDomainReleased(domain, tenantId);

    this.logger.log(
      `[release] Domain ${domain.domain} released for tenant ${tenantId}`,
    );
    return { released: !domain.released_at, domain: domain.domain };
  }

  /** Account deletion: tenants and their domain rows are about to cascade away, so free the zones first. */
  async releaseDomainsForUser(userSub: string): Promise<void> {
    const tenants = await this.query<{ id: string }>(
      sql`SELECT id FROM public.tenants WHERE user_id = ${userSub}::uuid`,
    );
    for (const tenant of tenants) {
      try {
        await this.releaseDomain(tenant.id);
      } catch (err) {
        // Must not block the user's right to delete their account; the sweeper deletes the orphan zone.
        this.logger.error(
          `[release] Could not release the domain of tenant ${tenant.id} on account deletion: ${String(err)}`,
        );
      }
    }
  }

  /**
   * Deletes the zone recorded on the row. No-op for user_provided domains (no zone ever existed).
   * Zones of another provider than the active adapter are left alone: deleting by name would hit the wrong account.
   */
  private async deleteStoredZone(
    row: Pick<DomainRow, 'id' | 'domain' | 'dns_provider'>,
  ): Promise<void> {
    if (!row.dns_provider) return;
    if (row.dns_provider !== this.dns.provider) {
      this.logger.error(
        `[dns] ${row.domain} has a ${row.dns_provider} zone but the active provider is ${this.dns.provider}; delete it manually.`,
      );
      return;
    }
    await this.dns.deleteZone(row.domain);
    await this.clearDnsZone(row.domain);
  }

  // ── Private DB helpers ────────────────────────────────────────────────────
  private async getTenantIdByUserSub(userSub: string): Promise<string> {
    const rows = await this.query<{ id: string }>(
      sql`SELECT id FROM public.tenants WHERE user_id = ${userSub}::uuid LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new DomainsTenantNotFoundException();
    return row.id;
  }

  private async getDomainByTenant(tenantId: string): Promise<DomainRow | null> {
    const rows = await this.query<DomainRow>(
      sql`SELECT id, tenant_id, domain, source, tld, registrar_domain_id,
                 annual_cost_usd_cents, period_years,
                 expires_at, dns_status, vercel_domain_id, vercel_mapped,
                 ssl_active, is_mock, purchase_completed_at, suspended_at,
                 released_at, dns_provider, dns_zone_id
          FROM public.domains
          WHERE tenant_id = ${tenantId}::uuid
          LIMIT 1`,
    );
    return rows[0] ?? null;
  }

  private async createDomainRecord(params: {
    tenantId: string;
    domain: string;
    tld: string;
    priceUsdCents: number | null;
    renewalPriceUsdCents: number | null;
    agreementTypes: string[];
    agreedAt: string | null;
    isMock: boolean;
    source: DomainSourceValue;
  }): Promise<void> {
    const hasRenewalPrice = params.renewalPriceUsdCents !== null;
    await this.query(
      sql`INSERT INTO public.domains (
            tenant_id, domain, tld, annual_cost_usd_cents,
            renewal_price_cents, renewal_price_currency, renewal_price_quoted_at,
            agreement_types_accepted, agreed_at, is_mock, source
          ) VALUES (
            ${params.tenantId}::uuid, ${params.domain}, ${params.tld},
            ${params.priceUsdCents},
            ${params.renewalPriceUsdCents}, ${hasRenewalPrice ? 'usd' : null},
            ${hasRenewalPrice ? new Date().toISOString() : null}::timestamptz,
            ${toPgTextArray(params.agreementTypes)}::text[], ${params.agreedAt}::timestamptz,
            ${params.isMock}, ${params.source}
          )`,
    );
  }

  /** Frees the row's DNS zone first (unless it will be reused), so no row ever disappears with a live zone. */
  private async deleteDomainRecord(
    row: DomainRow,
    opts: { keepZone: boolean },
  ): Promise<void> {
    if (!opts.keepZone) {
      try {
        await this.deleteStoredZone(row);
      } catch (err) {
        this.logger.warn(
          `[dns] Could not delete the zone of ${row.domain} while replacing its row (sweeper will retry): ${String(err)}`,
        );
      }
    }
    await this.query(
      sql`DELETE FROM public.domains WHERE id = ${row.id}::uuid`,
    );
  }

  private async setDnsZone(
    domain: string,
    provider: DnsProviderName,
    zoneId: string,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.domains
          SET dns_provider = ${provider}, dns_zone_id = ${zoneId}
          WHERE domain = ${domain}`,
    );
  }

  private async clearDnsZone(domain: string): Promise<void> {
    await this.query(
      sql`UPDATE public.domains SET dns_zone_id = NULL WHERE domain = ${domain}`,
    );
  }

  private async markDomainReleased(
    row: DomainRow,
    tenantId: string,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.domains
          SET released_at = COALESCE(released_at, now()), vercel_mapped = false,
              ssl_active = false, dns_zone_id = NULL, updated_at = now()
          WHERE id = ${row.id}::uuid`,
    );
    await this.query(
      sql`UPDATE public.tenants
          SET domain = NULL, vercel_domain_mapped = false
          WHERE id = ${tenantId}::uuid AND domain = ${row.domain}`,
    );
  }

  /** Inserts the tenant's running-purchase job, or returns the one already running for the same domain. */
  private async claimPurchaseJob(
    tenantId: string,
    domain: string,
  ): Promise<{ created: boolean; jobId: string }> {
    await this.query(
      sql`UPDATE public.domain_jobs
          SET status = 'failed', error_code = 'PURCHASE_INTERRUPTED',
              error_step = CASE WHEN status = 'pending' THEN 'purchasing' ELSE status END
          WHERE tenant_id = ${tenantId}::uuid AND job_type = 'purchase'
            AND status NOT IN ('completed', 'failed')
            AND updated_at < now() - make_interval(mins => ${STALE_JOB_MINUTES})`,
    );

    // Two attempts: the running job can finish between the failed insert and the lookup.
    for (let attempt = 0; attempt < 2; attempt++) {
      const inserted = await this.query<{ id: string }>(
        sql`INSERT INTO public.domain_jobs (tenant_id, domain, job_type)
            VALUES (${tenantId}::uuid, ${domain}, 'purchase')
            ON CONFLICT (tenant_id)
              WHERE job_type = 'purchase' AND status NOT IN ('completed', 'failed')
            DO NOTHING
            RETURNING id`,
      );
      if (inserted[0]) return { created: true, jobId: inserted[0].id };

      const running = await this.query<{ id: string; domain: string }>(
        sql`SELECT id, domain FROM public.domain_jobs
            WHERE tenant_id = ${tenantId}::uuid AND job_type = 'purchase'
              AND status NOT IN ('completed', 'failed')
            LIMIT 1`,
      );
      if (running[0]) {
        if (running[0].domain !== domain)
          throw new DomainPurchaseInProgressException();
        return { created: false, jobId: running[0].id };
      }
    }
    throw new DomainPurchaseInProgressException();
  }

  private async discardJob(jobId: string): Promise<void> {
    await this.query(
      sql`DELETE FROM public.domain_jobs WHERE id = ${jobId}::uuid`,
    );
  }

  private async createDomainJob(
    tenantId: string,
    domain: string,
    jobType: 'purchase' | 'connect' = 'purchase',
  ): Promise<string> {
    const rows = await this.query<{ id: string }>(
      sql`INSERT INTO public.domain_jobs (tenant_id, domain, job_type)
          VALUES (${tenantId}::uuid, ${domain}, ${jobType})
          RETURNING id`,
    );
    return rows[0].id;
  }

  private async updateJobStatus(
    jobId: string,
    status: DomainJobStatus,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.domain_jobs SET status = ${status} WHERE id = ${jobId}::uuid`,
    );
  }

  private async addCompletedStep(jobId: string, step: string): Promise<void> {
    await this.query(
      sql`UPDATE public.domain_jobs
          SET steps_completed = array_append(steps_completed, ${step})
          WHERE id = ${jobId}::uuid`,
    );
  }

  private async failJob(
    jobId: string,
    step: string,
    code: DomainJobErrorCode,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.domain_jobs
          SET status = 'failed', error_step = ${step}, error_code = ${code}
          WHERE id = ${jobId}::uuid`,
    );
  }

  private async setRegistrarDomainId(
    domain: string,
    registrarDomainId: string,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.domains
          SET registrar_domain_id = ${registrarDomainId}
          WHERE domain = ${domain}`,
    );
  }

  private async markDomainActive(
    domain: string,
    renewalDate: Date | null,
  ): Promise<void> {
    if (!renewalDate) {
      this.logger.warn(
        `Registrar returned no renewal date for ${domain}; expires_at left empty.`,
      );
    }
    await this.query(
      sql`UPDATE public.domains
          SET expires_at = ${renewalDate ? renewalDate.toISOString() : null}::timestamptz
          WHERE domain = ${domain}`,
    );
  }

  private async setDnsStatus(domain: string, status: DnsStatus): Promise<void> {
    await this.query(
      sql`UPDATE public.domains SET dns_status = ${status} WHERE domain = ${domain}`,
    );
  }

  private async markVercelMapped(
    domain: string,
    vercelDomainId: string,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.domains
          SET vercel_mapped = true, vercel_domain_id = ${vercelDomainId},
              purchase_completed_at = now()
          WHERE domain = ${domain}`,
    );
  }

  private async markDomainSuspended(
    domainId: string,
    tenantId: string,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.domains
          SET suspended_at = now(), vercel_mapped = false, ssl_active = false,
              updated_at = now()
          WHERE id = ${domainId}::uuid`,
    );
    await this.query(
      sql`UPDATE public.tenants SET vercel_domain_mapped = false WHERE id = ${tenantId}::uuid`,
    );
  }

  /**
   * Back to 'propagating' so checkDnsStatus re-verifies and flips ssl_active once
   * Vercel reissues the cert. Also restores tenants.domain, which the old release
   * flow used to clear.
   */
  private async markDomainRelaunched(
    domainId: string,
    tenantId: string,
    domain: string,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.domains
          SET suspended_at = NULL, relaunched_at = now(), vercel_mapped = true,
              dns_status = 'propagating', updated_at = now()
          WHERE id = ${domainId}::uuid`,
    );
    await this.updateTenantDomain(tenantId, domain);
  }

  private async updateTenantDomain(
    tenantId: string,
    domain: string,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.tenants
          SET domain = ${domain}, vercel_domain_mapped = true
          WHERE id = ${tenantId}::uuid`,
    );
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

// TODO: post-MVP — monitor expiry of user_provided domains (no renewal handling,
//       no expiry notifications; if the tenant lets it lapse the site goes dark).
// TODO: domain transfer to tenant on subscription cancellation (30-day grace).
// TODO: annual renewal via cron job — autorenew is off, so Lattiz must renew via the registrar.
// TODO: multiple domains per tenant — remove domains_tenant_id_idx + update UI.
// TODO: premium domain pricing above plan limit — extra charge flow.
// TODO: WHOIS privacy — not offered for .mx/.com.mx (is_private_whois_allowed=false).
// TODO: email forwarding — MX records via the DNS provider port.
// TODO: Cloudflare for SaaS once past ~200 tenants.

/** User-safe code for a failed step; typed pipeline exceptions already carry theirs. */
function failureCode(step: DomainJobStatus, err: unknown): DomainJobErrorCode {
  if (err instanceof PurchasePipelineException) return err.code;
  if (step === 'configuring_dns') {
    return classifyProviderFailure(err) === 'config'
      ? 'SERVICE_CONFIGURATION_ERROR'
      : 'DNS_SETUP_FAILED';
  }
  if (step === 'registering_vercel') return 'VERCEL_SETUP_FAILED';
  return 'UNEXPECTED_ERROR';
}

function toStatusDto(row: DomainRow): DomainStatusResponseDto {
  return {
    domain: row.domain,
    source: row.source,
    dnsStatus: row.dns_status,
    vercelMapped: row.vercel_mapped,
    sslActive: row.ssl_active,
    isMock: row.is_mock,
    expiresAt: row.expires_at ? toIso(row.expires_at) : null,
    purchaseCompletedAt: row.purchase_completed_at
      ? toIso(row.purchase_completed_at)
      : null,
  };
}

function toIso(value: string | Date): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

/** Drizzle's sql template expands JS arrays as row constructors — serialize to a PG array literal instead. */
function toPgTextArray(values: string[]): string {
  return `{${values.map((v) => `"${v.replace(/(["\\])/g, '\\$1')}"`).join(',')}}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
