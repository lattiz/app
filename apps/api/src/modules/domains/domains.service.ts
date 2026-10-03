import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../database/database.module';
import {
  DNS_PROVIDER_PORT,
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
  type DomainJobStatus,
  type DomainSourceValue,
} from './dto/domains.response.dto';
import { PurchaseDomainDto } from './dto/purchase-domain.dto';
import {
  DomainAgreementsRequiredException,
  DomainJobNotFoundException,
  DomainNotAvailableException,
  DomainNotCoveredByPlanException,
  DomainPriceChangedException,
  DomainsTenantNotFoundException,
  TenantAlreadyHasDomainException,
} from './domains.exceptions';
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
}

interface JobRow {
  id: string;
  domain: string;
  status: DomainJobStatus;
  steps_completed: string[];
  error_message: string | null;
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
        this.logger.warn(`Availability check failed for ${candidates[i]}: ${String(r.reason)}`);
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

    const existing = await this.getDomainByTenant(tenantId);
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
      await this.deleteDomainRecord(existing.id);
    }

    const jobId = await this.createDomainJob(tenantId, params.domain);

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

    void this.runPurchasePipeline(jobId, tenantId, params.domain, {
      period: 1,
      registered,
    });

    return { jobId };
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
      throw new DomainPriceChangedException(priceUsdCents, acceptedPriceUsdCents);
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
        this.logger.error(`Pipeline step "${name}" failed for job ${jobId}: ${String(err)}`);
        await this.failJob(jobId, name, String(err));
        await this.setDnsStatus(domain, 'error');
        throw err;
      }
    };

    try {
      await step('purchasing', async () => {
        const registration =
          params.registered ??
          (await this.registrar.registerDomain({ domain, periodYears: params.period }));
        // Persist the registrar id BEFORE polling so a crash can't orphan a paid domain.
        await this.setRegistrarDomainId(domain, registration.id);
        const done = await this.waitForRegistration(registration);
        await this.markDomainActive(domain, done.renewalDate);
      });

      await step('configuring_dns', async () => {
        await this.setDnsStatus(domain, 'configuring');
        await this.dns.upsertZone(domain, await this.buildDnsRecords(domain));
        await this.setDnsStatus(domain, 'propagating');
      });

      await step('registering_vercel', async () => {
        const result = await this.vercel.addDomain(domain);
        await this.markVercelMapped(domain, result.name);
        await this.updateTenantDomain(tenantId, domain);
      });

      await this.updateJobStatus(jobId, 'completed');
      this.logger.log(`Domain provisioning completed: ${domain} (job: ${jobId})`);
    } catch {
      // Error already logged and persisted by step().
    }
  }

  private async waitForRegistration(
    registration: RegisteredDomain,
  ): Promise<RegistrationState> {
    let state: RegistrationState = registration;
    for (let attempt = 0; state.status === 'pending'; attempt++) {
      if (attempt >= REGISTRATION_POLL_MAX_ATTEMPTS) {
        throw new Error('Registrar registration still pending after the polling window');
      }
      await sleep(REGISTRATION_POLL_INTERVAL_MS);
      state = await this.registrar.getRegistrationStatus(registration.id);
    }
    if (state.status === 'failed') {
      throw new Error('Registrar registration FAILED');
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
    const tenantId = await this.getTenantIdByUserSub(userSub);

    const existing = await this.getDomainByTenant(tenantId);
    if (existing) {
      if (existing.purchase_completed_at) {
        throw new TenantAlreadyHasDomainException();
      }
      // Leftover of an incomplete purchase/connect attempt — replace it.
      await this.deleteDomainRecord(existing.id);
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
      this.logger.error(`Connect failed for ${domain} (job ${jobId}): ${String(err)}`);
      await this.failJob(jobId, 'registering_vercel', String(err));
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
  async getJobStatus(userSub: string, jobId: string): Promise<DomainJobStatusDto> {
    const tenantId = await this.getTenantIdByUserSub(userSub);
    const rows = await this.query<JobRow>(
      sql`SELECT id, domain, status, steps_completed, error_message, error_step
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
      errorMessage: row.error_message,
      errorStep: row.error_step,
    };
  }

  // ── Domain status (DNS propagation check) ─────────────────────────────────
  async checkDnsStatus(userSub: string): Promise<DomainStatusResponseDto | null> {
    const tenantId = await this.getTenantIdByUserSub(userSub);
    const domain = await this.getDomainByTenant(tenantId);
    if (!domain) return null;
    if (domain.dns_status === 'active') return toStatusDto(domain);

    if (domain.dns_status === 'propagating' && (await this.dnsPropagated(domain.domain))) {
      // Vercel provisions SSL automatically once DNS validates.
      await this.query(
        sql`UPDATE public.domains
            SET dns_status = 'active', ssl_active = true
            WHERE domain = ${domain.domain}`,
      );
      const fresh = await this.getDomainByTenant(tenantId);
      return fresh ? toStatusDto(fresh) : null;
    }

    return toStatusDto(domain);
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
    if (!domain) return;

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
    this.logger.log(`[suspend] Domain ${domain.domain} suspended for tenant ${tenantId}`);
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
    if (!domain.suspended_at) return { relaunched: false, domain: domain.domain };

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
                 ssl_active, is_mock, purchase_completed_at, suspended_at
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

  private async deleteDomainRecord(id: string): Promise<void> {
    await this.query(sql`DELETE FROM public.domains WHERE id = ${id}::uuid`);
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

  private async updateJobStatus(jobId: string, status: DomainJobStatus): Promise<void> {
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

  private async failJob(jobId: string, step: string, message: string): Promise<void> {
    await this.query(
      sql`UPDATE public.domain_jobs
          SET status = 'failed', error_step = ${step}, error_message = ${message}
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

  private async markDomainActive(domain: string, renewalDate: Date | null): Promise<void> {
    if (!renewalDate) {
      this.logger.warn(`Registrar returned no renewal date for ${domain}; expires_at left empty.`);
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

  private async markVercelMapped(domain: string, vercelDomainId: string): Promise<void> {
    await this.query(
      sql`UPDATE public.domains
          SET vercel_mapped = true, vercel_domain_id = ${vercelDomainId},
              purchase_completed_at = now()
          WHERE domain = ${domain}`,
    );
  }

  private async markDomainSuspended(domainId: string, tenantId: string): Promise<void> {
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

  private async updateTenantDomain(tenantId: string, domain: string): Promise<void> {
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
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** Drizzle's sql template expands JS arrays as row constructors — serialize to a PG array literal instead. */
function toPgTextArray(values: string[]): string {
  return `{${values.map((v) => `"${v.replace(/(["\\])/g, '\\$1')}"`).join(',')}}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
