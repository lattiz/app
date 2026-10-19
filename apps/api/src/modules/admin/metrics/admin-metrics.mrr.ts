import type Stripe from 'stripe';
import { resolvePlanFromLookupKey } from '../../billing/billing.constants';

const COUNTED_STATUSES = new Set(['active', 'trialing', 'past_due']);

export interface PlanMrr {
  plan: 'basico' | 'pro';
  mrrCents: number;
}

export interface PeriodMrr {
  period: 'monthly' | 'annual' | 'weekly';
  mrrCents: number;
}

export interface CurrencyMrr {
  currency: string;
  mrrCents: number;
  arrCents: number;
  byPlan: PlanMrr[];
  byPeriod: PeriodMrr[];
}

export interface MrrSummary {
  /** Headline currency: MXN when present, otherwise the only currency. */
  mrrCents: number | null;
  arrCents: number | null;
  currency: string | null;
  byPlan: PlanMrr[];
  byPeriod: PeriodMrr[];
  byCurrency: CurrencyMrr[];
}

interface Bucket {
  currency: string;
  mrrCents: number;
  plans: Record<'basico' | 'pro', number>;
  periods: Record<'monthly' | 'annual' | 'weekly', number>;
}

/**
 * Live MRR from Stripe subscriptions. Annual ÷ 12, weekly × 52 / 12,
 * monthly unchanged. A fixed coupon is removed from the billing period
 * before that normalization. Internal customers are dropped by id.
 */
export function summarizeStripeMrr(
  subscriptions: readonly Stripe.Subscription[],
  internalCustomerIds: ReadonlySet<string>,
  nowSec: number,
): MrrSummary {
  const buckets = new Map<string, Bucket>();
  for (const subscription of subscriptions) {
    if (!COUNTED_STATUSES.has(subscription.status)) continue;
    const customerId = customerIdOf(subscription);
    if (customerId && internalCustomerIds.has(customerId)) continue;
    addSubscription(buckets, subscription, nowSec);
  }
  return toSummary([...buckets.values()]);
}

function addSubscription(
  buckets: Map<string, Bucket>,
  subscription: Stripe.Subscription,
  nowSec: number,
): void {
  const discount = activeDiscount(subscription, nowSec);
  let amountOffLeft =
    discount?.percentOff == null ? (discount?.amountOff ?? 0) : 0;
  const percentOff = discount?.percentOff ?? null;
  for (const item of subscription.items?.data ?? []) {
    const price = item.price;
    if (!price || typeof price === 'string') continue;
    const interval = price.recurring?.interval;
    if (!interval || price.unit_amount == null || price.unit_amount < 0) {
      continue;
    }
    const quantity = item.quantity ?? 1;
    if (quantity <= 0) continue;
    const currency = price.currency.toLowerCase();
    let periodAmount = price.unit_amount * quantity;
    if (percentOff != null) {
      const factor = Math.min(100, Math.max(0, percentOff));
      periodAmount *= 1 - factor / 100;
    }
    if (
      amountOffLeft > 0 &&
      (discount?.currency == null || discount.currency === currency)
    ) {
      const applied = Math.min(periodAmount, amountOffLeft);
      periodAmount -= applied;
      amountOffLeft -= applied;
    }
    const monthly = Math.max(
      0,
      Math.round(
        toMonthly(periodAmount, interval, price.recurring?.interval_count ?? 1),
      ),
    );
    if (monthly === 0) continue;
    const bucket = bucketFor(buckets, currency);
    bucket.mrrCents += monthly;
    const plan = price.lookup_key
      ? resolvePlanFromLookupKey(price.lookup_key)?.plan
      : undefined;
    if (plan === 'basico' || plan === 'pro') bucket.plans[plan] += monthly;
    const period = periodOf(interval);
    if (period) bucket.periods[period] += monthly;
  }
}

