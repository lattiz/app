/**
 * Style presets (extended catalog): opt-in looks a theme turns on with `style`. A theme without
 * `style` emits none of these tokens, so every legacy template compiles byte for byte. New section
 * variants read them with `var(--lz-…, <fallback>)` so they also work under a legacy theme.
 */

export const STYLE_OPTIONS = {
  /** Radius scale of buttons, cards and images. */
  shape: ['sharp', 'soft', 'round', 'pill'],
  /** Cards and panels. */
  surface: ['flat', 'outlined', 'tinted', 'elevated'],
  /** Section padding, gaps and container width. */
  density: ['compact', 'cozy', 'airy'],
  /** Section separators. */
  divider: ['none', 'hairline', 'rule'],
  /** Frames and masks of photos (CSS only). */
  imageTreatment: ['plain', 'framed', 'arch', 'offset', 'duotone-overlay'],
  /** Display and heading size ratio. */
  typeScale: ['tight', 'normal', 'expressive'],
  /** Display case hint. */
  displayCase: ['none', 'upper'],
  /** Display letter-spacing hint. */
  tracking: ['tight', 'normal', 'wide'],
} as const;

export type StyleKey = keyof typeof STYLE_OPTIONS;
export type ThemeStyle = {
  [K in StyleKey]?: (typeof STYLE_OPTIONS)[K][number];
};

/** Radii per shape preset; card ≤ 32px (kit:validate). */
export const SHAPE_RADII: Record<
  NonNullable<ThemeStyle['shape']>,
  { card: string; pill: string; img: string; inner: string }
> = {
  sharp: { card: '0px', pill: '0px', img: '0px', inner: '0px' },
  soft: { card: '12px', pill: '10px', img: '10px', inner: '6px' },
  round: { card: '22px', pill: '999px', img: '18px', inner: '12px' },
  pill: { card: '32px', pill: '999px', img: '32px', inner: '20px' },
};

/** Theme density + container + gaps per density preset (section padding reuses the kit's density). */
export const DENSITY_PRESETS: Record<
  NonNullable<ThemeStyle['density']>,
  {
    density: 'compact' | 'regular' | 'airy';
    container: string;
    gap: string;
    gapLg: string;
  }
> = {
  compact: {
    density: 'compact',
    container: '1120px',
    gap: '16px',
    gapLg: '32px',
  },
  cozy: { density: 'regular', container: '1200px', gap: '24px', gapLg: '48px' },
  airy: { density: 'airy', container: '1280px', gap: '40px', gapLg: '72px' },
};

/** Multiplier on the font pair's displayScale, and on secondary headings. */
export const TYPE_SCALES: Record<
  NonNullable<ThemeStyle['typeScale']>,
  { display: number; heading: string }
> = {
  tight: { display: 0.88, heading: '0.92' },
  normal: { display: 1, heading: '1' },
  expressive: { display: 1.15, heading: '1.12' },
};

/** Interaction tokens (docs/template-kit-design-principles.md §4): one motion feel for every new variant. */
export const INTERACTION_TOKENS: [string, string][] = [
  ['--lz-ease-out', 'cubic-bezier(0.23, 1, 0.32, 1)'],
  ['--lz-ease-in-out', 'cubic-bezier(0.77, 0, 0.175, 1)'],
  ['--lz-dur-press', '120ms'],
  ['--lz-dur-ui', '160ms'],
  ['--lz-dur-reveal', '240ms'],
  ['--lz-press-scale', '0.97'],
];

const SURFACES: Record<
  NonNullable<ThemeStyle['surface']>,
  { bg: string; border: string; shadow: string; pad: string }
