import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sql, type SQL } from 'drizzle-orm';
import { computeIsEntitled } from '../../common/billing/entitlement';
import { type Database, DATABASE } from '../../database/database.module';
import { AdminAlertService } from '../email/application/admin-alert.service';
import { EmailOutboxService } from '../email/application/email-outbox.service';
import type { EmailKind } from '../email/domain/email-kinds';
import {
  computeRenewalCharge,
  DomainRenewalConfig,
} from './domain-renewal.config';
import {
  currentRenewalNotice,
  type RenewalNotice,
  renewalNoticeKey,
  renewalWindow,
  RENEWAL_DAY_MS,
} from './domain/domain-renewal.policy';
import { REGISTRAR_PORT, type RegistrarPort } from './domain/registrar.port';
import { DomainsService } from './domains.service';

export interface RenewalRunSummary {
  opened: number;
  overdue: number;
  lapsed: number;
  notices: number;
  skipped: number;
  errors: number;
}

export interface RenewalCycleView {
  cycleId: string;
  domainId: string;
  tenantId: string;
  domain: string;
  status: 'open' | 'overdue' | 'paid' | 'renewed' | 'renewal_failed' | 'lapsed';
  expiresAt: Date;
  lateDeadlineAt: Date | null;
  baseCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
}

interface CandidateRow {
  id: string;
  tenant_id: string;
  domain: string;
  registrar_domain_id: string;
  expires_at: string | Date;
  plan: string | null;
}

interface OpenCycleRow {
  id: string;
}

interface OverdueCycleRow {
  id: string;
  tenant_id: string;
  domain?: string | null;
  expires_at?: string | Date | null;
  late_deadline_at?: string | Date | null;
  base_amount_cents?: number | string | null;
  tax_amount_cents?: number | string | null;
  amount_cents?: number | string | null;
  currency?: string | null;
}

interface NoticeCycleRow {
  id: string;
  tenant_id: string;
  domain: string;
  expires_at: string | Date;
  late_deadline_at: string | Date | null;
  base_amount_cents: number | string | null;
  tax_amount_cents: number | string | null;
  amount_cents: number | string | null;
  currency: string;
  subscription_status: string | null;
  current_period_end: string | Date | null;
}

interface ActiveCycleRow {
  id: string;
  domain_id: string;
  tenant_id: string;
  domain: string;
  status: RenewalCycleView['status'];
  expires_at: string | Date;
  late_deadline_at: string | Date | null;
  base_amount_cents: number | string | null;
  tax_amount_cents: number | string | null;
  amount_cents: number | string | null;
  currency: string;
}

/** Opens and advances unpaid renewal cycles. Payment is DomainRenewalPaymentService. */
@Injectable()
export class DomainRenewalService {
  private readonly logger = new Logger(DomainRenewalService.name);
  private running = false;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(REGISTRAR_PORT) private readonly registrar: RegistrarPort,
    private readonly config: DomainRenewalConfig,
    private readonly domains: DomainsService,
    private readonly emails: EmailOutboxService,
    private readonly adminAlerts: AdminAlertService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runScheduled(now: Date = new Date()): Promise<RenewalRunSummary> {
    if (!this.config.enabled || this.running) return emptySummary();
    this.running = true;
    try {
      return await this.run(now);
    } catch (err) {
      this.logger.error(`[domain-renewal] Run failed: ${errorText(err)}`);
      return emptySummary();
    } finally {
      this.running = false;
    }
  }

  async run(now: Date = new Date()): Promise<RenewalRunSummary> {
    const summary = emptySummary();
    if (!this.config.enabled) return summary;
    await this.openCycles(now, summary);
    await this.markOverdue(now, summary);
    await this.lapseOverdue(now, summary);
    await this.sendNotices(now, summary);
    this.logger.log(
      `[domain-renewal] opened=${summary.opened} overdue=${summary.overdue} lapsed=${summary.lapsed} notices=${summary.notices} skipped=${summary.skipped} errors=${summary.errors}`,
    );
    return summary;
  }

