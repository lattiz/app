/** Shared shapes for the template-kit source library (sections, themes, content packs, manifests). */

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
  serif: string;
  body: string;
  /** Google Fonts css2 query, e.g. `family=Anton&family=Space+Grotesk:wght@400;700`. */
  googleFonts: string;
}

export interface Theme {
  name: string;
  label: string;
  colors: Record<ColorToken, string>;
  fonts: ThemeFonts;
  radius: { pill: string; card: string };
  sectionPad: string;
  container: string;
  /** Non-color, theme-dependent filters (maps and photos are tuned per scheme). */
  effects: { mapFilter: string; heroImageFilter: string };
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
  /** Content pack file name under content/, without extension (e.g. `barberia.es-MX`). */
  content: string;
  business?: Partial<Business>;
  head?: Partial<HeadContent>;
  sections: ManifestSection[];
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
