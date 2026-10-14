import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { DIRECTIONS } from '../../directions';
import { GIROS } from '../../giros';
import { KIT_ROOT } from '../lib/paths';
import { readLock } from './lock';
import { hueDistance, hueOf, parseColor } from '../lib/color';
import { loadBlueprint, loadSectionMeta } from '../lib/load';
import { libraryFingerprints } from '../lib/targets';
import { MIN_ACCENT_HUE_DISTANCE } from '../lib/validate';
import { TIERS, type Role } from '../tiers';
import type { ContentObject, ContentValue } from '../types';
import { COPY_LIMITS, COPY_RULES } from './copy-lint';
import { allowedVariants, KIT_TIER, TIER_LABEL } from './compile';
import { FONT_PAIRS, SHAPES } from './presets';
import type { SpecTier } from './schema';

/** "Salvia (claro, verde azulado)" → "claro, verde azulado". */
const mood = (label: string) => /\(([^)]*)\)\s*$/.exec(label)?.[1] ?? '';

export interface GiroSummary {
  id: string;
  label: string;
  category: string;
  businessCategory: string;
  aliases: string[];
  palettes: number;
  palettesFree: number;
  fontPairs: number;
  templates: string[];
}

export interface GiroInfo extends GiroSummary {
  schemaType: string;
  description: Record<SpecTier, string>;
  rules: string[];
  palettesList: {
    id: string;
    label: string;
    mood: string;
    scheme: string;
    accent: string;
    /** Accent hue ≥ 30° from every template of the giro (the compiler can use it as is). */
    free: boolean;
  }[];
  fontPairsList: { id: string; label: string; mood: string; free: boolean }[];
  /** Every other curated pair `brand.fontPair` accepts (outside the giro's list): for a tone the giro's pairs don't cover. */
  otherFontPairs: { id: string; label: string; mood: string; free: boolean }[];
  shapes: { id: string; label: string }[];
  tiers: Record<
    SpecTier,
    {
      id: string;
      counted: [number, number];
      defaultSections: { role: string; variant: string }[];
      roles: {
        role: string;
        slot: string;
        required: boolean;
        variants: string[];
        purpose: string;
      }[];
    }
  >;
  /** Art directions in order of fit for the giro, with how many of its templates (spec locks) use each. */
  directions: {
    id: string;
    name: string;
    intent: string;
    /** Position in the direction's `giros` (0 = best fit), or null when it doesn't list the giro. */
    affinity: number | null;
    used: number;
  }[];
  /** Archetypes the giro's layout specs already use (spec locks), with counts. */
  archetypesUsed: Record<string, number>;
  /** Pro hero variants no Pro template of the giro uses yet (extended catalog). */
  freeProHeroes: string[];
  /** Accent hues already taken in the giro, and the hue ranges a custom palette can still use. */
  usedAccentHues: { id: string; hue: number }[];
  freeHueRanges: [number, number][];
  /** Per slot: every copy key an allowed variant reads, its length limit and the giro's example. */
  copy: Record<
    string,
    {
      keys: { key: string; limit?: number; example?: string }[];
      variants: Record<string, string[]>;
    }
  >;
  heroAlternates: string[];
  images: Record<string, { query: string; orientation: string }>;
  business: Record<string, string>;
  motion: string;
}

/** Layout (direction, archetype) of every template of a giro, from the spec locks. */
function giroLayouts(
  giroId: string,
): { direction?: string; archetype?: string }[] {
  const dir = resolve(KIT_ROOT, 'specs');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.lock.json'))
    .flatMap((f) => {
      const lock = readLock(resolve(dir, f));
      return lock
        ? Object.entries(lock.tiers)
            .filter(([id]) => id.startsWith(`${giroId}-`))
            .map(([, t]) => t.layout ?? {})
        : [];
    });
}

