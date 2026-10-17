import { describe, expect, it } from 'vitest';
import {
  formatBytes,
  formatCount,
  formatDate,
  formatDateTime,
  formatDay,
  formatMoney,
  formatMonth,
  formatMonthShort,
  formatPercent,
} from './format';

describe('formatMoney', () => {
  it('turns MXN cents into es-MX currency', () => {
    expect(formatMoney(123_456, 'mxn')).toBe('$1,234.56');
    expect(formatMoney(0, 'MXN')).toBe('$0.00');
  });

  it('falls back to MXN when the code is not a currency', () => {
    expect(formatMoney(100, 'no-es-moneda')).toBe('$1.00');
  });
});

describe('formatPercent', () => {
  it('rounds a ratio to a whole percent', () => {
    expect(formatPercent(0.256)).toBe('26%');
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('formatBytes', () => {
  it('picks B, KB and MB', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(-5)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(310 * 1024)).toBe('310 KB');
    expect(formatBytes(4.2 * 1024 * 1024)).toBe('4.2 MB');
  });
});

describe('formatDate', () => {
  it('uses the Mexico City calendar day', () => {
    expect(formatDate('2026-06-15T05:00:00.000Z')).toBe('14 jun 2026');
    expect(formatDate('2026-06-15T18:00:00.000Z')).toBe('15 jun 2026');
  });

  it('includes the local time', () => {
    expect(formatDateTime('2026-06-15T18:00:00.000Z')).toBe(
      '15 jun 2026, 12:00 p.m.',
    );
  });

  it('returns the input when it is not a date', () => {
    expect(formatDate('ayer')).toBe('ayer');
  });
});

describe('calendar labels', () => {
  it('does not shift a YYYY-MM or YYYY-MM-DD into the previous period', () => {
    expect(formatMonth('2026-01')).toBe('ene 2026');
    expect(formatMonthShort('2026-01')).toBe('ene');
    expect(formatDay('2026-10-17')).toBe('17 oct');
  });
});

describe('formatCount', () => {
  it('groups thousands', () => {
    expect(formatCount(1234)).toBe('1,234');
  });
});
