import { asMap, frontMatter, parseYamlLite, type YamlValue } from './yaml-lite';
import type { TypeStep } from '../types';

/** Design tokens as Stitch names them (Material 3 flavored); the kit never inherits these names. */
export interface StitchTokens {
  /** Color role (primary, on-surface, surface-container-low…) → #rrggbb. */
  colors: Record<string, string>;
  typography: TypeStep[];
  radiiPx: Record<string, number>;
  spacing: Record<string, string>;
  /** Families named in Google Fonts <link> tags (the only proof of a Google source in HTML). */
  linkedFamilies: string[];
  source: 'design-md' | 'html';
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const px = (v: string | undefined): number | undefined => {
  const m = /^(-?[\d.]+)\s*(px|rem|em)?$/.exec((v ?? '').trim());
  if (!m) return undefined;
  const n = Number(m[1]);
  return m[2] === 'rem' || m[2] === 'em' ? n * 16 : n;
};

function roleOf(token: string): TypeStep['role'] {
  if (/^display/.test(token)) return 'display';
  if (/^(headline|title)/.test(token)) return 'headline';
  if (/^body/.test(token)) return 'body';
  if (/^(label|caption|data)/.test(token)) return 'label';
  return 'other';
}

function step(token: string, f: Record<string, string>): TypeStep | null {
  const sizePx = px(f.fontSize);
  if (!f.fontFamily || sizePx === undefined) return null;
  const em = /^(-?[\d.]+)em$/.exec(f.letterSpacing ?? '');
  return {
    token,
    role: roleOf(token),
    family: f.fontFamily,
    sizePx,
    ...(f.fontWeight ? { weight: Number(f.fontWeight) } : {}),
    ...(px(f.lineHeight) !== undefined
      ? { lineHeightPx: px(f.lineHeight) }
      : {}),
    ...(em ? { letterSpacingEm: Number(em[1]) } : {}),
  };
}

function flatStrings(map: Record<string, YamlValue>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map))
    if (typeof v === 'string') out[k] = v;
  return out;
}

export function tokensFromDesignMd(markdown: string): StitchTokens | null {
  const fm = frontMatter(markdown);
  if (!fm) return null;
  const doc = parseYamlLite(fm);
  const colors = Object.fromEntries(
    Object.entries(flatStrings(asMap(doc.colors))).filter(([, v]) =>
      HEX.test(v),
    ),
  );
  const typography = Object.entries(asMap(doc.typography)).flatMap(([t, v]) => {
    const s = step(t, flatStrings(asMap(v)));
    return s ? [s] : [];
  });
  if (Object.keys(colors).length === 0 && typography.length === 0) return null;
  const radiiPx = Object.fromEntries(
    Object.entries(flatStrings(asMap(doc.rounded))).flatMap(([k, v]) => {
      const n = px(v);
      return n === undefined ? [] : [[k, n] as const];
    }),
  );
  return {
    colors,
    typography,
    radiiPx,
    spacing: flatStrings(asMap(doc.spacing)),
    linkedFamilies: [],
    source: 'design-md',
  };
}

/** The object literal after `tailwind.config =`, turned into JSON without evaluating anything. */
function tailwindLiteral(html: string): unknown | null {
  const m =
    /<script[^>]*id=["']tailwind-config["'][^>]*>([\s\S]*?)<\/script>/i.exec(
      html,
    );
  if (!m) return null;
  const start = m[1].indexOf('{');
  const end = m[1].lastIndexOf('}');
  if (start < 0 || end < start) return null;
  const json = m[1]
    .slice(start, end + 1)
    .replace(/([{,]\s*)([A-Za-z_$][\w$-]*)\s*:/g, '$1"$2":')
    .replace(/,\s*([}\]])/g, '$1');
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const rec = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};

export function linkedGoogleFamilies(html: string): string[] {
  const out = new Set<string>();
  for (const m of html.matchAll(/fonts\.googleapis\.com\/css2\?([^"']+)/g))
    for (const f of m[1].replace(/&amp;/g, '&').matchAll(/family=([^:&@]+)/g))
      out.add(decodeURIComponent(f[1].replace(/\+/g, ' ')));
  // Material Symbols is an icon font, not a typeface the kit can use.
  out.delete('Material Symbols Outlined');
  return [...out];
}

export function tokensFromHtml(html: string): StitchTokens | null {
  const cfg = rec(rec(rec(tailwindLiteral(html)).theme).extend);
  const colors = Object.fromEntries(
    Object.entries(rec(cfg.colors)).filter(
      ([, v]) => typeof v === 'string' && HEX.test(v),
    ),
  ) as Record<string, string>;
  const families = rec(cfg.fontFamily);
  const typography = Object.entries(rec(cfg.fontSize)).flatMap(([t, v]) => {
    if (!Array.isArray(v)) return [];
    const [size, extra] = v as [string, Record<string, string>];
    const fam = Array.isArray(families[t]) ? String(families[t][0]) : undefined;
    const s = step(t, {
      ...rec(extra),
      fontSize: String(size),
      ...(fam ? { fontFamily: fam } : {}),
    } as Record<string, string>);
    return s ? [s] : [];
  });
  const radiiPx = Object.fromEntries(
    Object.entries(rec(cfg.borderRadius)).flatMap(([k, v]) => {
      const n = px(String(v));
      return n === undefined ? [] : [[k, n] as const];
    }),
  );
  const linkedFamilies = linkedGoogleFamilies(html);
  if (Object.keys(colors).length === 0 && typography.length === 0)
    return linkedFamilies.length
      ? {
          colors,
          typography,
          radiiPx,
          spacing: {},
          linkedFamilies,
          source: 'html',
        }
      : null;
  return {
    colors,
    typography,
    radiiPx,
    spacing: Object.fromEntries(
      Object.entries(rec(cfg.spacing)).map(([k, v]) => [k, String(v)]),
    ),
    linkedFamilies,
    source: 'html',
  };
}
