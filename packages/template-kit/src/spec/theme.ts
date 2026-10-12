import { checkTheme } from '../lib/validate';
import { contrastRatio, parseColor, toHex, type Rgba } from '../lib/color';
import type { Tier } from '../tiers';
import type { Theme } from '../types';
import {
  CUSTOM_FONTS,
  customFontPair,
  EFFECTS,
  FONT_PAIRS,
  palette,
  slug,
  type FontPairPreset,
  type GiroPalette,
  type ShapePreset,
} from './presets';
import type { SpecBrand } from './schema';

/** Palette + font pair + shape (+ the spec's fine-tuning) → a kit theme. */
export function composeTheme(input: {
  name: string;
  label: string;
  tier: Tier;
  palette: GiroPalette;
  fontPair: { id: string; fonts: FontPairPreset };
  shape: ShapePreset;
  brand: SpecBrand;
}): Theme {
  const { brand, shape } = input;
  const { label: _label, ...fonts } = input.fontPair.fonts;
  void _label;
  const displayScale = brand.displayScale ?? fonts.displayScale;
  return {
    name: input.name,
    label: input.label,
    tier: input.tier,
    fontPair: input.fontPair.id,
    colors: { ...input.palette.colors },
    fonts: {
      ...fonts,
      ...(displayScale ? { displayScale } : {}),
    },
    shape: {
      radiusCard: shape.radiusCard,
      radiusPill: shape.radiusPill,
      border: shape.border,
      shadow: shape.shadow,
    },
    density: brand.density ?? shape.density,
    photoTreatment: brand.photoTreatment ?? input.palette.photoTreatment,
    placeholder: brand.placeholder ?? input.palette.placeholder,
    accentWords: input.palette.accentWords,
    container: brand.container ?? '1200px',
    effects: { ...input.palette.effects },
    ...(brand.rhythm && Object.keys(brand.rhythm).length > 0
      ? { rhythm: { ...brand.rhythm } }
      : {}),
  };
}

/** `fontPair` of a spec → id + fonts; undefined when the id or a family isn't allowed. */
export function resolveFontPair(
  value: SpecBrand['fontPair'],
): { id: string; fonts: FontPairPreset } | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string')
    return FONT_PAIRS[value]
      ? { id: value, fonts: FONT_PAIRS[value] }
      : undefined;
  if (!CUSTOM_FONTS[value.display] || !CUSTOM_FONTS[value.body])
    return undefined;
  return {
    id: `${slug(value.display)}+${slug(value.body)}`,
    fonts: customFontPair(value.display, value.body),
  };
}

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };

function mix(a: Rgba, b: Rgba, weightA: number): Rgba {
  const w = weightA;
  return {
    r: a.r * w + b.r * (1 - w),
    g: a.g * w + b.g * (1 - w),
    b: a.b * w + b.b * (1 - w),
    a: 1,
  };
}

/**
 * Derives the 14 tokens from a custom `{ bg, accent, text?, scheme? }` so every pair the validator
 * checks meets WCAG AA; returns problems (Spanish) instead when the seeds can't get there.
 */
export function customPalette(seed: {
  bg: string;
  accent: string;
  text?: string;
  scheme?: 'light' | 'dark';
}): { palette?: GiroPalette; problems: string[] } {
  const problems: string[] = [];
  const bg = parseColor(seed.bg);
  const accent = parseColor(seed.accent);
  if (!bg || !accent) return { problems: ['colores ilegibles'] };
  const dark = seed.scheme
    ? seed.scheme === 'dark'
    : contrastRatio(WHITE, bg) > contrastRatio(BLACK, bg);
  const text =
    (seed.text && parseColor(seed.text)) ||
    (dark ? mix(WHITE, bg, 0.92) : mix(BLACK, bg, 0.88));
  if (contrastRatio(text, bg) < 7)
    problems.push(
      `el texto ${toHex(text)} sobre el fondo ${toHex(bg)} da ${contrastRatio(text, bg).toFixed(2)}:1; usa un fondo más ${dark ? 'oscuro' : 'claro'} o define "text"`,
    );
  const surface = dark ? mix(text, bg, 0.05) : mix(WHITE, bg, 0.6);
  const surface2 = dark ? mix(text, bg, 0.1) : mix(text, bg, 0.07);
  let muted = text;
  for (let w = 0.55; w <= 1; w += 0.05) {
    muted = mix(text, bg, w);
    if (contrastRatio(muted, bg) >= 4.6 && contrastRatio(muted, surface) >= 4.6)
      break;
  }
  const onAccent =
    contrastRatio(WHITE, accent) >= contrastRatio(text, accent)
      ? WHITE
      : dark
        ? bg
        : text;
  if (contrastRatio(onAccent, accent) < 4.5)
    problems.push(
      `ningún texto se lee sobre el acento ${toHex(accent)} (máx. ${contrastRatio(onAccent, accent).toFixed(2)}:1, se necesita 4.5:1); oscurécelo o acláralo`,
    );
  let accentText = accent;
  for (let w = 0; w <= 0.7 && contrastRatio(accentText, bg) < 3.2; w += 0.05)
    accentText = mix(text, accent, w);
  if (contrastRatio(accentText, bg) < 3)
    problems.push(
      `el acento como texto no llega a 3:1 sobre el fondo ${toHex(bg)}`,
    );
  if (problems.length > 0) return { problems };
  const result = palette({
    label: 'Paleta propia',
    scheme: dark ? 'dark' : 'light',
    bg: toHex(bg),
    surface: toHex(surface),
    surface2: toHex(surface2),
    text: toHex(text),
    muted: toHex(muted),
    accent: toHex(accent),
    onAccent: toHex(onAccent),
    accentText: toHex(accentText),
    overlay: 'bg',
    photoTreatment: 'none',
    placeholder: 'dots',
    effects: dark ? EFFECTS.dark : undefined,
  });
  const findings = paletteFindings(result);
  return findings.length > 0
    ? { problems: findings }
    : { palette: result, problems: [] };
}

/** kit:validate's theme rules (contrast pairs) for a palette on its own. */
export function paletteFindings(p: GiroPalette): string[] {
  const probe = composeTheme({
    name: 'probe',
    label: 'probe',
    tier: 'pro',
    palette: p,
    fontPair: {
      id: 'probe',
      fonts: FONT_PAIRS['playfair-display+inter'],
    },
    shape: {
      label: 'probe',
      radiusCard: '0px',
      radiusPill: '0px',
      border: '1px',
      shadow: 'none',
      density: 'regular',
      archetype: 'editorial-atelier',
    },
    brand: {},
  });
  return checkTheme(probe, 'palette').map((f) => f.message);
}
