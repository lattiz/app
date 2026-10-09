import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import Stripe from 'stripe';
import { type Database, DATABASE } from '../../database/database.module';
import {
  type BillingPeriod,
  type BillingPlan,
  PLAN_LOOKUP_KEYS,
  resolvePlanFromLookupKey,
} from './billing.constants';
import { BillingProviderUnavailableException } from './billing.exceptions';
import type {
  PlanPriceDto,
  SubscriptionPriceDto,
} from './dto/billing.response.dto';
import { STRIPE_CLIENT } from './stripe.provider';

const CATALOG_TTL_MS = 10 * 60_000;

interface Catalog {
  plans: PlanPriceDto[];
  productPlans: ReadonlyMap<string, BillingPlan>;
}
const LOOKUP_KEYS = Object.values(PLAN_LOOKUP_KEYS);
const EXPECTED_INTERVAL: Record<
  BillingPeriod,
  Stripe.Price.Recurring.Interval
> = { monthly: 'month', annual: 'year' };

/** Stripe is the single source of truth for what each plan costs; the dashboard only renders it. */
@Injectable()
export class BillingPricesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BillingPricesService.name);
  private catalog: (Catalog & { fetchedAt: number }) | null = null;
  private inflight: Promise<Catalog> | null = null;

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  /** Warn-only: a missing or archived lookup key must not keep the API from booting. */
  onApplicationBootstrap(): void {
    if (!hasRealStripeKey()) return;
    void this.listPlans()
      .then((plans) => {
        for (const key of LOOKUP_KEYS) {
          const price = plans.find((p) => p.lookupKey === key);
          if (!price) {
            this.logger.warn(
              `Stripe lookup_key "${key}" has no active price — checkout for it will fail. See STRIPE_SETUP.md.`,
            );
          }
        }
      })
      .catch(() => undefined);
  }

  /** Cached for 10 min; if Stripe fails after that, the last good catalog is served. */
  async listPlans(): Promise<PlanPriceDto[]> {
    return (await this.loadCatalog()).plans;
  }

  /** Product id → plan of today's catalog; resolves a subscription whose price lost its lookup key. */
  async productPlans(): Promise<ReadonlyMap<string, BillingPlan>> {
    return (await this.loadCatalog()).productPlans;
  }

  private async loadCatalog(): Promise<Catalog> {
    const cached = this.catalog;
    if (cached && Date.now() - cached.fetchedAt < CATALOG_TTL_MS) {
      return cached;
    }

    this.inflight ??= this.fetchCatalog().finally(() => {
      this.inflight = null;
    });
    try {
      const catalog = await this.inflight;
      this.catalog = { ...catalog, fetchedAt: Date.now() };
      return catalog;
    } catch (error) {
      if (cached) {
        this.logger.warn(
          `Stripe price lookup failed; serving the catalog from ${new Date(cached.fetchedAt).toISOString()}: ${describe(error)}`,
        );
        return cached;
      }
      this.logger.error(`Stripe price lookup failed: ${describe(error)}`);
      throw new BillingProviderUnavailableException();
    }
  }

  /** Null when the user's tenant has never subscribed. */
  async getSubscriptionPriceForUser(
    userSub: string,
  ): Promise<SubscriptionPriceDto | null> {
    const rows = (await this.db.execute(
      sql`SELECT s.stripe_subscription_id
          FROM public.subscriptions s
          JOIN public.tenants t ON t.id = s.tenant_id
          WHERE t.user_id = ${userSub}::uuid
          ORDER BY s.created_at DESC
          LIMIT 1`,
    )) as unknown as { stripe_subscription_id: string | null }[];
    const subscriptionId = rows[0]?.stripe_subscription_id;
    if (!subscriptionId) return null;

    let subscription: Stripe.Subscription;
    try {
      subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error(
        `Stripe subscription ${subscriptionId} lookup failed: ${describe(error)}`,
      );
      throw new BillingProviderUnavailableException();
    }

    const price = subscription.items.data[0]?.price;
    if (!price || price.unit_amount === null || !price.recurring) return null;
    return {
      amount: price.unit_amount,
      currency: price.currency,
      period: price.recurring.interval === 'year' ? 'annual' : 'monthly',
    };
  }

  private async fetchCatalog(): Promise<Catalog> {
    const prices = await this.stripe.prices.list({
      lookup_keys: LOOKUP_KEYS,
      active: true,
      limit: LOOKUP_KEYS.length,
    });

    const plans: PlanPriceDto[] = [];
    const productPlans = new Map<string, BillingPlan>();
    for (const price of prices.data) {
      const resolved = resolvePlanFromLookupKey(price.lookup_key ?? '');
      if (!resolved || price.unit_amount === null) continue;
      if (price.recurring?.interval !== EXPECTED_INTERVAL[resolved.period]) {
        this.logger.warn(
          `Stripe price ${price.id} (${price.lookup_key}) bills every ${price.recurring?.interval ?? 'one-time'}; ignoring it.`,
        );
        continue;
      }
      plans.push({
        plan: resolved.plan,
        period: resolved.period,
        amount: price.unit_amount,
        currency: price.currency,
        lookupKey: price.lookup_key as string,
      });
      const productId =
        typeof price.product === 'string' ? price.product : price.product.id;
      productPlans.set(productId, resolved.plan);
    }
    return { plans, productPlans };
  }
}

function hasRealStripeKey(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? '';
  return /^(sk|rk)_(test|live)_[A-Za-z0-9]{16,}$/.test(key);
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