async function freeness(giroId: string) {
  const library = (await libraryFingerprints()).filter(
    (f) => f.vertical === giroId,
  );
  const hues = library
    .map((f) => f.accentHue)
    .filter((h): h is number => h !== null);
  const fonts = new Set(library.map((f) => f.fonts));
  return {
    templates: library.map((f) => `${f.id} (${f.tier})`).sort(),
    usedHues: library
      .filter((f) => f.accentHue !== null)
      .map((f) => ({ id: f.id, hue: Math.round(f.accentHue as number) }))
      .sort((a, b) => a.hue - b.hue),
    freeHueRanges: (() => {
      const free: [number, number][] = [];
      let start: number | null = null;
      for (let h = 0; h <= 360; h += 1) {
        const ok =
          h < 360 &&
          hues.every((x) => hueDistance(x, h) >= MIN_ACCENT_HUE_DISTANCE);
        if (ok && start === null) start = h;
        if (!ok && start !== null) {
          free.push([start, h - 1]);
          start = null;
        }
      }
      return free;
    })(),
    hueFree: (accent: string) => {
      const c = parseColor(accent);
      const h = c ? hueOf(c) : null;
      return (
        !h ||
        h.chroma <= 0.08 ||
        hues.every((x) => hueDistance(x, h.hue) >= MIN_ACCENT_HUE_DISTANCE)
      );
    },
    fontFree: (id: string) => !fonts.has(id),
  };
}

export async function giroList(): Promise<GiroSummary[]> {
  const out: GiroSummary[] = [];
  for (const g of Object.values(GIROS)) {
    const f = await freeness(g.id);
    out.push({
      id: g.id,
      label: g.label,
      category: g.category,
      businessCategory: g.businessCategory,
      aliases: g.aliases ?? [],
      palettes: Object.keys(g.palettes).length,
      palettesFree: Object.values(g.palettes).filter((p) =>
        f.hueFree(p.colors.accent),
      ).length,
      fontPairs: g.fontPairs.length,
      templates: f.templates,
    });
  }
  return out;
}

function exampleAt(
  copy: ContentObject | undefined,
  key: string,
): string | undefined {
  let cur: ContentValue | undefined = copy;
  for (const part of key.replace(/\?$/, '').split('.')) {
    const list = part.endsWith('[]');
    const name = list ? part.slice(0, -2) : part;
    cur =
      cur && typeof cur === 'object' && !Array.isArray(cur)
        ? (cur as ContentObject)[name]
        : undefined;
    if (list) cur = Array.isArray(cur) ? cur[0] : undefined;
  }
  return typeof cur === 'string' ? cur : undefined;
}

