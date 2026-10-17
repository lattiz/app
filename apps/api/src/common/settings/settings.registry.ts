export interface ResolveContext {
  trialDays: number;
}

export interface BoolSetting {
  readonly key: string;
  readonly type: 'bool';
  readonly envVar: string;
  readonly default: boolean;
  readonly description?: string;
  readonly validate: (value: boolean, ctx: ResolveContext) => boolean;
}

interface IntSettingBase {
  readonly key: string;
  readonly type: 'int';
  readonly envVar: string;
  readonly expectation: string;
  readonly description?: string;
  readonly min?: number;
  readonly max?: number;
  readonly validate: (value: number, ctx: ResolveContext) => boolean;
  /** Unset env uses min(default, trialDays - 1), or 0 when the trial is one day. */
  readonly deriveFromTrial?: boolean;
}

/** No code default: missing from both the database and the env means absent. */
export type RequiredIntSetting = IntSettingBase & {
  readonly required: true;
};

export type DefaultedIntSetting = IntSettingBase & {
  readonly required?: false;
  readonly default: number;
};

export type IntSetting = RequiredIntSetting | DefaultedIntSetting;

export interface StringListSetting {
  readonly key: string;
  readonly type: 'string-list';
  readonly envVar: string;
  readonly default: readonly string[];
  readonly kind: 'mime' | 'zone';
  readonly description?: string;
  readonly validate: (value: readonly string[], ctx: ResolveContext) => boolean;
}

export interface IntListSetting {
  readonly key: string;
  readonly type: 'int-list';
  readonly envVar: string;
  readonly default: readonly number[];
  readonly description?: string;
  readonly validate: (value: readonly number[], ctx: ResolveContext) => boolean;
}

export interface StringSetting {
  readonly key: string;
  readonly type: 'string';
  readonly envVar: string;
  readonly default: string;
  readonly description?: string;
  readonly validate: (value: string, ctx: ResolveContext) => boolean;
}

export type SettingDefinition =
  | BoolSetting
  | IntSetting
  | StringListSetting
  | IntListSetting
  | StringSetting;

