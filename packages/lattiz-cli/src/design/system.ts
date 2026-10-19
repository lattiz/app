import { DIRECTIONS } from '../../../template-kit/directions';
import type { ArtDirection } from '../../../template-kit/directions';
import { EXTENDED_FONT_PAIRS } from '../../../template-kit/font-pairs';
import { GIROS } from '../../../template-kit/giros';
import { EXTENDED_PALETTES } from '../../../template-kit/palettes';
import { SHAPE_RADII, TYPE_SCALES } from '../../../template-kit/src/lib/style';
import {
  FONT_PAIRS,
  type GiroPalette,
} from '../../../template-kit/src/spec/presets';
import {
  hueOf,
  parseColor,
  toHex,
  type Rgba,
} from '../../../template-kit/src/lib/color';
import { usage } from '../lib/errors';
import type { Runner } from './promote/kit';
import { entireMetricsCollection } from '@capsizecss/metrics/entireMetricsCollection';

/**
 * The Stitch design system we hand to the MCP: a DESIGN.md (YAML front matter + prose) generated
 * from an art direction, so candidates are born with our palette, type pair, shape and density.
 * Stitch is free to be creative inside it; the harvester maps whatever comes back to --lz-* tokens.
 */

const DENSITY = {
  airy: { sectionGap: '144px', gutter: '32px', stack: '28px' },
  regular: { sectionGap: '112px', gutter: '24px', stack: '20px' },
  compact: { sectionGap: '80px', gutter: '16px', stack: '14px' },
} as const;

/** Display size in px at "normal"; the direction's type scale multiplies it. */
const DISPLAY_BASE = 72;

const familyOf = (stack: string) =>
  /'([^']+)'/.exec(stack)?.[1] ?? stack.split(',')[0].trim();

export interface Resolved {
  giro: string;
  giroLabel: string;
  direction: ArtDirection;
  paletteId: string;
  palette: GiroPalette;
  fontPairId: string;
  display: string;
  body: string;
}

export function pickDirection(giro: string, id?: string): ArtDirection {
  if (id) {
    const d = DIRECTIONS[id];
    if (!d)
      throw usage(
        `Dirección desconocida: "${id}".`,
        `Direcciones: ${Object.keys(DIRECTIONS).join(', ')}`,
      );
    return d;
  }
  const all = Object.values(DIRECTIONS);
  return (
    all.find((d) => d.giros[0] === giro) ??
    all.find((d) => d.giros.includes(giro)) ??
    all[0]
  );
}

export type Rigor = 'loose' | 'tight';
export const RIGORS: Rigor[] = ['loose', 'tight'];

/** The direction on its own (no giro): the versioned file in design-library/stitch/_design-systems/. */
export function resolveDirection(directionId: string): Resolved {
  const direction = pickDirection('', directionId);
  const paletteId = direction.palettes.default.find(
    (p) => EXTENDED_PALETTES[p],
  );
  const fontPairId = direction.fontPairs.default.find(
    (p) => EXTENDED_FONT_PAIRS[p] ?? FONT_PAIRS[p],
  );
  if (!paletteId || !fontPairId)
    throw usage(
      `La dirección ${direction.id} no tiene paleta o par tipográfico utilizable.`,
    );
  const pair = EXTENDED_FONT_PAIRS[fontPairId] ?? FONT_PAIRS[fontPairId];
  return {
    giro: '',
    giroLabel: 'Local business',
    direction,
    paletteId,
    palette: EXTENDED_PALETTES[paletteId],
    fontPairId,
    display: familyOf(pair.display),
    body: familyOf(pair.body),
  };
}

export function resolveSystem(giro: string, directionId?: string): Resolved {
  const def = GIROS[giro];
  if (!def)
    throw usage(
      `Giro desconocido: "${giro}".`,
      `Giros: ${Object.keys(GIROS).join(', ')}`,
    );
  const direction = pickDirection(giro, directionId);
  const palettes =
    direction.palettes.byGiro?.[giro] ?? direction.palettes.default;
  const paletteId = palettes.find(
    (p) => EXTENDED_PALETTES[p] ?? def.palettes[p],
  );
  if (!paletteId)
    throw usage(`La dirección ${direction.id} no tiene paleta utilizable.`);
  const pairs =
    direction.fontPairs.byGiro?.[giro] ?? direction.fontPairs.default;
  const fontPairId = pairs.find((p) => EXTENDED_FONT_PAIRS[p] ?? FONT_PAIRS[p]);
  if (!fontPairId)
    throw usage(`La dirección ${direction.id} no tiene par tipográfico.`);
  const pair = EXTENDED_FONT_PAIRS[fontPairId] ?? FONT_PAIRS[fontPairId];
  return {
    giro,
    giroLabel: def.label,
    direction,
    paletteId,
    palette: EXTENDED_PALETTES[paletteId] ?? def.palettes[paletteId],
    fontPairId,
    display: familyOf(pair.display),
    body: familyOf(pair.body),
  };
}

