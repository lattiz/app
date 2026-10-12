import type {
  ColorToken,
  Density,
  PhotoTreatment,
  PlaceholderStyle,
  ThemeFonts,
  ThemeShape,
} from '../types';

/**
 * Curated design library for specs: font pairs, shapes and the palette shape giros fill in.
 * Every font family here has Capsize metrics, so the kit emits a metric-matched fallback (CLS ≈ 0).
 */

export interface FontPairPreset extends ThemeFonts {
  label: string;
}

/** `fontPair` id (unique per vertical in kit:validate) → theme fonts. The first six are the barbería themes'. */
export const FONT_PAIRS: Record<string, FontPairPreset> = {
  'anton+space-grotesk': {
    label: 'Anton + Space Grotesk (condensada en mayúsculas)',
    display: "'Anton', sans-serif",
    serif: "'Instrument Serif', serif",
    body: "'Space Grotesk', sans-serif",
    googleFonts:
      'family=Anton&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;700',
    displayTransform: 'uppercase',
    displayLeading: '0.9',
    displayWeight: '700',
    accentStyle: 'italic',
    accentTransform: 'lowercase',
  },
  'playfair-display+inter': {
    label: 'Playfair Display + Inter (editorial)',
    display: "'Playfair Display', serif",
    serif: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
    googleFonts:
      'family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '1.04',
    displayWeight: '500',
    accentStyle: 'italic',
    accentTransform: 'none',
  },
  'archivo-black+space-grotesk': {
    label: 'Archivo Black + Space Grotesk + Space Mono (brutalista)',
    display: "'Archivo Black', sans-serif",
    serif: "'Archivo Black', sans-serif",
    body: "'Space Grotesk', sans-serif",
    mono: "'Space Mono', monospace",
    googleFonts:
      'family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700',
    displayTransform: 'uppercase',
    displayLeading: '0.96',
    displayWeight: '400',
    accentStyle: 'normal',
    accentTransform: 'none',
  },
  'dm-serif-display+dm-sans': {
    label: 'DM Serif Display + DM Sans (serif clásica)',
    display: "'DM Serif Display', serif",
    serif: "'DM Serif Display', serif",
    body: "'DM Sans', sans-serif",
    googleFonts:
      'family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700',
    displayTransform: 'none',
    displayLeading: '1',
    displayWeight: '400',
    accentStyle: 'italic',
    accentTransform: 'none',
  },
  'fraunces+nunito-sans': {
    label: 'Fraunces + Nunito Sans (serif cálida)',
    display: "'Fraunces', serif",
    serif: "'Fraunces', serif",
    body: "'Nunito Sans', sans-serif",
    googleFonts:
      'family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&family=Nunito+Sans:wght@400;600;700',
    displayTransform: 'none',
    displayLeading: '1.02',
    displayWeight: '600',
    accentStyle: 'italic',
    accentTransform: 'none',
  },
  'unbounded+manrope': {
    label: 'Unbounded + Manrope (geométrica ancha)',
    display: "'Unbounded', sans-serif",
    serif: "'Unbounded', sans-serif",
    body: "'Manrope', sans-serif",
    googleFonts:
      'family=Unbounded:wght@500;700&family=Manrope:wght@400;500;700',
    displayTransform: 'none',
    displayLeading: '1.02',
    displayWeight: '700',
    displayScale: '0.82',
    accentStyle: 'normal',
    accentTransform: 'none',
  },
  'cormorant-garamond+work-sans': {
    label: 'Cormorant Garamond + Work Sans (serif fina, elegante)',
    display: "'Cormorant Garamond', serif",
    serif: "'Cormorant Garamond', serif",
    body: "'Work Sans', sans-serif",
    googleFonts:
      'family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Work+Sans:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '1',
    displayWeight: '600',
    displayScale: '1.12',
    accentStyle: 'italic',
    accentTransform: 'none',
  },
  'libre-baskerville+source-sans-3': {
    label: 'Libre Baskerville + Source Sans 3 (serif de confianza)',
    display: "'Libre Baskerville', serif",
    serif: "'Libre Baskerville', serif",
    body: "'Source Sans 3', sans-serif",
    googleFonts:
      'family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '1.1',
    displayWeight: '400',
    displayScale: '0.86',
    accentStyle: 'italic',
    accentTransform: 'none',
  },
  'lora+figtree': {
    label: 'Lora + Figtree (serif amable)',
    display: "'Lora', serif",
    serif: "'Lora', serif",
    body: "'Figtree', sans-serif",
    googleFonts:
      'family=Lora:ital,wght@0,500;0,600;1,500&family=Figtree:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '1.08',
    displayWeight: '500',
    displayScale: '0.94',
    accentStyle: 'italic',
    accentTransform: 'none',
  },
  'sora+inter': {
    label: 'Sora + Inter (sans moderna)',
    display: "'Sora', sans-serif",
    serif: "'Sora', sans-serif",
    body: "'Inter', sans-serif",
    googleFonts: 'family=Sora:wght@500;600&family=Inter:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '1.06',
    displayWeight: '600',
    displayScale: '0.86',
    accentStyle: 'normal',
    accentTransform: 'none',
  },
  'bricolage-grotesque+inter': {
    label: 'Bricolage Grotesque + Inter (grotesca con carácter)',
    display: "'Bricolage Grotesque', sans-serif",
    serif: "'Instrument Serif', serif",
    body: "'Inter', sans-serif",
    googleFonts:
      'family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '0.98',
    displayWeight: '800',
    displayScale: '0.92',
    accentStyle: 'italic',
    accentTransform: 'none',
  },
  'young-serif+figtree': {
    label: 'Young Serif + Figtree (bistró)',
    display: "'Young Serif', serif",
    serif: "'Young Serif', serif",
    body: "'Figtree', sans-serif",
    googleFonts: 'family=Young+Serif&family=Figtree:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '1.04',
    displayWeight: '400',
    displayScale: '0.9',
    accentStyle: 'normal',
    accentTransform: 'none',
  },
  'instrument-serif+instrument-sans': {
    label: 'Instrument Serif + Instrument Sans (editorial ligera)',
    display: "'Instrument Serif', serif",
    serif: "'Instrument Serif', serif",
    body: "'Instrument Sans', sans-serif",
    googleFonts:
      'family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '0.98',
    displayWeight: '400',
    displayScale: '1.14',
    accentStyle: 'italic',
    accentTransform: 'none',
  },
  'bodoni-moda+karla': {
    label: 'Bodoni Moda + Karla (alto contraste)',
    display: "'Bodoni Moda', serif",
    serif: "'Bodoni Moda', serif",
    body: "'Karla', sans-serif",
    googleFonts:
      'family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,600;1,6..96,500&family=Karla:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '1.02',
    displayWeight: '500',
    accentStyle: 'italic',
    accentTransform: 'none',
  },
  'syne+karla': {
    label: 'Syne + Karla (display ancha)',
    display: "'Syne', sans-serif",
    serif: "'Syne', sans-serif",
    body: "'Karla', sans-serif",
    googleFonts: 'family=Syne:wght@600;700;800&family=Karla:wght@400;500;600',
    displayTransform: 'none',
    displayLeading: '1',
    displayWeight: '700',
    displayScale: '0.84',
    accentStyle: 'normal',
    accentTransform: 'none',
  },
};

