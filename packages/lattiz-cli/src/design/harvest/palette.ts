import {
  hueOf,
  parseColor,
  type Rgba,
} from '../../../../template-kit/src/lib/color';
import {
  buildPalette,
  type PaletteSeed,
} from '../../../../template-kit/src/spec/palette-builder';
import type { PaletteDraft } from '../types';
import type { StitchTokens } from './tokens';

const rgb = (hex: string) => parseColor(hex) as Rgba;

function luminance({ r, g, b }: Rgba): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
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
  meta: { title: string; giro: string },
): PaletteDraft | null {
  const bg = pick(t, 'background', 'surface');
  const text = pick(t, 'on-background', 'on-surface');
  const candidates = ACCENT_ROLES.flatMap((role) =>
    t.colors[role] ? [{ name: role as string, hex: t.colors[role] }] : [],
  );
  if (!bg || !text || candidates.length === 0) return null;
  const chroma = (hex: string) => hueOf(rgb(hex)).chroma;
  // The most chromatic role wins; a near-gray design keeps `primary` (the kit has neutral accents).
  const best = candidates.reduce((a, b) =>
    chroma(b.hex) > chroma(a.hex) + 0.08 ? b : a,
  );
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
  const draft: Omit<PaletteDraft, 'aa'> = {
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
  };
}

export const seedFromDraft = (d: Omit<PaletteDraft, 'aa'>): PaletteSeed => ({
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
