import type { BillingPlan } from '../../billing/billing.constants';

/** Domain cost caps, all in USD cents. */
export interface DomainPriceCaps {
  /** First-year price cap, every plan. */
  purchaseUsdCents: number;
  /** Renewal price cap for Básico — also the fail-closed default for any non-Pro plan. */
  basicRenewalUsdCents: number;
  proRenewalUsdCents: number;
}

export const DOMAIN_PRICE_CAPS = Symbol('DOMAIN_PRICE_CAPS');

const PRO_PLAN: BillingPlan = 'pro';

/** `plan` is `tenants.plan` as stored ('pro', 'basico', 'none', 'trial', …). */
export function resolveRenewalCapUsdCents(
  plan: string | null,
  caps: DomainPriceCaps,
): number {
  return plan === PRO_PLAN
    ? caps.proRenewalUsdCents
    : caps.basicRenewalUsdCents;
}

export function isRenewalWithinCap(
  plan: string | null,
  renewalCostUsdCents: number,
  caps: DomainPriceCaps,
): { allowed: boolean; capUsdCents: number } {
  const capUsdCents = resolveRenewalCapUsdCents(plan, caps);
  return { allowed: renewalCostUsdCents <= capUsdCents, capUsdCents };
}

export function isPurchaseWithinCap(
  firstYearUsdCents: number,
  purchaseCapUsdCents: number,
): boolean {
  return firstYearUsdCents <= purchaseCapUsdCents;
}

/** The lower of the stored plan and a scheduled change; anything that is not Pro prices as Básico. */
export function resolveEffectivePlan(
  current: string | null,
  pending: string | null,
): string | null {
  if (current === PRO_PLAN && pending !== null && pending !== PRO_PLAN) {
    return pending;
  }
  return current;
}

/**
 * Why an available domain is outside the plan. `purchase_over_cap`: first year
 * above the global cap. `requires_pro`: renewal fits Pro but not this plan.
 * `renewal_over_cap`: renewal above every plan. `price_unknown`: a price could
 * not be read, so the domain is never treated as covered.
 */
export const DOMAIN_NOT_COVERED_REASONS = [
  'purchase_over_cap',
  'renewal_over_cap',
  'requires_pro',
  'price_unknown',
] as const;

export type DomainNotCoveredReason =
  (typeof DOMAIN_NOT_COVERED_REASONS)[number];

export type DomainPurchaseEvaluation =
  | { allowed: true }
  | { allowed: false; reason: DomainNotCoveredReason };

/** The single rule for search, quote and purchase; `plan` is the effective plan. */
export function evaluateDomainPurchase(input: {
  firstYearUsdCents: number | null;
  renewalUsdCents: number | null;
  plan: string | null;
  caps: DomainPriceCaps;
}): DomainPurchaseEvaluation {
  const { firstYearUsdCents, renewalUsdCents, plan, caps } = input;
  if (firstYearUsdCents === null) {
    return { allowed: false, reason: 'price_unknown' };
  }
  if (!isPurchaseWithinCap(firstYearUsdCents, caps.purchaseUsdCents)) {
    return { allowed: false, reason: 'purchase_over_cap' };
  }
  if (renewalUsdCents === null) {
    return { allowed: false, reason: 'price_unknown' };
  }
  if (isRenewalWithinCap(plan, renewalUsdCents, caps).allowed) {
    return { allowed: true };
  }
  const onProCap =
    resolveRenewalCapUsdCents(plan, caps) === caps.proRenewalUsdCents;
  if (!onProCap && renewalUsdCents <= caps.proRenewalUsdCents) {
    return { allowed: false, reason: 'requires_pro' };
  }
  return { allowed: false, reason: 'renewal_over_cap' };
}
