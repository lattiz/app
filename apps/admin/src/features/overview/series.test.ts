import type {
  MetricsFunnelDto,
  MetricsHistoryItemDto,
  MetricsRevenueMonthDto,
} from '@lattiz/api-client';
import { describe, expect, it } from 'vitest';
import {
  funnelBarWidth,
  medianPayPhrase,
  mixedCurrency,
  planBreakdown,
  stripeRevenueFailed,
  toFunnelSteps,
  toRevenueSeries,
  toTrendSeries,
  trendCurrency,
  trendReady,
} from './series';

const january: MetricsRevenueMonthDto = {
  month: '2026-01',
  grossCents: 10_000,
  feeCents: 500,
  refundCents: 200,
  netCents: 9_300,
  currency: 'mxn',
};

const march: MetricsRevenueMonthDto = {
  ...january,
  month: '2026-03',
  currency: 'usd',
  netCents: 1_000,
};

describe('toRevenueSeries', () => {
  it('sorts months and keeps cents for the tooltip', () => {
    const series = toRevenueSeries([march, january]);
    expect(series.map((point) => point.month)).toEqual(['2026-01', '2026-03']);
    expect(series[0]).toMatchObject({
      label: 'ene',
      monthLabel: 'ene 2026',
      netCents: 9_300,
      grossCents: 10_000,
      feeCents: 500,
      refundCents: 200,
      currency: 'mxn',
    });
  });

  it('notices mixed currencies', () => {
    expect(mixedCurrency(toRevenueSeries([january, march]))).toBe(true);
    expect(mixedCurrency(toRevenueSeries([january]))).toBe(false);
  });
});

describe('toTrendSeries', () => {
  const older: MetricsHistoryItemDto = {
    day: '2026-10-01',
    mrrCents: 50_000,
    currency: 'mxn',
    payingTenants: 4,
    trialsActive: 2,
    signups: 1,
    newPaying: 0,
    cancellations: 0,
    publishedSites: 3,
    capturedAt: '2026-10-02T06:00:00.000Z',
  };
  const newer: MetricsHistoryItemDto = {
    ...older,
    day: '2026-10-02',
    mrrCents: null,
    currency: null,
    payingTenants: 5,
  };

  it('needs two days before drawing a line', () => {
    expect(trendReady(toTrendSeries([]))).toBe(false);
    expect(trendReady(toTrendSeries([older]))).toBe(false);
    expect(trendReady(toTrendSeries([newer, older]))).toBe(true);
  });

  it('keeps a missing MRR as null and uses the latest currency', () => {
    const series = toTrendSeries([newer, older]);
    expect(series.map((point) => point.day)).toEqual([
      '2026-10-01',
      '2026-10-02',
    ]);
    expect(series[0]?.label).toBe('1 oct');
    expect(series[1]?.mrrCents).toBeNull();
    expect(trendCurrency(series)).toBe('mxn');
    expect(trendCurrency(toTrendSeries([newer]))).toBe('mxn');
  });
});

describe('toFunnelSteps', () => {
  const funnel: MetricsFunnelDto = {
    days: 30,
    signups: 10,
    choseTemplate: 5,
    published: 4,
    paid: 2,
    choseTemplateRate: 0.5,
    publishedRate: 0.8,
    paidRate: 0.5,
    medianHoursToPay: 36,
  };

  it('maps the four steps and their rates', () => {
    expect(
      toFunnelSteps(funnel).map((step) => [step.label, step.count, step.rate]),
    ).toEqual([
      ['Se registró', 10, null],
      ['Eligió plantilla', 5, 0.5],
      ['Publicó', 4, 0.8],
      ['Pagó', 2, 0.5],
    ]);
    expect(funnelBarWidth(4, 10)).toBe(40);
    expect(funnelBarWidth(0, 10)).toBe(0);
  });
});

describe('medianPayPhrase', () => {
  it('turns hours into the half-pay sentence', () => {
    expect(medianPayPhrase(10)).toBe('La mitad paga en menos de 1 día');
    expect(medianPayPhrase(36)).toBe('La mitad paga en menos de 2 días');
    expect(medianPayPhrase(null)).toBeNull();
    expect(medianPayPhrase(Number.NaN)).toBeNull();
  });
});

describe('stripeRevenueFailed', () => {
  it('treats null as a successful Stripe read', () => {
    expect(stripeRevenueFailed(null)).toBe(false);
    expect(stripeRevenueFailed(undefined)).toBe(false);
    expect(stripeRevenueFailed('unavailable')).toBe(true);
  });
});

describe('planBreakdown', () => {
  it('skips plans with no monthly revenue', () => {
    expect(
      planBreakdown(
        [
          { plan: 'basico', mrrCents: 10_000 },
          { plan: 'pro', mrrCents: 0 },
        ],
        'mxn',
      ),
    ).toBe('Básico $100.00');
    expect(planBreakdown([], 'mxn')).toBeNull();
  });
});
