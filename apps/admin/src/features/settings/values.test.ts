import { describe, expect, it } from 'vitest';
import { formatBytes } from '@/lib/format';
import {
  byteSettingHint,
  formatSettingValue,
  isSettingUpdateValue,
  settingRangeLabel,
  settingValueError,
} from './values';

describe('setting values', () => {
  it('formats each kind of value', () => {
    expect(formatSettingValue(true)).toBe('Sí');
    expect(formatSettingValue(false)).toBe('No');
    expect(formatSettingValue(1400)).toBe('1,400');
    expect(formatSettingValue('')).toBe('Vacío');
    expect(formatSettingValue(null)).toBe('Sin valor');
    expect(formatSettingValue(['image/png', 'image/jpeg'])).toBe('image/png, image/jpeg');
    expect(formatSettingValue([])).toBe('Ninguno');
  });

  it('describes the numeric range when it exists', () => {
    expect(settingRangeLabel(1, 365)).toBe('De 1 a 365');
    expect(settingRangeLabel(1, null)).toBe('Mínimo 1');
    expect(settingRangeLabel(null, null)).toBeNull();
  });

  it('accepts a value that matches its type and range', () => {
    expect(settingValueError('bool', false, null, null)).toBeNull();
    expect(settingValueError('int', 14, 1, 365)).toBeNull();
    expect(settingValueError('string', '', null, null)).toBeNull();
    expect(settingValueError('string-list', ['image/png'], null, null)).toBeNull();
    expect(settingValueError('int-list', [28, 0], null, null)).toBeNull();
  });

  it('rejects a value of the wrong type or outside the range', () => {
    expect(settingValueError('bool', 'sí', null, null)).toBe('Elige sí o no.');
    expect(settingValueError('int', 1.5, 1, 365)).toBe('Escribe un número entero.');
    expect(settingValueError('int', 0, 1, 365)).toBe('Tiene que estar entre 1 y 365.');
    expect(settingValueError('int', 9, 10, null)).toBe('Tiene que ser 10 o más.');
    expect(settingValueError('string', 4, null, null)).toBe('Escribe un texto.');
    expect(settingValueError('string-list', ['', 'a'], null, null)).toBe(
      'Cada elemento debe ser un texto.',
    );
    expect(settingValueError('int-list', [1.2], null, null)).toBe(
      'Cada elemento debe ser un número entero.',
    );
  });

  it('accepts the typed setting values and rejects null', () => {
    expect(isSettingUpdateValue(100)).toBe(true);
    expect(isSettingUpdateValue(false)).toBe(true);
    expect(isSettingUpdateValue('hola')).toBe(true);
    expect(isSettingUpdateValue(['a', 1])).toBe(true);
    expect(isSettingUpdateValue(null)).toBe(false);
  });

  it('shows a readable size next to byte settings', () => {
    expect(byteSettingHint('preview.max_asset_bytes', 100 * 1024 * 1024)).toBe(
      `= ${formatBytes(100 * 1024 * 1024)}`,
    );
    expect(byteSettingHint('preview.trial_days', 14)).toBeNull();
    expect(byteSettingHint('preview.max_asset_bytes', '100')).toBeNull();
  });
});
