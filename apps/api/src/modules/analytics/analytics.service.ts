import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { sql, type SQL } from 'drizzle-orm';
import { computeIsEntitled } from '../../common/billing/entitlement';
import { type Database, DATABASE } from '../../database/database.module';
import { AnalyticsConfig } from './analytics.config';
import {
  AnalyticsRetryCooldownException,
  AnalyticsRetryNotAllowedException,
  AnalyticsTenantNotFoundException,
  AnalyticsUpstreamException,
} from './analytics.errors';
import type {
  AnalyticsChannelDto,
  AnalyticsOverviewDto,
  AnalyticsReportDto,
} from './dto/analytics.response.dto';
import {
  addDays,
  GA4_GATEWAY,
  type Ga4Gateway,
  type RawOverview,
  todayInZone,
} from './ga4.gateway';

const RANGE_DAYS = 28;
const MAX_CHANNELS = 5;
/** Cron stops retrying after this many attempts; manual retry bypasses it. */
const MAX_ATTEMPTS = 5;
const STALE_LOCK_MINUTES = 10;
const RETRY_COOLDOWN_SECONDS = 60;
const CRON_BATCH_SIZE = 10;
const CRON_DELAY_MS = 1500;
const MAX_ERROR_LENGTH = 300;

// gRPC status codes carried on google-gax errors as `err.code`.
const TRANSIENT_CODES = new Set([4, 8, 10, 13, 14]); // DEADLINE_EXCEEDED, RESOURCE_EXHAUSTED, ABORTED, INTERNAL, UNAVAILABLE
const PERMANENT_CODES = new Set([3, 5, 7, 9, 16]); // INVALID_ARGUMENT, NOT_FOUND, PERMISSION_DENIED, FAILED_PRECONDITION, UNAUTHENTICATED
const RESOURCE_EXHAUSTED = 8;
const CODE_NAMES: Record<number, string> = {
  3: 'INVALID_ARGUMENT',
  4: 'DEADLINE_EXCEEDED',
  5: 'NOT_FOUND',
  7: 'PERMISSION_DENIED',
  8: 'RESOURCE_EXHAUSTED',
  9: 'FAILED_PRECONDITION',
  10: 'ABORTED',
  13: 'INTERNAL',
  14: 'UNAVAILABLE',
  16: 'UNAUTHENTICATED',
};

const CHANNEL_LABELS: Record<string, string> = {
  Direct: 'Directo',
  'Organic Search': 'Búsqueda orgánica',
  'Organic Social': 'Redes sociales',
  Referral: 'Referencia',
  'Paid Search': 'Búsqueda de pago',
  'Paid Social': 'Social de pago',
  Email: 'Correo',
  Display: 'Display',
  Unassigned: 'Sin asignar',
  '(not set)': 'Sin asignar',
};

type ProvisioningStatus = 'pending' | 'provisioning' | 'ready' | 'failed';

interface TenantRow {
  id: string;
  name: string;
  plan: string;
  domain: string | null;
}

interface AnalyticsRow {
  tenant_id: string;
  provisioning_status: ProvisioningStatus;
  ga4_property_id: string | null;
  ga4_data_stream_id: string | null;
  ga4_measurement_id: string | null;
  provisioning_attempts: number;
  last_attempt_at: string | Date | null;
  is_mock: boolean;
  lock_is_stale: boolean;
}

interface CacheRow {
  report: AnalyticsReportDto | string;
  fetched_at: string | Date;
  is_fresh: boolean;
}

interface ReconcileCandidateRow {
  tenant_id: string;
  status: string | null;
  current_period_end: string | Date | null;
}