/** Families a spec may combine in a custom `fontPair` ({ display, body }). Weights load per role. */
export const CUSTOM_FONTS: Record<
  string,
  { kind: 'serif' | 'sans-serif'; italic: boolean; weights: string }
> = {
  'Playfair Display': { kind: 'serif', italic: true, weights: '500;600' },
  'DM Serif Display': { kind: 'serif', italic: true, weights: '400' },
  Fraunces: { kind: 'serif', italic: true, weights: '500;600' },
  'Cormorant Garamond': { kind: 'serif', italic: true, weights: '500;600' },
  'Libre Baskerville': { kind: 'serif', italic: true, weights: '400;700' },
  Lora: { kind: 'serif', italic: true, weights: '500;600' },
  'Young Serif': { kind: 'serif', italic: false, weights: '400' },
  'Instrument Serif': { kind: 'serif', italic: true, weights: '400' },
  'Bodoni Moda': { kind: 'serif', italic: true, weights: '500;600' },
  'EB Garamond': { kind: 'serif', italic: true, weights: '500;600' },
  Newsreader: { kind: 'serif', italic: true, weights: '500;600' },
  Inter: { kind: 'sans-serif', italic: false, weights: '400;500;600' },
  'DM Sans': { kind: 'sans-serif', italic: false, weights: '400;500;700' },
  'Nunito Sans': { kind: 'sans-serif', italic: false, weights: '400;600;700' },
  Manrope: { kind: 'sans-serif', italic: false, weights: '400;500;700' },
  'Work Sans': { kind: 'sans-serif', italic: false, weights: '400;500;600' },
  'Source Sans 3': {
    kind: 'sans-serif',
    italic: false,
    weights: '400;500;600',
  },
  Figtree: { kind: 'sans-serif', italic: false, weights: '400;500;600' },
  'Instrument Sans': {
    kind: 'sans-serif',
    italic: false,
    weights: '400;500;600',
  },
  Karla: { kind: 'sans-serif', italic: false, weights: '400;500;600' },
  'Space Grotesk': {
    kind: 'sans-serif',
    italic: false,
    weights: '400;500;700',
  },
  Sora: { kind: 'sans-serif', italic: false, weights: '500;600' },
  'Plus Jakarta Sans': {
    kind: 'sans-serif',
    italic: false,
    weights: '400;500;700',
  },
  Outfit: { kind: 'sans-serif', italic: false, weights: '400;500;600' },
};

