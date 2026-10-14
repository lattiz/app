import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { ARCHETYPES } from '../../archetypes';
import { DIRECTIONS, type ArtDirection } from '../../directions';
import { GIROS } from '../../giros';
import { EXTENDED_PALETTES } from '../../palettes';
import { primitiveChoiceProblems } from '../../primitives';
import { contrastRatio, hueOf, parseColor } from '../lib/color';
import type { CompiledTemplate } from '../lib/compile';
import { KIT_ROOT, paths } from '../lib/paths';
import { styleProblems } from '../lib/style';
import { fontPairById, isLegacyVariant } from './catalog';

/**
 * Art directions: validation of the registry (directions/) and the taste rules a compiled template
 * is checked against. Dial → preset mappings follow docs/template-kit-design-principles.md §1.
 */

export function densityFromDial(n: number): 'airy' | 'cozy' | 'compact' {
  return n <= 3 ? 'airy' : n <= 6 ? 'cozy' : 'compact';
}

export function motionFromDial(n: number): 'none' | 'calm' | 'editorial' {
  return n <= 3 ? 'none' : n <= 5 ? 'calm' : 'editorial';
}

/** Heroes that center the composition (dial rule: variance > 4 avoids them). */
export const CENTERED_HEROES = new Set(['centered-arch']);

