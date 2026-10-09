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