> = {
  flat: { bg: 'transparent', border: 'none', shadow: 'none', pad: '0px' },
  outlined: {
    bg: 'transparent',
    border: 'var(--lz-border-width) solid var(--lz-color-line)',
    shadow: 'none',
    pad: 'calc(24px * var(--lz-space))',
  },
  tinted: {
    bg: 'var(--lz-color-surface-2)',
    border: 'none',
    shadow: 'none',
    pad: 'calc(24px * var(--lz-space))',
  },
  elevated: {
    bg: 'var(--lz-color-surface)',
    border: 'none',
    shadow:
      '0 18px 40px -24px color-mix(in srgb, var(--lz-color-ink) 40%, transparent)',
    pad: 'calc(24px * var(--lz-space))',
  },
};

const DIVIDERS: Record<NonNullable<ThemeStyle['divider']>, string> = {
  none: 'none',
  hairline: '1px solid var(--lz-color-line)',
  rule: '2px solid var(--lz-color-text)',
};

const TRACKING: Record<NonNullable<ThemeStyle['tracking']>, string> = {
  tight: '-0.02em',
  normal: '0em',
  wide: '0.04em',
};

/**
 * Every token a `style` adds to :root, with today's look where a preset is not chosen. The
 * fallbacks new variants use (`var(--lz-card-bg, var(--lz-color-surface))`…) match these defaults.
 */
export function styleVariables(style: ThemeStyle): [string, string][] {
  const radii = SHAPE_RADII[style.shape ?? 'soft'];
  const surface = SURFACES[style.surface ?? 'outlined'];
  const density = DENSITY_PRESETS[style.density ?? 'cozy'];
  const treatment = style.imageTreatment ?? 'plain';
  const imgRadius =
    treatment === 'arch'
      ? '999px 999px var(--lz-radius-img) var(--lz-radius-img)'
      : 'var(--lz-radius-img)';
  return [
    ['--lz-radius-img', radii.img],
    ['--lz-radius-inner', radii.inner],
    ['--lz-card-bg', surface.bg],
    ['--lz-card-border', surface.border],
    ['--lz-card-shadow', surface.shadow],
    ['--lz-card-pad', surface.pad],
    ['--lz-gap', density.gap],
    ['--lz-gap-lg', density.gapLg],
    ['--lz-divider', DIVIDERS[style.divider ?? 'none']],
    ['--lz-img-shape', imgRadius],
    [
      '--lz-img-pad',
      treatment === 'framed' ? 'calc(10px * var(--lz-space))' : '0px',
    ],
    [
      '--lz-img-frame',
      treatment === 'framed' ? 'var(--lz-color-surface)' : 'transparent',
    ],
    [
      '--lz-img-ring',
      treatment === 'framed'
        ? 'var(--lz-border-width) solid var(--lz-color-line)'
        : 'none',
    ],
    ['--lz-img-offset', treatment === 'offset' ? '14px' : '0px'],
    [
      '--lz-img-offset-bg',
      treatment === 'offset' ? 'var(--lz-color-accent)' : 'transparent',
    ],
    [
      '--lz-img-overlay',
      treatment === 'duotone-overlay'
        ? 'color-mix(in srgb, var(--lz-color-accent) 55%, transparent)'
        : 'transparent',
    ],
    ['--lz-img-blend', treatment === 'duotone-overlay' ? 'multiply' : 'normal'],
    ['--lz-heading-scale', TYPE_SCALES[style.typeScale ?? 'normal'].heading],
    ['--lz-display-tracking', TRACKING[style.tracking ?? 'normal']],
    ...INTERACTION_TOKENS,
  ];
}

/** Problems with a theme's `style` object (Spanish-free: kit:validate messages are English). */
export function styleProblems(raw: unknown, where = 'theme.style'): string[] {
  if (raw === undefined) return [];
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw))
    return [`${where} must be an object`];
  const out: string[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const allowed = (STYLE_OPTIONS as Record<string, readonly string[]>)[key];
    if (!allowed)
      out.push(
        `${where}.${key} is not one of ${Object.keys(STYLE_OPTIONS).join(' | ')}`,
      );
    else if (!allowed.includes(String(value)))
      out.push(`${where}.${key} must be one of ${allowed.join(' | ')}`);
  }
  return out;
}