const MIME_PATTERN = /^[\w.+-]+\/[\w.+-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_MIME = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

function boolSetting(
  def: Omit<BoolSetting, 'type' | 'validate'> & {
    validate?: BoolSetting['validate'];
  },
): BoolSetting {
  return {
    type: 'bool',
    validate: def.validate ?? (() => true),
    key: def.key,
    envVar: def.envVar,
    default: def.default,
    description: def.description,
  };
}

function intSetting(def: Omit<RequiredIntSetting, 'type'>): RequiredIntSetting;
function intSetting(
  def: Omit<DefaultedIntSetting, 'type'> & { readonly default: number },
): DefaultedIntSetting;
function intSetting(
  def:
    | Omit<RequiredIntSetting, 'type'>
    | (Omit<DefaultedIntSetting, 'type'> & { readonly default: number }),
): IntSetting {
  return { type: 'int', ...def };
}

function stringListSetting(
  def: Omit<StringListSetting, 'type'>,
): StringListSetting {
  return { type: 'string-list', ...def };
}

function intListSetting(def: Omit<IntListSetting, 'type'>): IntListSetting {
  return { type: 'int-list', ...def };
}

function stringSetting(def: Omit<StringSetting, 'type'>): StringSetting {
  return { type: 'string', ...def };
}

const always = (): boolean => true;

/** Each integer in range, no duplicates, at most `maxLength` items. Empty is allowed. */
function intsInRange(min: number, max: number, maxLength: number) {
  return (value: readonly number[]): boolean => {
    if (value.length > maxLength) return false;
    const seen = new Set<number>();
    for (const item of value) {
      if (
        !Number.isSafeInteger(item) ||
        item < min ||
        item > max ||
        seen.has(item)
      ) {
        return false;
      }
      seen.add(item);
    }
    return true;
  };
}

export const SETTINGS = {
  'preview.enabled': boolSetting({
    key: 'preview.enabled',
    envVar: 'PREVIEW_ENABLED',
    default: true,
    description: 'Activa la ventana de prueba gratuita en el sitio público.',
  }),
  'preview.trial_days': intSetting({
    key: 'preview.trial_days',
    envVar: 'PREVIEW_TRIAL_DAYS',
    default: 14,
    min: 1,
    max: 365,
    expectation: 'from 1 to 365',
    description:
      'Días de la prueba gratuita cuando la llamada no indica otro valor.',
    validate: (value) => value >= 1 && value <= 365,
  }),
  'preview.warning_day': intSetting({
    key: 'preview.warning_day',
    envVar: 'PREVIEW_WARNING_DAY',
    default: 10,
    min: 1,
    expectation: 'at least 1 and less than the trial length',
    description: 'Día de la prueba en el que se avisa que está por terminar.',
    deriveFromTrial: true,
    validate: (value, ctx) => value >= 1 && value < ctx.trialDays,
  }),
  'preview.max_asset_bytes': intSetting({
    key: 'preview.max_asset_bytes',
    envVar: 'PREVIEW_MAX_ASSET_BYTES',
    default: 26_214_400,
    min: 0,
    expectation: '0 or greater (0 disables the unpaid cap)',
    description:
      'Tamaño máximo, en bytes, de un archivo subido durante la prueba.',
    validate: (value) => value >= 0,
  }),
  'preview.sanitize_enabled': boolSetting({
    key: 'preview.sanitize_enabled',
    envVar: 'PREVIEW_SANITIZE_ENABLED',
    default: true,
    description: 'Sanitiza el HTML publicado durante la prueba.',
  }),
  'preview.require_verified_email': boolSetting({
    key: 'preview.require_verified_email',
    envVar: 'PREVIEW_REQUIRE_VERIFIED_EMAIL',
    default: true,
    description: 'Exige un correo verificado para publicar durante la prueba.',
  }),
  'preview.allowed_asset_mime': stringListSetting({
    key: 'preview.allowed_asset_mime',
    envVar: 'PREVIEW_ALLOWED_ASSET_MIME',
    default: DEFAULT_MIME,
    kind: 'mime',
    description: 'Tipos MIME permitidos para los archivos de la prueba.',
    validate: (value) => value.every((mime) => MIME_PATTERN.test(mime)),
  }),
  'preview.publish_rate_limit_per_min': intSetting({
    key: 'preview.publish_rate_limit_per_min',
    envVar: 'PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN',
    default: 6,
    min: 0,
    expectation: '0 or greater (0 disables the extra limit)',
    description: 'Publicaciones permitidas por minuto durante la prueba.',
    validate: (value) => value >= 0,
  }),
  'preview.asset_rate_limit_per_min': intSetting({
    key: 'preview.asset_rate_limit_per_min',
    envVar: 'PREVIEW_ASSET_RATE_LIMIT_PER_MIN',
    default: 20,
    min: 0,
    expectation: '0 or greater (0 disables the extra limit)',
    description: 'Subidas de archivos permitidas por minuto durante la prueba.',
    validate: (value) => value >= 0,
  }),
  'preview.notify_enabled': boolSetting({
    key: 'preview.notify_enabled',
    envVar: 'PREVIEW_NOTIFY_ENABLED',
    default: true,
    description: 'Envía avisos de que la prueba está por terminar.',
  }),
  'preview.notify_interval_minutes': intSetting({
    key: 'preview.notify_interval_minutes',
    envVar: 'PREVIEW_NOTIFY_INTERVAL_MINUTES',
    default: 60,
    min: 1,
    expectation: 'at least 1',
    description:
      'Minutos de espera entre cada lote de avisos de fin de prueba.',
    validate: (value) => value >= 1,
  }),
  'preview.notify_batch': intSetting({
    key: 'preview.notify_batch',
    envVar: 'PREVIEW_NOTIFY_BATCH',
    default: 50,
    min: 1,
    expectation: 'at least 1',
    description:
      'Cantidad de avisos de fin de prueba que se envían en cada lote.',
    validate: (value) => value >= 1,
  }),
  'email.sending_enabled': boolSetting({
    key: 'email.sending_enabled',
    envVar: 'EMAIL_SENDING_ENABLED',
    default: false,
  }),
  'email.max_per_run': intSetting({
    key: 'email.max_per_run',
    envVar: 'EMAIL_MAX_PER_RUN',
    default: 20,
    min: 1,
    expectation: 'at least 1',
    validate: (value) => value >= 1,
  }),
  'dns.reconcile.enabled': boolSetting({
    key: 'dns.reconcile.enabled',
    envVar: 'DNS_RECONCILE_ENABLED',
    default: false,
  }),
  'dns.reconcile.grace_minutes': intSetting({
    key: 'dns.reconcile.grace_minutes',
    envVar: 'DNS_RECONCILE_GRACE_MINUTES',
    default: 120,
    min: 1,
    expectation: 'at least 1',
    validate: (value) => value >= 1,
  }),
  'dns.reconcile.max_deletes': intSetting({
    key: 'dns.reconcile.max_deletes',
    envVar: 'DNS_RECONCILE_MAX_DELETES',
    default: 5,
    min: 1,
    expectation: 'at least 1',
    validate: (value) => value >= 1,
  }),
  'dns.reconcile.keep_zones': stringListSetting({
    key: 'dns.reconcile.keep_zones',
    envVar: 'DNS_RECONCILE_KEEP_ZONES',
    default: [],
    kind: 'zone',
    validate: always,
  }),
  // Required: no invented default. Absent unless the database or the env var is set.
  'domain.max_cost_usd_cents': intSetting({
    key: 'domain.max_cost_usd_cents',
    envVar: 'DOMAIN_MAX_COST_USD_CENTS',
    required: true,
    min: 1,
    expectation: 'a positive integer (USD cents)',
    validate: (value) => value >= 1,
  }),
  'domain.basic_renewal_max_cost_usd_cents': intSetting({
    key: 'domain.basic_renewal_max_cost_usd_cents',
    envVar: 'BASIC_DOMAIN_MAX_COST_USD_CENTS',
    required: true,
    min: 1,
    expectation: 'a positive integer (USD cents)',
    validate: (value) => value >= 1,
  }),
  'domain.pro_renewal_max_cost_usd_cents': intSetting({
    key: 'domain.pro_renewal_max_cost_usd_cents',
    envVar: 'PRO_DOMAIN_MAX_COST_USD_CENTS',
    required: true,
    min: 1,
    expectation: 'a positive integer (USD cents)',
    validate: (value) => value >= 1,
  }),
  'domains.mock_purchases': boolSetting({
    key: 'domains.mock_purchases',
    envVar: 'OPENPROVIDER_MOCK_PURCHASES',
    default: false,
  }),
  // Off unless the database row or DOMAIN_RENEWAL_ENABLED is set.
  'domain.renewal.enabled': boolSetting({
    key: 'domain.renewal.enabled',
    envVar: 'DOMAIN_RENEWAL_ENABLED',
    default: false,
  }),
  'domain.renewal.fee_basic_mxn_cents': intSetting({
    key: 'domain.renewal.fee_basic_mxn_cents',
    envVar: 'DOMAIN_RENEWAL_FEE_BASIC_MXN_CENTS',
    default: 59900,
    min: 1,
    expectation: 'at least 1 (MXN cents)',
    validate: (value) => value >= 1,
  }),
  'domain.renewal.fee_pro_mxn_cents': intSetting({
    key: 'domain.renewal.fee_pro_mxn_cents',
    envVar: 'DOMAIN_RENEWAL_FEE_PRO_MXN_CENTS',
    default: 59900,
    min: 1,
    expectation: 'at least 1 (MXN cents)',
    validate: (value) => value >= 1,
  }),
  'domain.renewal.tax_rate_bps': intSetting({
    key: 'domain.renewal.tax_rate_bps',
    envVar: 'DOMAIN_RENEWAL_TAX_RATE_BPS',
    default: 1600,
    min: 0,
    max: 10_000,
    expectation: 'from 0 to 10000 basis points',
    validate: (value) => value >= 0 && value <= 10_000,
  }),
  'domain.renewal.open_days_before': intSetting({
    key: 'domain.renewal.open_days_before',
    envVar: 'DOMAIN_RENEWAL_OPEN_DAYS_BEFORE',
    default: 28,
    min: 1,
    max: 28,
    expectation:
      'from 1 to 28 (Openprovider renews only inside the previous 4 weeks)',
    validate: (value) => value >= 1 && value <= 28,
  }),
  'domain.renewal.notice_days_before': intListSetting({
    key: 'domain.renewal.notice_days_before',
    envVar: 'DOMAIN_RENEWAL_NOTICE_DAYS_BEFORE',
    default: [28, 14, 7, 3, 1, 0],
    validate: intsInRange(0, 28, 12),
  }),
  'domain.renewal.late_days': intSetting({
    key: 'domain.renewal.late_days',
    envVar: 'DOMAIN_RENEWAL_LATE_DAYS',
    default: 15,
    min: 0,
    max: 30,
    expectation: 'from 0 to 30',
    validate: (value) => value >= 0 && value <= 30,
  }),
  'domain.renewal.late_notice_days_after': intListSetting({
    key: 'domain.renewal.late_notice_days_after',
    envVar: 'DOMAIN_RENEWAL_LATE_NOTICE_DAYS_AFTER',
    default: [7],
    validate: intsInRange(1, 30, 12),
  }),
  'domain.renewal.max_registrar_attempts': intSetting({
    key: 'domain.renewal.max_registrar_attempts',
    envVar: 'DOMAIN_RENEWAL_MAX_REGISTRAR_ATTEMPTS',
    default: 5,
    min: 1,
    max: 20,
    expectation: 'from 1 to 20',
    validate: (value) => value >= 1 && value <= 20,
  }),
  'domain.renewal.balance_alert_days': intSetting({
    key: 'domain.renewal.balance_alert_days',
    envVar: 'DOMAIN_RENEWAL_BALANCE_ALERT_DAYS',
    default: 30,
    min: 1,
    max: 90,
    expectation: 'from 1 to 90',
    validate: (value) => value >= 1 && value <= 90,
  }),
  // Empty means operational alerts are not sent.
  'alerts.admin_email': stringSetting({
    key: 'alerts.admin_email',
    envVar: 'ALERTS_ADMIN_EMAIL',
    default: '',
    validate: (value) => value === '' || EMAIL_PATTERN.test(value),
  }),
};

export type SettingKey = keyof typeof SETTINGS;

export type BoolKey = {
  [K in SettingKey]: (typeof SETTINGS)[K] extends BoolSetting ? K : never;
}[SettingKey];

export type IntKey = {
  [K in SettingKey]: (typeof SETTINGS)[K] extends IntSetting ? K : never;
}[SettingKey];

export type StringListKey = {
  [K in SettingKey]: (typeof SETTINGS)[K] extends StringListSetting ? K : never;
}[SettingKey];

export type IntListKey = {
  [K in SettingKey]: (typeof SETTINGS)[K] extends IntListSetting ? K : never;
}[SettingKey];

export type StringKey = {
  [K in SettingKey]: (typeof SETTINGS)[K] extends StringSetting ? K : never;
}[SettingKey];

export type DbRead<T> = { ok: true; value: T } | { ok: false; reason: string };

const NO_CONTEXT: ResolveContext = { trialDays: 0 };

export function derivedWarningDay(trialDays: number, cap: number): number {
  if (trialDays <= 1) return 0;
  return Math.min(cap, trialDays - 1);
}

export function envBool(def: BoolSetting, raw: string | undefined): boolean {
  if (raw === undefined || raw.trim() === '') return def.default;
  const value = raw.trim().toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(
    `${def.envVar}="${raw.trim()}" is invalid; expected "true" or "false".`,
  );
}

export function envInt(
  def: IntSetting,
  raw: string | undefined,
  ctx: ResolveContext,
): number {
  const unset = raw === undefined || raw.trim() === '';
  if (unset) {
    if (def.required) {
      throw new Error(
        `${def.envVar} must be set to an integer (${def.expectation}).`,
      );
    }
    if (!def.validate(def.default, ctx)) {
      throw new Error(
        `${def.envVar} must be an integer (${def.expectation}); the default ${def.default} does not satisfy that.`,
      );
    }
    return def.default;
  }
  return parseIntValue(
    def.envVar,
    raw,
    (value) => def.validate(value, ctx),
    def.expectation,
  );
}

export function envWarningDay(
  raw: string | undefined,
  trialDays: number,
): number {
  const def = SETTINGS['preview.warning_day'];
  const unset = raw === undefined || raw.trim() === '';
  if (unset) return derivedWarningDay(trialDays, def.default);
  return parseIntValue(
    def.envVar,
    raw,
    (value) => def.validate(value, { trialDays }),
    `at least 1 and less than PREVIEW_TRIAL_DAYS (${trialDays})`,
  );
}

export function envStringList(
  def: StringListSetting,
  raw: string | undefined,
): readonly string[] {
  if (def.kind === 'mime') return readMimeList(def, raw);
  if (raw === undefined) return [...def.default];
  return normalizeZones(raw.split(','));
}

export function dbBool(value: unknown): DbRead<boolean> {
  if (typeof value !== 'boolean') {
    return {
      ok: false,
      reason: `expected a JSON boolean, got ${describeJson(value)}`,
    };
  }
  return { ok: true, value };
}

export function dbInt(value: unknown): DbRead<number> {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    return {
      ok: false,
      reason: `expected a JSON integer, got ${describeJson(value)}`,
    };
  }
  return { ok: true, value };
}

