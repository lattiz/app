/**
 * "Tema" presets. They rewrite the template-kit tokens on :root (--lz-color-*,
 * --lz-font-*), which every kit template and the section kit read. Contrast of
 * text/bg, muted/bg, on-accent/accent and accent-text/bg is checked to WCAG AA.
 */

export interface PaletteColors {
  bg: string;
  surface: string;
  'surface-2': string;
  text: string;
  muted: string;
  accent: string;
  'on-accent': string;
  'accent-text': string;
}

export interface ThemePalette {
  id: string;
  label: string;
  tier: 'basic' | 'pro';
  light: PaletteColors;
  /** Pro palettes ship a dark variant. */
  dark?: PaletteColors;
}

export interface FontPairing {
  id: string;
  label: string;
  display: string;
  serif: string;
  body: string;
  mono: string;
  displayTransform: 'none' | 'uppercase';
  displayWeight: string;
  displayLeading: string;
  /** Google Fonts css2 `family=` query. */
  googleFonts: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'clasico',
    label: 'Clásico',
    tier: 'basic',
    light: {
      bg: '#FAFAF7',
      surface: '#FFFFFF',
      'surface-2': '#F0EFEA',
      text: '#1A1A1A',
      muted: '#5C5C57',
      accent: '#1F4FD1',
      'on-accent': '#FFFFFF',
      'accent-text': '#1F4FD1',
    },
  },
  {
    id: 'noche',
    label: 'Noche',
    tier: 'basic',
    light: {
      bg: '#111214',
      surface: '#1A1B1E',
      'surface-2': '#232428',
      text: '#F2F2EF',
      muted: '#A3A39E',
      accent: '#F2B33D',
      'on-accent': '#111214',
      'accent-text': '#F2B33D',
    },
  },
  {
    id: 'terracota',
    label: 'Terracota',
    tier: 'basic',
    light: {
      bg: '#F7F1EA',
      surface: '#FFFDFA',
      'surface-2': '#EFE5D9',
      text: '#2B1D14',
      muted: '#6B5546',
      accent: '#A8481F',
      'on-accent': '#FFFFFF',
      'accent-text': '#9A4422',
    },
  },
  {
    id: 'bosque',
    label: 'Bosque',
    tier: 'basic',
    light: {
      bg: '#F3F6F2',
      surface: '#FFFFFF',
      'surface-2': '#E3EBE1',
      text: '#142018',
      muted: '#4E5E52',
      accent: '#2F6B45',
      'on-accent': '#FFFFFF',
      'accent-text': '#2F6B45',
    },
  },
  {
    id: 'oxido',
    label: 'Óxido',
    tier: 'pro',
    light: {
      bg: '#F4F1EA',
      surface: '#FFFFFF',
      'surface-2': '#E9E4D9',
      text: '#141414',
      muted: '#5E5A52',
      accent: '#C23A12',
      'on-accent': '#FFFFFF',
      'accent-text': '#B33510',
    },
    dark: {
      bg: '#0B0B0C',
      surface: '#141416',
      'surface-2': '#1C1C1F',
      text: '#F4F1EA',
      muted: '#9A978F',
      accent: '#FF4F1F',
      'on-accent': '#0B0B0C',
      'accent-text': '#FF6A3D',
    },
  },
  {
    id: 'lima',
    label: 'Lima brutal',
    tier: 'pro',
    light: {
      bg: '#F1EFE8',
      surface: '#FFFFFF',
      'surface-2': '#E4E1D8',
      text: '#0A0A0A',
      muted: '#46463F',
      accent: '#C6F135',
      'on-accent': '#0A0A0A',
      'accent-text': '#3D5A00',
    },
    dark: {
      bg: '#0D0D0B',
      surface: '#161613',
      'surface-2': '#20201C',
      text: '#F1EFE8',
      muted: '#A4A39A',
      accent: '#C6F135',
      'on-accent': '#0A0A0A',
      'accent-text': '#C6F135',
    },
  },
  {
    id: 'oceano',
    label: 'Océano',
    tier: 'pro',
    light: {
      bg: '#F2F6F8',
      surface: '#FFFFFF',
      'surface-2': '#E2EBF0',
      text: '#0E1C26',
      muted: '#4A5D6B',
      accent: '#0F6E8C',
      'on-accent': '#FFFFFF',
      'accent-text': '#0F6E8C',
    },
    dark: {
      bg: '#08141B',
      surface: '#0E1E28',
      'surface-2': '#152A36',
      text: '#E6F1F5',
      muted: '#8FA7B4',
      accent: '#38B6D9',
      'on-accent': '#08141B',
      'accent-text': '#5CC6E3',
    },
  },
  {
    id: 'champagne',
    label: 'Champagne',
    tier: 'pro',
    light: {
      bg: '#FBF8F2',
      surface: '#FFFFFF',
      'surface-2': '#F1EADC',
      text: '#221C14',
      muted: '#6E6252',
      accent: '#7F6129',
      'on-accent': '#FFFFFF',
      'accent-text': '#7F6129',
    },
    dark: {
      bg: '#14110C',
      surface: '#1D1913',
      'surface-2': '#27211A',
      text: '#F5EEDF',
      muted: '#B3A68F',
      accent: '#D4AF6A',
      'on-accent': '#14110C',
      'accent-text': '#D9B877',
    },
  },
  {
    id: 'rosa',
    label: 'Rosa editorial',
    tier: 'pro',
    light: {
      bg: '#FFF5F5',
      surface: '#FFFFFF',
      'surface-2': '#FBE4E6',
      text: '#2A0F16',
      muted: '#73545B',
      accent: '#B5164F',
      'on-accent': '#FFFFFF',
      'accent-text': '#B5164F',
    },
    dark: {
      bg: '#170A0E',
      surface: '#22111A',
      'surface-2': '#2D1822',
      text: '#FCE8EE',
      muted: '#C29AA6',
      accent: '#FF5C93',
      'on-accent': '#170A0E',
      'accent-text': '#FF7AA8',
    },
  },
  {
    id: 'violeta',
    label: 'Violeta',
    tier: 'pro',
    light: {
      bg: '#F7F5FD',
      surface: '#FFFFFF',
      'surface-2': '#ECE7FA',
      text: '#1B1530',
      muted: '#5D5675',
      accent: '#5B3FD6',
      'on-accent': '#FFFFFF',
      'accent-text': '#5B3FD6',
    },
    dark: {
      bg: '#0F0B1E',
      surface: '#18122D',
      'surface-2': '#221A3C',
      text: '#EEEAFB',
      muted: '#A79FC4',
      accent: '#9B85FF',
      'on-accent': '#0F0B1E',
      'accent-text': '#A996FF',
    },
  },
  {
    id: 'salvia',
    label: 'Salvia',
    tier: 'pro',
    light: {
      bg: '#F4F5F0',
      surface: '#FFFFFF',
      'surface-2': '#E6E9DE',
      text: '#1C211A',
      muted: '#575E52',
      accent: '#4A684D',
      'on-accent': '#FFFFFF',
      'accent-text': '#4A684D',
    },
    dark: {
      bg: '#0F120E',
      surface: '#171B15',
      'surface-2': '#20251D',
      text: '#E9EDE4',
      muted: '#A0A898',
      accent: '#9CC59F',
      'on-accent': '#0F120E',
      'accent-text': '#A8CEAB',
    },
  },
  {
    id: 'mostaza',
    label: 'Mostaza',
    tier: 'pro',
    light: {
      bg: '#FFFBEB',
      surface: '#FFFFFF',
      'surface-2': '#FDF0C4',
      text: '#1F1A0A',
      muted: '#6B5F3A',
      accent: '#1F1A0A',
      'on-accent': '#FDE047',
      'accent-text': '#7A5E00',
    },
    dark: {
      bg: '#121008',
      surface: '#1C1A0F',
      'surface-2': '#262315',
      text: '#FBF6E3',
      muted: '#B7AE8C',
      accent: '#FACC15',
      'on-accent': '#121008',
      'accent-text': '#FACC15',
    },
  },
];

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'urbano',
    label: 'Urbano · Anton + Space Grotesk',
    display: "'Anton', sans-serif",
    serif: "'Instrument Serif', serif",
    body: "'Space Grotesk', sans-serif",
    mono: "'Space Grotesk', sans-serif",
    displayTransform: 'uppercase',
    displayWeight: '400',
    displayLeading: '0.92',
    googleFonts:
      'family=Anton&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;700',
  },
  {
    id: 'elegante',
    label: 'Elegante · Playfair Display + Inter',
    display: "'Playfair Display', serif",
    serif: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
    mono: "'Inter', sans-serif",
    displayTransform: 'none',
    displayWeight: '600',
    displayLeading: '1.02',
    googleFonts:
      'family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;700',
  },
  {
    id: 'brutal',
    label: 'Brutal · Archivo Black + Space Mono',
    display: "'Archivo Black', sans-serif",
    serif: "'Archivo Black', sans-serif",
    body: "'Archivo', sans-serif",
    mono: "'Space Mono', monospace",
    displayTransform: 'uppercase',
    displayWeight: '400',
    displayLeading: '0.95',
    googleFonts:
      'family=Archivo+Black&family=Archivo:wght@400;500;700&family=Space+Mono:wght@400;700',
  },
  {
    id: 'calido',
    label: 'Cálido · Fraunces + Manrope',
    display: "'Fraunces', serif",
    serif: "'Fraunces', serif",
    body: "'Manrope', sans-serif",
    mono: "'Manrope', sans-serif",
    displayTransform: 'none',
    displayWeight: '600',
    displayLeading: '1',
    googleFonts:
      'family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Manrope:wght@400;500;700',
  },
  {
    id: 'clasico',
    label: 'Clásico · DM Serif Display + DM Sans',
    display: "'DM Serif Display', serif",
    serif: "'DM Serif Display', serif",
    body: "'DM Sans', sans-serif",
    mono: "'DM Mono', monospace",
    displayTransform: 'none',
    displayWeight: '400',
    displayLeading: '1.02',
    googleFonts:
      'family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500',
  },
  {
    id: 'deportivo',
    label: 'Deportivo · Bebas Neue + Work Sans',
    display: "'Bebas Neue', sans-serif",
    serif: "'Bebas Neue', sans-serif",
    body: "'Work Sans', sans-serif",
    mono: "'Work Sans', sans-serif",
    displayTransform: 'uppercase',
    displayWeight: '400',
    displayLeading: '0.92',
    googleFonts: 'family=Bebas+Neue&family=Work+Sans:wght@400;500;700',
  },
];

