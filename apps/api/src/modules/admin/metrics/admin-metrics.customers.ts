import { computeIsEntitled } from '../../../common/billing/entitlement';

const QUALIFYING = new Set(['active', 'trialing', 'past_due', 'canceled']);
const OPEN_STATUSES = new Set(['active', 'trialing', 'past_due']);

export interface SubscriptionFact {
  tenantId: string;
  status: string;
  currentPeriodEnd: string | Date | null;
  canceledAt: string | Date | null;
  createdAt: string | Date;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | Date | null;
  latest: boolean;
}

export interface CustomerWindow {
  start: Date;
  end: Date;
}

export interface CustomerFigures {
  payingTenants: number;
  newPaying: number;
  cancellations: number;
  /** Entitled at `window.start`. The churn divisor. */
  payingAtStart: number;
  churnRate: number | null;
  atRisk: number;
}

/**
 * Paying tenants use `computeIsEntitled` on the current row.
 * Churn is cancellations in the window ÷ tenants entitled at the start.
 * Null when that divisor is 0. At-risk counts each tenant once.
 */
export function customerFigures(
  subscriptions: readonly SubscriptionFact[],
  window: CustomerWindow,
): CustomerFigures {
  const paying = new Set<string>();
  const payingAtStart = new Set<string>();
  const cancellations = new Set<string>();
  const atRisk = new Set<string>();
  const earliestPaying = new Map<string, number>();
  const start = window.start.getTime();
  const end = window.end.getTime();

  for (const subscription of subscriptions) {
    if (
      computeIsEntitled({
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      })
    ) {
      paying.add(subscription.tenantId);
    }
    if (wasEntitledAt(subscription, start)) {
      payingAtStart.add(subscription.tenantId);
    }
    const canceled = timeOf(subscription.canceledAt);
    if (canceled != null && canceled >= start && canceled < end) {
      cancellations.add(subscription.tenantId);
    }
    if (subscription.latest && atRiskNow(subscription)) {
      atRisk.add(subscription.tenantId);
    }
    if (!QUALIFYING.has(subscription.status)) continue;
    const created = timeOf(subscription.createdAt);
    if (created == null) continue;
    const previous = earliestPaying.get(subscription.tenantId);
    if (previous == null || created < previous) {
      earliestPaying.set(subscription.tenantId, created);
    }
  }

  let newPaying = 0;
  for (const created of earliestPaying.values()) {
    if (created >= start && created < end) newPaying += 1;
  }

  return {
    payingTenants: paying.size,
    newPaying,
    cancellations: cancellations.size,
    payingAtStart: payingAtStart.size,
    churnRate:
      payingAtStart.size === 0 ? null : cancellations.size / payingAtStart.size,
    atRisk: atRisk.size,
  };
}

function wasEntitledAt(subscription: SubscriptionFact, at: number): boolean {
  const created = timeOf(subscription.createdAt);
  if (created == null || created >= at) return false;
  const canceled = timeOf(subscription.canceledAt);
  if (canceled != null && canceled < at) return false;
  const status =
    canceled != null && canceled >= at ? 'active' : subscription.status;
  const periodEnd = timeOf(subscription.currentPeriodEnd);
  if (periodEnd == null || periodEnd <= at) return false;
  return status === 'active' || status === 'trialing';
}

function atRiskNow(subscription: SubscriptionFact): boolean {
  if (subscription.status === 'past_due') return true;
  const scheduled =
    subscription.cancelAtPeriodEnd || subscription.cancelAt != null;
  return scheduled && OPEN_STATUSES.has(subscription.status);
}

function timeOf(value: string | Date | null): number | null {
  if (value == null) return null;
  const time =
    value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}
