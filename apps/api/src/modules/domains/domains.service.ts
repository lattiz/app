import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql, type SQL } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { type Database, DATABASE } from '../../database/database.module';
import {
  CnameInstructionDto,
  ConnectDomainResponseDto,
  DomainJobStatusDto,
  DomainQuoteResponseDto,
  DomainSearchResultDto,
  DomainStatusResponseDto,
  type DnsStatus,
  type DomainJobStatus,
} from './dto/domains.response.dto';
import { PurchaseDomainDto } from './dto/purchase-domain.dto';
import {
  DomainJobNotFoundException,
  DomainsTenantNotFoundException,
  TenantAlreadyHasDomainException,
} from './domains.exceptions';
import { GodaddyService } from './godaddy.service';
import { VercelDomainsService } from './vercel-domains.service';

const VERCEL_CNAME = 'cname.vercel-dns.com';

const CNAME_INSTRUCTIONS: CnameInstructionDto[] = [
  { type: 'CNAME', name: '@', value: VERCEL_CNAME, ttl: 600 },
  { type: 'CNAME', name: 'www', value: VERCEL_CNAME, ttl: 600 },
];

type DomainSource = 'godaddy_managed' | 'user_provided';

interface DomainRow {
  id: string;
  tenant_id: string;
  domain: string;
  source: DomainSource;
  tld: string;
  godaddy_registration_id: string | null;
  godaddy_idempotency_key: string | null;
  annual_cost_usd_cents: number;
  period_years: number;
  expires_at: string | Date | null;
  dns_status: DnsStatus;
  vercel_domain_id: string | null;
  vercel_mapped: boolean;
  ssl_active: boolean;
  is_mock: boolean;
  purchase_completed_at: string | Date | null;
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
  idempotencyKey: string;
  quoteToken: string;
  period: number;
  agreementTypes: string[];
  agreedAt: string;
}

/**
 * Orchestrates GoDaddy (purchase + DNS), Vercel (mapping + SSL) and the DB.
 * State is persisted BEFORE each external call so a dead process can retry safely.
 */
