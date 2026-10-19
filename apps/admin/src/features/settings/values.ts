import type { AdminSettingViewDto, AdminUpdateSettingDto } from '@lattiz/api-client';
import { formatBytes, formatCount } from '@/lib/format';

export type SettingType = AdminSettingViewDto['type'];
export type SettingUpdateValue = AdminUpdateSettingDto['value'];

export function isSettingUpdateValue(value: unknown): value is SettingUpdateValue {
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return true;
  }
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string' || typeof item === 'number')
  );
}

/** Claves `*_bytes`: equivalente legible junto al número, p. ej. "= 100.0 MB". */
export function byteSettingHint(key: string, value: unknown): string | null {
  if (!key.endsWith('_bytes')) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return `= ${formatBytes(value)}`;
}

export function formatSettingValue(value: unknown): string {
  if (value == null) return 'Sin valor';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return formatCount(value);
  if (typeof value === 'string') return value === '' ? 'Vacío' : value;
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Ninguno';
    return value.map((item) => String(item)).join(', ');
  }
  return JSON.stringify(value);
}

export function settingRangeLabel(
  min: number | null,
  max: number | null,
): string | null {
  if (min != null && max != null) {
    return `De ${formatCount(min)} a ${formatCount(max)}`;
  }
  if (min != null) return `Mínimo ${formatCount(min)}`;
  if (max != null) return `Máximo ${formatCount(max)}`;
  return null;
}

export function sameSettingValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function settingValueError(
  type: SettingType,
  value: unknown,
  min: number | null,
  max: number | null,
): string | null {
  if (type === 'bool') {
    return typeof value === 'boolean' ? null : 'Elige sí o no.';
  }
  if (type === 'int') return intError(value, min, max);
  if (type === 'string') {
    return typeof value === 'string' ? null : 'Escribe un texto.';
  }
  if (type === 'string-list') {
    if (!isStringList(value)) return 'Cada elemento debe ser un texto.';
    return null;
  }
  if (type === 'int-list') {
    if (!isIntList(value)) return 'Cada elemento debe ser un número entero.';
    return null;
  }
  return 'Este tipo de valor no se puede editar.';
}

function intError(
  value: unknown,
  min: number | null,
  max: number | null,
): string | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return 'Escribe un número entero.';
  }
  if (min != null && value < min) {
    return max != null
      ? `Tiene que estar entre ${formatCount(min)} y ${formatCount(max)}.`
      : `Tiene que ser ${formatCount(min)} o más.`;
  }
  if (max != null && value > max) {
    return min != null
      ? `Tiene que estar entre ${formatCount(min)} y ${formatCount(max)}.`
      : `Tiene que ser ${formatCount(max)} o menos.`;
  }
  return null;
}

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim() !== '')
  );
}

function isIntList(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'number' && Number.isInteger(item))
  );
}
