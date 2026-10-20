/** Shared shapes for the template-kit source library (sections, themes, content packs, manifests). */

import type { ThemeStyle } from './lib/style';
import type { PrimitiveChoices } from '../primitives';
import type { Role, Tier } from './tiers';

export type Region = 'header' | 'main' | 'footer';

export const COLOR_TOKENS = [
  'bg',
  'surface',
  'surface-2',
  'text',
  'muted',
  'accent',
  'on-accent',
  /** Accent used as text (titles' accent words, link hover); `accent` stays the fill color. */
  'accent-text',
  'line',
  'line-strong',
  'overlay',
  'on-overlay',
  'navbar-bg',
  'ink',
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

export interface ThemeFonts {
  display: string;
  /** Accent face for `.lz-title__serif` words (a serif italic, the display itself or the mono). */
  serif: string;
  body: string;
  /** Labels and small caps; falls back to body. */
  mono?: string;
  /** Google Fonts css2 query, e.g. `family=Anton&family=Space+Grotesk:wght@400;700`. */
  googleFonts: string;
  displayTransform: 'uppercase' | 'none';
  /** Unitless line-height for display type (condensed caps ≈ 0.9, serifs ≈ 1.05). */
  displayLeading: string;
  /** Weight of `.lz-title` headings. */
  displayWeight: string;
  /** Multiplier on display title sizes for wide or narrow faces (default 1). */
  displayScale?: string;
  accentStyle: 'italic' | 'normal';
  accentTransform: 'lowercase' | 'none';
}

export type ShadowStyle = 'none' | 'soft' | 'hard-offset';
export type Density = 'airy' | 'regular' | 'compact';
export type PhotoTreatment = 'none' | 'duotone' | 'grayscale' | 'warm';
export type PlaceholderStyle =
  | 'grain'
  | 'rules'
  | 'stripes'
  | 'blobs'
  | 'arches'
  | 'dots';

export interface ThemeShape {
  radiusCard: string;
  radiusPill: string;
  /** Border width of cards, panels, buttons and chips (e.g. `1px`, `3px`). */
  border: string;
  shadow: ShadowStyle;
}

/**
 * Global rhythm knobs (all optional; defaults reproduce the kit's original values).
 * `space` multiplies gaps, margins and paddings inside sections; `textScale` multiplies body and
 * UI text; titles are fluid `clamp()` values. `*Md`/`*Sm` apply at ≤ 992px / ≤ 480px.
 */
export const RHYTHM_TOKENS = {
  sectionPad: '--lz-section-pad',
  gutter: '--lz-gutter',
  gutterMd: '--lz-gutter-md',
  gutterSm: '--lz-gutter-sm',
  space: '--lz-space',
  textScale: '--lz-text-scale',
  titleHero: '--lz-title-hero',
  titleHeroSm: '--lz-title-hero-sm',
  titleSection: '--lz-title-section',
  titleSectionSm: '--lz-title-section-sm',
  titleSub: '--lz-title-sub',
} as const;
export type RhythmToken = keyof typeof RHYTHM_TOKENS;

export interface Theme {
  name: string;
  label: string;
  /** A `pro` theme is a Pro template's identity; Basic templates may not use it (and vice versa). */
  tier: Tier;
  /** Unique per vertical, e.g. `anton+space-grotesk`. */
  fontPair: string;
  colors: Record<ColorToken, string>;
  fonts: ThemeFonts;
  shape: ThemeShape;
  density: Density;
  photoTreatment: PhotoTreatment;
  /** Pattern of the generated placeholders in assets/<vertical>/<theme>/ until real photos arrive. */
  placeholder: PlaceholderStyle;
  /** `color`: accent words in accent-text; `highlight`: accent-text on an accent marker. */
  accentWords: 'color' | 'highlight';
  container: string;
  /** Non-color, theme-dependent filters (maps and the image-bg hero are tuned per scheme). */
  effects: { mapFilter: string; heroImageFilter: string };
  rhythm?: Partial<Record<RhythmToken, string>>;
  /** Extended catalog only: opt-in style presets (src/lib/style.ts); absent = no extra tokens. */
  style?: ThemeStyle;
  /** Extended catalog only: primitive style per family (primitives/); absent = family defaults. */
  primitives?: PrimitiveChoices;
}

export interface SectionMeta {
  slot: string;
  variant: string;
  /** Spanish component name shown in the editor's layer manager. */
  label: string;
  region: Region;
  description: string;
  /** Section takes part in the `{{index}}` numbering (01, 02, …). */
  numbered?: boolean;
  /** Size used when a referenced image is missing and a placeholder is generated. */
  placeholder?: { width: number; height: number };
  /** Content keys the fragment reads, for authors and agents (`items[].name` for list fields). */
  contentKeys: string[];
  /** Extended variants: the tiers it is designed for (legacy ones follow the blueprints). */
  tiers?: Tier[];
  /** Extended variants: one-line design intent (what sets it apart, for which business). */
  intent?: string;
  /** Extended variants: page archetypes (archetypes/) it suits, best first. */
  archetypes?: string[];
  /** Copy for keys no giro writes yet; the gallery and `kit probe` merge it over the giro's copy. */
  sample?: ContentObject;
}

export type ContentValue =
  | string
  | number
  | boolean
  | null
  | ContentValue[]
  | { [key: string]: ContentValue };
export type ContentObject = { [key: string]: ContentValue };

export interface Business {
  name: string;
  shortName: string;
  tagline: string;
  city: string;
  phone: string;
  /** Digits only, with country code, as wa.me expects (e.g. 5215500000000). */
  whatsapp: string;
  whatsappMessage: string;
  address: string;
  year: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  email: string;
  /** Google profile with every review ("Ver todas en Google"). */
  googleReviewsUrl: string;
  /** Google "write a review" link (g.page/r/<id>/review) behind "Dejar reseña en Google". */
  googleReviewUrl: string;
}

export interface HeadContent {
  title: string;
  description: string;
}

export interface ContentPack {
  vertical: string;
  locale: string;
  business: Business;
  head: HeadContent;
  sections: Record<string, ContentObject>;
}

export interface ManifestSection {
  slot: string;
  variant: string;
  /** Shallow overrides of the content pack's data for this slot. */
  props?: ContentObject;
}

export type MotionPreset = 'calm' | 'editorial' | 'none';
export type MotionSectionType =
  | 'hero'
  | 'about'
  | 'cards'
  | 'steps'
  | 'timeline'
  | 'gallery'
  | 'stats'
  | 'testimonials'
  | 'pricing'
  | 'team'
  | 'faq'
  | 'contact'
  | 'cta'
  | 'footer'
  | 'none';
export type MotionPattern =
  | 'cascade'
  | 'alternate'
  | 'converge'
  | 'center-out'
  | 'wave'
  | 'none';

/** Lattiz Motion for the seed (docs/lattiz-motion.md); copied to template.meta.json. */
export interface ManifestMotion {
  /** Default `--motion` preset when the seed command doesn't pass one. */
  preset?: MotionPreset;
  /** Manual corrections that beat the seed's classifier. Key: slot name, `#id` or section index. */
  sections?: Record<
    string,
    MotionSectionType | { type?: MotionSectionType; pattern?: MotionPattern }
  >;
  /** Scroll progress bar on Pro sites (data-lz-progress on the root wrapper). */
  progress?: boolean;
}

export interface Manifest {
  id: string;
  name: string;
  category: string;
  description: string;
  family: string;
  tier: Tier;
  vertical: string;
  archetype: string;
  theme: string;
  /** Content pack file name under content/, without extension (e.g. `barberia.oxido.es-MX`). */
  content: string;
  business?: Partial<Business>;
  head?: Partial<HeadContent>;
  sections: ManifestSection[];
  motion?: ManifestMotion;
  /** Id of the template this one renews (spec `renews`): the pair is exempt from the uniqueness gates. */
  renews?: string;
}

export interface BlueprintRole {
  region: Region;
  /** `first` / `last` pin the role's slot inside its region. */
  position?: 'first' | 'last';
  purpose: string;
  /** Variants of the resolved slot this tier allows; any variant when omitted. */
  variants?: string[];
}

export interface BlueprintVertical {
  /** schema.org LocalBusiness subtype the publisher emits as JSON-LD (e.g. `BarberShop`). */
  schemaType: string;
  /** Slot that fills each role in this vertical (e.g. catalog → services). */
  slots: Partial<Record<Role, string>>;
}

export interface Blueprint {
  family: string;
  tier: Tier;
  description: string;
  /** Roles this tier allows; which are required comes from `TIERS` in src/tiers.ts. */
  roles: Partial<Record<Role, BlueprintRole>>;
  verticals: Record<string, BlueprintVertical>;
  archetypes: Record<string, string>;
  guidance: string[];
}
