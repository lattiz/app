import { GIROS } from '../../giros';
import { hueDistance, hueOf, parseColor } from '../lib/color';
import { loadBlueprint } from '../lib/load';
import type { Fingerprint } from '../lib/similarity';
import { libraryFingerprints } from '../lib/targets';
import { MIN_ACCENT_HUE_DISTANCE } from '../lib/validate';
import { allowedVariants, planSpec } from './compile';
import { parseSpec, type SpecTier } from './schema';

/**
 * Capacity per giro: how many more templates the uniqueness rules (kit:validate's accent hue, font
 * pair, Pro hero, headline and similarity) accept, found by running the spec compiler on synthetic
 * specs one after another until it refuses. Synthetic specs write their own headline, so the
 * number measures the design pools, not the copy.
 */

export type Catalog = 'legacy' | 'extended';

export interface Headroom {
  /** Templates added before the compiler refused. */
  added: number;
  /** Why it stopped (the compiler's first error), or null when it hit the simulation cap. */
  stop: string | null;
}

export interface GiroCapacity {
  giro: string;
  label: string;
  catalog: Catalog;
  templates: { pro: number; basico: number; total: number };
  pools: {
    palettes: number;
    palettesFree: number;
    fontPairs: number;
    fontPairsFree: number;
    heroVariants: number;
    heroFreePro: number;
    shapes: number;
  };
  /** Chromatic accent hues still placeable at ≥ 30° (near-gray accents don't count, so are unlimited). */
  hueSlots: number;
  headroom: {
    /** Básico + Pro pairs (the sales unit), as templates (2 per pair). */
    twins: Headroom;
    pro: Headroom;
    basico: Headroom;
    /** Pairs first, then Básicos, then Pros: the most templates the giro still takes. */
    total: Headroom;
  };
}

/** Simulation cap per mode: far above any target, keeps a runaway loop bounded. */
const CAP = 40;

/** Greedy count of hues placeable ≥ 30° from every taken hue and from each other. */
export function freeHueSlots(taken: number[]): number {
  if (taken.length === 0) return Math.floor(360 / MIN_ACCENT_HUE_DISTANCE);
  const sorted = [...taken].sort((a, b) => a - b);
  let slots = 0;
  sorted.forEach((h, i) => {
    const next = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + 360;
    slots += Math.max(0, Math.floor((next - h) / MIN_ACCENT_HUE_DISTANCE) - 1);
  });
  return slots;
}

function accentHue(accent: string): number | null {
  const c = parseColor(accent);
  const h = c ? hueOf(c) : null;
  return h && h.chroma > 0.08 ? h.hue : null;
}

function syntheticSpec(
  giro: string,
  n: number,
  mode: 'twin' | SpecTier,
  catalog: Catalog,
): unknown {
  const brand = catalog === 'extended' ? { brand: { catalog } } : {};
  const title = `Prueba de capacidad ${n} con titular propio`;
  if (mode === 'twin')
    return {
      specVersion: 1,
      idBase: `${giro}-capacidad-${n}`,
      twin: true,
      giro,
      business: { name: `Capacidad ${n}` },
      ...brand,
      copy: { hero: { title } },
      overrides: {
        basico: { copy: { hero: { title: `${title}, versión básica` } } },
      },
    };
  return {
    specVersion: 1,
    id:
      mode === 'pro'
        ? `${giro}-capacidad-${n}-v1`
        : `${giro}-base-capacidad-${n}-v1`,
    tier: mode,
    giro,
    business: { name: `Capacidad ${n}` },
    ...brand,
    copy: { hero: { title } },
  };
}

