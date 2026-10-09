import type Stripe from 'stripe';
import {
  type BillingPeriod,
  type BillingPlan,
  resolvePlanFromLookupKey,
} from './billing.constants';

export interface ResolvedPlan {
  plan: BillingPlan;
  period: BillingPeriod;
}

const PLAN_RANK: Record<BillingPlan, number> = { basico: 0, pro: 1 };

const PERIOD_BY_INTERVAL: Partial<
  Record<Stripe.Price.Recurring.Interval, BillingPeriod>
> = { month: 'monthly', year: 'annual' };

export function planRank(plan: BillingPlan): number {
  return PLAN_RANK[plan];
}

/**
 * The price is the truth: lookup key first, then its product (an archived price
 * keeps its product after the key moves on). Null when neither maps to a plan.
 */
export function resolvePlanFromPrice(
  price: Stripe.Price,
  productPlans: ReadonlyMap<string, BillingPlan> | null,
): ResolvedPlan | null {
  const byKey = price.lookup_key
    ? resolvePlanFromLookupKey(price.lookup_key)
    : null;
  if (byKey) return byKey;

  const productId =
    typeof price.product === 'string' ? price.product : price.product?.id;
  const plan = productId ? productPlans?.get(productId) : undefined;
  const interval = price.recurring?.interval;
  const period = interval ? PERIOD_BY_INTERVAL[interval] : undefined;
  return plan && period ? { plan, period } : null;
}
