import type { Tier } from '../tiers';
import type { Manifest, Theme } from '../types';
import { hueOf } from './color';
import { tokenColor } from './theme';

export interface Fingerprint {
  id: string;
  vertical: string;
  tier: Tier;
  pairs: string[];
  order: string[];
  theme: string;
  fonts: string;
  /** radiusCard|radiusPill|border|shadow */
  shape: string;
  hero: string;
  services: string;
  /** Accent hue in degrees; null for a near-gray accent. */
  accentHue: number | null;
  /** Normalized hero headline (see normalizeHeadline). */
  headline: string;
}

/** Lowercase letters and digits only: "Corte de <b>lujo</b>.<br>Actitud" → "corte de lujo actitud". */
export function normalizeHeadline(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function fingerprint(
  manifest: Manifest,
  theme: Theme,
  headlineHtml: string,
): Fingerprint {
  const variantOf = (slot: string) =>
    manifest.sections.find((s) => s.slot === slot)?.variant ?? '';
  const accent = tokenColor(theme, 'accent');
  const hue = accent ? hueOf(accent) : null;
  const { radiusCard, radiusPill, border, shadow } = theme.shape;
  return {
    id: manifest.id,
    vertical: manifest.vertical,
    tier: manifest.tier,
    pairs: manifest.sections.map((s) => `${s.slot}:${s.variant}`),
    order: manifest.sections.map((s) => s.slot),
    theme: manifest.theme,
    fonts: theme.fontPair,
    shape: [radiusCard, radiusPill, border, shadow].join('|'),
    hero: variantOf('hero'),
    services: variantOf('services'),
    accentHue: hue && hue.chroma > 0.08 ? hue.hue : null,
    headline: normalizeHeadline(headlineHtml),
  };
}

function lcs(a: string[], b: string[]): number {
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export interface SimilarityBreakdown {
  score: number;
  sections: number;
  order: number;
  hero: number;
  services: number;
  theme: number;
  fonts: number;
  shape: number;
}

/** Weights of the structural + visual-identity similarity; they add up to 1. */
export const SIMILARITY_WEIGHTS = {
  sections: 0.25,
  order: 0.05,
  hero: 0.15,
  services: 0.1,
  theme: 0.15,
  fonts: 0.15,
  shape: 0.15,
} as const;

/**
 * Jaccard of slot+variant pairs, LCS order agreement of shared slots, and equality of hero
 * variant, services variant, theme, font pair and shape, weighted by SIMILARITY_WEIGHTS.
 */
export function similarity(
  a: Fingerprint,
  b: Fingerprint,
): SimilarityBreakdown {
  const pa = new Set(a.pairs);
  const pb = new Set(b.pairs);
  const shared = [...pa].filter((p) => pb.has(p));
  const union = new Set([...pa, ...pb]);
  const sections = union.size === 0 ? 0 : shared.length / union.size;
  const sharedSlots = new Set(shared.map((p) => p.split(':')[0]));
  const oa = a.order.filter((s) => sharedSlots.has(s));
  const ob = b.order.filter((s) => sharedSlots.has(s));
  const order = sharedSlots.size === 0 ? 0 : lcs(oa, ob) / sharedSlots.size;
  const same = (x: string, y: string) => (x !== '' && x === y ? 1 : 0);
  const parts = {
    sections,
    order,
    hero: same(a.hero, b.hero),
    services: same(a.services, b.services),
    theme: same(a.theme, b.theme),
    fonts: same(a.fonts, b.fonts),
    shape: same(a.shape, b.shape),
  };
  const score = (
    Object.keys(SIMILARITY_WEIGHTS) as (keyof typeof SIMILARITY_WEIGHTS)[]
  ).reduce((sum, k) => sum + SIMILARITY_WEIGHTS[k] * parts[k], 0);
  return { score: Math.round(score * 1000) / 1000, ...parts };
}
