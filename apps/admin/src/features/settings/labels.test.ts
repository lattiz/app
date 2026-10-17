import { describe, expect, it } from 'vitest';
import { groupSettings, humanizeSettingKey, settingGroupLabel, settingLabel } from './labels';

describe('setting labels', () => {
  it('names known keys in plain Spanish', () => {
    expect(settingLabel('preview.trial_days')).toBe('Días de prueba');
    expect(settingLabel('preview.notify_batch')).toBe('Avisos por lote');
  });

  it('derives a readable name from an unknown key', () => {
    expect(humanizeSettingKey('custom.max_asset_bytes')).toBe('Max asset bytes');
    expect(settingLabel('custom.max_asset_bytes')).toBe('Max asset bytes');
    expect(settingLabel('solo')).toBe('Solo');
  });

  it('names the known groups and keeps the rest as written', () => {
    expect(settingGroupLabel('preview')).toBe('Prueba gratuita');
    expect(settingGroupLabel('email')).toBe('Correos');
    expect(settingGroupLabel('dns')).toBe('DNS');
    expect(settingGroupLabel('domain')).toBe('Dominios');
    expect(settingGroupLabel('otro')).toBe('otro');
  });

  it('groups items with the trial settings first', () => {
    const grouped = groupSettings([
      { group: 'alerts', key: 'a' },
      { group: 'preview', key: 'b' },
      { group: 'email', key: 'c' },
      { group: 'preview', key: 'd' },
    ]);
    expect(grouped.map((group) => group.label)).toEqual([
      'Prueba gratuita',
      'Correos',
      'Alertas',
    ]);
    expect(grouped[0]?.items.map((item) => item.key)).toEqual(['b', 'd']);
  });
});
