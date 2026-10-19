import { summarizeFunnel, type FunnelTenant } from './admin-metrics.funnel';

function tenant(overrides: Partial<FunnelTenant> = {}): FunnelTenant {
  return {
    createdAt: '2026-10-01T12:00:00.000Z',
    hasSchema: false,
    published: false,
    paidAt: null,
    ...overrides,
  };
}

describe('summarizeFunnel', () => {
  it('rates each step against the previous one and medians the hours to pay', () => {
    const figures = summarizeFunnel([
      tenant({
        hasSchema: true,
        published: true,
        paidAt: '2026-10-01T22:00:00.000Z',
      }),
      tenant({ hasSchema: true, paidAt: '2026-10-02T18:00:00.000Z' }),
      tenant({ published: true }),
      tenant(),
    ]);
    expect(figures).toMatchObject({
      signups: 4,
      choseTemplate: 2,
      published: 2,
      paid: 2,
      choseTemplateRate: 0.5,
      publishedRate: 1,
      paidRate: 1,
      medianHoursToPay: 20,
    });

    const odd = summarizeFunnel([
      tenant({ paidAt: '2026-10-01T22:00:00.000Z' }),
      tenant({ paidAt: '2026-10-02T08:00:00.000Z' }),
      tenant({ paidAt: '2026-10-03T04:00:00.000Z' }),
    ]);
    expect(odd.medianHoursToPay).toBe(20);
  });

  it('returns null rates and a null median when a divisor is zero', () => {
    expect(summarizeFunnel([])).toMatchObject({
      signups: 0,
      choseTemplateRate: null,
      publishedRate: null,
      paidRate: null,
      medianHoursToPay: null,
    });
    expect(
      summarizeFunnel([tenant({ paidAt: '2026-10-02T12:00:00.000Z' })])
        .publishedRate,
    ).toBeNull();
  });
});
