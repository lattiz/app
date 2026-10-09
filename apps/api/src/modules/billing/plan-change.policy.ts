import type { BillingPeriod, BillingPlan } from './billing.constants';
import { planRank } from './subscription-plan';

export const PLAN_CHANGE_BLOCKERS = [
  'NO_ACTIVE_SUBSCRIPTION',
  'SUBSCRIPTION_NOT_ACTIVE',
  'SUBSCRIPTION_CANCELING',
  'SAME_PLAN',
  'PLAN_CHANGE_PENDING',
  'UNSUPPORTED_SUBSCRIPTION',
  'DOWNGRADE_DOMAIN_ABOVE_BASIC_CAP',
  'DOWNGRADE_PRICE_UNAVAILABLE',
] as const;

export type PlanChangeBlocker = (typeof PLAN_CHANGE_BLOCKERS)[number];

export type PlanChangeDirection = 'upgrade' | 'downgrade' | 'none';
export type PlanChangeTiming = 'immediate' | 'period_end';

/** Result of checking the tenant's Lattiz-managed domain against the target plan's renewal cap. */
export type DomainRenewalCheck = 'ok' | 'above_cap' | 'price_unavailable';

/** Fresh Stripe state of the tenant's subscription, reduced to what eligibility needs. */
export interface PlanChangeSnapshot {
  /** Null when the tenant has no subscription at all. */
  status: string | null;
  /** `cancel_at` (flexible billing mode) or `cancel_at_period_end` (classic). */
  canceling: boolean;
  itemCount: number;
  /** Null when the single item's price maps to no known plan. */
  currentPlan: BillingPlan | null;
  period: BillingPeriod | null;
  /** `pending`: our own scheduled change; `foreign`: any other schedule (blocks portal and schedule writes). */
  schedule: 'none' | 'pending' | 'foreign';
}

export interface PlanChangeEvaluation {
  direction: PlanChangeDirection;
  timing: PlanChangeTiming | null;
  blockers: PlanChangeBlocker[];
}

const ENDED_STATUSES = new Set(['canceled', 'incomplete_expired']);
const UNHEALTHY_STATUSES = new Set([
  'past_due',
  'unpaid',
  'incomplete',
  'paused',
]);

export function planChangeDirection(
  current: BillingPlan | null,
  target: BillingPlan,
): PlanChangeDirection {
  if (!current || current === target) return 'none';
  return planRank(target) > planRank(current) ? 'upgrade' : 'downgrade';
}

/**
 * Upgrades never look at domains: they are the path to unlock pricier renewals.
 * `domainCheck` is only consulted for a downgrade.
 */
export function evaluatePlanChange(
  snapshot: PlanChangeSnapshot,
  target: BillingPlan,
  domainCheck: DomainRenewalCheck | null,
): PlanChangeEvaluation {
  const direction = planChangeDirection(snapshot.currentPlan, target);
  const timing: PlanChangeTiming | null =
    direction === 'upgrade'
      ? 'immediate'
      : direction === 'downgrade'
        ? 'period_end'
        : null;

  if (snapshot.status === null || ENDED_STATUSES.has(snapshot.status)) {
    return { direction, timing, blockers: ['NO_ACTIVE_SUBSCRIPTION'] };
  }

  const blockers: PlanChangeBlocker[] = [];
  if (UNHEALTHY_STATUSES.has(snapshot.status)) {
    blockers.push('SUBSCRIPTION_NOT_ACTIVE');
  }
  if (snapshot.canceling) blockers.push('SUBSCRIPTION_CANCELING');
  if (
    snapshot.itemCount !== 1 ||
    snapshot.currentPlan === null ||
    snapshot.period === null ||
    snapshot.schedule === 'foreign'
  ) {
    blockers.push('UNSUPPORTED_SUBSCRIPTION');
  }
  if (snapshot.currentPlan === target) blockers.push('SAME_PLAN');
  if (snapshot.schedule === 'pending') blockers.push('PLAN_CHANGE_PENDING');
  if (direction === 'downgrade') {
    if (domainCheck === 'above_cap') {
      blockers.push('DOWNGRADE_DOMAIN_ABOVE_BASIC_CAP');
    } else if (domainCheck !== 'ok') {
      blockers.push('DOWNGRADE_PRICE_UNAVAILABLE');
    }
  }
  return { direction, timing, blockers };
}
