export type BillingPlan = 'basico' | 'pro';
export type BillingPeriod = 'monthly' | 'annual';

export const PLAN_LOOKUP_KEYS = {
  basico_monthly: 'basico_monthly',
  basico_annual: 'basico_annual',
  pro_monthly: 'pro_monthly',
  pro_annual: 'pro_annual',
} as const;

export type PlanLookupKey = keyof typeof PLAN_LOOKUP_KEYS;

const LOOKUP_KEY_MAP: Record<
  string,
  { plan: BillingPlan; period: BillingPeriod }
> = {
  basico_monthly: { plan: 'basico', period: 'monthly' },
  basico_annual: { plan: 'basico', period: 'annual' },
  pro_monthly: { plan: 'pro', period: 'monthly' },
  pro_annual: { plan: 'pro', period: 'annual' },
};

export function lookupKeyFor(plan: BillingPlan, period: BillingPeriod): string {
  return `${plan}_${period}`;
}

export function resolvePlanFromLookupKey(
  key: string,
): { plan: BillingPlan; period: BillingPeriod } | null {
  return LOOKUP_KEY_MAP[key] ?? null;
}