export function envIntList(
  def: IntListSetting,
  raw: string | undefined,
): readonly number[] {
  if (!def.validate(def.default, NO_CONTEXT)) {
    throw new Error(
      `${def.envVar} default [${def.default.join(', ')}] failed validation.`,
    );
  }
  if (raw === undefined) return [...def.default];
  const trimmed = raw.trim();
  if (trimmed === '')
    return def.validate([], NO_CONTEXT) ? [] : [...def.default];
  const values: number[] = [];
  for (const part of trimmed.split(',')) {
    const piece = part.trim();
    if (piece === '') continue;
    if (!/^[0-9]+$/.test(piece)) return [...def.default];
    const value = Number(piece);
    if (!Number.isSafeInteger(value)) return [...def.default];
    values.push(value);
  }
  if (!def.validate(values, NO_CONTEXT)) return [...def.default];
  return values;
}

export function envString(def: StringSetting, raw: string | undefined): string {
  if (!def.validate(def.default, NO_CONTEXT)) {
    throw new Error(`${def.envVar} default failed validation.`);
  }
  if (raw === undefined) return def.default;
  const value = raw.trim();
  if (!def.validate(value, NO_CONTEXT)) return def.default;
  return value;
}

export function dbIntList(value: unknown): DbRead<readonly number[]> {
  if (
    !Array.isArray(value) ||
    value.some(
      (item) => typeof item !== 'number' || !Number.isSafeInteger(item),
    )
  ) {
    return {
      ok: false,
      reason: `expected a JSON array of integers, got ${describeJson(value)}`,
    };
  }
  return { ok: true, value: [...value] };
}

