import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { slugify } from '../library';
import type { Candidate, Harvest, SectionPattern } from '../types';
import {
  changedFiles,
  commonGates,
  GateFailure,
  kitFile,
  type Runner,
  repoRel,
  snapshotFailures,
  tail,
  Undo,
  MANIFEST_ALLOWED,
} from './kit';
import type { PromoteOutcome } from './palette';
import { folderExists } from '../harvest/resolve';
import { type Scaffold, supportedPatterns } from './section-templates';

/** Anti-inflation: a Stitch design adds at most this many sections before the kit is deduped. */
export const MAX_STITCH_SECTIONS = 6;
/** The largest existing extended variant is ~1 KB of gzip CSS; a draft above this is not "budgeted". */
export const SECTION_CSS_GZIP_MAX = 1200;

export function stitchSectionCount(): number {
  const root = kitFile('sections');
  let n = 0;
  for (const slot of readdirSync(root))
    for (const variant of readdirSync(join(root, slot))) {
      const meta = join(root, slot, variant, 'meta.ts');
      if (existsSync(meta) && /^\/\/ Stitch:/m.test(readFileSync(meta, 'utf8')))
        n += 1;
    }
  return n;
}

export const sectionKey = (p: SectionPattern) => `${p.slot}/${p.layout}`;

/** `<surface>-<layout>` (glass-bento), numbered when the name is taken. */
export function variantName(p: SectionPattern): string {
  const dir = kitFile('sections', p.slot);
  const taken = new Set(existsSync(dir) ? readdirSync(dir) : []);
  const base = slugify(`${p.surface}-${p.layout}`);
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1)
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

const lit = (v: unknown): string => JSON.stringify(v, null, 2);

export function metaSource(
  slot: string,
  variant: string,
  s: Scaffold,
  candidateId: string,
): string {
  return `import type { SectionMeta } from '../../../src/types';

// Stitch: ${candidateId}
export default {
  slot: ${lit(slot)},
  variant: ${lit(variant)},
  label: ${lit(s.label)},
  region: 'main',
  description: ${lit(s.description)},
  ${s.numbered ? 'numbered: true,\n  ' : ''}tiers: ${lit(s.tiers)},
  intent: ${lit(s.intent)},
  archetypes: ${lit(s.archetypes)},
  contentKeys: ${lit(s.contentKeys)},
  ${Object.keys(s.sample).length ? `sample: ${lit(s.sample)},\n` : ''}} satisfies SectionMeta;
`;
}

export interface SectionOptions {
  /** Index into harvest.sections, or "slot/layout". */
  pick?: string;
  /** Keep the generated manifest files (touches apps/api and apps/web generated slices). */
  regenerateManifest: boolean;
  /** Create it although the kit has similar variants (a deliberate decision, not a default). */
  allowSimilar?: boolean;
}

export function pickPattern(harvest: Harvest, pick?: string): SectionPattern {
  const found = harvest.sections.filter((p) => p.mappable);
  const chosen = pick
    ? /^\d+$/.test(pick)
      ? found[Number(pick)]
      : found.find((p) => sectionKey(p) === pick)
    : found.find((p) => p.draft);
  if (chosen?.existing)
    throw new GateFailure(
      'patrón',
      `${sectionKey(chosen)} ya existe en el kit: usa ${chosen.existing}. No se crea nada.`,
    );
  if (!chosen?.draft)
    throw new GateFailure(
      'patrón',
      `No hay un patrón nuevo y mapeable${pick ? ` «${pick}»` : ''}.\nEn el harvest: ${found.map((p) => `${sectionKey(p)}${p.existing ? ` (ya existe: ${p.existing})` : p.draft ? ' (borrador)' : ''}`).join(', ') || '(ninguno)'}.\nGeneradores: ${supportedPatterns().join(', ')}.`,
    );
  return chosen;
}

/** The kit's hard rules for a draft, before anything is written: no JS, no new dependencies. */
export function draftProblems(
  d: NonNullable<SectionPattern['draft']>,
): string[] {
  const out: string[] = [];
  if (/<script|<iframe|<form|\sstyle=|\son\w+=/i.test(d.html))
    out.push(
      'el HTML lleva script, iframe, form, style="" o manejadores en línea',
    );
  if (/https?:\/\//.test(d.html + d.css) || /@import/.test(d.css))
    out.push('hay URLs o @import: el draft no puede traer dependencias');
  if (/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(d.css))
    out.push('colores literales fuera de :root (solo tokens --lz-*)');
  if (/class="[^"]*\b(flex|grid-cols-\d+|px-\d+|md:[\w-]+)\b/.test(d.html))
    out.push('clases de Tailwind en el markup (solo lz-*)');
  return out;
}

