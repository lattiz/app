import { contrastRatio, parseColor, toHex, type Rgba } from '../lib/color';
import type { LibraryPalette } from '../../palettes';
import { palette, type GiroPalette } from './presets';
import { paletteFindings } from './theme';

/**
 * Seeds → library palettes. A seed names the ground, the text and the accent (and may pin any other
 * token); the builder derives the rest so every pair kit:validate checks meets WCAG AA, or reports
 * why it can't. Deterministic: the same seed always gives the same hex values.
 */

export interface PaletteSeed {
  label: string;
  mode: LibraryPalette['mode'];
  mood: string[];
  affinity: string[];
  bg: string;
  text: string;
  accent: string;
  surface?: string;
  surface2?: string;
  muted?: string;
  onAccent?: string;
  accentText?: string;
  /** `highlight`: accent words on an accent marker (accent-text must read on the accent). */
  accentWords?: 'color' | 'highlight';
  /** Veil of the image-bg hero: the dark ink (default on light grounds when accent-text reads on it) or the ground. */
  overlay?: 'ink' | 'bg';
  photoTreatment: GiroPalette['photoTreatment'];
  placeholder: GiroPalette['placeholder'];
}

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

function mix(a: Rgba, b: Rgba, weightA: number): Rgba {
  return {
    r: a.r * weightA + b.r * (1 - weightA),
    g: a.g * weightA + b.g * (1 - weightA),
    b: a.b * weightA + b.b * (1 - weightA),
    a: 1,
  };
}

const ratio = (a: Rgba, b: Rgba) => contrastRatio(a, b);

export function buildPalette(seed: PaletteSeed): {
  palette?: LibraryPalette;
  problems: string[];
} {
  const problems: string[] = [];
  const read = (v: string, what: string) => {
    const c = parseColor(v);
    if (!c) problems.push(`${what}: color ilegible ${v}`);
    return c as Rgba;
  };
  const dark = seed.mode === 'dark';
  const bg = read(seed.bg, 'bg');
  const text = read(seed.text, 'text');
  const accent = read(seed.accent, 'accent');
  if (problems.length) return { problems };
  const surface = seed.surface
    ? read(seed.surface, 'surface')
    : dark
      ? mix(text, bg, 0.06)
      : mix(WHITE, bg, seed.mode === 'tinted' ? 0.42 : 0.55);
  const surface2 = seed.surface2
    ? read(seed.surface2, 'surface2')
    : dark
      ? mix(text, bg, 0.12)
      : mix(text, bg, 0.07);
  // Muted: as close to the ground as AA allows on every surface it sits on.
  let muted = seed.muted ? read(seed.muted, 'muted') : text;
  if (!seed.muted)
    for (let w = 0.5; w <= 1.0001; w += 0.02) {
      muted = mix(text, bg, w);
      if ([bg, surface, surface2].every((s) => ratio(muted, s) >= 4.7)) break;
    }
  const onAccent = seed.onAccent
    ? read(seed.onAccent, 'onAccent')
    : [WHITE, text, bg].reduce((best, c) =>
        ratio(c, accent) > ratio(best, accent) ? c : best,
      );
  if (ratio(onAccent, accent) < 4.5)
    problems.push(
      `on-accent ${toHex(onAccent)} sobre ${seed.accent} da ${ratio(onAccent, accent).toFixed(2)}:1`,
    );
  // The ink veil (image hero) is the text color on light grounds; accent-text must read on it too.
  const ink = dark ? bg : text;
  const grounds = (veil: 'ink' | 'bg') => [
    bg,
    surface,
    ...(veil === 'ink' && !dark ? [ink] : []),
  ];
  const fits = (c: Rgba, veil: 'ink' | 'bg') =>
    grounds(veil).every((g) => ratio(c, g) >= 3.2);
  let accentText = seed.accentText
    ? read(seed.accentText, 'accentText')
    : accent;
  let veil: 'ink' | 'bg' = seed.overlay ?? (dark ? 'bg' : 'ink');
  if (seed.accentWords === 'highlight') {
    if (ratio(accentText, accent) < 4.5)
      problems.push(
        `accent-text sobre el marcador ${seed.accent} da ${ratio(accentText, accent).toFixed(2)}:1`,
      );
  } else if (!seed.accentText) {
    // Darken (light) or lighten (dark) toward the text until it reads on the ground.
    const tryVeil = (v: 'ink' | 'bg') => {
      for (let w = 0; w <= 0.8; w += 0.04) {
        const c = mix(text, accent, w);
        if (fits(c, v)) return c;
      }
      return undefined;
    };
    const found = tryVeil(veil) ?? (seed.overlay ? undefined : tryVeil('bg'));
    if (found && !fits(found, veil)) veil = 'bg';
    if (found) accentText = found;
  } else if (!seed.overlay && !fits(accentText, veil)) veil = 'bg';
  if (problems.length) return { problems };
  const result = palette({
    label: seed.label,
    scheme: dark ? 'dark' : 'light',
    bg: toHex(bg),
    surface: toHex(surface),
    surface2: toHex(surface2),
    text: toHex(text),
    muted: toHex(muted),
    accent: toHex(accent),
    onAccent: toHex(onAccent),
    accentText: toHex(accentText),
    overlay: veil,
    accentWords: seed.accentWords ?? 'color',
    photoTreatment: seed.photoTreatment,
    placeholder: seed.placeholder,
  });
  const findings = paletteFindings(result);
  if (findings.length) return { problems: findings };
  return {
    palette: {
      ...result,
      mode: seed.mode,
      mood: seed.mood,
      affinity: seed.affinity,
    },
    problems: [],
  };
}
