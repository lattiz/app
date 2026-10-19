import { computeRenewalCharge } from '../../domains/domain-renewal.config';

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 30;

export interface RenewalFees {
  basicCents: number;
  proCents: number;
  taxRateBps: number;
}

export interface DomainRenewalFact {
  source: string;
  plan: string;
  expiresAt: string | Date | null;
  overdue: boolean;
  openAmountCents: number | null;
  openExpiresAt: string | Date | null;
}

export interface RenewalForecast {
  domainsPurchased: number;
  domainsConnected: number;
  renewalsOverdue: number;
  renewalsNext30Days: {
    count: number;
    expectedRevenueCents: number;
    currency: string;
  };
}

/**
 * An open cycle in the next 30 days contributes its `amount_cents`.
 * A managed domain in that window with no open cycle contributes the
 * plan fee plus IVA. Connected domains are counted, not priced.
 */
export function summarizeDomains(
  domains: readonly DomainRenewalFact[],
  now: Date,
  fees: RenewalFees,
): RenewalForecast {
  let domainsPurchased = 0;
  let domainsConnected = 0;
  let renewalsOverdue = 0;
  let count = 0;
  let expectedRevenueCents = 0;
  const nowMs = now.getTime();
  const until = nowMs + WINDOW_DAYS * DAY_MS;

  for (const domain of domains) {
    if (domain.source === 'lattiz_managed') domainsPurchased += 1;
    if (domain.source === 'user_provided') domainsConnected += 1;
    if (domain.overdue) renewalsOverdue += 1;

    const openAt = timeOf(domain.openExpiresAt);
    const hasOpen = openAt != null;
    if (hasOpen && openAt > nowMs && openAt <= until) {
      count += 1;
      expectedRevenueCents += domain.openAmountCents ?? 0;
      continue;
    }
    const expiresAt = timeOf(domain.expiresAt);
    if (
      hasOpen ||
      domain.source !== 'lattiz_managed' ||
      expiresAt == null ||
      expiresAt <= nowMs ||
      expiresAt > until
    ) {
      continue;
    }
    count += 1;
    const base = domain.plan === 'pro' ? fees.proCents : fees.basicCents;
    expectedRevenueCents += computeRenewalCharge(
      base,
      fees.taxRateBps,
    ).totalCents;
  }

  return {
    domainsPurchased,
    domainsConnected,
    renewalsOverdue,
    renewalsNext30Days: {
      count,
      expectedRevenueCents,
      currency: 'mxn',
    },
  };
}

function timeOf(value: string | Date | null): number | null {
  if (value == null) return null;
  const time =
    value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}