/** line tokens are color-mix() expressions; Stitch needs hex, so blend text over the ground. */
function solid(value: string, text: string, bg: string): string {
  const direct = parseColor(value);
  if (direct && /^#/.test(value.trim())) return toHex(direct);
  const w = Number(/(\d+)%/.exec(value)?.[1] ?? 20) / 100;
  const [a, b] = [parseColor(text), parseColor(bg)] as [Rgba, Rgba];
  return toHex({
    r: a.r * w + b.r * (1 - w),
    g: a.g * w + b.g * (1 - w),
    b: a.b * w + b.b * (1 - w),
    a: 1,
  });
}

/** Warm = reds to yellows (and magentas); everything else reads cool. Neutrals count as cool. */
const warm = (hex: string) => {
  const c = parseColor(hex);
  if (!c) return false;
  const { hue, chroma } = hueOf(c);
  return chroma > 0.08 && (hue < 70 || hue >= 320);
};

const px = (n: number) => `${Math.round(n)}px`;

export function buildDesignMd(r: Resolved, rigor: Rigor = 'loose'): string {
  const { direction: d, palette: p } = r;
  const c = p.colors;
  const radii = SHAPE_RADII[d.style.shape];
  const dens =
    DENSITY[
      d.style.density === 'airy'
        ? 'airy'
        : d.style.density === 'compact'
          ? 'compact'
          : 'regular'
    ];
  const k = TYPE_SCALES[d.style.typeScale].display;
  const display = DISPLAY_BASE * k;
  const rounded = (v: string) => (v === '0px' ? '0px' : v);
  const yaml = [
    '---',
    `name: ${r.giroLabel} · ${d.name}`,
    'colors:',
    `  background: '${c.bg}'`,
    `  surface: '${c.bg}'`,
    `  surface-container-low: '${c.surface}'`,
    `  surface-container-high: '${c['surface-2']}'`,
    `  on-background: '${c.text}'`,
    `  on-surface: '${c.text}'`,
    `  on-surface-variant: '${c.muted}'`,
    `  outline: '${solid(c['line-strong'], c.text, c.bg)}'`,
    `  outline-variant: '${solid(c.line, c.text, c.bg)}'`,
    `  primary: '${c.accent}'`,
    `  on-primary: '${c['on-accent']}'`,
    `  tertiary: '${c['accent-text']}'`,
    'typography:',
    '  display-lg:',
    `    fontFamily: ${r.display}`,
    `    fontSize: ${px(display)}`,
    `    fontWeight: '700'`,
    `    lineHeight: ${px(display * 1.08)}`,
    '  headline-md:',
    `    fontFamily: ${r.display}`,
    `    fontSize: ${px(display * 0.5)}`,
    `    fontWeight: '600'`,
    `    lineHeight: ${px(display * 0.58)}`,
    '  body-lg:',
    `    fontFamily: ${r.body}`,
    `    fontSize: 20px`,
    `    fontWeight: '400'`,
    `    lineHeight: 32px`,
    '  body-md:',
    `    fontFamily: ${r.body}`,
    `    fontSize: 16px`,
    `    fontWeight: '400'`,
    `    lineHeight: 26px`,
    '  label-caps:',
    `    fontFamily: ${r.body}`,
    `    fontSize: 14px`,
    `    fontWeight: '600'`,
    `    lineHeight: 20px`,
    `    letterSpacing: 0.08em`,
    'rounded:',
    `  sm: ${rounded(radii.inner)}`,
    `  DEFAULT: ${rounded(radii.card)}`,
    `  lg: ${rounded(radii.img)}`,
    `  full: 9999px`,
    'spacing:',
    '  container-max: 1200px',
    `  gutter: ${dens.gutter}`,
    `  section-gap: ${dens.sectionGap}`,
    `  stack-md: ${dens.stack}`,
    '---',
  ].join('\n');
  const faceStyle = (family: string) => {
    const cat = Object.values(entireMetricsCollection).find(
      (m) => m.familyName === family,
    )?.category;
    return cat === 'serif'
      ? 'an editorial serif'
      : cat === 'display' || cat === 'handwriting'
        ? 'an expressive display face'
        : 'a clean grotesque or humanist sans';
  };
  const scheme = p.scheme === 'dark' ? 'dark' : 'light';
  const palette =
    rigor === 'tight'
      ? `Use exactly these colors: ground ${c.bg}, text ${c.text}, accent ${c.accent} (as text: ${c['accent-text']}). Do not introduce other hues.`
      : `Starting palette: ground ${c.bg}, text ${c.text}, accent ${c.accent} (as text: ${c['accent-text']}). You may propose closely related variants (shift tone or saturation) as long as the mood stays ${scheme} and ${warm(c.accent) ? 'warm' : 'cool'}. Neutral accents are welcome.`;
  const type =
    rigor === 'tight'
      ? `Use exactly ${r.display} for headlines and ${r.body} for everything else.`
      : `One display face for headlines (like ${r.display}: ${faceStyle(r.display)}) and one body face (like ${r.body}: ${faceStyle(r.body)}). These are examples of the style, not a closed list: any similar Google Fonts pair works.`;
  const prose = `
## Brand & Style

Direction intent (es-MX): ${d.intent}

Art direction "${d.name}" for a Mexican ${r.giro ? r.giroLabel.toLowerCase() : 'local business'}. Surfaces are ${d.style.surface}, corners ${d.style.shape}, spacing ${d.style.density}, dividers ${d.style.divider}, photos ${d.style.imageTreatment}. Buttons are ${d.primitives.button}, cards ${d.primitives.card}, quotes ${d.primitives.quote}.
Rigor: ${rigor}. ${rigor === 'loose' ? 'Explore: the tokens above are a guide, not a straitjacket.' : 'Stay strictly inside the palette and typography below.'}

## Colors

${palette} Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

${type} Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

## Layout

12-column grid. One long page: header, hero, about, services with prices, testimonials, FAQ, contact, footer. Bento grids, overlapping elements and stacked cards are welcome when the direction calls for them. ${d.style.density === 'airy' ? 'Generous whitespace.' : d.style.density === 'compact' ? 'Dense and efficient.' : 'Balanced spacing.'}

## Hard constraints (Lattiz kit; these are strict so the harvester can map the design)

- No gradients as the background of primary text; text always at high contrast.
- Icons are inline SVG only: no icon webfonts (no Material Symbols, no Font Awesome).
- Semantic structure by section: header, hero (one h1), social proof, features or services, testimonials, FAQ, CTA, contact, footer.
- Single-column layout on mobile.
- No forms or input fields: contact is a WhatsApp button, a phone link and an email link.
- No carousels, sliders, video, iframes or canvas.
- No real brand copy and no images of specific, identifiable real people; every image is a replaceable placeholder.
- All copy in Mexican Spanish (es-MX), with the tone: ${d.voice.register}
`;
  return `${yaml}\n\n${prose.trim()}\n`;
}

export function buildPrompt(
  r: Resolved,
  brief?: string,
  rigor: Rigor = 'loose',
): string {
  const d = r.direction;
  return [
    `Design a single-page landing for a Mexican ${r.giroLabel.toLowerCase()} using the attached design system.`,
    `Sections in order: header with a WhatsApp call-to-action, hero (one h1, one primary action), about, services with example prices, testimonials, FAQ (all answers visible), contact (WhatsApp, phone, email, address), footer.`,
    `Voice: ${d.voice.register} Example headline: "${d.voice.headline}". Primary action: "${d.voice.cta}". Avoid: ${d.voice.avoid.join(', ')}.`,
    `Rigor ${rigor}: ${rigor === 'loose' ? 'explore within the mood of the design system; variants of its palette are welcome.' : 'follow the design system exactly.'}`,
    'Copy in Mexican Spanish. Fictitious business, no real brands or real people. No forms, carousels, video or icon fonts; icons as inline SVG.',
    ...(brief ? ['', 'Brief:', brief.trim()] : []),
  ].join('\n');
}

/** `--direccion unused`: the direction the giro's templates use least (spec locks), best fit first. */
export function unusedDirection(giro: string, info: Runner): string {
  const r = info(['giro', 'show', giro, '--json']);
  if (r.status !== 0)
    throw usage(
      'No pude leer los datos del giro para elegir una dirección sin usar.',
    );
  const dirs = (
    JSON.parse(r.out) as { directions: { id: string; used: number }[] }
  ).directions;
  const least = Math.min(...dirs.map((d) => d.used));
  return dirs.find((d) => d.used === least)!.id;
}
