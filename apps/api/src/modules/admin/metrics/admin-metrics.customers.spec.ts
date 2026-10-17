import {
  customerFigures,
  type SubscriptionFact,
} from './admin-metrics.customers';

const WINDOW = {
  start: new Date('2026-10-01T06:00:00.000Z'),
  end: new Date('2026-11-01T06:00:00.000Z'),
};
const FUTURE = '2027-01-01T00:00:00.000Z';
const PAST = '2020-01-01T00:00:00.000Z';

function fact(overrides: Partial<SubscriptionFact> = {}): SubscriptionFact {
  return {
    tenantId: 'tenant-a',
    status: 'active',
    currentPeriodEnd: FUTURE,
    canceledAt: null,
    createdAt: '2026-09-01T06:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelAt: null,
    latest: true,
    ...overrides,
  };
}

describe('customerFigures', () => {
  it('returns a null churn rate when nobody was paying at the start of the window', () => {
    const figures = customerFigures(
      [
        fact({
          createdAt: '2026-10-05T06:00:00.000Z',
          canceledAt: '2026-10-20T06:00:00.000Z',
          status: 'canceled',
        }),
      ],
      WINDOW,
    );
    expect(figures.payingAtStart).toBe(0);
    expect(figures.cancellations).toBe(1);
    expect(figures.churnRate).toBeNull();
    expect(figures.newPaying).toBe(1);
  });

  it('divides cancellations by tenants entitled at the start of the window', () => {
    const started = ['a', 'b', 'c', 'd'].map((tenantId) => fact({ tenantId }));
    started[0] = fact({
      tenantId: 'a',
      status: 'canceled',
      canceledAt: '2026-10-15T06:00:00.000Z',
    });
    const figures = customerFigures(started, WINDOW);
    expect(figures.payingAtStart).toBe(4);
    expect(figures.cancellations).toBe(1);
    expect(figures.churnRate).toBe(0.25);
    expect(figures.payingTenants).toBe(3);
    expect(figures.newPaying).toBe(0);
  });

  it('counts past_due and a scheduled cancel once, and ignores a lapsed period', () => {
    const figures = customerFigures(
      [
        fact({
          tenantId: 'due',
          status: 'past_due',
          cancelAt: '2026-11-01T00:00:00.000Z',
        }),
        fact({
          tenantId: 'ending',
          status: 'active',
          cancelAtPeriodEnd: true,
        }),
        fact({
          tenantId: 'old-due',
          status: 'past_due',
          latest: false,
        }),
        fact({
          tenantId: 'lapsed',
          status: 'active',
          currentPeriodEnd: PAST,
        }),
      ],
      WINDOW,
    );
    expect(figures.payingTenants).toBe(1);
    expect(figures.atRisk).toBe(2);
  });
});
