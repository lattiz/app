import {
  dbBool,
  dbInt,
  dbIntList,
  dbString,
  dbStringList,
  derivedWarningDay,
  envBool,
  envInt,
  envStringList,
  envWarningDay,
  SETTINGS,
  type IntListSetting,
  type ResolveContext,
  type SettingDefinition,
  type SettingKey,
} from '../../../common/settings/settings.registry';

const NO_CONTEXT: ResolveContext = { trialDays: 0 };
const SECRET_PATTERN =
  /secret|password|token|credential|api[_-]?key|private[_-]?key|service[_-]?role/i;

export type SettingSource = 'db' | 'env' | 'default';

export interface SettingRow {
  value: unknown;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface SettingView {
  key: string;
  group: string;
  type: SettingDefinition['type'];
  min: number | null;
  max: number | null;
  default: unknown;
  envValue: string | null;
  dbValue: unknown;
  effectiveValue: unknown;
  source: SettingSource;
  description: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export type ParsedSetting =
  | { ok: true; value: unknown }
  | { ok: false; message: string };

export function isSettingKey(key: string): key is SettingKey {
  return Object.prototype.hasOwnProperty.call(SETTINGS, key);
}

export function settingDefinition(key: string): SettingDefinition | undefined {
  if (!isSettingKey(key)) return undefined;
  return SETTINGS[key];
}

/** Env names that must never be echoed, even if a future key looks like a secret. */
export function settingLooksSecret(key: string, envVar: string): boolean {
  return SECRET_PATTERN.test(key) || SECRET_PATTERN.test(envVar);
}

export function describeSettings(
  rows: ReadonlyMap<string, SettingRow>,
  env: (name: string) => string | undefined,
): SettingView[] {
  const ctx = trialContext(rows, env);
  return Object.values(SETTINGS).map((def) =>
    describeSetting(
      def,
      rows.get(def.key),
      env(def.envVar),
      def.type === 'int' && def.deriveFromTrial ? ctx : NO_CONTEXT,
    ),
  );
}

export function describeSetting(
  def: SettingDefinition,
  row: SettingRow | undefined,
  envRaw: string | undefined,
  ctx: ResolveContext,
): SettingView {
  const fromDb = row ? acceptDb(def, row.value, ctx) : undefined;
  const fromEnv = acceptEnv(def, envRaw, ctx);
  const secret = settingLooksSecret(def.key, def.envVar);
  let source: SettingSource = 'default';
  let effectiveValue = fallbackValue(def, ctx);
  if (fromDb !== undefined) {
    source = 'db';
    effectiveValue = fromDb;
  } else if (fromEnv !== undefined) {
    source = 'env';
    effectiveValue = fromEnv;
  }
  const dot = def.key.indexOf('.');
  return {
    key: def.key,
    group: dot === -1 ? def.key : def.key.slice(0, dot),
    type: def.type,
    min: def.type === 'int' && def.min !== undefined ? def.min : null,
    max: def.type === 'int' && def.max !== undefined ? def.max : null,
    default: registryDefault(def),
    envValue: envRaw !== undefined && !secret ? envRaw : null,
    dbValue: row ? row.value : null,
    effectiveValue,
    source,
    description: def.description ?? null,
    updatedAt: row?.updatedAt ?? null,
    updatedBy: row?.updatedBy ?? null,
  };
}

/** Same type and range the running app accepts from `app_settings`. */
export function parseSettingValue(
  def: SettingDefinition,
  value: unknown,
  ctx: ResolveContext,
): ParsedSetting {
  if (def.type === 'bool') {
    const parsed = dbBool(value);
    if (!parsed.ok) return { ok: false, message: parsed.reason };
    if (!def.validate(parsed.value, ctx)) {
      return { ok: false, message: 'failed validation' };
    }
    return { ok: true, value: parsed.value };
  }
  if (def.type === 'int') {
    const parsed = dbInt(value);
    if (!parsed.ok) return { ok: false, message: parsed.reason };
    if (!def.validate(parsed.value, ctx)) {
      return { ok: false, message: def.expectation };
    }
    return { ok: true, value: parsed.value };
  }
  if (def.type === 'string-list') {
    const parsed = dbStringList(def, value);
    if (!parsed.ok) return { ok: false, message: parsed.reason };
    return { ok: true, value: [...parsed.value] };
  }
  if (def.type === 'int-list') {
    const parsed = dbIntList(value);
    if (!parsed.ok) return { ok: false, message: parsed.reason };
    if (!def.validate(parsed.value, NO_CONTEXT)) {
      return { ok: false, message: 'failed validation' };
    }
    return { ok: true, value: [...parsed.value] };
  }
  const parsed = dbString(value);
  if (!parsed.ok) return { ok: false, message: parsed.reason };
  if (!def.validate(parsed.value, NO_CONTEXT)) {
    return { ok: false, message: 'failed validation' };
  }
  return { ok: true, value: parsed.value };
}

export function trialContext(
  rows: ReadonlyMap<string, SettingRow>,
  env: (name: string) => string | undefined,
): ResolveContext {
  const def = SETTINGS['preview.trial_days'];
  const view = describeSetting(
    def,
    rows.get(def.key),
    env(def.envVar),
    NO_CONTEXT,
  );
  return {
    trialDays:
      typeof view.effectiveValue === 'number' ? view.effectiveValue : 0,
  };
}

function registryDefault(def: SettingDefinition): unknown {
  if (def.type === 'int' && def.required) return null;
  if (def.type === 'string-list' || def.type === 'int-list') {
    return [...def.default];
  }
  return def.default;
}

function fallbackValue(def: SettingDefinition, ctx: ResolveContext): unknown {
  if (def.type === 'int' && def.deriveFromTrial && 'default' in def) {
    return derivedWarningDay(ctx.trialDays, def.default);
  }
  return registryDefault(def);
}

function acceptDb(
  def: SettingDefinition,
  value: unknown,
  ctx: ResolveContext,
): unknown {
  const parsed = parseSettingValue(def, value, ctx);
  return parsed.ok ? parsed.value : undefined;
}

function acceptEnv(
  def: SettingDefinition,
  raw: string | undefined,
  ctx: ResolveContext,
): unknown {
  if (raw === undefined || raw.trim() === '') return undefined;
  try {
    if (def.type === 'bool') {
      const value = envBool(def, raw);
      return def.validate(value, ctx) ? value : undefined;
    }
    if (def.type === 'int') {
      if (def.deriveFromTrial) return envWarningDay(raw, ctx.trialDays);
      return envInt(def, raw, ctx);
    }
    if (def.type === 'string-list') return [...envStringList(def, raw)];
    if (def.type === 'int-list') return acceptedIntList(def, raw);
    const value = raw.trim();
    return def.validate(value, NO_CONTEXT) ? value : undefined;
  } catch {
    return undefined;
  }
}

function acceptedIntList(
  def: IntListSetting,
  raw: string,
): readonly number[] | undefined {
  const trimmed = raw.trim();
  const values: number[] = [];
  if (trimmed !== '') {
    for (const part of trimmed.split(',')) {
      const piece = part.trim();
      if (piece === '') continue;
      if (!/^[0-9]+$/.test(piece)) return undefined;
      const value = Number(piece);
      if (!Number.isSafeInteger(value)) return undefined;
      values.push(value);
    }
  }
  if (!def.validate(values, NO_CONTEXT)) return undefined;
  return values;
}
