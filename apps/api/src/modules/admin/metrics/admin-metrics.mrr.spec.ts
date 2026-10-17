import type Stripe from 'stripe';
import { summarizeStripeMrr } from './admin-metrics.mrr';

const NOW_SEC = 1_800_000_000;

function subscription(overrides: {
  status?: string;
  customer?: string;
  unitAmount?: number;
  quantity?: number;
  currency?: string;
  interval?: 'day' | 'week' | 'month' | 'year';
  intervalCount?: number;
  lookupKey?: string | null;
  percentOff?: number | null;
  amountOff?: number | null;
  discountCurrency?: string | null;
  discountEnd?: number | null;
}): Stripe.Subscription {
  const hasDiscount =
    overrides.percentOff != null || overrides.amountOff != null;
  return {
    status: overrides.status ?? 'active',
    customer: overrides.customer ?? 'cus_ext',
    discounts: hasDiscount
      ? [
          {
            end: overrides.discountEnd ?? null,
            source: {
              type: 'coupon',
              coupon: {
                percent_off: overrides.percentOff ?? null,
                amount_off: overrides.amountOff ?? null,
                currency: overrides.discountCurrency ?? 'mxn',
              },
            },
          },
        ]
      : [],
    items: {
      data: [
        {
          quantity: overrides.quantity ?? 1,
          price: {
            unit_amount: overrides.unitAmount ?? 0,
            currency: overrides.currency ?? 'mxn',
            lookup_key:
              overrides.lookupKey === undefined
                ? 'basico_monthly'
                : overrides.lookupKey,
            recurring: {
              interval: overrides.interval ?? 'month',
              interval_count: overrides.intervalCount ?? 1,
            },
          },
        },
      ],
    },
  } as unknown as Stripe.Subscription;
}

describe('summarizeStripeMrr', () => {
  it('normalizes annual, monthly and weekly prices to a month', () => {
    const summary = summarizeStripeMrr(
      [
        subscription({
          unitAmount: 120_000,
          interval: 'year',
          lookupKey: 'basico_annual',
        }),
        subscription({
          customer: 'cus_pro',
          unitAmount: 49_900,
          lookupKey: 'pro_monthly',
        }),
        subscription({
          customer: 'cus_week',
          unitAmount: 1_200,
          interval: 'week',
          lookupKey: null,
        }),
      ],
      new Set(),
      NOW_SEC,
    );

    expect(summary.mrrCents).toBe(10_000 + 49_900 + 5_200);
    expect(summary.arrCents).toBe((10_000 + 49_900 + 5_200) * 12);
    expect(summary.currency).toBe('mxn');
    expect(summary.byPlan).toEqual([
      { plan: 'basico', mrrCents: 10_000 },
      { plan: 'pro', mrrCents: 49_900 },
    ]);
    expect(summary.byPeriod).toEqual([
      { period: 'monthly', mrrCents: 49_900 },
      { period: 'annual', mrrCents: 10_000 },
      { period: 'weekly', mrrCents: 5_200 },
    ]);
  });

  it('applies a percent coupon and a fixed coupon before normalizing', () => {
    const percent = summarizeStripeMrr(
      [
        subscription({
          unitAmount: 50_000,
          percentOff: 20,
          discountCurrency: null,
        }),
      ],
      new Set(),
      NOW_SEC,
    );
    expect(percent.mrrCents).toBe(40_000);

    const fixed = summarizeStripeMrr(
      [
        subscription({
          unitAmount: 120_000,
          interval: 'year',
          lookupKey: 'pro_annual',
          amountOff: 12_000,
          discountCurrency: 'mxn',
        }),
      ],
      new Set(),
      NOW_SEC,
    );
    expect(fixed.mrrCents).toBe(9_000);
    expect(fixed.byPlan).toEqual([
      { plan: 'basico', mrrCents: 0 },
      { plan: 'pro', mrrCents: 9_000 },
    ]);
  });

  it('ignores a coupon that already ended and multiplies by quantity', () => {
    const summary = summarizeStripeMrr(
      [
        subscription({
          unitAmount: 10_000,
          quantity: 3,
          percentOff: 50,
          discountEnd: NOW_SEC - 10,
        }),
      ],
      new Set(),
      NOW_SEC,
    );
    expect(summary.mrrCents).toBe(30_000);
  });

  it('drops internal customers and statuses that are not active, trialing or past_due', () => {
    const summary = summarizeStripeMrr(
      [
        subscription({ customer: 'cus_internal', unitAmount: 80_000 }),
        subscription({ status: 'canceled', unitAmount: 70_000 }),
        subscription({ status: 'unpaid', unitAmount: 60_000 }),
        subscription({ status: 'incomplete', unitAmount: 50_000 }),
        subscription({ status: 'paused', unitAmount: 40_000 }),
        subscription({
          status: 'trialing',
          unitAmount: 15_000,
          customer: 'cus_trial',
        }),
        subscription({
          status: 'past_due',
          unitAmount: 5_000,
          customer: 'cus_due',
        }),
      ],
      new Set(['cus_internal']),
      NOW_SEC,
    );
    expect(summary.mrrCents).toBe(20_000);
  });

  it('keeps each currency separate and headlines MXN', () => {
    const summary = summarizeStripeMrr(
      [
        subscription({ unitAmount: 10_000, currency: 'mxn' }),
        subscription({
          customer: 'cus_usd',
          unitAmount: 2_000,
          currency: 'usd',
          lookupKey: 'pro_monthly',
        }),
      ],
      new Set(),
      NOW_SEC,
    );
    expect(summary.currency).toBe('mxn');
    expect(summary.mrrCents).toBe(10_000);
    expect(summary.byCurrency.map((group) => group.currency)).toEqual([
      'mxn',
      'usd',
    ]);
    expect(summary.byCurrency[1]?.mrrCents).toBe(2_000);
  });
});
