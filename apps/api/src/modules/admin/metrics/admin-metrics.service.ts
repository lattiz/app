import { Inject, Injectable, Logger } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import type Stripe from 'stripe';
import { type Database, DATABASE } from '../../../database/database.module';
import { PreviewConfig } from '../../../common/billing/preview.config';
import { SettingsService } from '../../../common/settings/settings.service';
import { STRIPE_CLIENT } from '../../billing/stripe.provider';
import { AdminStripeUnavailableException } from '../admin.exceptions';
import {
  mexicoCityDayBounds,
  mexicoCityDayKey,
  mexicoCityMonthBounds,
  mexicoCityMonthKeys,
  mexicoCityMonthStart,
  mexicoCityWindowStart,
  previousMexicoCityDay,
} from './admin-metrics.calendar';
import {
  customerFigures,
  type SubscriptionFact,
} from './admin-metrics.customers';
import type {
  MetricsFunnelDto,
  MetricsHistoryDto,
  MetricsOverviewDto,
  MetricsRevenueDto,
  MetricsTemplatesDto,
} from './admin-metrics.dto';
import { summarizeFunnel, type FunnelTenant } from './admin-metrics.funnel';
import { summarizeStripeMrr, type MrrSummary } from './admin-metrics.mrr';
import {
  domainFactsStatement,
  funnelStatement,
  internalCustomerStatement,
  kpiHistoryStatement,
  kpiUpsertStatement,
  publishedSitesStatement,
  signupsStatement,
  subscriptionFactsStatement,
  templateUsageStatement,
  trialFactsStatement,
  type KpiSnapshotWrite,
} from './admin-metrics.queries';
import {
  summarizeDomains,
  type DomainRenewalFact,
  type RenewalFees,
} from './admin-metrics.renewals';
import {
  groupRevenueByMonth,
  type BalanceTxn,
  type RevenuePoint,
} from './admin-metrics.revenue-series';
import {
  rankTemplates,
  type TemplateUsageFact,
} from './admin-metrics.templates';
import { countOpenTrials, type TrialFact } from './admin-metrics.trials';

const CACHE_TTL_MS = 10 * 60 * 1000;
const STRIPE_PAGE = 100;

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

interface SubscriptionRow {
  tenant_id: string;
  status: string;
  current_period_end: string | Date | null;
  canceled_at: string | Date | null;
  created_at: string | Date;
  cancel_at_period_end: boolean | null;
  cancel_at: string | Date | null;
  is_latest: boolean;
}

interface TrialRow {
  plan: string;
  preview_started_at: string | Date;
  subscription_status: string | null;
  current_period_end: string | Date | null;
  converted_at: string | Date | null;
}

interface DomainRow {
  source: string;
  plan: string;
  expires_at: string | Date | null;
  overdue: boolean;
  open_amount_cents: number | string | null;
  open_expires_at: string | Date | null;
}

interface FunnelRow {
  created_at: string | Date;
  has_schema: boolean;
  published: boolean;
  paid_at: string | Date | null;
}

interface TemplateRow {
  template_id: string;
  name: string;
  tier: string;
  tenants_using: number | string;
  paying_tenants: number | string;
}

interface HistoryRow {
  day: string;
  mrr_cents: number | string | null;
  currency: string | null;
  paying_tenants: number | string;
  trials_active: number | string;
  signups: number | string;
  new_paying: number | string;
  cancellations: number | string;
  published_sites: number | string;
  captured_at: string | Date;
}

interface CountRow {
  total: number | string;
}

interface CustomerIdRow {
  stripe_customer_id: string;
}

