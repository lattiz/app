import { COLOR_TOKENS, type ColorToken } from './types';

/** Tiers, roles and the counting rule: the single source of truth for what Basic and Pro mean. */

export const TIER_NAMES = ['basic', 'pro'] as const;
export type Tier = (typeof TIER_NAMES)[number];

/** What a section does on the page; blueprints resolve each role to a slot per vertical. */
export const ROLES = [
  'header',
  'hero',
  'marquee',
  'about',
  'catalog',
  'proof',
  'team',
  'testimonials',
  'faq',
  'contact',
  'whatsapp',
  'footer',
] as const;
export type Role = (typeof ROLES)[number];

export type SeoProfile = 'basic' | 'advanced';

/** Theme values a tenant may change in a future editor phase (custom property name without `--lz-`). */
export type EditableToken =
  | `color-${ColorToken}`
  | 'radius-pill'
  | 'radius-card';

export interface TierSpec {
  /** Inclusive range of counted sections (see UNCOUNTED_SLOTS). */
  countedMin: number;
  countedMax: number;
  requiredRoles: readonly Role[];
  optionalRoles: readonly Role[];
  /** Max similarity against templates of the same vertical and tier. */
  similarityLimit: number;
  /** What the publisher emits in <head>; see docs/template-tiers.md. */
  seoProfile: SeoProfile;
  /** Only tenants with this tier's subscription may use the template (enforced outside the kit). */
  exclusive: boolean;
  /** Emitted in template.meta.json for the editor; nothing in the kit reads it. */
  editableTokens: readonly EditableToken[];
}

/** `floating-whatsapp` belongs to the footer and `marquee` is decorative: neither counts as a section. */
export const UNCOUNTED_SLOTS: ReadonlySet<string> = new Set([
  'floating-whatsapp',
  'marquee',
]);

export const TIERS = {
  basic: {
    countedMin: 6,
    countedMax: 7,
    requiredRoles: [
      'header',
      'hero',
      'catalog',
      'contact',
      'faq',
      'footer',
      'whatsapp',
    ],
    optionalRoles: ['about'],
    // Basic templates are skins of one shared structure on purpose.
    similarityLimit: 0.85,
    seoProfile: 'basic',
    exclusive: false,
    editableTokens: ['color-accent'],
  },
  pro: {
    countedMin: 8,
    countedMax: 10,
    requiredRoles: [
      'header',
      'hero',
      'about',
      'catalog',
      'proof',
      'testimonials',
      'faq',
      'contact',
      'footer',
      'whatsapp',
    ],
    optionalRoles: ['team', 'marquee'],
    similarityLimit: 0.5,
    seoProfile: 'advanced',
    exclusive: true,
    editableTokens: [
      ...COLOR_TOKENS.map((t): EditableToken => `color-${t}`),
      'radius-pill',
      'radius-card',
    ],
  },
} as const satisfies Record<Tier, TierSpec>;

export function isTier(value: unknown): value is Tier {
  return (TIER_NAMES as readonly unknown[]).includes(value);
}

export function tierRoles(tier: Tier): Role[] {
  return [...TIERS[tier].requiredRoles, ...TIERS[tier].optionalRoles];
}

export function countedSlots(slots: readonly string[]): string[] {
  return slots.filter((slot) => !UNCOUNTED_SLOTS.has(slot));
}
