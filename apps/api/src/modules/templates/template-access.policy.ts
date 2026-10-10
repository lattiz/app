/**
 * Template access by plan. Pure functions only: the service feeds them the
 * tenant's plan and entitlement, read live on every request — no lock flag is
 * ever stored, so a missed webhook cannot leave a tenant stuck or unlocked.
 */

export const TEMPLATE_TIERS = ['basic', 'pro'] as const;
export type TemplateTier = (typeof TEMPLATE_TIERS)[number];

export const TEMPLATE_LOCK_REASONS = ['REQUIRES_PRO'] as const;
export type TemplateLockReason = (typeof TEMPLATE_LOCK_REASONS)[number];

/**
 * Owner assumptions (docs/template-tiers.md › Supuestos). Each is the single
 * switch for its behavior; flip it here. A1 (a downgrade takes effect at the end
 * of the paid period) lives in billing: `evaluatePlanChange` timing.
 */
export const TEMPLATE_ACCESS_ASSUMPTIONS = {
  /** A2: while locked, loading, saving, uploading and publishing are blocked; the published site stays online. */
  lockBlocksEditing: true,
  /** A3: Básico tenants still see Pro templates (locked, with preview and "Mejorar a Pro"). */
  showLockedTemplates: true,
  /** A4: switching template replaces the project with the new template's; content is not migrated. */
  migrateContentOnSwitch: false,
} as const;

/**
 * A5: unpaid and free-preview tenants (`none`, `trial`) rank as Básico; an
 * unknown plan does too (fails closed). `empresarial` ranks at least as high as Pro.
 */
const PLAN_RANK: Readonly<Record<string, number>> = {
  none: 0,
  trial: 0,
  basico: 0,
  pro: 1,
  empresarial: 2,
};

const TIER_MIN_RANK: Readonly<Record<TemplateTier, number>> = {
  basic: 0,
  pro: 1,
};

export function planRankForTemplates(plan: string | null | undefined): number {
  return plan && Object.hasOwn(PLAN_RANK, plan) ? PLAN_RANK[plan] : 0;
}

export function isTemplateTier(value: unknown): value is TemplateTier {
  return (TEMPLATE_TIERS as readonly unknown[]).includes(value);
}

export interface TemplateAccessDecision {
  allowed: boolean;
  reason: TemplateLockReason | null;
}

/** Whether a tenant on `effectivePlan` may use a `tier` template. An unknown tier counts as Pro. */
export function evaluateTemplateAccess(
  effectivePlan: string | null | undefined,
  tier: string,
): TemplateAccessDecision {
  const required = isTemplateTier(tier)
    ? TIER_MIN_RANK[tier]
    : TIER_MIN_RANK.pro;
  return planRankForTemplates(effectivePlan) >= required
    ? { allowed: true, reason: null }
    : { allowed: false, reason: 'REQUIRES_PRO' };
}

/** What the template rules know about a tenant: `tenants.plan` plus the live entitlement. */
export interface TenantPlanState {
  plan: string | null;
  /** `computeIsEntitled` on the latest subscription (status + current_period_end). */
  isEntitled: boolean;
}

/**
 * The plan that decides which templates a tenant may pick. An entitled tenant
 * uses its synced plan. A tenant who never paid ranks as Básico (A5). A lapsed
 * payer keeps its stored plan: the lapse is handled by the subscription lockout,
 * not by the template rules.
 */
export function templatePlanFor(state: TenantPlanState): string {
  if (state.isEntitled) return state.plan ?? 'none';
  if (!state.plan || state.plan === 'none' || state.plan === 'trial')
    return 'none';
  return state.plan;
}

/**
 * Locked = an active subscription whose plan is below the current template's
 * tier (voluntary downgrade, or cancel and resubscribe lower). An involuntary
 * lapse never locks: the tenant is not entitled, so the rule does not apply.
 */
export function isTemplateLocked(
  state: TenantPlanState,
  currentTier: string | null,
): boolean {
  if (!state.isEntitled || currentTier === null) return false;
  return !evaluateTemplateAccess(state.plan, currentTier).allowed;
}