/**
 * GA4 lifecycle per Pro tenant: provision one property + web stream in
 * Lattiz's GA account, then serve a cached 28-day overview from the Data API.
 * Eligibility (plan + entitlement) is always derived at read time.
 *
 * TODO: Google caps properties per GA account (documented as 2,000) — shard
 * tenants across several GA accounts before approaching it.
 * TODO: tenant deletion cascades our rows but orphans the GA property; call
 * `properties.delete` once account deletion covers it.
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly provisioningInFlight = new Set<string>();
  private readonly reportsInFlight = new Map<
    string,
    Promise<{ report: AnalyticsReportDto; fetchedAt: string }>
  >();

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(GA4_GATEWAY) private readonly gateway: Ga4Gateway,
    private readonly config: AnalyticsConfig,
  ) {}

  // ── Overview ──────────────────────────────────────────────────────────────
  async getOverview(userSub: string): Promise<AnalyticsOverviewDto> {
    const tenant = await this.getTenantByUserSub(userSub);
    if (tenant.plan !== 'pro') return overview('not_eligible');
    // Write no state: adding credentials later must self-heal.
    if (!this.config.isConfigured) return overview('unavailable');

    let row = await this.getAnalyticsRow(tenant.id);
    if (row && row.is_mock && !this.gateway.isMock) {
      row = await this.discardMockProvisioning(tenant.id);
    }

    if (
      !row ||
      row.provisioning_status === 'pending' ||
      (row.provisioning_status === 'provisioning' && row.lock_is_stale)
    ) {
      void this.provisionSafely(tenant.id);
      return overview('provisioning');
    }

    switch (row.provisioning_status) {
      case 'provisioning':
        return overview('provisioning');
      case 'failed':
        return {
          ...overview('failed'),
          retryAvailableAt: retryAvailableAt(row.last_attempt_at),
        };
      case 'ready':
        return this.getReadyOverview(tenant.id, requireValue(row.ga4_property_id));
    }
  }

  // ── Manual retry ──────────────────────────────────────────────────────────
  async retry(userSub: string): Promise<AnalyticsOverviewDto> {
    const tenant = await this.getTenantByUserSub(userSub);
    if (tenant.plan !== 'pro') throw new AnalyticsRetryNotAllowedException();
    if (!this.config.isConfigured) return overview('unavailable');

    const row = await this.getAnalyticsRow(tenant.id);
    if (!row) throw new AnalyticsRetryNotAllowedException();

    // Cooldown first, so a fast second click is told to wait rather than "nothing to retry".
    const cooldown = secondsUntilRetry(row.last_attempt_at);
    if (cooldown > 0) throw new AnalyticsRetryCooldownException(cooldown);
    if (row.provisioning_status !== 'failed') {
      throw new AnalyticsRetryNotAllowedException();
    }

    const claimed = await this.claim(tenant.id);
    if (!claimed) throw new AnalyticsRetryCooldownException(RETRY_COOLDOWN_SECONDS);

    void this.runClaimedSafely(tenant.id, claimed);
    return overview('provisioning');
  }

  // ── Reconciliation cron ───────────────────────────────────────────────────
  /** Provisions Pro tenants that never opened the tab and retries failures with linear backoff. */
  @Cron('*/15 * * * *')
  async reconcileProvisioning(): Promise<void> {
    if (!this.config.isConfigured) return;

    let candidates: ReconcileCandidateRow[];
    try {
      candidates = await this.findReconcileCandidates();
    } catch (err) {
      this.logger.error(`[analytics] Reconcile query failed: ${String(err)}`);
      return;
    }

    const entitled = candidates
      .filter((row) =>
        computeIsEntitled({
          status: row.status,
          currentPeriodEnd: row.current_period_end,
        }),
      )
      .slice(0, CRON_BATCH_SIZE);
    if (entitled.length === 0) return;

    this.logger.log(`[analytics] Reconciling ${entitled.length} tenant(s)`);
    for (const [i, row] of entitled.entries()) {
      if (i > 0) await sleep(CRON_DELAY_MS);
      await this.provisionSafely(row.tenant_id);
    }
  }

  /** Entitlement is filtered in JS via computeIsEntitled, never re-derived in SQL. */
  private async findReconcileCandidates(): Promise<ReconcileCandidateRow[]> {
    return this.query<ReconcileCandidateRow>(
      sql`SELECT t.id AS tenant_id, s.status, s.current_period_end
          FROM public.tenants t
          LEFT JOIN public.tenant_analytics a ON a.tenant_id = t.id
          LEFT JOIN LATERAL (
            SELECT status, current_period_end
            FROM public.subscriptions
            WHERE tenant_id = t.id
            ORDER BY created_at DESC
            LIMIT 1
          ) s ON true
          WHERE t.plan = 'pro'
            AND (
              a.tenant_id IS NULL
              OR (a.provisioning_status IN ('pending', 'failed')
                  AND a.provisioning_attempts < ${MAX_ATTEMPTS}
                  AND (a.last_attempt_at IS NULL
                       OR a.last_attempt_at < now() - a.provisioning_attempts * interval '10 minutes'))
              OR (a.provisioning_status = 'provisioning'
                  AND a.last_attempt_at < now() - interval '10 minutes')
            )
          ORDER BY a.last_attempt_at ASC NULLS FIRST
          LIMIT 50`,
    );
  }

  // ── Provisioning pipeline ─────────────────────────────────────────────────
  /** Safe to fire-and-forget: never rejects. */
  async provisionSafely(tenantId: string): Promise<void> {
    try {
      await this.ensureRow(tenantId);
      const claimed = await this.claim(tenantId);
      if (!claimed) return;
      await this.runClaimedSafely(tenantId, claimed);
    } catch (err) {
      this.logger.error(
        `[analytics] Provisioning crashed for tenant ${tenantId}: ${String(err)}`,
      );
    }
  }

  private async runClaimedSafely(tenantId: string, row: AnalyticsRow): Promise<void> {
    // The DB claim covers multiple instances; this covers re-entry within one.
    if (this.provisioningInFlight.has(tenantId)) return;
    this.provisioningInFlight.add(tenantId);
    try {
      await this.runProvisioning(tenantId, row);
    } catch (err) {
      await this.recordFailure(tenantId, err).catch((dbErr: unknown) =>
        this.logger.error(
          `[analytics] Could not record failure for ${tenantId}: ${String(dbErr)}`,
        ),
      );
    } finally {
      this.provisioningInFlight.delete(tenantId);
    }
  }

  /** Each step persists its output immediately so a crash resumes where it stopped. */
  private async runProvisioning(tenantId: string, row: AnalyticsRow): Promise<void> {
    const tenant = await this.getTenantById(tenantId);
    const displayName = `Lattiz · ${tenant.name} · ${tenantId.slice(0, 8)}`.slice(0, 100);

    let propertyId = row.ga4_property_id;
    if (!propertyId) {
      const created = await withTransientRetry(() =>
        this.gateway.createProperty({
          displayName,
          timeZone: this.config.timeZone,
          currencyCode: this.config.currencyCode,
        }),
      );
      propertyId = created.propertyId;
      await this.query(
        sql`UPDATE public.tenant_analytics
            SET ga4_property_id = ${propertyId}, is_mock = ${this.gateway.isMock}
            WHERE tenant_id = ${tenantId}::uuid`,
      );
    }

    if (!row.ga4_measurement_id) {
      const pid = propertyId;
      const stream = await withTransientRetry(() =>
        this.gateway.createWebStream({
          propertyId: pid,
          displayName: tenant.domain ?? displayName,
          defaultUri: tenant.domain ? `https://${tenant.domain}` : undefined,
        }),
      );
      await this.query(
        sql`UPDATE public.tenant_analytics
            SET ga4_data_stream_id = ${stream.streamId},
                ga4_measurement_id = ${stream.measurementId}
            WHERE tenant_id = ${tenantId}::uuid`,
      );
    }

    try {
      await this.gateway.setRetention(propertyId);
    } catch (err) {
      this.logger.warn(
        `[analytics] setRetention failed for property ${propertyId} (non-fatal): ${describeError(err)}`,
      );
    }

    await this.query(
      sql`UPDATE public.tenant_analytics
          SET provisioning_status = 'ready', provisioned_at = now(),
              provisioning_error = NULL
          WHERE tenant_id = ${tenantId}::uuid`,
    );
    await this.query(
      sql`DELETE FROM public.analytics_report_cache WHERE tenant_id = ${tenantId}::uuid`,
    );
    this.logger.log(
      `[analytics] Tenant ${tenantId} provisioned (property ${propertyId}${this.gateway.isMock ? ', mock' : ''})`,
    );
  }

  private async recordFailure(tenantId: string, err: unknown): Promise<void> {
    const code = grpcCode(err);
    const permanent = code !== null && PERMANENT_CODES.has(code);
    const message = describeError(err).slice(0, MAX_ERROR_LENGTH);

    if (permanent || code === RESOURCE_EXHAUSTED) {
      this.logger.error(
        `[analytics] ACTION REQUIRED — GA4 provisioning failed for tenant ${tenantId}: ${message}. ` +
          'Check the service account role, GA4_ACCOUNT_ID and the per-account property quota.',
      );
    } else {
      this.logger.warn(`[analytics] Provisioning failed for tenant ${tenantId}: ${message}`);
    }

    await this.query(
      sql`UPDATE public.tenant_analytics
          SET provisioning_status = 'failed',
              provisioning_error = ${message},
              provisioning_attempts = CASE WHEN ${permanent}::boolean
                THEN GREATEST(provisioning_attempts, ${MAX_ATTEMPTS})
                ELSE provisioning_attempts END
          WHERE tenant_id = ${tenantId}::uuid`,
    );
  }

  private async ensureRow(tenantId: string): Promise<void> {
    await this.query(
      sql`INSERT INTO public.tenant_analytics (tenant_id, is_mock)
          VALUES (${tenantId}::uuid, ${this.gateway.isMock})
          ON CONFLICT (tenant_id) DO NOTHING`,
    );
  }

  /** Only the caller that gets a row back may proceed. */
  private async claim(tenantId: string): Promise<AnalyticsRow | null> {
    const rows = await this.query<AnalyticsRow>(
      sql`UPDATE public.tenant_analytics
          SET provisioning_status = 'provisioning',
              provisioning_attempts = provisioning_attempts + 1,
              last_attempt_at = now(),
              provisioning_error = NULL
          WHERE tenant_id = ${tenantId}::uuid
            AND (provisioning_status IN ('pending', 'failed')
                 OR (provisioning_status = 'provisioning'
                     AND last_attempt_at < now() - interval '10 minutes'))
          RETURNING tenant_id, provisioning_status, ga4_property_id, ga4_data_stream_id,
                    ga4_measurement_id, provisioning_attempts, last_attempt_at, is_mock,
                    false AS lock_is_stale`,
    );
    return rows[0] ?? null;
  }

  /** Mock IDs mean nothing to the real Data API; start over once real credentials are set. */
  private async discardMockProvisioning(tenantId: string): Promise<null> {
    this.logger.log(`[analytics] Discarding mock provisioning for tenant ${tenantId}`);
    await this.query(
      sql`DELETE FROM public.tenant_analytics
          WHERE tenant_id = ${tenantId}::uuid AND is_mock = true`,
    );
    await this.query(
      sql`DELETE FROM public.analytics_report_cache WHERE tenant_id = ${tenantId}::uuid`,
    );
    return null;
  }

  // ── Report ────────────────────────────────────────────────────────────────
  private async getReadyOverview(
    tenantId: string,
    propertyId: string,
  ): Promise<AnalyticsOverviewDto> {
    const cached = await this.getCachedReport(tenantId);
    if (cached?.is_fresh) {
      return {
        ...overview('ready'),
        report: parseReport(cached.report),
        fetchedAt: toIso(cached.fetched_at),
      };
    }

    try {
      const fresh = await this.fetchReportCoalesced(tenantId, propertyId);
      return { ...overview('ready'), report: fresh.report, fetchedAt: fresh.fetchedAt };
    } catch (err) {
      this.logger.warn(
        `[analytics] Data API failed for tenant ${tenantId}: ${describeError(err)}`,
      );
      if (!cached) throw new AnalyticsUpstreamException();
      return {
        ...overview('ready'),
        report: parseReport(cached.report),
        fetchedAt: toIso(cached.fetched_at),
        stale: true,
      };
    }
  }

  private fetchReportCoalesced(
    tenantId: string,
    propertyId: string,
  ): Promise<{ report: AnalyticsReportDto; fetchedAt: string }> {
    const existing = this.reportsInFlight.get(tenantId);
    if (existing) return existing;

    const promise = (async () => {
      const raw = await this.gateway.runOverviewReport(propertyId);
      const report = buildReport(raw, this.config.timeZone);
      const rows = await this.query<{ fetched_at: string | Date }>(
        sql`INSERT INTO public.analytics_report_cache (tenant_id, report, fetched_at, expires_at)
            VALUES (${tenantId}::uuid, ${JSON.stringify(report)}::jsonb, now(),
                    now() + make_interval(secs => ${this.config.reportTtlSeconds}))
            ON CONFLICT (tenant_id) DO UPDATE SET
              report = EXCLUDED.report,
              fetched_at = EXCLUDED.fetched_at,
              expires_at = EXCLUDED.expires_at
            RETURNING fetched_at`,
      );
      return {
        report,
        fetchedAt: rows[0] ? toIso(rows[0].fetched_at) : new Date().toISOString(),
      };
    })().finally(() => this.reportsInFlight.delete(tenantId));

    this.reportsInFlight.set(tenantId, promise);
    return promise;
  }

  private async getCachedReport(tenantId: string): Promise<CacheRow | null> {
    const rows = await this.query<CacheRow>(
      sql`SELECT report, fetched_at, expires_at > now() AS is_fresh
          FROM public.analytics_report_cache
          WHERE tenant_id = ${tenantId}::uuid`,
    );
    return rows[0] ?? null;
  }

  // ── DB helpers ────────────────────────────────────────────────────────────
  private async getTenantByUserSub(userSub: string): Promise<TenantRow> {
    const rows = await this.query<TenantRow>(
      sql`SELECT id, name, plan, domain FROM public.tenants
          WHERE user_id = ${userSub}::uuid LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new AnalyticsTenantNotFoundException();
    return row;
  }

  private async getTenantById(tenantId: string): Promise<TenantRow> {
    const rows = await this.query<TenantRow>(
      sql`SELECT id, name, plan, domain FROM public.tenants
          WHERE id = ${tenantId}::uuid LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new AnalyticsTenantNotFoundException();
    return row;
  }

  private async getAnalyticsRow(tenantId: string): Promise<AnalyticsRow | null> {
    const rows = await this.query<AnalyticsRow>(
      sql`SELECT tenant_id, provisioning_status, ga4_property_id, ga4_data_stream_id,
                 ga4_measurement_id, provisioning_attempts, last_attempt_at, is_mock,
                 (last_attempt_at IS NULL
                  OR last_attempt_at < now() - make_interval(mins => ${STALE_LOCK_MINUTES})) AS lock_is_stale
          FROM public.tenant_analytics
          WHERE tenant_id = ${tenantId}::uuid`,
    );
    return rows[0] ?? null;
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

// ── Pure helpers ────────────────────────────────────────────────────────────
function overview(status: AnalyticsOverviewDto['status']): AnalyticsOverviewDto {
  return { status, report: null, fetchedAt: null, stale: false, retryAvailableAt: null };
}

/** Gap-fills to exactly RANGE_DAYS days ending today in the property zone and localizes channels. */
export function buildReport(raw: RawOverview, timeZone: string): AnalyticsReportDto {
  const byDate = new Map(
    raw.daily.map((d) => [
      `${d.date.slice(0, 4)}-${d.date.slice(4, 6)}-${d.date.slice(6, 8)}`,
      d.sessions,
    ]),
  );
  const today = todayInZone(timeZone);
  const daily = Array.from({ length: RANGE_DAYS }, (_, i) => {
    const date = addDays(today, i - (RANGE_DAYS - 1));
    return { date, sessions: byDate.get(date) ?? 0 };
  });

  const total = raw.current.sessions;
  const channels: AnalyticsChannelDto[] = mergeChannels(raw.channels)
    .slice(0, MAX_CHANNELS)
    .map(({ key, label, sessions }) => ({
      key,
      label,
      sessions,
      sharePct: total > 0 ? Math.round((sessions / total) * 100) : 0,
    }));

  return {
    rangeDays: RANGE_DAYS,
    sessions: total,
    sessionsDeltaPct: deltaPct(total, raw.previous.sessions),
    activeUsers: raw.current.activeUsers,
    activeUsersDeltaPct: deltaPct(raw.current.activeUsers, raw.previous.activeUsers),
    daily,
    channels,
    topChannel: channels[0] ?? null,
    hasData: total > 0,
  };
}

/** "Unassigned" and "(not set)" share a label, so they are folded into one bar. */
function mergeChannels(
  channels: RawOverview['channels'],
): { key: string; label: string; sessions: number }[] {
  const merged = new Map<string, { key: string; label: string; sessions: number }>();
  for (const { name, sessions } of channels) {
    const label = CHANNEL_LABELS[name] ?? name;
    const entry = merged.get(label);
    if (entry) entry.sessions += sessions;
    else merged.set(label, { key: name, label, sessions });
  }
  return [...merged.values()]
    .filter((c) => c.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions);
}

function deltaPct(current: number, previous: number): number | null {
  return previous === 0 ? null : Math.round(((current - previous) / previous) * 100);
}

async function withTransientRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [500, 1500];
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const code = grpcCode(err);
      const transient = code !== null && TRANSIENT_CODES.has(code);
      if (!transient || attempt >= delays.length) throw err;
      await sleep(delays[attempt] + Math.floor(Math.random() * 250));
    }
  }
}