@Injectable()
export class AdminMetricsService {
  private readonly logger = new Logger(AdminMetricsService.name);
  private mrrCache: CacheEntry<MrrSummary> | null = null;
  private revenueCache = new Map<string, CacheEntry<RevenuePoint[]>>();

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly settings: SettingsService,
    private readonly preview: PreviewConfig,
  ) {}

  /** Marcar un tenant interno lo saca de los KPI; la siguiente lectura vuelve a Stripe. */
  invalidate(): void {
    this.mrrCache = null;
    this.revenueCache.clear();
  }

  async overview(now = new Date()): Promise<MetricsOverviewDto> {
    const [subscriptions, trials, product, mrr] = await Promise.all([
      this.customerFacts(),
      this.trialFacts(),
      this.product(now),
      this.cachedMrr(now),
    ]);
    const month = mexicoCityMonthBounds(now);
    const customers = customerFigures(subscriptions, month);
    const openTrials = countOpenTrials(trials, this.previewPolicy(), now);
    const revenue = mrr.ok ? mrr.summary : null;
    return {
      mrrCents: revenue ? revenue.mrrCents : null,
      arrCents: revenue ? revenue.arrCents : null,
      currency: revenue ? revenue.currency : null,
      mrrByPlan: revenue ? revenue.byPlan : [],
      mrrByPeriod: revenue ? revenue.byPeriod : [],
      mrrByCurrency: revenue ? revenue.byCurrency : [],
      revenueError: mrr.ok ? null : 'unavailable',
      customers: {
        payingTenants: customers.payingTenants,
        newPayingThisMonth: customers.newPaying,
        cancellationsThisMonth: customers.cancellations,
        churnRateThisMonth: customers.churnRate,
        atRisk: customers.atRisk,
      },
      trials: {
        active: openTrials.active,
        expiringWithin48h: openTrials.expiringWithin48h,
      },
      product,
      generatedAt: now.toISOString(),
    };
  }

  async revenue(
    months: number | undefined,
    now = new Date(),
  ): Promise<MetricsRevenueDto> {
    const count = clamp(months, 12, 1, 24);
    const items = await this.cachedRevenue(count, now);
    return { items, months: count };
  }

  async funnel(
    days: number | undefined,
    now = new Date(),
  ): Promise<MetricsFunnelDto> {
    const count = clamp(days, 30, 7, 365);
    const start = mexicoCityWindowStart(now, count);
    const rows = await this.query<FunnelRow>(
      funnelStatement(start.toISOString(), now.toISOString()),
    );
    return {
      days: count,
      ...summarizeFunnel(rows.map(mapFunnel)),
    };
  }

  async templates(): Promise<MetricsTemplatesDto> {
    const rows = await this.query<TemplateRow>(templateUsageStatement());
    return rankTemplates(rows.flatMap(mapTemplate));
  }

  async history(
    days: number | undefined,
    now = new Date(),
  ): Promise<MetricsHistoryDto> {
    const count = clamp(days, 90, 7, 730);
    const start = mexicoCityWindowStart(now, count);
    const rows = await this.query<HistoryRow>(
      kpiHistoryStatement(mexicoCityDayKey(start)),
    );
    return {
      days: count,
      items: rows.map(mapHistory),
    };
  }

  /** Point-in-time figures as of `now`, flow counts for the closed Mexico City day. */
  async captureClosedDay(now = new Date()): Promise<void> {
    const day = previousMexicoCityDay(now);
    const bounds = mexicoCityDayBounds(day);
    const [subscriptions, trials, publishedSites, signups, mrr] =
      await Promise.all([
        this.customerFacts(),
        this.trialFacts(),
        this.count(publishedSitesStatement()),
        this.count(
          signupsStatement(
            bounds.start.toISOString(),
            bounds.end.toISOString(),
          ),
        ),
        this.cachedMrr(now),
      ]);
    const figures = customerFigures(subscriptions, bounds);
    const openTrials = countOpenTrials(trials, this.previewPolicy(), now);
    const row: KpiSnapshotWrite = {
      day,
      mrrCents: mrr.ok ? mrr.summary.mrrCents : null,
      currency: mrr.ok ? mrr.summary.currency : null,
      payingTenants: figures.payingTenants,
      trialsActive: openTrials.active,
      signups,
      newPaying: figures.newPaying,
      cancellations: figures.cancellations,
      publishedSites,
      capturedAt: now.toISOString(),
    };
    await this.db.execute(kpiUpsertStatement(row));
  }

  private async product(now: Date): Promise<MetricsOverviewDto['product']> {
    const [rows, publishedSites] = await Promise.all([
      this.query<DomainRow>(domainFactsStatement()),
      this.count(publishedSitesStatement()),
    ]);
    const forecast = summarizeDomains(
      rows.map(mapDomain),
      now,
      this.renewalFees(),
    );
    return { publishedSites, ...forecast };
  }

  private async cachedMrr(
    now: Date,
  ): Promise<{ ok: true; summary: MrrSummary } | { ok: false }> {
    const cached = this.mrrCache;
    if (cached && cached.expiresAt > now.getTime()) {
      return { ok: true, summary: cached.value };
    }
    try {
      const [subscriptions, internalIds] = await Promise.all([
        this.listSubscriptions(),
        this.internalCustomerIds(),
      ]);
      const summary = summarizeStripeMrr(
        subscriptions,
        internalIds,
        Math.floor(now.getTime() / 1000),
      );
      this.mrrCache = {
        expiresAt: now.getTime() + CACHE_TTL_MS,
        value: summary,
      };
      return { ok: true, summary };
    } catch (err) {
      this.logger.warn(`MRR no disponible: ${messageOf(err)}`);
      return { ok: false };
    }
  }

  private async cachedRevenue(
    months: number,
    now: Date,
  ): Promise<RevenuePoint[]> {
    const monthKeys = mexicoCityMonthKeys(now, months);
    const cacheKey = `${months}:${monthKeys[0] ?? ''}`;
    const cached = this.revenueCache.get(cacheKey);
    if (cached && cached.expiresAt > now.getTime()) return cached.value;
    const firstMonth = monthKeys[0];
    if (!firstMonth) return [];
    let transactions: Stripe.BalanceTransaction[];
    try {
      const start = mexicoCityMonthStart(firstMonth);
      transactions = await this.listBalanceTransactions(
        Math.floor(start.getTime() / 1000),
      );
    } catch (err) {
      this.logger.warn(`Ingresos no disponibles: ${messageOf(err)}`);
      throw new AdminStripeUnavailableException();
    }
    const value = groupRevenueByMonth(transactions.map(mapBalance), monthKeys);
    this.revenueCache.set(cacheKey, {
      expiresAt: now.getTime() + CACHE_TTL_MS,
      value,
    });
    return value;
  }

  private async listSubscriptions(): Promise<Stripe.Subscription[]> {
    return this.collect(
      this.stripe.subscriptions.list({
        status: 'all',
        limit: STRIPE_PAGE,
        expand: ['data.items.data.price', 'data.discounts.source.coupon'],
      }),
    );
  }

  private async listBalanceTransactions(
    gteUnix: number,
  ): Promise<Stripe.BalanceTransaction[]> {
    return this.collect(
      this.stripe.balanceTransactions.list({
        created: { gte: gteUnix },
        limit: STRIPE_PAGE,
      }),
    );
  }

  private async collect<T>(pending: {
    autoPagingEach: (
      handler: (item: T) => void | Promise<void>,
    ) => Promise<void>;
  }): Promise<T[]> {
    const items: T[] = [];
    await pending.autoPagingEach((item) => {
      items.push(item);
    });
    return items;
  }

  private async internalCustomerIds(): Promise<Set<string>> {
    const rows = await this.query<CustomerIdRow>(internalCustomerStatement());
    return new Set(rows.map((row) => row.stripe_customer_id));
  }

  private async customerFacts(): Promise<SubscriptionFact[]> {
    const rows = await this.query<SubscriptionRow>(
      subscriptionFactsStatement(),
    );
    return rows.map((row) => ({
      tenantId: row.tenant_id,
      status: row.status,
      currentPeriodEnd: row.current_period_end,
      canceledAt: row.canceled_at,
      createdAt: row.created_at,
      cancelAtPeriodEnd: row.cancel_at_period_end === true,
      cancelAt: row.cancel_at,
      latest: row.is_latest === true,
    }));
  }

  private async trialFacts(): Promise<TrialFact[]> {
    const rows = await this.query<TrialRow>(trialFactsStatement());
    return rows.map((row) => ({
      plan: row.plan,
      previewStartedAt: row.preview_started_at,
      subscriptionStatus: row.subscription_status,
      currentPeriodEnd: row.current_period_end,
      convertedAt: row.converted_at,
    }));
  }

  private previewPolicy(): { enabled: boolean; trialDays: number } {
    return { enabled: this.preview.enabled, trialDays: this.preview.trialDays };
  }

  private renewalFees(): RenewalFees {
    return {
      basicCents: this.settings.getInt('domain.renewal.fee_basic_mxn_cents'),
      proCents: this.settings.getInt('domain.renewal.fee_pro_mxn_cents'),
      taxRateBps: this.settings.getInt('domain.renewal.tax_rate_bps'),
    };
  }

  private async count(statement: SQL): Promise<number> {
    const rows = await this.query<CountRow>(statement);
    return asInt(rows[0]?.total);
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function mapDomain(row: DomainRow): DomainRenewalFact {
  return {
    source: row.source,
    plan: row.plan,
    expiresAt: row.expires_at,
    overdue: row.overdue === true,
    openAmountCents:
      row.open_amount_cents == null ? null : asInt(row.open_amount_cents),
    openExpiresAt: row.open_expires_at,
  };
}

function mapFunnel(row: FunnelRow): FunnelTenant {
  return {
    createdAt: row.created_at,
    hasSchema: row.has_schema === true,
    published: row.published === true,
    paidAt: row.paid_at,
  };
}

function mapTemplate(row: TemplateRow): TemplateUsageFact[] {
  if (row.tier !== 'basic' && row.tier !== 'pro') return [];
  return [
    {
      id: row.template_id,
      name: row.name,
      tier: row.tier,
      tenantsUsing: asInt(row.tenants_using),
      payingTenants: asInt(row.paying_tenants),
    },
  ];
}

function mapHistory(row: HistoryRow): MetricsHistoryDto['items'][number] {
  return {
    day: row.day,
    mrrCents: row.mrr_cents == null ? null : asInt(row.mrr_cents),
    currency: row.currency,
    payingTenants: asInt(row.paying_tenants),
    trialsActive: asInt(row.trials_active),
    signups: asInt(row.signups),
    newPaying: asInt(row.new_paying),
    cancellations: asInt(row.cancellations),
    publishedSites: asInt(row.published_sites),
    capturedAt: asIso(row.captured_at),
  };
}

function mapBalance(txn: Stripe.BalanceTransaction): BalanceTxn {
  return {
    type: txn.type,
    amount: txn.amount,
    fee: txn.fee,
    net: txn.net,
    currency: txn.currency,
    created: txn.created,
  };
}

function clamp(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || !Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function asInt(value: number | string | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.trunc(parsed);
}

function asIso(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date(0).toISOString();
  return date.toISOString();
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : 'unknown';
}
