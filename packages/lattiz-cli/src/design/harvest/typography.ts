import type { TypographyDraft } from '../types';
import type { StitchTokens } from './tokens';

/** Faces the kit can't ship (system or proprietary): never promoted. */
const UNSUPPORTED =
  /^(sf pro|sf mono|san francisco|google sans|product sans|helvetica|arial|system-ui|segoe|roboto flex?$|-apple-system|times)/i;

export function typographyFromTokens(t: StitchTokens): TypographyDraft {
  const byRole = (role: string) =>
    t.typography
      .filter((s) => s.role === role)
      .sort((a, b) => b.sizePx - a.sizePx);
  const display = byRole('display')[0] ?? byRole('headline')[0];
  const body = byRole('body')[0];
  const families = [
    ...new Set([...t.typography.map((s) => s.family), ...t.linkedFamilies]),
  ];
  const radiusPx = t.radiiPx.DEFAULT ?? t.radiiPx.md;
  return {
    scale: [...t.typography].sort((a, b) => b.sizePx - a.sizePx),
    ...(display ? { displayFamily: display.family } : {}),
    ...(body ? { bodyFamily: body.family } : {}),
    googleFamilies: families.filter((f) => !UNSUPPORTED.test(f)),
    unsupportedFamilies: families.filter((f) => UNSUPPORTED.test(f)),
    ...(radiusPx !== undefined ? { radiusPx } : {}),
    ...(Object.keys(t.spacing).length ? { spacing: t.spacing } : {}),
  };
}
