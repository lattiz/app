import { describe, expect, it } from 'vitest';
import { STATUS_TONE_CLASS } from '@/features/tenants/labels';
import {
  cancellationLabel,
  cardBrandLabel,
  invoiceBadge,
  priceIntervalLabel,
  priceText,
  scheduleStatusLabel,
  subscriptionBadge,
} from './labels';

describe('subscription status', () => {
  it('maps each status to plain Spanish and a color', () => {
    expect(subscriptionBadge('active')).toEqual({ label: 'Al día', tone: 'good' });
    expect(subscriptionBadge('trialing')).toEqual({
      label: 'En periodo de prueba',
      tone: 'info',
    });
    expect(subscriptionBadge('past_due')).toEqual({
      label: 'Pago atrasado',
      tone: 'warn',
    });
    expect(subscriptionBadge('canceled')).toEqual({ label: 'Cancelada', tone: 'bad' });
    expect(subscriptionBadge('incomplete')).toEqual({
      label: 'Pago incompleto',
      tone: 'warn',
    });
    expect(subscriptionBadge('unpaid')).toEqual({ label: 'Sin pagar', tone: 'bad' });
    expect(subscriptionBadge('paused')).toEqual({ label: 'En pausa', tone: 'neutral' });
    expect(subscriptionBadge(null)).toEqual({ label: 'Sin dato', tone: 'neutral' });
    expect(STATUS_TONE_CLASS.good).toContain('emerald');
    expect(STATUS_TONE_CLASS.warn).toContain('amber');
    expect(STATUS_TONE_CLASS.bad).toContain('destructive');
    expect(STATUS_TONE_CLASS.info).toContain('sky');
  });
});

describe('subscription copy', () => {
  it('describes a scheduled cancellation', () => {
    expect(cancellationLabel({ cancelAt: null, cancelAtPeriodEnd: false })).toBe('No');
    expect(cancellationLabel({ cancelAt: null, cancelAtPeriodEnd: true })).toBe(
      'Al terminar el periodo',
    );
    expect(
      cancellationLabel({
        cancelAt: '2026-11-02T18:00:00.000Z',
        cancelAtPeriodEnd: true,
      }),
    ).toBe('El 2 nov 2026');
  });

  it('writes the price the way a person would say it', () => {
    expect(priceIntervalLabel('month', 1)).toBe('cada mes');
    expect(priceIntervalLabel('year', 1)).toBe('cada año');
    expect(priceIntervalLabel(null, null)).toBe('sin periodo fijo');
    expect(
      priceText({
        unitAmount: 49900,
        currency: 'mxn',
        interval: 'month',
        intervalCount: 1,
        discount: { percentOff: 10, amountOff: null, currency: null },
      }),
    ).toContain('cada mes');
    expect(cardBrandLabel('visa')).toBe('Visa');
    expect(invoiceBadge('paid').label).toBe('Pagada');
    expect(invoiceBadge(null).label).toBe('Sin estado');
    expect(scheduleStatusLabel('active')).toBe('En curso');
  });
});
