import { EXTENDED_FONT_PAIRS } from '../../font-pairs';
import { EXTENDED_PALETTES } from '../../palettes';
import type { GiroDefinition } from './giro';
import { FONT_PAIRS, type FontPairPreset, type GiroPalette } from './presets';

/**
 * Catalog versioning. The compiler picks palettes, font pairs and variants by rotating pools seeded
 * by the template id, so growing a pool would change what an existing spec resolves to on rebuild.
 * `legacy` (the default: a spec without `brand.catalog`) sees exactly the pools that existed before
 * the extended catalog, in their original order. `extended` adds everything newer. Naming an
 * extended item explicitly (palette preset, font pair, variant) works in either catalog: it changes
 * only the spec that names it.
 */

export type Catalog = 'legacy' | 'extended';
export const CATALOGS: readonly Catalog[] = ['legacy', 'extended'];

/** Bumped whenever an extended pool grows or reorders; recorded in every lock. */
export const CATALOG_VERSION = 1;

/** Section variants as of 2026-10-12 (31): everything else under sections/ is extended. */
export const LEGACY_VARIANTS: Readonly<Record<string, readonly string[]>> = {
  about: ['brief', 'statement', 'stats-strip', 'text-image-offset'],
  faq: ['list', 'two-col'],
  'floating-whatsapp': ['bubble'],
  footer: ['big-wordmark', 'columns', 'minimal-centered'],
  gallery: ['grid', 'mosaic', 'strip'],
  hero: ['centered-arch', 'image-bg', 'offset-card', 'split'],
  locations: ['cards', 'single', 'with-contact'],
  marquee: ['ticker'],
  navbar: ['centered-logo', 'inline'],
  services: ['cards', 'editorial-table', 'price-list', 'product-grid'],
  team: ['grid', 'list'],
  testimonials: ['cards', 'quote-feature'],
};

/** FONT_PAIRS ids as of 2026-10-12; new pairs live in font-pairs/ (extended). */
export const LEGACY_FONT_PAIRS: readonly string[] = Object.keys(FONT_PAIRS);

export function isLegacyVariant(slot: string, variant: string): boolean {
  return LEGACY_VARIANTS[slot]?.includes(variant) ?? false;
}

export function catalogOf(spec: { brand?: { catalog?: Catalog } }): Catalog {
  return spec.brand?.catalog ?? 'legacy';
}

/** Library palettes ordered for a giro: the ones that list it (by its position), then the rest. */
function byAffinity<T extends { affinity: string[] }>(
  entries: [string, T][],
  giro: string,
): [string, T][] {
  const rank = (e: [string, T]) => {
    const i = e[1].affinity.indexOf(giro);
    return i < 0 ? Number.MAX_SAFE_INTEGER : i;
  };
  return entries
    .map((e, order) => ({ e, order }))
    .sort((a, b) => rank(a.e) - rank(b.e) || a.order - b.order)
    .map((x) => x.e);
}

/** The palette pool a spec of this catalog picks from, in pick order (before the seed rotation). */
export function palettePool(
  giro: GiroDefinition,
  catalog: Catalog,
): [string, GiroPalette][] {
  const own = Object.entries(giro.palettes);
  if (catalog === 'legacy') return own;
  return [...own, ...byAffinity(Object.entries(EXTENDED_PALETTES), giro.id)];
}

/** A palette preset by id: the giro's own, or any palette of the extended library. */
export function paletteById(
  giro: GiroDefinition,
  id: string,
): GiroPalette | undefined {
  return giro.palettes[id] ?? EXTENDED_PALETTES[id];
}

export function paletteIds(giro: GiroDefinition): string[] {
  return [...Object.keys(giro.palettes), ...Object.keys(EXTENDED_PALETTES)];
}

/** Font pair ids a spec of this catalog picks from, in pick order. */
export function fontPairPool(giro: GiroDefinition, catalog: Catalog): string[] {
  if (catalog === 'legacy') return [...giro.fontPairs];
  const extended = byAffinity(Object.entries(EXTENDED_FONT_PAIRS), giro.id)
    .map(([id]) => id)
    .filter((id) => !giro.fontPairs.includes(id));
  return [...giro.fontPairs, ...extended];
}

/** A curated pair by id, legacy or extended. */
export function fontPairById(id: string): FontPairPreset | undefined {
  return FONT_PAIRS[id] ?? EXTENDED_FONT_PAIRS[id];
}

export function fontPairIds(): string[] {
  return [...Object.keys(FONT_PAIRS), ...Object.keys(EXTENDED_FONT_PAIRS)];
}