/**
 * Draft (from harvest.json) → new extended variant folder, then the kit's own contract
 * (extended-sections tests), `kit probe` (real page, three themes, overflow/contrast/tap targets)
 * and an untouched golden snapshot. The manifest is only rewritten with `regenerateManifest`.
 */
export function promoteSection(
  _candidate: Candidate,
  harvest: Harvest,
  opts: SectionOptions,
  run: Runner,
  probe: Runner,
  undo: Undo,
): PromoteOutcome {
  const pattern = pickPattern(harvest, opts.pick);
  const draft = pattern.draft!;
  const variant = draft.variant;
  if (folderExists(`${pattern.slot}/${variant}`))
    throw new GateFailure(
      'patrón',
      `sections/${pattern.slot}/${variant} ya existe (¿ya se promovió?). Vuelve a correr harvest.`,
    );
  const unmeasured = pattern.fidelity?.verdict !== 'different';
  if (
    (pattern.reuse_candidate || pattern.similar?.length) &&
    unmeasured &&
    !opts.allowSimilar
  )
    throw new GateFailure(
      'anti-inflación (¿ya existe algo parecido?)',
      `El kit tiene ${[pattern.reuse_candidate, ...(pattern.similar ?? [])].filter(Boolean).join(', ')} en la misma familia de composición y no se midió si esta sección es distinta.\nCorre «lattiz design fidelity <id> ${pattern.ref}»: si es distinta (estructura > 0.15) se puede crear; si no, reutiliza la variante. O confirma a ciegas con --allow-similar.`,
    );
  const count = stitchSectionCount();
  if (count >= MAX_STITCH_SECTIONS)
    throw new GateFailure(
      'tope de secciones de Stitch',
      `Ya hay ${count} secciones nacidas de Stitch (tope ${MAX_STITCH_SECTIONS}). Haz un repaso de duplicados antes de sumar otra.`,
    );
  if (draft.bytes.css_gzip > SECTION_CSS_GZIP_MAX)
    throw new GateFailure(
      'presupuesto de la sección',
      `El CSS del borrador pesa ${draft.bytes.css_gzip} B gzip (máximo ${SECTION_CSS_GZIP_MAX}). Simplifica el patrón: quita efectos o variantes.`,
    );
  const problems = draftProblems(draft);
  if (problems.length)
    throw new GateFailure(
      'borrador dentro de las reglas del kit',
      problems.join('\n'),
    );
  const dirty = changedFiles().filter((f) =>
    /packages\/template-kit\/(sections|catalog)\//.test(f),
  );
  if (dirty.length)
    throw new GateFailure(
      'árbol limpio',
      `Cambios sin commitear en ${dirty.join(', ')}.`,
    );
  const baseline = snapshotFailures(run);
  const before = changedFiles();
  const dir = kitFile('sections', pattern.slot, variant);
  undo.made(dir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'section.html'), draft.html);
  writeFileSync(join(dir, 'section.css'), draft.css);
  writeFileSync(join(dir, 'meta.ts'), draft.meta_ts);
  const key = `${pattern.slot}/${variant}`;
  const contract = run(['test', 'extended-sections']);
  if (contract.status !== 0)
    throw new GateFailure(
      'contrato de variantes extended (vitest)',
      tail(contract.out, 20),
    );
  const probed = probe(['kit', 'probe', key]);
  if (probed.status !== 0)
    throw new GateFailure('kit probe', tail(probed.out, 20));
  const gates = [
    `borrador dentro de las reglas del kit (sin JS ni dependencias; ${draft.bytes.css_gzip} B de CSS gzip)`,
    'contrato extended-sections (tiers, intent, imágenes con alt, sin form/script/iframe)',
    `kit probe ${key} (3 temas, copy demo y largo, overflow, texto, táctiles, contraste)`,
  ];
  if (!opts.regenerateManifest) {
    // The golden snapshot can be checked without touching generated files.
    const after = snapshotFailures(run);
    if (JSON.stringify(after) !== JSON.stringify(baseline))
      throw new GateFailure(
        'kit:verify-snapshot',
        'Cambió el snapshot dorado.',
      );
    gates.push('kit:verify-snapshot idéntico');
    return { id: key, gates };
  }
  gates.push(
    ...commonGates(
      run,
      undo,
      baseline,
      [repoRel(dir), ...MANIFEST_ALLOWED],
      before,
    ),
  );
  return { id: key, gates };
}
