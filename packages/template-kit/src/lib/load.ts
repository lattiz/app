import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  COLOR_TOKENS,
  type Blueprint,
  type ContentPack,
  type Manifest,
  type SectionMeta,
  type Theme,
} from '../types';
import { isTier, TIER_NAMES, type Tier } from '../tiers';
import { KitError } from './args';
import { paths, sectionDir } from './paths';

type Rec = Record<string, unknown>;

function isRecord(value: unknown): value is Rec {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireStrings(
  obj: Rec,
  keys: readonly string[],
  where: string,
): string[] {
  return keys
    .filter(
      (k) => typeof obj[k] !== 'string' || (obj[k] as string).trim() === '',
    )
    .map((k) => `${where}.${k} must be a non-empty string`);
}

async function importDefault(file: string): Promise<unknown> {
  if (!existsSync(file)) throw new KitError(`${file} does not exist.`);
  const mod: unknown = await import(pathToFileURL(file).href);
  return isRecord(mod) ? mod.default : undefined;
}

function requireOneOf(
  obj: Rec,
  key: string,
  allowed: readonly string[],
  where: string,
): string[] {
  return allowed.includes(String(obj[key]))
    ? []
    : [`${where}.${key} must be one of ${allowed.join(' | ')}`];
}

export function parseTheme(raw: unknown, file: string): Theme {
  if (!isRecord(raw))
    throw new KitError(`${file}: theme must be a JSON object.`);
  const problems = requireStrings(
    raw,
    ['name', 'label', 'fontPair', 'container'],
    'theme',
  );
  problems.push(...requireOneOf(raw, 'tier', TIER_NAMES, 'theme'));
  problems.push(
    ...requireOneOf(raw, 'density', ['airy', 'regular', 'compact'], 'theme'),
  );
  problems.push(
    ...requireOneOf(
      raw,
      'photoTreatment',
      ['none', 'duotone', 'grayscale', 'warm'],
      'theme',
    ),
  );
  problems.push(
    ...requireOneOf(raw, 'accentWords', ['color', 'highlight'], 'theme'),
  );
  const colors = isRecord(raw.colors) ? raw.colors : {};
  problems.push(...requireStrings(colors, COLOR_TOKENS, 'colors'));
  const fonts = isRecord(raw.fonts) ? raw.fonts : {};
  problems.push(
    ...requireStrings(
      fonts,
      [
        'display',
        'serif',
        'body',
        'googleFonts',
        'displayLeading',
        'displayWeight',
      ],
      'fonts',
    ),
    ...requireOneOf(fonts, 'displayTransform', ['uppercase', 'none'], 'fonts'),
    ...requireOneOf(fonts, 'accentStyle', ['italic', 'normal'], 'fonts'),
    ...requireOneOf(fonts, 'accentTransform', ['lowercase', 'none'], 'fonts'),
  );
  if (fonts.mono !== undefined && typeof fonts.mono !== 'string')
    problems.push('fonts.mono must be a string when present');
  const shape = isRecord(raw.shape) ? raw.shape : {};
  problems.push(
    ...requireStrings(shape, ['radiusCard', 'radiusPill', 'border'], 'shape'),
    ...requireOneOf(shape, 'shadow', ['none', 'soft', 'hard-offset'], 'shape'),
  );
  const effects = isRecord(raw.effects) ? raw.effects : {};
  problems.push(
    ...requireStrings(effects, ['mapFilter', 'heroImageFilter'], 'effects'),
  );
  if (problems.length > 0)
    throw new KitError(`${file}:\n  ${problems.join('\n  ')}`);
  return raw as unknown as Theme;
}

export function loadTheme(name: string): Theme {
  const file = resolve(paths.themes, `${name}.json`);
  if (!existsSync(file))
    throw new KitError(`Theme "${name}" not found (${file}).`);
  const theme = parseTheme(JSON.parse(readFileSync(file, 'utf8')), file);
  if (theme.name !== name)
    throw new KitError(`${file}: "name" must be "${name}".`);
  return theme;
}

export function listThemes(): string[] {
  return readdirSync(paths.themes)
    .filter((f) => f.endsWith('.json'))
    .map((f) => basename(f, '.json'));
}

export async function loadSectionMeta(
  slot: string,
  variant: string,
  root?: string,
): Promise<SectionMeta> {
  const file = resolve(sectionDir(slot, variant, root), 'meta.ts');
  const raw = await importDefault(file);
  if (!isRecord(raw))
    throw new KitError(`${file}: default export must be a SectionMeta object.`);
  const problems = requireStrings(
    raw,
    ['slot', 'variant', 'label', 'region', 'description'],
    'meta',
  );
  if (raw.slot !== slot) problems.push(`meta.slot must be "${slot}"`);
  if (raw.variant !== variant)
    problems.push(`meta.variant must be "${variant}"`);
  if (!['header', 'main', 'footer'].includes(String(raw.region)))
    problems.push('meta.region must be header|main|footer');
  if (!Array.isArray(raw.contentKeys))
    problems.push('meta.contentKeys must be an array');
  if (problems.length > 0)
    throw new KitError(`${file}:\n  ${problems.join('\n  ')}`);
  return raw as unknown as SectionMeta;
}

export async function loadContentPack(name: string): Promise<ContentPack> {
  const file = resolve(paths.content, `${name}.ts`);
  const raw = await importDefault(file);
  if (
    !isRecord(raw) ||
    !isRecord(raw.business) ||
    !isRecord(raw.head) ||
    !isRecord(raw.sections)
  ) {
    throw new KitError(
      `${file}: default export must be a ContentPack (business, head, sections).`,
    );
  }
  return raw as unknown as ContentPack;
}

export async function loadBlueprint(
  family: string,
  tier: Tier,
): Promise<Blueprint> {
  const file = resolve(paths.blueprints, `${family}.${tier}.ts`);
  const raw = await importDefault(file);
  if (
    !isRecord(raw) ||
    raw.family !== family ||
    raw.tier !== tier ||
    !isRecord(raw.roles) ||
    !isRecord(raw.verticals)
  ) {
    throw new KitError(
      `${file}: default export must be a Blueprint with family "${family}" and tier "${tier}".`,
    );
  }
  return raw as unknown as Blueprint;
}

const ID_RE = /^[a-z0-9-]{3,60}$/;

export async function loadManifest(file: string): Promise<Manifest> {
  const raw = await importDefault(resolve(file));
  if (!isRecord(raw))
    throw new KitError(`${file}: default export must be a Manifest object.`);
  const problems = requireStrings(
    raw,
    [
      'id',
      'name',
      'category',
      'description',
      'family',
      'vertical',
      'archetype',
      'theme',
      'content',
    ],
    'manifest',
  );
  if (typeof raw.id === 'string' && !ID_RE.test(raw.id))
    problems.push(`manifest.id must match ${ID_RE}`);
  if (!isTier(raw.tier))
    problems.push(`manifest.tier must be one of ${TIER_NAMES.join('|')}`);
  if (!Array.isArray(raw.sections) || raw.sections.length === 0) {
    problems.push('manifest.sections must be a non-empty array');
  } else {
    raw.sections.forEach((s: unknown, i: number) => {
      if (!isRecord(s)) problems.push(`sections[${i}] must be an object`);
      else
        problems.push(
          ...requireStrings(s, ['slot', 'variant'], `sections[${i}]`),
        );
    });
  }
  if (problems.length > 0)
    throw new KitError(`${file}:\n  ${problems.join('\n  ')}`);
  return raw as unknown as Manifest;
}

export function listManifestFiles(): string[] {
  if (!existsSync(paths.templates)) return [];
  return readdirSync(paths.templates)
    .filter((f) => f.endsWith('.ts'))
    .sort()
    .map((f) => resolve(paths.templates, f));
}
