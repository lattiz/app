import type { Manifest, Theme } from '../types';
import { fontFamilyName } from './theme';

export const SIMILARITY_LIMIT = 0.6;

export interface Fingerprint {
  id: string;
  vertical: string;
  pairs: string[];
  order: string[];
  theme: string;
  fonts: string;
}

export function fingerprint(manifest: Manifest, theme: Theme): Fingerprint {
  return {
    id: manifest.id,
    vertical: manifest.vertical,
    pairs: manifest.sections.map((s) => `${s.slot}:${s.variant}`),
    order: manifest.sections.map((s) => s.slot),
    theme: manifest.theme,
    fonts: `${fontFamilyName(theme.fonts.display)} + ${fontFamilyName(theme.fonts.body)}`,
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
  theme: number;
  fonts: number;
}

/**
 * 0.50 × Jaccard of slot+variant pairs + 0.10 × order agreement of shared slots (LCS)
 * + 0.25 × same theme + 0.15 × same display/body font pair.
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
  const theme = a.theme === b.theme ? 1 : 0;
  const fonts = a.fonts === b.fonts ? 1 : 0;
  const score = 0.5 * sections + 0.1 * order + 0.25 * theme + 0.15 * fonts;
  return {
    score: Math.round(score * 1000) / 1000,
    sections,
    order,
    theme,
    fonts,
  };
}