  /** The tenant's live renewal cycle (open, overdue, paid or renewal_failed), newest first; null if none. */
  async findActiveCycleForTenant(
    tenantId: string,
  ): Promise<RenewalCycleView | null> {
    const rows = await this.query<ActiveCycleRow>(
      sql`SELECT c.id, c.domain_id, c.tenant_id, d.domain, c.status,
                 c.expires_at, c.late_deadline_at,
                 c.base_amount_cents, c.tax_amount_cents, c.amount_cents,
                 c.currency
          FROM public.domain_maintenance_cycles c
          JOIN public.domains d ON d.id = c.domain_id
          WHERE c.tenant_id = ${tenantId}::uuid
            AND c.status IN ('open', 'overdue', 'paid', 'renewal_failed')
          ORDER BY c.opened_at DESC NULLS LAST, c.expires_at DESC
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) return null;
    return {
      cycleId: row.id,
      domainId: row.domain_id,
      tenantId: row.tenant_id,
      domain: row.domain,
      status: row.status,
      expiresAt: asDate(row.expires_at),
      lateDeadlineAt:
        row.late_deadline_at === null ? null : asDate(row.late_deadline_at),
      baseCents: cents(row.base_amount_cents),
      taxCents: cents(row.tax_amount_cents),
      totalCents: cents(row.amount_cents),
      currency: row.currency,
    };
  }

  private async openCycles(
    now: Date,
    summary: RenewalRunSummary,
  ): Promise<void> {
    const openDays = this.config.openDaysBefore;
    const lateDays = this.config.lateDays;
    const after = new Date(now.getTime() - lateDays * RENEWAL_DAY_MS);
    const through = new Date(now.getTime() + openDays * RENEWAL_DAY_MS);
    let rows: CandidateRow[];
    try {
      rows = await this.query<CandidateRow>(
        sql`SELECT d.id, d.tenant_id, d.domain, d.registrar_domain_id,
                   d.expires_at, t.plan
            FROM public.domains d
            JOIN public.tenants t ON t.id = d.tenant_id
            WHERE d.source = 'lattiz_managed'
              AND d.is_mock = false
              AND d.released_at IS NULL
              AND d.purchase_completed_at IS NOT NULL
              AND d.registrar_domain_id IS NOT NULL
              AND d.expires_at IS NOT NULL
              AND d.expires_at > ${iso(after)}::timestamptz
              AND d.expires_at <= ${iso(through)}::timestamptz
              AND NOT EXISTS (
                SELECT 1
                FROM public.domain_maintenance_cycles c
                WHERE c.domain_id = d.id
                  AND c.expires_at = d.expires_at
                  AND c.status <> 'void'
              )`,
      );
    } catch (err) {
      summary.errors += 1;
      this.logger.error(
        `[domain-renewal] Could not list domains due for renewal: ${errorText(err)}`,
      );
      return;
    }

    for (const row of rows) {
      try {
        await this.openOne(row, now, summary);
      } catch (err) {
        summary.errors += 1;
        this.logger.error(
          `[domain-renewal] Failed to open a cycle for ${row.domain}: ${errorText(err)}`,
        );
      }
    }
  }

  private async openOne(
    row: CandidateRow,
    now: Date,
    summary: RenewalRunSummary,
  ): Promise<void> {
    let reported: Date | null;
    try {
      const lifecycle = await this.registrar.getLifecycle(
        row.registrar_domain_id,
      );
      reported = lifecycle.renewalDate;
    } catch (err) {
      summary.skipped += 1;
      this.logger.warn(
        `[domain-renewal] Registrar lifecycle failed for ${row.domain} (${row.registrar_domain_id}); will retry: ${errorText(err)}`,
      );
      return;
    }

    const stored = asDate(row.expires_at);
    if (Number.isNaN(stored.getTime())) {
      throw new Error(`domain ${row.id} has an invalid expires_at`);
    }

    // Missing or same-day registrar dates keep the stored expiry; a larger gap waits one pass.
    if (
      reported !== null &&
      Math.abs(reported.getTime() - stored.getTime()) > RENEWAL_DAY_MS
    ) {
      await this.query(
        sql`UPDATE public.domains
            SET expires_at = ${iso(reported)}::timestamptz
            WHERE id = ${row.id}::uuid`,
      );
      this.logger.log(
        `[domain-renewal] ${row.domain} expiry moved to ${iso(reported)}; cycle deferred`,
      );
      return;
    }

    const window = renewalWindow({
      expiresAt: stored,
      now,
      openDaysBefore: this.config.openDaysBefore,
      lateDays: this.config.lateDays,
    });
    if (window.phase !== 'open' && window.phase !== 'late') return;

    const plan = row.plan ?? 'none';
    const charge = computeRenewalCharge(
      this.config.feeMxnCents(plan),
      this.config.taxRateBps,
    );
    const late = window.phase === 'late';
    const inserted = await this.query<{ id: string }>(
      sql`INSERT INTO public.domain_maintenance_cycles (
            tenant_id, domain_id, expires_at, status,
            base_amount_cents, tax_amount_cents, amount_cents, currency,
            plan_at_open, opened_at, overdue_at, site_offline_at, late_deadline_at
          ) VALUES (
            ${row.tenant_id}::uuid,
            ${row.id}::uuid,
            (SELECT expires_at FROM public.domains WHERE id = ${row.id}::uuid),
            ${late ? 'overdue' : 'open'},
            ${charge.baseCents},
            ${charge.taxCents},
            ${charge.totalCents},
            'mxn',
            ${row.plan},
            ${iso(now)}::timestamptz,
            ${late ? iso(now) : null}::timestamptz,
            ${late ? iso(now) : null}::timestamptz,
            ${iso(window.lateDeadlineAt)}::timestamptz
          )
          ON CONFLICT (domain_id, expires_at) WHERE status <> 'void' DO NOTHING
          RETURNING id`,
    );
    if (inserted.length > 0) summary.opened += 1;
  }

  private async markOverdue(
    now: Date,
    summary: RenewalRunSummary,
  ): Promise<void> {
    let rows: OpenCycleRow[];
    try {
      rows = await this.query<OpenCycleRow>(
        sql`SELECT id
            FROM public.domain_maintenance_cycles
            WHERE status = 'open'
              AND expires_at <= ${iso(now)}::timestamptz`,
      );
    } catch (err) {
      summary.errors += 1;
      this.logger.error(
        `[domain-renewal] Could not list cycles to mark overdue: ${errorText(err)}`,
      );
      return;
    }

    for (const row of rows) {
      try {
        const updated = await this.query<{ id: string }>(
          sql`UPDATE public.domain_maintenance_cycles
              SET status = 'overdue',
                  overdue_at = ${iso(now)}::timestamptz,
                  site_offline_at = ${iso(now)}::timestamptz,
                  late_deadline_at = COALESCE(
                    late_deadline_at,
                    expires_at + make_interval(days => ${this.config.lateDays})
                  )
              WHERE id = ${row.id}::uuid
                AND status = 'open'
              RETURNING id`,
        );
        if (updated.length > 0) summary.overdue += 1;
      } catch (err) {
        summary.errors += 1;
        this.logger.error(
          `[domain-renewal] Failed to mark cycle ${row.id} overdue: ${errorText(err)}`,
        );
      }
    }
  }

  private async lapseOverdue(
    now: Date,
    summary: RenewalRunSummary,
  ): Promise<void> {
    let rows: OverdueCycleRow[];
    try {
      rows = await this.query<OverdueCycleRow>(
        sql`SELECT c.id, c.tenant_id, d.domain, c.expires_at, c.late_deadline_at,
                   c.base_amount_cents, c.tax_amount_cents, c.amount_cents,
                   c.currency
            FROM public.domain_maintenance_cycles c
            JOIN public.domains d ON d.id = c.domain_id
            WHERE c.status = 'overdue'
              AND c.late_deadline_at <= ${iso(now)}::timestamptz`,
      );
    } catch (err) {
      summary.errors += 1;
      this.logger.error(
        `[domain-renewal] Could not list cycles to lapse: ${errorText(err)}`,
      );
      return;
    }

    for (const row of rows) {
      try {
        // A payment may have landed since the list was read; never release a paid cycle.
        const still = await this.query<{ id: string }>(
          sql`SELECT id FROM public.domain_maintenance_cycles
              WHERE id = ${row.id}::uuid AND status = 'overdue'`,
        );
        if (still.length === 0) continue;
        await this.domains.releaseDomain(row.tenant_id);
      } catch (err) {
        summary.errors += 1;
        this.logger.error(
          `[domain-renewal] Failed to release tenant ${row.tenant_id}: ${errorText(err)}`,
        );
        try {
          const written = await this.query<{ attempts: number | string }>(
            sql`UPDATE public.domain_maintenance_cycles
                SET last_error = ${errorText(err)},
                    attempts = attempts + 1
                WHERE id = ${row.id}::uuid
                  AND status = 'overdue'
                RETURNING attempts`,
          );
          const attempts = cents(written[0]?.attempts ?? null);
          if (attempts >= 3) {
            await this.adminAlerts.alert({
              key: `renewal_release:${row.id}`,
              title: 'No se pudo liberar un dominio vencido',
              summary:
                'Un ciclo vencido no pudo liberarse 3 veces seguidas. Hay que liberar el dominio a mano.',
              details: {
                tenant: row.tenant_id,
                dominio: row.domain ?? '',
                ultimo_error: errorText(err),
              },
              tenantId: row.tenant_id,
            });
          }
        } catch (writeErr) {
          this.logger.error(
            `[domain-renewal] Failed to record the release error on cycle ${row.id}: ${errorText(writeErr)}`,
          );
        }
        continue;
      }

      try {
        const updated = await this.query<{ id: string }>(
          sql`UPDATE public.domain_maintenance_cycles
              SET status = 'lapsed',
                  lapsed_at = ${iso(now)}::timestamptz
              WHERE id = ${row.id}::uuid
                AND status = 'overdue'
              RETURNING id`,
        );
        if (updated.length > 0) {
          summary.lapsed += 1;
          await this.emails.enqueueForTenant(
            'domain_lost',
            row.tenant_id,
            renewalEmailData(row, now, false),
            `renewal:${row.id}:lost`,
          );
        }
      } catch (err) {
        summary.errors += 1;
        this.logger.error(
          `[domain-renewal] Released tenant ${row.tenant_id} but could not mark cycle ${row.id} lapsed: ${errorText(err)}`,
        );
      }
    }
  }

  private async sendNotices(
    now: Date,
    summary: RenewalRunSummary,
  ): Promise<void> {
    let rows: NoticeCycleRow[];
    try {
      rows = await this.query<NoticeCycleRow>(
        sql`SELECT c.id, c.tenant_id, d.domain, c.expires_at, c.late_deadline_at,
                   c.base_amount_cents, c.tax_amount_cents, c.amount_cents,
                   c.currency,
                   s.status AS subscription_status,
                   s.current_period_end
            FROM public.domain_maintenance_cycles c
            JOIN public.domains d ON d.id = c.domain_id
            LEFT JOIN LATERAL (
              SELECT sub.status, sub.current_period_end
              FROM public.subscriptions sub
              WHERE sub.tenant_id = c.tenant_id
              ORDER BY sub.created_at DESC NULLS LAST
              LIMIT 1
            ) s ON true
            WHERE c.status IN ('open', 'overdue')`,
      );
    } catch (err) {
      summary.errors += 1;
      this.logger.error(
        `[domain-renewal] Could not list cycles to notify: ${errorText(err)}`,
      );
      return;
    }

    for (const row of rows) {
      try {
        const expiresAt = asDate(row.expires_at);
        const notice = currentRenewalNotice({
          expiresAt,
          now,
          noticeDaysBefore: this.config.noticeDaysBefore,
          lateNoticeDaysAfter: this.config.lateNoticeDaysAfter,
          openDaysBefore: this.config.openDaysBefore,
          lateDays: this.config.lateDays,
        });
        if (!notice) continue;
        const lateDeadlineAt =
          row.late_deadline_at === null ? null : asDate(row.late_deadline_at);
        const subscriptionActive = computeIsEntitled({
          status: row.subscription_status,
          currentPeriodEnd: row.current_period_end,
        });
        await this.emails.enqueueForTenant(
          noticeEmailKind(notice),
          row.tenant_id,
          {
            ...renewalEmailData(row, now, subscriptionActive),
            daysLeft: noticeDaysLeft(notice, expiresAt, lateDeadlineAt, now),
          },
          `renewal:${row.id}:${renewalNoticeKey(notice)}`,
        );
        summary.notices += 1;
      } catch (err) {
        summary.errors += 1;
        this.logger.error(
          `[domain-renewal] Failed to enqueue a notice for cycle ${row.id}: ${errorText(err)}`,
        );
      }
    }
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function emptySummary(): RenewalRunSummary {
  return { opened: 0, overdue: 0, lapsed: 0, notices: 0, skipped: 0, errors: 0 };
}

function noticeEmailKind(notice: RenewalNotice): EmailKind {
  if (notice.kind === 'after') return 'renewal_last_notice';
  if (notice.days === 0) return 'domain_expired';
  return 'renewal_upcoming';
}

function noticeDaysLeft(
  notice: RenewalNotice,
  expiresAt: Date,
  lateDeadlineAt: Date | null,
  now: Date,
): number {
  const target =
    notice.kind === 'after' && lateDeadlineAt !== null
      ? lateDeadlineAt
      : expiresAt;
  return daysUntil(target, now);
}

function daysUntil(target: Date, now: Date): number {
  const delta = target.getTime() - now.getTime();
  if (delta <= 0) return 0;
  return Math.ceil(delta / RENEWAL_DAY_MS);
}

function renewalEmailData(
  row: {
    domain?: string | null;
    expires_at?: string | Date | null;
    late_deadline_at?: string | Date | null;
    base_amount_cents?: number | string | null;
    tax_amount_cents?: number | string | null;
    amount_cents?: number | string | null;
    currency?: string | null;
  },
  now: Date,
  subscriptionActive: boolean,
): Record<string, unknown> {
  const expiresAt = row.expires_at ? asDate(row.expires_at) : now;
  const late =
    row.late_deadline_at == null ? null : asDate(row.late_deadline_at);
  return {
    domain: row.domain ?? '',
    expiresAt: iso(expiresAt),
    lateDeadlineAt: late && !Number.isNaN(late.getTime()) ? iso(late) : null,
    daysLeft: 0,
    baseCents: cents(row.base_amount_cents ?? null),
    taxCents: cents(row.tax_amount_cents ?? null),
    totalCents: cents(row.amount_cents ?? null),
    currency: row.currency ?? 'mxn',
    subscriptionActive,
  };
}

function asDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function cents(value: number | string | null): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function errorText(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  return message.slice(0, 500);
}

/** postgres.js rejects a Date bound in raw sql; bind ISO text and cast. */
function iso(value: Date): string {
  return value.toISOString();
}