export function dbString(value: unknown): DbRead<string> {
  if (typeof value !== 'string') {
    return {
      ok: false,
      reason: `expected a JSON string, got ${describeJson(value)}`,
    };
  }
  return { ok: true, value };
}

export function dbStringList(
  def: StringListSetting,
  value: unknown,
): DbRead<readonly string[]> {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    return {
      ok: false,
      reason: `expected a JSON array of strings, got ${describeJson(value)}`,
    };
  }
  if (def.kind === 'zone') {
    const zones = normalizeZones(value);
    if (!def.validate(zones, NO_CONTEXT)) {
      return { ok: false, reason: 'failed validation' };
    }
    return { ok: true, value: zones };
  }
  const parsed = normalizeMimes(value);
  if (!parsed.ok) return parsed;
  if (!def.validate(parsed.value, NO_CONTEXT)) {
    return { ok: false, reason: 'failed validation' };
  }
  return parsed;
}

function readMimeList(
  def: StringListSetting,
  raw: string | undefined,
): readonly string[] {
  if (raw === undefined) return [...def.default];
  const trimmed = raw.trim();
  if (trimmed === '') return [];

  const unique: string[] = [];
  for (const part of trimmed.split(',')) {
    const mime = part.trim().toLowerCase();
    if (mime === '') continue;
    if (!MIME_PATTERN.test(mime)) {
      throw new Error(
        `${def.envVar}="${trimmed}" is invalid; expected a comma-separated list of mime types, or empty to disable.`,
      );
    }
    if (!unique.includes(mime)) unique.push(mime);
  }
  return unique;
}

function normalizeMimes(values: readonly string[]): DbRead<readonly string[]> {
  const unique: string[] = [];
  for (const value of values) {
    const mime = value.trim().toLowerCase();
    if (!MIME_PATTERN.test(mime)) {
      return { ok: false, reason: `mime "${value}" is invalid` };
    }
    if (!unique.includes(mime)) unique.push(mime);
  }
  return { ok: true, value: unique };
}

function normalizeZones(values: readonly string[]): readonly string[] {
  const unique: string[] = [];
  for (const value of values) {
    const zone = value.trim().toLowerCase();
    if (zone === '') continue;
    if (!unique.includes(zone)) unique.push(zone);
  }
  return unique;
}

function parseIntValue(
  name: string,
  raw: string,
  valid: (value: number) => boolean,
  expectation: string,
): number {
  const trimmed = raw.trim();
  if (!/^[0-9]+$/.test(trimmed)) {
    throw new Error(
      `${name}="${trimmed}" is invalid; expected an integer (${expectation}).`,
    );
  }
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value) || !valid(value)) {
    throw new Error(
      `${name}="${trimmed}" is invalid; expected an integer (${expectation}).`,
    );
  }
  return value;
}

function describeJson(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
