import { describe, expect, it } from 'vitest';
import { medianHoursText, trialDurationText, trialStateLabel } from './labels';

describe('trial state', () => {
  it('maps each state to plain Spanish', () => {
    expect(trialStateLabel('active')).toBe('Activa');
    expect(trialStateLabel('expiring')).toBe('Por vencer');
    expect(trialStateLabel('expired')).toBe('Vencida');
    expect(trialStateLabel('converted')).toBe('Convertida');
  });

  it('explains the live trial length', () => {
    expect(trialDurationText(7)).toBe(
      'La prueba dura 7 días desde la primera publicación.',
    );
    expect(trialDurationText(1)).toBe(
      'La prueba dura 1 día desde la primera publicación.',
    );
    expect(medianHoursText(null)).toBeNull();
    expect(medianHoursText(1)).toBe(
      'La mitad de quienes pagan lo hacen en la primera hora.',
    );
    expect(medianHoursText(36.4)).toBe(
      'La mitad de quienes pagan lo hacen en las primeras 36 horas.',
    );
  });
});
