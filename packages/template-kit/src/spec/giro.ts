import type { Role } from '../tiers';
import type {
  Business,
  ContentObject,
  ManifestMotion,
  MotionPreset,
} from '../types';
import type { GiroPalette } from './presets';
import type { SpecTier } from './schema';

/** tenants.business_profile.category values (apps/api business-profile.dto.ts). */
export type BusinessCategory =
  | 'restaurant'
  | 'medical'
  | 'dental'
  | 'legal'
  | 'accounting'
  | 'beauty_salon'
  | 'barbershop'
  | 'store'
  | 'other';

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type DemoHours = Partial<
  Record<Weekday, { open: string; close: string }[]>
>;

export interface GiroImage {
  /** Pexels search (Spanish or English); `--images pexels` downloads the first unused result. */
  query: string;
  orientation: 'landscape' | 'portrait' | 'square';
}

/**
 * One business type in the spec flow: what `lattiz spec init` pre-fills and what the compiler
 * chooses from. The giro id doubles as the kit vertical (blueprints/service-landing.shared.ts).
 */
export interface GiroDefinition {
  id: string;
  label: string;
  /** templates.category for the gallery, plural (`florerias`). */
  category: string;
  businessCategory: BusinessCategory;
  /** schema.org type the kit records in template.meta.json. */
  schemaType: string;
  /** Gallery description per tier when the spec has none. */
  description: Record<SpecTier, string>;
  /** Curated palettes, contrast-checked (`kit:spec presets`); ≥ 4 so uniqueness has room. */
  palettes: Record<string, GiroPalette>;
  /** FONT_PAIRS ids in order of preference (≥ 3). */
  fontPairs: string[];
  /** SHAPES ids in order of preference. */
  shapes: string[];
  /** Default sections per tier (variants may be swapped by the uniqueness pass). */
  sections: Record<SpecTier, { role: Role; variant: string }[]>;
  motion: {
    preset: MotionPreset;
    progress: boolean;
    sections?: ManifestMotion['sections'];
  };
  /** Menu labels per slot; anchors come from the sections present. */
  navLabels: Partial<Record<string, string>>;
  /** Business defaults (demo data); the spec's business wins. */
  business: Pick<
    Business,
    'tagline' | 'whatsappMessage' | 'phone' | 'whatsapp' | 'city'
  > & { hours: string; address: string; branch: string };
  head: { title: string; description: string };
  /** es-MX copy per slot: the union of the keys every allowed variant reads. */
  copy: Record<string, ContentObject>;
  /** Extra hero headlines, used when a headline is already taken in the giro (twins included). */
  heroAlternates: string[];
  images: Record<string, GiroImage>;
  /** Weekly hours for the demo profile (JSON-LD and "Abierto ahora"). */
  demoHours: DemoHours;
  priceRange: string;
}