@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);
  private readonly maxCostCents: number;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly godaddy: GodaddyService,
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
    const candidates = [
      `${base}.com`,
      `${base}.com.mx`,
      `${base}.mx`,
      `${base}.net`,
    ];

    const results = await Promise.allSettled(
      candidates.map((d) => this.godaddy.checkAvailability(d)),
    );

    const found: DomainSearchResultDto[] = [];
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        this.logger.warn(`Availability check failed for ${candidates[i]}: ${String(r.reason)}`);
        return;
      }
      const price = r.value.prices?.[0]?.price?.value ?? 0;
      found.push({
        domain: candidates[i],
        available: r.value.available,
        priceUsdCents: price,
        coveredByPlan: price <= this.maxCostCents,
      });
    });
    return found;
  }

  // ── Quote ─────────────────────────────────────────────────────────────────
  async getQuote(domain: string): Promise<DomainQuoteResponseDto> {
    const quote = await this.godaddy.getRegistrationQuote(domain, 1);
    return {
      quoteToken: quote.quoteToken,
      expiresAt: quote.expiresAt,
      domain: quote.domain,
      available: quote.available,
      priceUsdCents: quote.price?.value ?? 0,
      renewalPriceUsdCents: quote.renewalPrice?.value ?? 0,
      coveredByPlan: (quote.price?.value ?? 0) <= this.maxCostCents,
      requiredAgreements: (quote.requiredAgreements ?? []).map((a) => ({
        agreementType: a.agreementType,
        title: a.title,
        url: a.url ?? null,
      })),
      irreversible: quote.irreversible,
    };
  }

  // ── Purchase — async pipeline ─────────────────────────────────────────────
  /** Returns a jobId immediately; the pipeline runs in the background. */
  async initiatePurchase(
    userSub: string,
    params: PurchaseDomainDto,
  ): Promise<{ jobId: string }> {
    const tenantId = await this.getTenantIdByUserSub(userSub);

    const existing = await this.getDomainByTenant(tenantId);
    let idempotencyKey: string = randomUUID();

    if (existing) {
      if (existing.purchase_completed_at) {
        throw new TenantAlreadyHasDomainException();
      }
      if (existing.domain === params.domain && existing.godaddy_idempotency_key) {
        // Retry of an incomplete purchase — reuse the stored key so GoDaddy dedupes.
        idempotencyKey = existing.godaddy_idempotency_key;
      } else {
        await this.deleteDomainRecord(existing.id);
      }
    }

    const tld = '.' + params.domain.split('.').slice(1).join('.');
    const jobId = await this.createDomainJob(tenantId, params.domain);

    if (!existing || existing.domain !== params.domain) {
      // Persist the idempotency key BEFORE calling GoDaddy — enables safe retry.
      await this.createDomainRecord({
        tenantId,
        domain: params.domain,
        tld,
        idempotencyKey,
        priceUsdCents: params.priceUsdCents,
        agreementTypes: params.agreementTypes,
        agreedAt: params.agreedAt,
        isMock: this.godaddy.isMockMode,
        source: 'godaddy_managed',
      });
    }

    void this.runPurchasePipeline(jobId, tenantId, params.domain, {
      idempotencyKey,
      quoteToken: params.quoteToken,
      period: 1,
      agreementTypes: params.agreementTypes,
      agreedAt: params.agreedAt,
    });

    return { jobId };
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
        const result = await this.godaddy.registerDomain({
          domain,
          quoteToken: params.quoteToken,
          period: params.period,
          agreementTypes: params.agreementTypes,
          agreedAt: params.agreedAt,
          idempotencyKey: params.idempotencyKey,
        });

        if (result.status !== 'COMPLETED') {
          let attempts = 0;
          while (attempts < 20) {
            await sleep(3000);
            const poll = await this.godaddy.pollRegistration(result.registrationId);
            if (poll.status === 'COMPLETED') break;
            if (poll.status === 'FAILED') {
              throw new Error('GoDaddy registration FAILED');
            }
            attempts++;
          }
        }

        await this.markDomainRegistered(domain, result.registrationId, params.period);
        await this.godaddy.disableAutoRenew(domain);
      });

      await step('configuring_dns', async () => {
        await this.setDnsStatus(domain, 'configuring');
        await this.godaddy.createDnsRecord(domain, {
          type: 'CNAME',
          name: '@',
          data: VERCEL_CNAME,
          ttl: 600,
        });
        await this.godaddy.createDnsRecord(domain, {
          type: 'CNAME',
          name: 'www',
          data: VERCEL_CNAME,
          ttl: 600,
        });
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

  // ── Connect a domain the tenant already owns ──────────────────────────────
  // No GoDaddy involved — Lattiz only maps the domain in Vercel and hands the
  // tenant the CNAME records to create at their registrar.
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
      idempotencyKey: null,
      priceUsdCents: null,
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

    return { jobId, dnsInstructions: CNAME_INSTRUCTIONS };
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
      const lookups = await Promise.all(
        [domain, `www.${domain}`].map(async (name) => {
          const res = await fetch(
            `https://dns.google/resolve?name=${name}&type=CNAME`,
          );
          const data = (await res.json()) as {
            Answer?: Array<{ data?: string }>;
          };
          return data.Answer?.some((r) => r.data?.includes('vercel-dns.com')) ?? false;
        }),
      );
      return lookups.some(Boolean);
    } catch {
      // DNS check failure is not critical — stay in 'propagating'.
      return false;
    }
  }

  // ── Offboarding ───────────────────────────────────────────────────────────
  /**
   * Takes the tenant's site offline after their subscription lapsed. Idempotent:
   * safe to call when there is no domain, or when it was already released.
   */
  async releaseDomainForTenant(tenantId: string): Promise<void> {
    const domain = await this.getDomainByTenant(tenantId);
    if (!domain) return;

    // Unmapping from Vercel is what actually takes the site offline. Non-fatal:
    // removeDomain already swallows a 404 on an already-unmapped domain.
    try {
      await this.vercel.removeDomain(domain.domain);
    } catch (err) {
      this.logger.warn(
        `[release] Vercel unmap failed for ${domain.domain} (non-fatal): ${String(err)}`,
      );
    }

    // The GoDaddy registration itself is deliberately left alone: there is no
    // reliable self-serve API to cancel or refund a paid registration. auto_renew
    // is already false from purchase time, so the name lapses at expires_at and
    // returns to the registrar pool on its own — that is the only reuse mechanism
    // available, and Lattiz does not control it beyond not renewing.
    await this.markDomainReleased(domain.id);
    await this.clearTenantDomain(tenantId);
    this.logger.log(`[release] Domain ${domain.domain} released for tenant ${tenantId}`);
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
      sql`SELECT id, tenant_id, domain, source, tld, godaddy_registration_id,
                 godaddy_idempotency_key, annual_cost_usd_cents, period_years,
                 expires_at, dns_status, vercel_domain_id, vercel_mapped,
                 ssl_active, is_mock, purchase_completed_at
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
    idempotencyKey: string | null;
    priceUsdCents: number | null;
    agreementTypes: string[];
    agreedAt: string | null;
    isMock: boolean;
    source: DomainSource;
  }): Promise<void> {
    await this.query(
      sql`INSERT INTO public.domains (
            tenant_id, domain, tld, godaddy_idempotency_key,
            annual_cost_usd_cents, agreement_types_accepted, agreed_at, is_mock,
            source
          ) VALUES (
            ${params.tenantId}::uuid, ${params.domain}, ${params.tld},
            ${params.idempotencyKey}, ${params.priceUsdCents},
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

  private async markDomainRegistered(
    domain: string,
    registrationId: string,
    periodYears: number,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.domains
          SET godaddy_registration_id = ${registrationId},
              expires_at = now() + (${periodYears} * interval '1 year')
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

  private async markDomainReleased(domainId: string): Promise<void> {
    await this.query(
      sql`UPDATE public.domains
          SET released_at = now(), vercel_mapped = false, ssl_active = false,
              updated_at = now()
          WHERE id = ${domainId}::uuid`,
    );
  }

  /** Keeps "does this tenant already have a domain" honest if they resubscribe. */
  private async clearTenantDomain(tenantId: string): Promise<void> {
    await this.query(
      sql`UPDATE public.tenants
          SET domain = NULL, vercel_domain_mapped = false
          WHERE id = ${tenantId}::uuid`,
    );
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
// TODO: annual renewal via cron job — v1 POST /domains/{domain}/renew.
// TODO: multiple domains per tenant — remove domains_tenant_id_idx + update UI.
// TODO: premium domain pricing above plan limit — extra charge flow.
// TODO: WHOIS privacy — v1 PATCH /domains/{domain} privacyEnabled.
// TODO: email forwarding — MX records via v3 DNS.
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
