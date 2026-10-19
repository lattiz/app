import {
  summarizeDomains,
  type DomainRenewalFact,
} from './admin-metrics.renewals';

const NOW = new Date('2026-10-01T18:00:00.000Z');
const IN_10_DAYS = new Date(NOW.getTime() + 10 * 86_400_000).toISOString();
const IN_40_DAYS = new Date(NOW.getTime() + 40 * 86_400_000).toISOString();
const FEES = { basicCents: 49_900, proCents: 59_900, taxRateBps: 1600 };

function domain(overrides: Partial<DomainRenewalFact> = {}): DomainRenewalFact {
  return {
    source: 'lattiz_managed',
    plan: 'pro',
    expiresAt: IN_10_DAYS,
    overdue: false,
    openAmountCents: null,
    openExpiresAt: null,
    ...overrides,
  };
}

describe('summarizeDomains', () => {
  it('uses the open cycle amount and the fee plus tax when there is no cycle', () => {
    const summary = summarizeDomains(
      [
        domain({ openAmountCents: 25_000, openExpiresAt: IN_10_DAYS }),
        domain(),
        domain({
          source: 'user_provided',
          plan: 'basico',
        }),
        domain({
          plan: 'basico',
          expiresAt: IN_40_DAYS,
          openAmountCents: 999,
          openExpiresAt: IN_40_DAYS,
        }),
        domain({
          plan: 'basico',
          expiresAt: new Date(NOW.getTime() - 86_400_000).toISOString(),
          overdue: true,
        }),
      ],
      NOW,
      FEES,
    );

    expect(summary.domainsPurchased).toBe(4);
    expect(summary.domainsConnected).toBe(1);
    expect(summary.renewalsOverdue).toBe(1);
    expect(summary.renewalsNext30Days).toEqual({
      count: 2,
      expectedRevenueCents: 25_000 + 69_484,
      currency: 'mxn',
    });
  });
});
