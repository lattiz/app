import { GIROS } from '../../../../template-kit/giros';
import { EXTENDED_PALETTES } from '../../../../template-kit/palettes';
import {
  contrastRatio,
  hueOf,
  parseColor,
  type Rgba,
} from '../../../../template-kit/src/lib/color';
import {
  MIN_PALETTE_DISTANCE,
  paletteDistance,
} from '../../../../template-kit/src/lib/delta-e';
import {
  buildPalette,
  type PaletteSeed,
} from '../../../../template-kit/src/spec/palette-builder';
import type { ContrastPair, PaletteDistance, PaletteDraft } from '../types';
import type { StitchTokens } from './tokens';

const rgb = (hex: string) => parseColor(hex) as Rgba;

function luminance({ r, g, b }: Rgba): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const ROLE_PATTERNS: Record<keyof PaletteDraft['roles'], RegExp> = {
  surface: /^(background|surface)/,
  text: /^on-(background|surface)/,
  accent: /^(primary|secondary|tertiary)(?!.*(fixed|dim))/,
  border: /^outline/,
};

function rolesOf(t: StitchTokens): PaletteDraft['roles'] {
  const names = Object.keys(t.colors);
  const out = {
    surface: [],
    text: [],
    accent: [],
    border: [],
  } as PaletteDraft['roles'];
  for (const n of names)
    for (const role of Object.keys(
      ROLE_PATTERNS,
    ) as (keyof typeof ROLE_PATTERNS)[])
      if (ROLE_PATTERNS[role].test(n)) {
        out[role].push(n);
        break;
      }
  return out;
}

/** Text/background pairs the design itself defines (on-X over X), plus text over each surface. */
function pairsOf(t: StitchTokens): ContrastPair[] {
  const seen = new Set<string>();
  const out: ContrastPair[] = [];
  const add = (fg: string, bg: string, min: number) => {
    const key = `${fg}|${bg}`;
    if (!t.colors[fg] || !t.colors[bg] || seen.has(key)) return;
    seen.add(key);
    const ratio =
      Math.round(contrastRatio(rgb(t.colors[fg]), rgb(t.colors[bg])) * 100) /
      100;
    out.push({ fg, bg, ratio, min, aa_pass: ratio >= min });
  };
  for (const n of Object.keys(t.colors))
    if (
      n.startsWith('on-') &&
      !/(fixed|variant)$/.test(n) &&
      n !== 'on-surface-variant'
    )
      add(n, n.slice(3), 4.5);
  for (const bg of [
    'background',
    'surface',
    'surface-container-low',
    'surface-container-high',
  ]) {
    add('on-surface', bg, 4.5);
    add('on-surface-variant', bg, 4.5);
  }
  return out;
}

/** Closest existing palette per giro the draft fits, by the A2 measure (ΔE00 ground + accent). */
function distancesOf(
  giros: string[],
  own: { bg: string; accent: string },
): PaletteDistance[] {
  return giros.flatMap((giro) => {
    const def = GIROS[giro];
    if (!def) return [];
    const pool: [string, { bg: string; accent: string }][] = [
      ...Object.entries(def.palettes).map(
        ([id, p]) =>
          [`${giro}:${id}`, p.colors] as [
            string,
            { bg: string; accent: string },
          ],
      ),
      ...Object.entries(EXTENDED_PALETTES)
        .filter(([, p]) => p.affinity.includes(giro))
        .map(
          ([id, p]) =>
            [id, p.colors] as [string, { bg: string; accent: string }],
        ),
    ];
    let best: PaletteDistance | undefined;
    for (const [id, q] of pool) {
      const d = Math.round(paletteDistance(own, q) * 10) / 10;
      if (!best || d < best.distance)
        best = {
          giro,
          nearest: id,
          distance: d,
          min: MIN_PALETTE_DISTANCE,
          ok: d >= MIN_PALETTE_DISTANCE,
        };
    }
    return best ? [best] : [];
  });
}

const pick = (t: StitchTokens, ...names: string[]) => {
  const name = names.find((n) => t.colors[n]);
  return name ? { name, hex: t.colors[name] } : undefined;
};

/** Stitch roles that can carry the accent, best first. */
const ACCENT_ROLES = ['primary', 'tertiary', 'secondary'] as const;