export const slug = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Theme fonts for a custom pair of CUSTOM_FONTS families; the display face doubles as the accent face. */
export function customFontPair(display: string, body: string): FontPairPreset {
  const d = CUSTOM_FONTS[display];
  const b = CUSTOM_FONTS[body];
  const q = (family: string) => family.replace(/ /g, '+');
  const displayQuery = d.italic
    ? `family=${q(display)}:ital,wght@${d.weights
        .split(';')
        .map((w) => `0,${w}`)
        .join(';')};1,${d.weights.split(';')[0]}`
    : `family=${q(display)}:wght@${d.weights}`;
  return {
    label: `${display} + ${body}`,
    display: `'${display}', ${d.kind}`,
    serif: `'${display}', ${d.kind}`,
    body: `'${body}', ${b.kind}`,
    googleFonts:
      display === body
        ? displayQuery
        : `${displayQuery}&family=${q(body)}:wght@${b.weights}`,
    displayTransform: 'none',
    displayLeading: d.kind === 'serif' ? '1.04' : '1',
    displayWeight: d.weights.split(';').at(-1) as string,
    accentStyle: d.italic ? 'italic' : 'normal',
    accentTransform: 'none',
  };
}

export interface ShapePreset extends ThemeShape {
  label: string;
  density: Density;
  /** Pro archetype this shape reads as (the blueprint's archetypes). */
  archetype: 'editorial-atelier' | 'neo-brutal' | 'street-luxe';
}

