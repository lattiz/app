import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
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
} from './kit';
import type { PromoteOutcome } from './palette';
import { scaffoldFor, supportedPatterns } from './section-templates';

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
  s: NonNullable<ReturnType<typeof scaffoldFor>>,
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
}

export function pickPattern(harvest: Harvest, pick?: string): SectionPattern {
  const found = harvest.sections.filter((p) => p.mappable);
  const chosen = pick
    ? /^\d+$/.test(pick)
      ? found[Number(pick)]
      : found.find((p) => sectionKey(p) === pick)
    : found.find((p) => supportedPatterns().includes(sectionKey(p)));
  if (!chosen)
    throw new GateFailure(
      'patrón',
      `No hay un patrón mapeable${pick ? ` «${pick}»` : ' con generador'}. Soportados: ${supportedPatterns().join(', ')}.\nEn el harvest: ${found.map(sectionKey).join(', ') || '(ninguno)'}.`,
    );
  return chosen;
}

/**
 * Pattern → new extended variant folder, then the kit's own contract (extended-sections tests),
 * `kit probe` (real page, three themes, overflow/contrast/tap targets) and an untouched golden
 * snapshot. The manifest is only rewritten with `regenerateManifest`.
 */
export function promoteSection(
  candidate: Candidate,
  harvest: Harvest,
  opts: SectionOptions,
  run: Runner,
  probe: Runner,
  undo: Undo,
): PromoteOutcome {
  const pattern = pickPattern(harvest, opts.pick);
  const variant = variantName(pattern);
  const scaffold = scaffoldFor(variant, pattern);
  if (!scaffold)
    throw new GateFailure(
      'generador',
      `Sin generador para ${sectionKey(pattern)}.`,
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
  writeFileSync(join(dir, 'section.html'), scaffold.html);
  writeFileSync(join(dir, 'section.css'), scaffold.css);
  writeFileSync(
    join(dir, 'meta.ts'),
    metaSource(pattern.slot, variant, scaffold, candidate.id),
  );
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
      [
        repoRel(dir),
        repoRel(kitFile('catalog/catalog.manifest.json')),
        'apps/api/src/modules/sites/plan-catalog.generated.ts',
        'apps/web/src/features/editor/blocks',
        'apps/web/src/features/templates',
      ],
      before,
    ),
  );
  return { id: key, gates };
}