export async function giroInfo(id: string): Promise<GiroInfo | null> {
  const g = GIROS[id];
  if (!g) return null;
  const f = await freeness(g.id);
  const freeFont = f.fontFree;
  const tiers = {} as GiroInfo['tiers'];
  const copy: GiroInfo['copy'] = {};
  for (const tier of ['basico', 'pro'] as SpecTier[]) {
    const blueprint = await loadBlueprint('service-landing', KIT_TIER[tier]);
    const slots = blueprint.verticals[g.id]?.slots ?? {};
    const spec = TIERS[KIT_TIER[tier]];
    const roles: GiroInfo['tiers'][SpecTier]['roles'] = [];
    for (const [role, def] of Object.entries(blueprint.roles)) {
      const slot = slots[role as Role] as string;
      const variants = allowedVariants(blueprint, role as Role, slot);
      roles.push({
        role,
        slot,
        required: (spec.requiredRoles as readonly string[]).includes(role),
        variants,
        purpose: def.purpose,
      });
      const entry = (copy[slot] ??= { keys: [], variants: {} });
      for (const variant of variants) {
        if (entry.variants[variant]) continue;
        const meta = await loadSectionMeta(slot, variant).catch(() => null);
        if (!meta) continue;
        entry.variants[variant] = meta.contentKeys;
        for (const key of meta.contentKeys) {
          const bare = key.replace(/\?$/, '');
          if (entry.keys.some((k) => k.key === bare)) continue;
          if (/^(links|branch|branches)\b/.test(bare)) continue;
          entry.keys.push({
            key: bare,
            limit: COPY_LIMITS[`${slot}.${bare}`],
            example: exampleAt(g.copy[slot], bare),
          });
        }
      }
    }
    tiers[tier] = {
      id: tier === 'pro' ? `${g.id}-<nombre>-v1` : `${g.id}-base-<nombre>-v1`,
      counted: [spec.countedMin, spec.countedMax],
      defaultSections: g.sections[tier],
      roles,
    };
  }
  copy.head = {
    keys: ['title', 'description'].map((k) => ({
      key: k,
      limit: COPY_LIMITS[`head.${k}`],
      example: g.head[k as 'title' | 'description'],
    })),
    variants: {},
  };
  const layouts = giroLayouts(g.id);
  const proBlueprint = await loadBlueprint('service-landing', 'pro');
  const usedHeroes = new Set(
    (await libraryFingerprints())
      .filter((p) => p.vertical === g.id && p.tier === 'pro')
      .map((p) => p.hero),
  );
  return {
    directions: Object.values(DIRECTIONS)
      .map((d) => ({
        id: d.id,
        name: d.name,
        intent: d.intent,
        affinity: d.giros.includes(g.id) ? d.giros.indexOf(g.id) : null,
        used: layouts.filter((l) => l.direction === d.id).length,
      }))
      .sort(
        (a, b) =>
          a.used - b.used ||
          (a.affinity ?? 99) - (b.affinity ?? 99) ||
          a.id.localeCompare(b.id),
      ),
    archetypesUsed: layouts.reduce<Record<string, number>>((acc, l) => {
      if (l.archetype) acc[l.archetype] = (acc[l.archetype] ?? 0) + 1;
      return acc;
    }, {}),
    freeProHeroes: allowedVariants(
      proBlueprint,
      'hero',
      'hero',
      'extended',
    ).filter((h) => !usedHeroes.has(h)),
    id: g.id,
    label: g.label,
    category: g.category,
    businessCategory: g.businessCategory,
    schemaType: g.schemaType,
    aliases: g.aliases ?? [],
    description: g.description,
    rules: [...COPY_RULES, ...(g.rules ?? [])],
    palettes: Object.keys(g.palettes).length,
    palettesFree: Object.values(g.palettes).filter((p) =>
      f.hueFree(p.colors.accent),
    ).length,
    fontPairs: g.fontPairs.length,
    templates: f.templates,
    palettesList: Object.entries(g.palettes).map(([pid, p]) => ({
      id: pid,
      label: p.label,
      mood: mood(p.label),
      scheme: p.scheme,
      accent: p.colors.accent,
      free: f.hueFree(p.colors.accent),
    })),
    fontPairsList: g.fontPairs.map((fid) => ({
      id: fid,
      label: FONT_PAIRS[fid]?.label ?? fid,
      mood: mood(FONT_PAIRS[fid]?.label ?? ''),
      free: f.fontFree(fid),
    })),
    otherFontPairs: Object.entries(FONT_PAIRS)
      .filter(([fid]) => !g.fontPairs.includes(fid))
      .map(([fid, f]) => ({
        id: fid,
        label: f.label,
        mood: mood(f.label),
        free: freeFont(fid),
      })),
    shapes: g.shapes.map((sid) => ({
      id: sid,
      label: SHAPES[sid]?.label ?? sid,
    })),
    usedAccentHues: f.usedHues,
    freeHueRanges: f.freeHueRanges,
    tiers,
    copy,
    heroAlternates: g.heroAlternates,
    images: g.images,
    business: {
      ...Object.fromEntries(
        Object.entries(g.business).map(([k, v]) => [k, String(v)]),
      ),
    },
    motion: `${g.motion.preset}${g.motion.progress ? ' + barra de progreso' : ''}`,
  };
}

export { TIER_LABEL };