/**
 * Stitch tokens → a kit palette seed. The names are Stitch's (Material 3); the output is ours:
 * bg/text/accent (+ surfaces), and `buildPalette` derives and AA-checks everything else.
 */
export function paletteFromTokens(
  t: StitchTokens,
  meta: { title: string; giro: string; accentRole?: string },
): PaletteDraft | null {
  const bg = pick(t, 'background', 'surface');
  const text = pick(t, 'on-background', 'on-surface');
  const candidates = ACCENT_ROLES.flatMap((role) =>
    t.colors[role] ? [{ name: role as string, hex: t.colors[role] }] : [],
  );
  if (!bg || !text || candidates.length === 0) return null;
  const chroma = (hex: string) => hueOf(rgb(hex)).chroma;
  // `primary` is the brand accent in Material tokens. Only when it is near gray does the most
  // chromatic other role (a highlight, say) take over; `accentRole` forces a choice (e.g. silver).
  const primary = candidates.find((c) => c.name === 'primary');
  const forced = meta.accentRole
    ? candidates.find((c) => c.name === meta.accentRole)
    : undefined;
  if (meta.accentRole && !forced) return null;
  const best =
    forced ??
    (primary && chroma(primary.hex) > 0.08
      ? primary
      : candidates.reduce((a, b) =>
          chroma(b.hex) > chroma(a.hex) + 0.08 ? b : a,
        ));
  const lum = luminance(rgb(bg.hex));
  const mode: PaletteDraft['mode'] =
    lum < 0.18
      ? 'dark'
      : chroma(bg.hex) > 0.1 && lum < 0.75
        ? 'tinted'
        : 'light';
  const surface = pick(t, 'surface-container-low', 'surface-container');
  const surface2 = pick(
    t,
    'surface-container-high',
    'surface-container-highest',
  );
  const radius = t.radiiPx.DEFAULT ?? t.radiiPx.md ?? 8;
  const from: Record<string, string> = {
    bg: bg.name,
    text: text.name,
    accent: best.name,
    ...(surface ? { surface: surface.name } : {}),
    ...(surface2 ? { surface2: surface2.name } : {}),
  };
  const draft: Omit<
    PaletteDraft,
    'aa' | 'roles' | 'lz' | 'pairs' | 'distance'
  > = {
    label: `${meta.title} (Stitch, ${mode === 'dark' ? 'oscuro' : mode === 'tinted' ? 'teñido' : 'claro'})`,
    mode,
    mood: [mode === 'dark' ? 'nocturno' : 'sobrio', 'stitch'],
    affinity: [meta.giro],
    bg: bg.hex,
    text: text.hex,
    accent: best.hex,
    ...(surface ? { surface: surface.hex } : {}),
    ...(surface2 ? { surface2: surface2.hex } : {}),
    photoTreatment: 'none',
    placeholder: radius <= 4 ? 'rules' : radius >= 16 ? 'blobs' : 'arches',
    from,
  };
  const built = buildPalette(seedFromDraft(draft));
  return {
    ...draft,
    aa: { ok: Boolean(built.palette), problems: built.problems },
    roles: rolesOf(t),
    lz: built.palette
      ? Object.fromEntries(
          Object.entries(built.palette.colors).map(([k, v]) => [
            `--lz-color-${k}`,
            v,
          ]),
        )
      : {},
    pairs: pairsOf(t),
    distance: distancesOf([...new Set(draft.affinity)], {
      bg: draft.bg,
      accent: draft.accent,
    }),
  };
}

export const seedFromDraft = (
  d: Omit<PaletteDraft, 'aa' | 'roles' | 'lz' | 'pairs' | 'distance'>,
): PaletteSeed => ({
  label: d.label,
  mode: d.mode,
  mood: d.mood,
  affinity: d.affinity,
  bg: d.bg,
  text: d.text,
  accent: d.accent,
  ...(d.surface ? { surface: d.surface } : {}),
  ...(d.surface2 ? { surface2: d.surface2 } : {}),
  ...(d.onAccent ? { onAccent: d.onAccent } : {}),
  ...(d.accentText ? { accentText: d.accentText } : {}),
  photoTreatment: d.photoTreatment,
  placeholder: d.placeholder,
});