/** The :root declarations a palette sets; lines/overlays derive from text/bg so they follow. */
export function paletteTokens(colors: PaletteColors): Record<string, string> {
  return {
    '--lz-color-bg': colors.bg,
    '--lz-color-surface': colors.surface,
    '--lz-color-surface-2': colors['surface-2'],
    '--lz-color-text': colors.text,
    '--lz-color-muted': colors.muted,
    '--lz-color-accent': colors.accent,
    '--lz-color-on-accent': colors['on-accent'],
    '--lz-color-accent-text': colors['accent-text'],
    '--lz-color-line':
      'color-mix(in srgb, var(--lz-color-text) 14%, transparent)',
    '--lz-color-line-strong':
      'color-mix(in srgb, var(--lz-color-text) 24%, transparent)',
    '--lz-color-overlay': colors.bg,
    '--lz-color-on-overlay': colors.text,
    '--lz-color-navbar-bg':
      'color-mix(in srgb, var(--lz-color-bg) 82%, transparent)',
  };
}

export function fontTokens(font: FontPairing): Record<string, string> {
  return {
    '--lz-font-display': font.display,
    '--lz-font-serif': font.serif,
    '--lz-font-body': font.body,
    '--lz-font-mono': font.mono,
    '--lz-display-transform': font.displayTransform,
    '--lz-display-weight': font.displayWeight,
    '--lz-display-leading': font.displayLeading,
  };
}

export function googleFontsHref(font: FontPairing): string {
  return `https://fonts.googleapis.com/css2?${font.googleFonts}&display=swap`;
}