/** Adds synthetic specs of one mode until planSpec refuses; returns how many templates fit. */
async function simulate(
  giro: string,
  library: Fingerprint[],
  mode: 'twin' | SpecTier,
  catalog: Catalog,
  start: number,
): Promise<Headroom & { library: Fingerprint[]; next: number }> {
  const lib = [...library];
  let added = 0;
  let n = start;
  for (let i = 0; i < CAP; i += 1, n += 1) {
    const parsed = parseSpec(syntheticSpec(giro, n, mode, catalog));
    if (!parsed.ok)
      return {
        added,
        stop: parsed.problems.map((p) => `${p.path}: ${p.message}`).join('; '),
        library: lib,
        next: n,
      };
    const plan = await planSpec(parsed.spec, lib);
    const error = plan.problems.find((p) => p.level === 'error');
    if (!('tiers' in plan) || error)
      return {
        added,
        stop: error ? `${error.path}: ${error.message}` : 'sin plan',
        library: lib,
        next: n,
      };
    for (const t of plan.tiers) lib.push(t.fingerprint);
    added += plan.tiers.length;
  }
  return { added, stop: null, library: lib, next: n };
}

export async function giroCapacity(
  giroId: string,
  catalog: Catalog = 'legacy',
  library?: Fingerprint[],
): Promise<GiroCapacity> {
  const giro = GIROS[giroId];
  if (!giro) throw new Error(`giro desconocido: ${giroId}`);
  const all = library ?? (await libraryFingerprints());
  const mine = all.filter((f) => f.vertical === giroId);
  const takenHues = mine
    .map((f) => f.accentHue)
    .filter((h): h is number => h !== null);
  const takenFonts = new Set(mine.map((f) => f.fonts));
  const proBlueprint = await loadBlueprint('service-landing', 'pro');
  const heroes = allowedVariants(proBlueprint, 'hero', 'hero');
  const usedHeroes = new Set(
    mine.filter((f) => f.tier === 'pro').map((f) => f.hero),
  );
  const palettes = Object.values(giro.palettes);

  const twins = await simulate(giroId, all, 'twin', catalog, 1);
  const pro = await simulate(giroId, all, 'pro', catalog, 1);
  const basico = await simulate(giroId, all, 'basico', catalog, 1);
  // Total: pairs until they stop, then Básicos, then Pros, each on top of the previous.
  const afterBasico = await simulate(
    giroId,
    twins.library,
    'basico',
    catalog,
    twins.next + 100,
  );
  const afterPro = await simulate(
    giroId,
    afterBasico.library,
    'pro',
    catalog,
    afterBasico.next + 100,
  );
  return {
    giro: giroId,
    label: giro.label,
    catalog,
    templates: {
      pro: mine.filter((f) => f.tier === 'pro').length,
      basico: mine.filter((f) => f.tier === 'basic').length,
      total: mine.length,
    },
    pools: {
      palettes: palettes.length,
      palettesFree: palettes.filter((p) => {
        const h = accentHue(p.colors.accent);
        return (
          h === null ||
          takenHues.every((t) => hueDistance(t, h) >= MIN_ACCENT_HUE_DISTANCE)
        );
      }).length,
      fontPairs: giro.fontPairs.length,
      fontPairsFree: giro.fontPairs.filter((f) => !takenFonts.has(f)).length,
      heroVariants: heroes.length,
      heroFreePro: heroes.filter((h) => !usedHeroes.has(h)).length,
      shapes: giro.shapes.length,
    },
    hueSlots: freeHueSlots(takenHues),
    headroom: {
      twins: { added: twins.added, stop: twins.stop },
      pro: { added: pro.added, stop: pro.stop },
      basico: { added: basico.added, stop: basico.stop },
      total: {
        added: twins.added + afterBasico.added + afterPro.added,
        stop: afterPro.stop,
      },
    },
  };
}

export async function kitCapacity(
  catalog: Catalog = 'legacy',
  giros: string[] = Object.keys(GIROS),
): Promise<GiroCapacity[]> {
  const library = await libraryFingerprints();
  const out: GiroCapacity[] = [];
  for (const g of giros) out.push(await giroCapacity(g, catalog, library));
  return out;
}