export const SHAPES: Record<string, ShapePreset> = {
  filete: {
    label: 'Filetes de 1px, sin radios ni sombras (editorial)',
    radiusCard: '0px',
    radiusPill: '0px',
    border: '1px',
    shadow: 'none',
    density: 'airy',
    archetype: 'editorial-atelier',
  },
  urbano: {
    label: 'Esquinas casi rectas, bordes finos (urbano)',
    radiusCard: '2px',
    radiusPill: '2px',
    border: '1px',
    shadow: 'none',
    density: 'regular',
    archetype: 'street-luxe',
  },
  sutil: {
    label: 'Radios pequeños, sin sombras',
    radiusCard: '4px',
    radiusPill: '4px',
    border: '1px',
    shadow: 'none',
    density: 'regular',
    archetype: 'editorial-atelier',
  },
  redondo: {
    label: 'Tarjetas redondeadas con borde de 2px y sombra suave',
    radiusCard: '12px',
    radiusPill: '12px',
    border: '2px',
    shadow: 'soft',
    density: 'regular',
    archetype: 'editorial-atelier',
  },
  suave: {
    label: 'Tarjetas suaves y botones píldora',
    radiusCard: '14px',
    radiusPill: '999px',
    border: '1px',
    shadow: 'soft',
    density: 'regular',
    archetype: 'editorial-atelier',
  },
  organico: {
    label: 'Radios amplios y botones píldora, sin sombras',
    radiusCard: '24px',
    radiusPill: '999px',
    border: '1px',
    shadow: 'none',
    density: 'airy',
    archetype: 'editorial-atelier',
  },
  brutal: {
    label: 'Bordes de 3px y sombras desplazadas duras (neo-brutal)',
    radiusCard: '0px',
    radiusPill: '0px',
    border: '3px',
    shadow: 'hard-offset',
    density: 'compact',
    archetype: 'neo-brutal',
  },
};

/** A curated palette: the 14 color tokens plus what reads well with them. */
export interface GiroPalette {
  label: string;
  scheme: 'light' | 'dark';
  colors: Record<ColorToken, string>;
  accentWords: 'color' | 'highlight';
  photoTreatment: PhotoTreatment;
  placeholder: PlaceholderStyle;
  effects: { mapFilter: string; heroImageFilter: string };
}

export const EFFECTS = {
  light: {
    mapFilter: 'grayscale(.6) contrast(1.05)',
    heroImageFilter: 'brightness(.62) saturate(.95)',
  },
  dark: {
    mapFilter: 'grayscale(1) invert(.9) contrast(.9) brightness(.8)',
    heroImageFilter: 'brightness(.45) saturate(.9)',
  },
} as const;

/**
 * Fills the derived tokens of a palette. Light schemes veil the image hero in the dark `ink`
 * (so accent-text must read on both); pass `overlay: 'bg'` for a light veil instead.
 */
export function palette(input: {
  label: string;
  scheme: 'light' | 'dark';
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  accentText: string;
  ink?: string;
  overlay?: 'ink' | 'bg';
  accentWords?: 'color' | 'highlight';
  photoTreatment: PhotoTreatment;
  placeholder: PlaceholderStyle;
  effects?: { mapFilter: string; heroImageFilter: string };
}): GiroPalette {
  const dark = input.scheme === 'dark';
  const ink = input.ink ?? (dark ? input.bg : input.text);
  const veil = input.overlay ?? (dark ? 'bg' : 'ink');
  return {
    label: input.label,
    scheme: input.scheme,
    colors: {
      bg: input.bg,
      surface: input.surface,
      'surface-2': input.surface2,
      text: input.text,
      muted: input.muted,
      accent: input.accent,
      'on-accent': input.onAccent,
      'accent-text': input.accentText,
      line: 'color-mix(in srgb, var(--lz-color-text) 18%, transparent)',
      'line-strong':
        'color-mix(in srgb, var(--lz-color-text) 55%, transparent)',
      overlay: veil === 'ink' ? ink : input.bg,
      'on-overlay': veil === 'ink' ? input.bg : input.text,
      'navbar-bg': 'color-mix(in srgb, var(--lz-color-bg) 94%, transparent)',
      ink,
    },
    accentWords: input.accentWords ?? 'color',
    photoTreatment: input.photoTreatment,
    placeholder: input.placeholder,
    effects:
      input.effects ??
      (veil === 'bg' && !dark
        ? {
            mapFilter: EFFECTS.light.mapFilter,
            heroImageFilter: 'brightness(1.08) saturate(.85)',
          }
        : EFFECTS[input.scheme]),
  };
}
