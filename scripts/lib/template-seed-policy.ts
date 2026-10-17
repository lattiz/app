/**
 * What a re-seed may write. Name, description, category, sort order and an admin
 * thumbnail stay with the admin unless `--overwrite-meta` is set. The kit still
 * owns the project JSON, the tier, the preview URL and `kit_meta`.
 */

export interface KitSection {
  slot: string;
  variant: string;
  role: string;
}

/** Compact copy of `.lattiz/state/<id>.json` → `lastCheck`, when that file exists. */
export interface KitCheckSummary {
  at: string;
  result: string;
  fail: number;
  warn: number;
  forced?: boolean;
}

export interface KitMetaRecord {
  vertical?: string;
  family?: string;
  archetype?: string;
  direction?: string;
  palette?: string;
  fontPair?: string;
  sections: KitSection[];
  check?: KitCheckSummary;
  gitSha: string | null;
  seededAt: string;
}

/** `template.meta.json` (only the fields `kit_meta` keeps). */
export interface KitSourceMeta {
  vertical?: unknown;
  family?: unknown;
  archetype?: unknown;
  slots?: unknown;
}

export interface KitMetaExtras {
  direction?: string | null;
  palette?: string | null;
  fontPair?: string | null;
  check?: KitCheckSummary | null;
  gitSha: string | null;
  seededAt: string;
}

export interface TemplateSeedInput {
  name: string;
  description?: string;
  category: string;
  sortOrder?: number;
  tier: string;
  grapesjsJson: unknown;
  previewUrl?: string | null;
  kitMeta: KitMetaRecord;
}

export interface TemplateWriteFields {
  name?: string;
  description?: string;
  category?: string;
  sort_order?: number;
  grapesjs_json: unknown;
  tier: string;
  preview_url?: string;
  kit_meta: KitMetaRecord;
}

/** Lock tier, spec and compiled theme: whatever the build actually left on disk. */
export interface KitIdentitySources {
  lockTier?: unknown;
  spec?: unknown;
  themeFontPair?: unknown;
}

export interface KitIdentity {
  direction?: string;
  palette?: string;
  fontPair?: string;
}

const ADMIN_THUMB = '/admin-thumb-';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return null;
  return value as Record<string, unknown>;
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function first(values: (string | undefined)[]): string | undefined {
  return values.find((value) => value !== undefined);
}

/** Preset id. `custom` is the lock's sentinel for a spec palette with no id. */
function paletteId(value: unknown): string | undefined {
  const direct = text(value);
  if (direct) return direct === 'custom' ? undefined : direct;
  return text(asRecord(value)?.preset);
}

function sectionOf(value: unknown): KitSection | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  const slot = text(record.slot);
  const variant = text(record.variant);
  const role = text(record.role);
  if (!slot || !variant || !role) return undefined;
  return { slot, variant, role };
}

function sectionsOf(slots: unknown): KitSection[] {
  if (!Array.isArray(slots)) return [];
  const sections: KitSection[] = [];
  for (const slot of slots) {
    const section = sectionOf(slot);
    if (section) sections.push(section);
  }
  return sections;
}

/**
 * Columns to send. Catalog fields only when the row is new or `--overwrite-meta`
 * is set; `preview_url` is omitted when this run has no preview URL, so a
 * `--no-preview` re-seed does not clear it.
 */
export function templateWriteFields(
  existing: object | null,
  args: TemplateSeedInput,
  overwriteMeta: boolean,
): TemplateWriteFields {
  const writeCatalog = existing == null || overwriteMeta;
  const fields: TemplateWriteFields = {
    grapesjs_json: args.grapesjsJson,
    tier: args.tier,
    kit_meta: args.kitMeta,
  };
  if (args.previewUrl) fields.preview_url = args.previewUrl;
  if (!writeCatalog) return fields;
  fields.name = args.name;
  fields.category = args.category;
  if (args.description !== undefined) fields.description = args.description;
  if (args.sortOrder !== undefined) fields.sort_order = args.sortOrder;
  return fields;
}

/** Admin thumbs use the key `templates/<id>/admin-thumb-<hash>.<ext>`. */
export function shouldReplaceThumbnail(
  currentThumbnailUrl: string | null | undefined,
  overwriteMeta: boolean,
): boolean {
  if (overwriteMeta) return true;
  return !currentThumbnailUrl?.includes(ADMIN_THUMB);
}

/** A row with `retired_at` stays inactive; the check constraint requires it. */
export function shouldActivate(input: {
  previewLive: boolean;
  thumbnailReady: boolean;
  retiredAt: string | null;
}): boolean {
  if (input.retiredAt) return false;
  return input.previewLive && input.thumbnailReady;
}

export function buildKitMeta(
  meta: KitSourceMeta | null,
  extras: KitMetaExtras,
): KitMetaRecord {
  const source = meta ?? {};
  const ordered: Record<string, unknown> = {};
  const vertical = text(source.vertical);
  const family = text(source.family);
  const archetype = text(source.archetype);
  const direction = text(extras.direction);
  const palette = paletteId(extras.palette);
  const fontPair = text(extras.fontPair);
  if (vertical) ordered.vertical = vertical;
  if (family) ordered.family = family;
  if (archetype) ordered.archetype = archetype;
  if (direction) ordered.direction = direction;
  if (palette) ordered.palette = palette;
  if (fontPair) ordered.fontPair = fontPair;
  ordered.sections = sectionsOf(source.slots);
  if (extras.check) {
    ordered.check = {
      at: extras.check.at,
      result: extras.check.result,
      fail: extras.check.fail,
      warn: extras.check.warn,
      ...(extras.check.forced ? { forced: true } : {}),
    };
  }
  ordered.gitSha = extras.gitSha;
  ordered.seededAt = extras.seededAt;
  return ordered as unknown as KitMetaRecord;
}

/**
 * Direction, palette and font pair from the lock (`specs/<stem>.lock.json`),
 * then the spec, then `manifest.json`'s theme. Object font pairs and a `custom`
 * palette have no id, so they are left out.
 */
export function pickKitIdentity(sources: KitIdentitySources): KitIdentity {
  const lock = asRecord(sources.lockTier);
  const spec = asRecord(sources.spec);
  const brand = asRecord(spec?.brand);
  const direction = first([
    text(asRecord(lock?.layout)?.direction),
    text(asRecord(spec?.layout)?.direction),
  ]);
  const palette = first([paletteId(lock?.palette), paletteId(brand?.palette)]);
  const fontPair = first([
    text(lock?.fontPair),
    text(sources.themeFontPair),
    text(brand?.fontPair),
  ]);
  return {
    ...(direction ? { direction } : {}),
    ...(palette ? { palette } : {}),
    ...(fontPair ? { fontPair } : {}),
  };
}
