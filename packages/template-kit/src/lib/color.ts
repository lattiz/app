/** Minimal CSS color math: parse, resolve `var()`/`color-mix()`, composite and WCAG contrast. */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const NAMED: Record<string, Rgba> = {
  black: { r: 0, g: 0, b: 0, a: 1 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  transparent: { r: 0, g: 0, b: 0, a: 0 },
};

/** Every CSS named color; matched as whole words when hunting literals. */
export const CSS_NAMED_COLORS = [
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
] as const;

export type VarResolver = (name: string) => string | undefined;

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, n));
}

function parseHex(hex: string): Rgba | null {
  const h = hex.slice(1);
  if (![3, 4, 6, 8].includes(h.length) || !/^[0-9a-f]+$/i.test(h)) return null;
  const full = h.length <= 4 ? [...h].map((c) => c + c).join('') : h;
  const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 };
}

function parseAlpha(raw: string | undefined): number {
  if (raw === undefined) return 1;
  const v = raw.trim();
  return v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v);
}

function parseRgbFn(args: string): Rgba | null {
  const [main, slashAlpha] = args.split('/');
  const parts = main.split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const channel = (p: string) =>
    clamp255(p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p));
  return {
    r: channel(parts[0]),
    g: channel(parts[1]),
    b: channel(parts[2]),
    a: parseAlpha(slashAlpha ?? parts[3]),
  };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function parseHslFn(args: string): Rgba | null {
  const [main, slashAlpha] = args.split('/');
  const parts = main.split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const [r, g, b] = hslToRgb(
    parseFloat(parts[0]),
    parseFloat(parts[1]) / 100,
    parseFloat(parts[2]) / 100,
  );
  return { r, g, b, a: parseAlpha(slashAlpha ?? parts[3]) };
}

/** Splits on top-level commas only (ignores commas nested in parentheses). */
export function splitTopLevel(value: string, sep = ','): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === sep && depth === 0) {
      out.push(current.trim());
      current = '';
    } else current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function parseMixPart(part: string): { color: string; pct?: number } {
  const m = /^(.*?)(?:\s+(\d+(?:\.\d+)?)%)?$/.exec(part.trim());
  const pctFirst = /^(\d+(?:\.\d+)?)%\s+(.*)$/.exec(part.trim());
  if (pctFirst) return { color: pctFirst[2], pct: parseFloat(pctFirst[1]) };
  return { color: m?.[1] ?? part, pct: m?.[2] ? parseFloat(m[2]) : undefined };
}

/** Implements `color-mix(in srgb, …)` with premultiplied alpha, as browsers do. */
function mixSrgb(a: Rgba, pa: number, b: Rgba, pb: number): Rgba {
  const total = pa + pb;
  const wa = pa / total;
  const wb = pb / total;
  const alpha = a.a * wa + b.a * wb;
  const premul = (ca: number, cb: number) =>
    alpha === 0 ? 0 : (ca * a.a * wa + cb * b.a * wb) / alpha;
  const scale = Math.min(1, total / 100);
  return {
    r: premul(a.r, b.r),
    g: premul(a.g, b.g),
    b: premul(a.b, b.b),
    a: alpha * scale,
  };
}

/** Parses a CSS color expression; `var(--x)` is resolved through `resolveVar`. */
export function parseColor(
  input: string,
  resolveVar?: VarResolver,
  depth = 0,
): Rgba | null {
  if (depth > 10) return null;
  const value = input.trim().toLowerCase();
  if (value.startsWith('#')) return parseHex(value);
  if (NAMED[value]) return NAMED[value];
  const fn = /^([a-z-]+)\((.*)\)$/s.exec(value);
  if (!fn) return null;
  const [, name, args] = fn;
  if (name === 'rgb' || name === 'rgba') return parseRgbFn(args);
  if (name === 'hsl' || name === 'hsla') return parseHslFn(args);
  if (name === 'var') {
    const [varName, fallback] = splitTopLevel(args);
    const resolved = resolveVar?.(varName.trim()) ?? fallback;
    return resolved ? parseColor(resolved, resolveVar, depth + 1) : null;
  }
  if (name === 'color-mix') {
    const [space, first, second] = splitTopLevel(args);
    if (!/^in\s+srgb$/.test(space ?? '') || !first || !second) return null;
    const p1 = parseMixPart(first);
    const p2 = parseMixPart(second);
    const c1 = parseColor(p1.color, resolveVar, depth + 1);
    const c2 = parseColor(p2.color, resolveVar, depth + 1);
    if (!c1 || !c2) return null;
    const pa = p1.pct ?? (p2.pct !== undefined ? 100 - p2.pct : 50);
    const pb = p2.pct ?? 100 - pa;
    return mixSrgb(c1, pa, c2, pb);
  }
  return null;
}

/** Source-over composite of `top` onto an opaque `bottom`. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  };
}

function luminance({ r, g, b }: Rgba): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(fg: Rgba, bg: Rgba): number {
  const opaqueBg =
    bg.a < 1 ? composite(bg, { r: 255, g: 255, b: 255, a: 1 }) : bg;
  const opaqueFg = fg.a < 1 ? composite(fg, opaqueBg) : fg;
  const l1 = luminance(opaqueFg);
  const l2 = luminance(opaqueBg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function toHex({ r, g, b }: Rgba): string {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

const LITERAL_FN_RE = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const HEX_RE = /#[0-9a-f]{3,8}\b/gi;
const NAMED_RE = new RegExp(
  String.raw`(?<![\w-])(?:${CSS_NAMED_COLORS.join('|')})(?![\w-])`,
  'gi',
);

/** Returns the color literals found in a CSS value, ignoring strings, url() and custom property names. */
export function findColorLiterals(value: string): string[] {
  const cleaned = value
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, '""')
    .replace(/url\([^)]*\)/gi, 'url()')
    .replace(/--[\w-]+/g, '--x');
  const found: string[] = [];
  for (const m of cleaned.matchAll(HEX_RE)) found.push(m[0]);
  const fn = LITERAL_FN_RE.exec(cleaned);
  if (fn) found.push(`${fn[0]}…)`);
  for (const m of cleaned.matchAll(NAMED_RE)) found.push(m[0]);
  return found;
}

/** HSL hue in degrees (0–360) and chroma (0–1); hue is meaningless when chroma is ~0. */
export function hueOf({ r, g, b }: Rgba): { hue: number; chroma: number } {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const chroma = max - min;
  if (chroma === 0) return { hue: 0, chroma };
  let hue: number;
  if (max === rn) hue = ((gn - bn) / chroma) % 6;
  else if (max === gn) hue = (bn - rn) / chroma + 2;
  else hue = (rn - gn) / chroma + 4;
  return { hue: (hue * 60 + 360) % 360, chroma };
}

/** Shortest distance between two hues on the color wheel (0–180). */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}