function grpcCode(err: unknown): number | null {
  if (typeof err !== 'object' || err === null) return null;
  const code = (err as { code?: unknown }).code;
  return typeof code === 'number' ? code : null;
}

/** Short and secret-free: the gRPC code name plus the first line of the message. */
function describeError(err: unknown): string {
  const code = grpcCode(err);
  const name = code !== null ? (CODE_NAMES[code] ?? `CODE_${code}`) : 'ERROR';
  const message = err instanceof Error ? err.message : String(err);
  const firstLine = message.split('\n')[0].replace(/-----BEGIN[\s\S]*/g, '[redacted]');
  return `${name}: ${firstLine}`;
}

function secondsUntilRetry(lastAttemptAt: string | Date | null): number {
  if (!lastAttemptAt) return 0;
  const elapsed = (Date.now() - new Date(lastAttemptAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(RETRY_COOLDOWN_SECONDS - elapsed));
}

function retryAvailableAt(lastAttemptAt: string | Date | null): string {
  const base = lastAttemptAt ? new Date(lastAttemptAt).getTime() : Date.now();
  return new Date(
    Math.max(base + RETRY_COOLDOWN_SECONDS * 1000, Date.now()),
  ).toISOString();
}

function parseReport(value: AnalyticsReportDto | string): AnalyticsReportDto {
  return typeof value === 'string' ? (JSON.parse(value) as AnalyticsReportDto) : value;
}

function requireValue(value: string | null): string {
  // The ready_requires_ids CHECK constraint guarantees this for 'ready' rows.
  if (!value) throw new Error('ready analytics row without a property id');
  return value;
}

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