function heroVariants(): Set<string> {
  return new Set(
    readdirSync(resolve(paths.sections, 'hero'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );
}

/** Basic-eligible hero: legacy heroes serve both tiers; an extended one needs `basic` in meta.tiers. */
function heroTiers(variant: string): string[] {
  if (isLegacyVariant('hero', variant)) return ['basic', 'pro'];
  const metaFile = resolve(paths.sections, 'hero', variant, 'meta.ts');
  const text = existsSync(metaFile) ? readFileSync(metaFile, 'utf8') : '';
  const m = /tiers:\s*\[([^\]]*)\]/.exec(text);
  return m ? [...m[1].matchAll(/'(basic|pro)'/g)].map((x) => x[1]) : [];
}

const WHITE = { r: 255, g: 255, b: 255, a: 1 };
const BLACK = { r: 0, g: 0, b: 0, a: 1 };
/** Dark ground: white text contrasts more than black text. */
const isDark = (bg: string) => {
  const c = parseColor(bg);
  return c ? contrastRatio(WHITE, c) > contrastRatio(BLACK, c) : false;
};
const isNeutral = (accent: string) => {
  const c = parseColor(accent);
  return c ? hueOf(c).chroma <= 0.08 : false;
};
const isSerif = (display: string) =>
  /\bserif\s*$/.test(display.trim()) && !/sans-serif\s*$/.test(display.trim());

/** Problems with one direction; empty when it is valid. */
export function directionProblems(d: ArtDirection): string[] {
  const out: string[] = [];
  const where = `directions/${d.id}.ts`;
  const push = (m: string) => out.push(`${where}: ${m}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id))
    push('id con minúsculas y guiones');
  if (d.voice.rules.length < 3 || d.voice.rules.length > 5)
    push('voice.rules lleva de 3 a 5 reglas');
  const lists = [d.palettes.default, ...Object.values(d.palettes.byGiro ?? {})];
  for (const list of lists)
    for (const id of list) {
      const p = EXTENDED_PALETTES[id];
      if (!p) {
        push(`paleta desconocida: ${id}`);
        continue;
      }
      if (d.rules.includes('scheme:light') && p.scheme !== 'light')
        push(`la paleta ${id} es oscura y la dirección exige scheme:light`);
      if (d.rules.includes('scheme:dark') && p.scheme !== 'dark')
        push(`la paleta ${id} es clara y la dirección exige scheme:dark`);
      if (d.rules.includes('accent:neutral') && !isNeutral(p.colors.accent))
        push(
          `la paleta ${id} tiene acento de color y la dirección exige accent:neutral`,
        );
    }
  for (const list of [
    d.fontPairs.default,
    ...Object.values(d.fontPairs.byGiro ?? {}),
  ])
    for (const id of list) {
      const f = fontPairById(id);
      if (!f) push(`par tipográfico desconocido: ${id}`);
      else if (d.rules.includes('display:serif') && !isSerif(f.display))
        push(`el par ${id} no tiene display serif`);
    }
  for (const giro of [
    ...d.giros,
    ...Object.keys(d.palettes.byGiro ?? {}),
    ...Object.keys(d.fontPairs.byGiro ?? {}),
  ])
    if (!GIROS[giro]) push(`giro desconocido: ${giro}`);
  for (const a of d.archetypes)
    if (!ARCHETYPES[a]) push(`arquetipo desconocido: ${a}`);
  const heroes = heroVariants();
  for (const tier of ['pro', 'basic'] as const)
    for (const h of d.heroes[tier]) {
      if (!heroes.has(h)) push(`portada desconocida: hero/${h}`);
      else if (!heroTiers(h).includes(tier))
        push(`hero/${h} no está hecha para ${tier}`);
      if (CENTERED_HEROES.has(h) && d.dials.variance > 4)
        push(
          `hero/${h} es centrada y la variación es ${d.dials.variance} (> 4)`,
        );
    }
  out.push(...styleProblems(d.style, `${where} style`));
  out.push(...primitiveChoiceProblems(d.primitives, `${where} primitives`));
  for (const [k, v] of Object.entries(d.dials))
    if (!Number.isInteger(v) || v < 1 || v > 10)
      push(`dials.${k} va de 1 a 10`);
  if (d.motion !== motionFromDial(d.dials.motion))
    push(
      `motion «${d.motion}» no corresponde al dial de movimiento ${d.dials.motion} (${motionFromDial(d.dials.motion)})`,
    );
  if (d.style.density !== densityFromDial(d.dials.density))
    push(
      `style.density «${d.style.density}» no corresponde al dial de densidad ${d.dials.density} (${densityFromDial(d.dials.density)})`,
    );
  if (d.rules.includes('display:upper') && d.style.displayCase !== 'upper')
    push('display:upper exige style.displayCase upper');
  return out;
}

/** Style + primitive choices that differ between two directions (out of 15). */
export function directionDistance(a: ArtDirection, b: ArtDirection): number {
  const keys = Object.keys(a.style) as (keyof ArtDirection['style'])[];
  const prims = Object.keys(
    a.primitives,
  ) as (keyof ArtDirection['primitives'])[];
  return (
    keys.filter((k) => a.style[k] !== b.style[k]).length +
    prims.filter((k) => a.primitives[k] !== b.primitives[k]).length
  );
}

/** Two directions must read apart: ≥ 6 different style/primitive choices and their own first palette and pair. */
export const MIN_DIRECTION_DISTANCE = 6;

export function registryProblems(
  all: Record<string, ArtDirection> = DIRECTIONS,
): string[] {
  const out = Object.values(all).flatMap(directionProblems);
  const list = Object.values(all);
  for (let i = 0; i < list.length; i += 1)
    for (let j = i + 1; j < list.length; j += 1) {
      const [a, b] = [list[i], list[j]];
      const d = directionDistance(a, b);
      if (d < MIN_DIRECTION_DISTANCE)
        out.push(
          `${a.id} y ${b.id} se parecen demasiado: ${d} elecciones distintas (mínimo ${MIN_DIRECTION_DISTANCE})`,
        );
      if (a.palettes.default[0] === b.palettes.default[0])
        out.push(`${a.id} y ${b.id} empiezan con la misma paleta`);
      if (a.fontPairs.default[0] === b.fontPairs.default[0])
        out.push(`${a.id} y ${b.id} empiezan con el mismo par tipográfico`);
    }
  return out;
}

/** A palette the direction's rules accept (the compiler's fallback when its own list runs out). */
export function directionAcceptsPalette(
  d: ArtDirection,
  p: { scheme: string; colors: { accent: string } },
): boolean {
  if (d.rules.includes('scheme:light') && p.scheme !== 'light') return false;
  if (d.rules.includes('scheme:dark') && p.scheme !== 'dark') return false;
  if (d.rules.includes('accent:neutral') && !isNeutral(p.colors.accent))
    return false;
  return true;
}

/** A font pair the direction's rules accept. */
export function directionAcceptsFont(
  d: ArtDirection,
  f: { display: string },
): boolean {
  return !d.rules.includes('display:serif') || isSerif(f.display);
}

/** Lists ordered for a giro: `byGiro` when present, else the default list. */
export function directionPalettes(d: ArtDirection, giro: string): string[] {
  return d.palettes.byGiro?.[giro] ?? d.palettes.default;
}
export function directionFontPairs(d: ArtDirection, giro: string): string[] {
  return d.fontPairs.byGiro?.[giro] ?? d.fontPairs.default;
}

export interface DirectionFinding {
  rule: string;
  message: string;
}

/**
 * The direction's taste rules on a compiled template. `no-gradients` reads the CSS the direction
 * controls (primitives and extended variants); the functional scrims of three legacy variants
 * (hero/image-bg, gallery/grid, services/price-list) are exempt.
 */
export function directionFindings(
  c: CompiledTemplate,
  d: ArtDirection,
): DirectionFinding[] {
  const out: DirectionFinding[] = [];
  const t = c.theme;
  if (d.rules.includes('scheme:light') && isDark(t.colors.bg))
    out.push({
      rule: 'scheme:light',
      message: `fondo oscuro (${t.colors.bg})`,
    });
  if (d.rules.includes('scheme:dark') && !isDark(t.colors.bg))
    out.push({ rule: 'scheme:dark', message: `fondo claro (${t.colors.bg})` });
  if (
    d.rules.includes('display:upper') &&
    t.fonts.displayTransform !== 'uppercase'
  )
    out.push({
      rule: 'display:upper',
      message: 'el display no va en mayúsculas',
    });
  if (d.rules.includes('display:serif') && !isSerif(t.fonts.display))
    out.push({
      rule: 'display:serif',
      message: `display sin serif (${t.fonts.display})`,
    });
  if (d.rules.includes('accent:neutral') && !isNeutral(t.colors.accent))
    out.push({
      rule: 'accent:neutral',
      message: `acento de color (${t.colors.accent})`,
    });
  if (d.rules.includes('no-gradients')) {
    const files = [
      ...c.primitives.files.map((f) => resolve(KIT_ROOT, f)),
      ...c.sections
        .filter((s) => !isLegacyVariant(s.slot, s.variant))
        .map((s) => s.cssFile),
    ];
    for (const f of files)
      if (existsSync(f) && /gradient\(/.test(readFileSync(f, 'utf8')))
        out.push({
          rule: 'no-gradients',
          message: `degradado en ${relative(KIT_ROOT, f)}`,
        });
  }
  return out;
}
