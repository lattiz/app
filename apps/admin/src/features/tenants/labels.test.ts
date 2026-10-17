import { describe, expect, it } from 'vitest';
import {
  STATUS_TONE_CLASS,
  daysRemainingText,
  daysUntil,
  dnsBadge,
  domainExpiryIsUrgent,
  domainExpiryListText,
  planBadge,
  previewBadge,
  renewalBadge,
  subscriptionBadge,
  tenantStatusBadge,
} from './labels';

describe('status badges', () => {
  it('maps plan, payment and trial to plain text and a tone', () => {
    expect(planBadge('basico')).toEqual({ label: 'Básico', tone: 'neutral' });
    expect(planBadge('pro')).toEqual({ label: 'Pro', tone: 'info' });
    expect(tenantStatusBadge('cancelled')).toEqual({ label: 'Cancelado', tone: 'bad' });
    expect(subscriptionBadge('past_due')).toEqual({ label: 'Pago atrasado', tone: 'warn' });
    expect(subscriptionBadge('active')).toEqual({ label: 'Al día', tone: 'good' });
    expect(previewBadge('trial_expired')).toEqual({
      label: 'Prueba vencida',
      tone: 'warn',
    });
    expect(dnsBadge('error')).toEqual({ label: 'Con error', tone: 'bad' });
    expect(renewalBadge('overdue')).toEqual({ label: 'En mora', tone: 'bad' });
    expect(planBadge('otro')).toEqual({ label: 'Sin dato', tone: 'neutral' });
  });

  it('gives each tone a distinct color class', () => {
    expect(STATUS_TONE_CLASS.good).toContain('emerald');
    expect(STATUS_TONE_CLASS.warn).toContain('amber');
    expect(STATUS_TONE_CLASS.bad).toContain('destructive');
    expect(STATUS_TONE_CLASS.info).toContain('sky');
    expect(STATUS_TONE_CLASS.neutral).toContain('muted');
  });
});

describe('days remaining', () => {
  const now = new Date('2026-10-18T05:30:00.000Z');

  it('counts calendar days in Mexico City, not UTC', () => {
    expect(daysUntil('2026-10-18T06:00:00.000Z', now)).toBe(1);
    expect(daysUntil('2026-10-17T18:00:00.000Z', now)).toBe(0);
    expect(daysUntil('2026-10-16T18:00:00.000Z', now)).toBe(-1);
    expect(daysUntil(null, now)).toBeNull();
    expect(daysUntil('no-es-fecha', now)).toBeNull();
  });

  it('writes how many days are left', () => {
    expect(daysRemainingText(30)).toBe('Faltan 30 días');
    expect(daysRemainingText(1)).toBe('Falta 1 día');
    expect(daysRemainingText(0)).toBe('Vence hoy');
    expect(daysRemainingText(-1)).toBe('Venció hace 1 día');
    expect(daysRemainingText(-4)).toBe('Venció hace 4 días');
    expect(domainExpiryListText(12)).toBe('Vence en 12 días');
    expect(domainExpiryIsUrgent(30)).toBe(true);
    expect(domainExpiryIsUrgent(31)).toBe(false);
    expect(domainExpiryIsUrgent(null)).toBe(false);
  });
});
