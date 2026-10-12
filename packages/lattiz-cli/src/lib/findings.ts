/**
 * `check --json` findings: one row per FAIL/WARN item with the section it sits in and, for
 * templates generated from a spec, which spec field to change (`specHint`). The skill fixes
 * templates only through the spec, so the hint names spec paths, never generated files.
 */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadBlueprint } from '../../../template-kit/src/lib/load';
import { COPY_LIMITS } from '../../../template-kit/src/spec/copy-lint';
import { allowedVariants } from '../../../template-kit/src/spec/compile';
import type { Role } from '../../../template-kit/src/tiers';
import type { Status } from './ui';
import { KIT } from './paths';
import type { DistMeta } from './templates';

export interface Finding {
  rule: string;
  severity: 'FAIL' | 'WARN';
  viewport: string;
  section: string | null;
  variant: string | null;
  selector: string | null;
  message: string;
  /** Spec field or section change that should fix it; null when the spec can't (pipeline, variant style). */
  specHint: string | null;
}

interface ResultLike {
  rule: string;
  viewport: string;
  status: Status;
  detail: string;
  items: string[];
}

const KIT_RULE_HINT: [RegExp, (tier: string) => string][] = [
  [
    /unique-headline/,
    (t) =>
      `${t === 'basico' ? 'overrides.basico.copy.hero.title' : 'copy.hero.title'} (o copy.hero.alternates[]): el titular ya existe en el giro`,
  ],
  [
    /accent-hue|unique-theme|theme-ownership/,
    (t) =>
      `brand.palette${t === 'basico' ? ' / overrides.basico.brand.palette' : ''}: otra paleta libre del giro (lattiz giro show)`,
  ],
  [
    /unique-font-pair/,
    (t) =>
      `brand.fontPair${t === 'basico' ? ' / overrides.basico.brand.fontPair' : ''}: otra tipografía libre del giro`,
  ],
  [
    /unique-hero/,
    (t) =>
      `sections.${t} → { "role": "hero", "variant": … } (otra portada) o quita la variante fija`,
  ],
  [
    /similarity/,
    (t) =>
      `sections.${t}: cambia variantes (services, about, footer, navbar, testimonials) o deja que el compilador las elija`,
  ],
  [
    /contrast/,
    (t) =>
      `brand.palette${t === 'basico' ? ' / overrides.basico.brand.palette' : ''}: la paleta propia no pasa AA; usa una curada`,
  ],
  [
    /counted|required-role|tier/,
    (t) => `sections.${t}: roles y número de secciones (lattiz giro show)`,
  ],
];

async function otherVariants(
  tier: 'basic' | 'pro',
  role: string,
  slot: string,
  current: string,
): Promise<string[]> {
  try {
    const blueprint = await loadBlueprint('service-landing', tier);
    return allowedVariants(blueprint, role as Role, slot).filter(
      (v) => v !== current,
    );
  } catch {
    const dir = resolve(KIT, 'sections', slot);
    return existsSync(dir) ? readdirSync(dir).filter((v) => v !== current) : [];
  }
}

/** Splits `hero › p.lz-hero-split__eyebrow — 12 px` / `hero — contentHeight …` / axe `.sel — msg`. */
function parseItem(
  item: string,
  meta: DistMeta | null,
): { section: string | null; selector: string | null; message: string } {
  const [head, ...rest] = item.split(' — ');
  const message = rest.join(' — ') || head;
  const arrow = head.split(' › ');
  if (arrow.length > 1)
    return { section: arrow[0], selector: arrow.slice(1).join(' › '), message };
  if (meta?.slots.some((s) => s.slot === head))
    return { section: head, selector: null, message };
  // axe selectors: find the slot by its BEM block (lz-<slot>-<variant>).
  const slot =
    meta?.slots.find((s) => head.includes(`lz-${s.slot}-${s.variant}`))?.slot ??
    meta?.slots.find((s) => new RegExp(`lz-${s.slot}\\b`).test(head))?.slot ??
    null;
  return { section: slot, selector: rest.length ? head : null, message };
}

export async function buildFindings(
  results: ResultLike[],
  meta: DistMeta | null,
  spec: { stem: string; tier: 'pro' | 'basico'; twin: boolean } | null,
): Promise<Finding[]> {
  const out: Finding[] = [];
  const t = spec?.tier ?? 'pro';
  // In a twin, copy.* changes both tiers; the Básico's own copy lives in overrides.basico.copy.
  const cp = (path: string) =>
    spec?.twin && t === 'basico'
      ? `overrides.basico.copy.${path}`
      : `copy.${path}`;
  const slotOf = (section: string | null) =>
    meta?.slots.find((s) => s.slot === section) ?? null;
  for (const r of results) {
    if (r.status !== 'FAIL' && r.status !== 'WARN') continue;
    const items = r.items.length ? r.items : [r.detail];
    for (const item of items) {
      const { section, selector, message } = parseItem(item, meta);
      const s = slotOf(section);
      let hint: string | null = null;
      switch (r.rule) {
        case 'fit': {
          const alts = s
            ? await otherVariants(meta!.tier, s.role, s.slot, s.variant)
            : [];
          hint = `${cp(`${section}.title`)} (≤ ${COPY_LIMITS[`${section}.title`] ?? 56} caracteres; ideal ≤ 40) y ${cp(`${section}.text`)} más cortos; o brand.rhythm.titleHero más chico; si no basta: sections.${t} → { "role": "${s?.role ?? 'hero'}", "variant": "${alts[0] ?? '…'}" }`;
          break;
        }
        case 'overflow': {
          const alts = s
            ? await otherVariants(meta!.tier, s.role, s.slot, s.variant)
            : [];
          hint = s
            ? `${cp(s.slot)}: acorta textos y palabras largas; o sections.${t} → { "role": "${s.role}", "variant": "${alts[0] ?? '…'}" }`
            : null;
          break;
        }
        case 'contrast':
          hint = `brand.palette${t === 'basico' ? ' (o overrides.basico.brand.palette)' : ''}: otra paleta curada del giro; las curadas pasan AA`;
          break;
        case 'alt':
          hint = section
            ? `${cp(section)}: imageAlt / items[].alt / members[].imageAlt`
            : null;
          break;
        case 'head':
          hint = `${cp('head.title')} y ${cp('head.description')}`;
          break;
        case 'motion':
          hint =
            'motion.overrides: { "<slot o #id>": "<tipo>" } (lattiz motion <id> muestra los tipos)';
          break;
        case 'kit': {
          const match = KIT_RULE_HINT.find(([re]) => re.test(item));
          hint = match ? match[1](t) : null;
          break;
        }
        default:
          // font/tap/images WARN come from the variant's CSS or the seed's image step: nothing to change in the spec.
          hint = null;
      }
      out.push({
        rule: r.rule,
        severity: r.status,
        viewport: r.viewport,
        section,
        variant: s?.variant ?? null,
        selector,
        message,
        specHint: spec ? hint : null,
      });
    }
  }
  return out;
}
