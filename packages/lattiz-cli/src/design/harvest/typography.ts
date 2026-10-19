import { entireMetricsCollection } from '@capsizecss/metrics/entireMetricsCollection';
import type { TypographyDraft } from '../types';
import { existingPair } from '../promote/fonts';
import type { StitchTokens } from './tokens';

/** Icon webfonts: a dependency the kit never takes (icons are inline SVG). */
const ICON_FONTS =
  /(material (symbols|icons)|font ?awesome|icomoon|glyphicons)/i;

const hasMetrics = (family: string) =>
  Object.values(entireMetricsCollection).some((m) => m.familyName === family);

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
  const excluded = families.filter((f) => ICON_FONTS.test(f));
  const usable = families.filter(
    (f) => !UNSUPPORTED.test(f) && !ICON_FONTS.test(f),
  );
  const metrics = Object.fromEntries(usable.map((f) => [f, hasMetrics(f)]));
  const pair =
    display && body && display.family !== body.family
      ? existingPair(display.family, body.family)
      : undefined;
  const problems = [
    ...(!display || !body ? ['falta fuente de títulos o de texto'] : []),
    ...(display && body && display.family === body.family
      ? ['el kit usa dos familias distintas por página']
      : []),
    ...usable
      .filter((f) => !metrics[f])
      .map((f) => `sin métricas Capsize para ${f}`),
    ...families
      .filter((f) => UNSUPPORTED.test(f))
      .map((f) => `${f} no tiene fuente utilizable`),
  ];
  const radiusPx = t.radiiPx.DEFAULT ?? t.radiiPx.md;
  return {
    scale: [...t.typography].sort((a, b) => b.sizePx - a.sizePx),
    ...(display ? { displayFamily: display.family } : {}),
    ...(body ? { bodyFamily: body.family } : {}),
    googleFamilies: usable,
    unsupportedFamilies: families.filter((f) => UNSUPPORTED.test(f)),
    excludedFamilies: excluded,
    metrics,
    ...(pair ? { existingPair: pair } : {}),
    delivery: { ok: problems.length === 0, problems },
    ...(radiusPx !== undefined ? { radiusPx } : {}),
    ...(Object.keys(t.spacing).length ? { spacing: t.spacing } : {}),
  };
}
