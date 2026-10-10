import { COLOR_TOKENS, type ColorToken, type Theme } from '../types';
import { hueOf, parseColor, type Rgba, type VarResolver } from './color';

const SECTION_PAD = {
  airy: 'clamp(96px, 13vw, 184px)',
  regular: 'clamp(72px, 10vw, 140px)',
  compact: 'clamp(56px, 7vw, 104px)',
} as const;

const STACK = { airy: '32px', regular: '24px', compact: '16px' } as const;

const SHADOWS = {
  none: ['none', 'none'],
  soft: [
    '0 24px 48px -24px color-mix(in srgb, var(--lz-color-ink) 40%, transparent)',
    '0 10px 22px -12px color-mix(in srgb, var(--lz-color-ink) 45%, transparent)',
  ],
  'hard-offset': [
    '6px 6px 0 var(--lz-color-ink)',
    '3px 3px 0 var(--lz-color-ink)',
  ],
} as const;

/** Resolves only --lz-color-* (themeResolver would recurse through themeVariables). */
function colorResolver(theme: Theme): VarResolver {
  const colors = new Map<string, string>(
    COLOR_TOKENS.map((t) => [`--lz-color-${t}`, theme.colors[t]]),
  );
  return (name) => colors.get(name);
}

/** Photo filter per treatment; duotone tints toward the accent hue (sepia starts near 38°). */
function photoFilter(theme: Theme): string {
  switch (theme.photoTreatment) {
    case 'none':
      return 'none';
    case 'grayscale':
      return 'grayscale(1)';
    case 'warm':
      return 'sepia(0.28) saturate(1.15) brightness(1.02)';
    case 'duotone': {
      const accent = parseColor(theme.colors.accent, colorResolver(theme));
      const hue = accent ? hueOf(accent).hue : 38;
      return `grayscale(1) contrast(1.15) sepia(0.9) hue-rotate(${Math.round(hue - 38)}deg) saturate(1.6)`;
    }
  }
}

/** Every custom property a theme defines; this is the only place token values enter the CSS. */
export function themeVariables(theme: Theme): [string, string][] {
  const [shadow, shadowSm] = SHADOWS[theme.shape.shadow];
  const highlight = theme.accentWords === 'highlight';
  return [
    ...COLOR_TOKENS.map((t): [string, string] => [
      `--lz-color-${t}`,
      theme.colors[t],
    ]),
    ['--lz-font-display', theme.fonts.display],
    ['--lz-font-serif', theme.fonts.serif],
    ['--lz-font-body', theme.fonts.body],
    ['--lz-font-mono', theme.fonts.mono ?? theme.fonts.body],
    ['--lz-display-transform', theme.fonts.displayTransform],
    ['--lz-display-leading', theme.fonts.displayLeading],
    ['--lz-display-weight', theme.fonts.displayWeight],
    ['--lz-display-scale', theme.fonts.displayScale ?? '1'],
    ['--lz-accent-style', theme.fonts.accentStyle],
    ['--lz-accent-transform', theme.fonts.accentTransform],
    [
      '--lz-accent-word-bg',
      highlight
        ? 'linear-gradient(180deg, transparent 16%, var(--lz-color-accent) 16%, var(--lz-color-accent) 88%, transparent 88%)'
        : 'transparent',
    ],
    ['--lz-accent-word-pad', highlight ? '0 0.12em' : '0'],
    ['--lz-radius-pill', theme.shape.radiusPill],
    ['--lz-radius-card', theme.shape.radiusCard],
    ['--lz-border-width', theme.shape.border],
    ['--lz-shadow', shadow],
    ['--lz-shadow-sm', shadowSm],
    ['--lz-section-pad', SECTION_PAD[theme.density]],
    ['--lz-stack', STACK[theme.density]],
    ['--lz-container', theme.container],
    ['--lz-photo-filter', photoFilter(theme)],
    ['--lz-map-filter', theme.effects.mapFilter],
    ['--lz-hero-image-filter', theme.effects.heroImageFilter],
  ];
}

export function themeRootCss(theme: Theme): string {
  return `:root {\n${themeVariables(theme)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`;
}

export function googleFontsHref(theme: Theme): string {
  return `https://fonts.googleapis.com/css2?${theme.fonts.googleFonts}&display=swap`;
}

export function themeResolver(theme: Theme): VarResolver {
  const vars = new Map(themeVariables(theme));
  return (name) => vars.get(name);
}

export function tokenColor(theme: Theme, token: ColorToken): Rgba | null {
  return parseColor(theme.colors[token], themeResolver(theme));
}

/** Primary family names, e.g. `'Anton', sans-serif` → `Anton`. */
export function fontFamilyName(stack: string): string {
  return stack
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '');
}