/** Day prices stay in the total only; the panel buckets month, year and week. */
export function toMonthly(
  periodAmount: number,
  interval: string,
  intervalCount: number,
): number {
  const count = intervalCount > 0 ? intervalCount : 1;
  if (interval === 'year') return periodAmount / (12 * count);
  if (interval === 'week') return (periodAmount * 52) / (12 * count);
  if (interval === 'month') return periodAmount / count;
  if (interval === 'day') return (periodAmount * 365) / (12 * count);
  return 0;
}

function toSummary(buckets: Bucket[]): MrrSummary {
  const ordered = buckets.toSorted((left, right) => {
    if (left.currency === right.currency) return 0;
    if (left.currency === 'mxn') return -1;
    if (right.currency === 'mxn') return 1;
    return left.currency.localeCompare(right.currency);
  });
  const byCurrency = ordered.map(currencyMrr);
  const headline =
    byCurrency.find((group) => group.currency === 'mxn') ??
    (byCurrency.length === 1 ? byCurrency[0] : undefined);
  if (!headline && byCurrency.length === 0) {
    return {
      mrrCents: 0,
      arrCents: 0,
      currency: null,
      byPlan: plansOf(emptyBucket('mxn')),
      byPeriod: periodsOf(emptyBucket('mxn')),
      byCurrency: [],
    };
  }
  return {
    mrrCents: headline ? headline.mrrCents : null,
    arrCents: headline ? headline.arrCents : null,
    currency: headline ? headline.currency : null,
    byPlan: headline ? headline.byPlan : [],
    byPeriod: headline ? headline.byPeriod : [],
    byCurrency,
  };
}

function currencyMrr(bucket: Bucket): CurrencyMrr {
  return {
    currency: bucket.currency,
    mrrCents: bucket.mrrCents,
    arrCents: bucket.mrrCents * 12,
    byPlan: plansOf(bucket),
    byPeriod: periodsOf(bucket),
  };
}

function plansOf(bucket: Bucket): PlanMrr[] {
  return [
    { plan: 'basico', mrrCents: bucket.plans.basico },
    { plan: 'pro', mrrCents: bucket.plans.pro },
  ];
}

function periodsOf(bucket: Bucket): PeriodMrr[] {
  const periods: PeriodMrr[] = [
    { period: 'monthly', mrrCents: bucket.periods.monthly },
    { period: 'annual', mrrCents: bucket.periods.annual },
  ];
  if (bucket.periods.weekly > 0) {
    periods.push({ period: 'weekly', mrrCents: bucket.periods.weekly });
  }
  return periods;
}

function bucketFor(buckets: Map<string, Bucket>, currency: string): Bucket {
  const existing = buckets.get(currency);
  if (existing) return existing;
  const created = emptyBucket(currency);
  buckets.set(currency, created);
  return created;
}

function emptyBucket(currency: string): Bucket {
  return {
    currency,
    mrrCents: 0,
    plans: { basico: 0, pro: 0 },
    periods: { monthly: 0, annual: 0, weekly: 0 },
  };
}

function periodOf(interval: string): 'monthly' | 'annual' | 'weekly' | null {
  if (interval === 'month') return 'monthly';
  if (interval === 'year') return 'annual';
  if (interval === 'week') return 'weekly';
  return null;
}

interface ActiveDiscount {
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
}

function activeDiscount(
  subscription: Stripe.Subscription,
  nowSec: number,
): ActiveDiscount | null {
  for (const entry of subscription.discounts ?? []) {
    if (!entry || typeof entry === 'string') continue;
    if (entry.end != null && entry.end <= nowSec) continue;
    const coupon = entry.source?.coupon;
    if (!coupon || typeof coupon === 'string') continue;
    return {
      percentOff: coupon.percent_off,
      amountOff: coupon.amount_off,
      currency: coupon.currency?.toLowerCase() ?? null,
    };
  }
  return null;
}

function customerIdOf(subscription: Stripe.Subscription): string {
  const customer = subscription.customer;
  if (typeof customer === 'string') return customer;
  if (customer && typeof customer === 'object' && 'id' in customer) {
    return customer.id;
  }
  return '';
}
