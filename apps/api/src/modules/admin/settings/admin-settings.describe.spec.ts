import { SETTINGS } from '../../../common/settings/settings.registry';
import {
  describeSetting,
  describeSettings,
  parseSettingValue,
  settingLooksSecret,
  type SettingRow,
} from './admin-settings.describe';

const TRIAL = SETTINGS['preview.trial_days'];

function row(value: unknown): SettingRow {
  return {
    value,
    updatedBy: 'ana@lattiz.test',
    updatedAt: '2026-10-17T00:00:00.000Z',
  };
}

describe('setting sources', () => {
  it('prefers the database, then the env var, then the code default', () => {
    const fromDb = describeSetting(TRIAL, row(5), '9', { trialDays: 0 });
    expect(fromDb.source).toBe('db');
    expect(fromDb.effectiveValue).toBe(5);
    expect(fromDb.dbValue).toBe(5);
    expect(fromDb.envValue).toBe('9');

    const fromEnv = describeSetting(TRIAL, undefined, '9', { trialDays: 0 });
    expect(fromEnv.source).toBe('env');
    expect(fromEnv.effectiveValue).toBe(9);
    expect(fromEnv.dbValue).toBeNull();
    expect(fromEnv.envValue).toBe('9');

    const fromDefault = describeSetting(TRIAL, undefined, undefined, {
      trialDays: 0,
    });
    expect(fromDefault.source).toBe('default');
    expect(fromDefault.effectiveValue).toBe(14);
    expect(fromDefault.envValue).toBeNull();
    expect(fromDefault.default).toBe(14);
  });

  it('groups by the prefix, exposes bounds, and describes every preview key', () => {
    const view = describeSetting(TRIAL, undefined, undefined, { trialDays: 0 });
    expect(view.group).toBe('preview');
    expect(view.type).toBe('int');
    expect(view.min).toBe(1);
    expect(view.max).toBe(365);
    expect(view.description).toMatch(/prueba gratuita/);

    const views = describeSettings(new Map(), () => undefined);
    const preview = views.filter((item) => item.key.startsWith('preview.'));
    expect(preview.length).toBeGreaterThan(0);
    expect(preview.every((item) => item.description)).toBe(true);
  });

  it('never echoes an env value whose name looks secret', () => {
    for (const def of Object.values(SETTINGS)) {
      expect(settingLooksSecret(def.key, def.envVar)).toBe(false);
    }
    expect(settingLooksSecret('stripe.secret', 'STRIPE_SECRET_KEY')).toBe(true);
    const hidden = describeSetting(
      {
        ...TRIAL,
        key: 'preview.trial_days',
        envVar: 'STRIPE_SECRET_KEY',
      },
      undefined,
      '9',
      { trialDays: 0 },
    );
    expect(hidden.envValue).toBeNull();
    expect(hidden.source).toBe('env');
    expect(hidden.effectiveValue).toBe(9);
  });

  it('rejects an out-of-range integer with the registry expectation', () => {
    const parsed = parseSettingValue(TRIAL, 999, { trialDays: 0 });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toBe(TRIAL.expectation);
  });
});
