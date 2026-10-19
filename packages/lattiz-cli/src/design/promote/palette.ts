import { readFileSync, writeFileSync } from 'node:fs';
import {
  hueDistance,
  hueOf,
  parseColor,
  type Rgba,
} from '../../../../template-kit/src/lib/color';
import { EXTENDED_PALETTES } from '../../../../template-kit/palettes';
import { PALETTE_SEEDS } from '../../../../template-kit/palettes/seeds';
import { slugify } from '../library';
import type { Candidate, Harvest } from '../types';
import {
  changedFiles,
  commonGates,
  GateFailure,
  jsonOut,
  kitFile,
  type Runner,
  repoRel,
  snapshotFailures,
  tail,
  Undo,
} from './kit';

const q = (v: string) => `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const list = (v: string[]) => `[${v.map(q).join(', ')}]`;

export function paletteId(label: string): string {
  const base = `pal-${slugify(label.replace(/\s*\(.*$/, ''))}`;
  const taken = new Set([
    ...Object.keys(PALETTE_SEEDS),
    ...Object.keys(EXTENDED_PALETTES),
  ]);
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1)
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

export function seedSource(id: string, d: NonNullable<Harvest['palette']>) {
  const rows = [
    `label: ${q(d.label)}`,
    `mode: ${q(d.mode)}`,
    `mood: ${list(d.mood)}`,
    `affinity: ${list(d.affinity)}`,
    `bg: ${q(d.bg)}`,
    `text: ${q(d.text)}`,
    `accent: ${q(d.accent)}`,
    ...(d.surface ? [`surface: ${q(d.surface)}`] : []),
    ...(d.surface2 ? [`surface2: ${q(d.surface2)}`] : []),
    ...(d.onAccent ? [`onAccent: ${q(d.onAccent)}`] : []),
    ...(d.accentText ? [`accentText: ${q(d.accentText)}`] : []),
    `photoTreatment: ${q(d.photoTreatment)}`,
    `placeholder: ${q(d.placeholder)}`,
  ];
  return `  ${q(id)}: {\n${rows.map((r) => `    ${r},`).join('\n')}\n  },\n`;
}

/**
 * Informational, not a gate: a palette that passes ΔE can still sit < 30° from every free accent
 * hue of its giro, so the compiler would never pick it there (it keeps its place for `custom`).
 */
export function usabilityNotes(
  accent: string,
  giros: string[],
  info: Runner,
): string[] {
  const c = parseColor(accent) as Rgba;
  const { hue, chroma } = hueOf(c);
  if (chroma <= 0.08) return [];
  const notes: string[] = [];
  for (const giro of giros) {
    const r = info(['giro', 'show', giro, '--json']);
    if (r.status !== 0) continue;
    try {
      const used =
        jsonOut<{ usedAccentHues?: { id: string; hue: number }[] }>(r.out)
          .usedAccentHues ?? [];
      const clash = used.find((u) => hueDistance(u.hue, hue) < 30);
      if (clash)
        notes.push(
          `aviso: en ${giro} el acento (${Math.round(hue)}°) está a < 30° de ${clash.id} (${Math.round(clash.hue)}°); el compilador no la elegirá ahí salvo que se fije a mano`,
        );
    } catch {
      // Unreadable giro info: no note rather than a wrong one.
    }
  }
  return notes;
}

export interface PromoteOutcome {
  id: string;
  gates: string[];
}

/**
 * Seed → library (AA by construction, ΔE00 ≥ 15 against every palette of each giro it fits) →
 * manifest → untouched golden snapshot. Throws GateFailure; the caller restores `undo`.
 */
export function promotePalette(
  candidate: Candidate,
  harvest: Harvest,
  run: Runner,
  undo: Undo,
  info: Runner = () => ({ status: 1, out: '' }),
): PromoteOutcome {
  const draft = harvest.palette;
  if (!draft)
    throw new GateFailure('paleta', 'El harvest no encontró una paleta.');
  if (!draft.aa.ok)
    throw new GateFailure(
      'AA',
      `La paleta no cumple WCAG AA:\n  ${draft.aa.problems.join('\n  ')}`,
    );
  const dirty = changedFiles().filter((f) =>
    /palettes\/(seeds|library)\.ts$|catalog\.manifest\.json$/.test(f),
  );
  if (dirty.length)
    throw new GateFailure(
      'árbol limpio',
      `Hay cambios sin commitear en ${dirty.join(', ')}; commitea o descarta antes de promover.`,
    );
  const base = run(['kit:palettes']);
  if (base.status !== 0)
    throw new GateFailure(
      'línea base de paletas',
      `kit:palettes ya falla antes de promover:\n${tail(base.out)}`,
    );
  const baseline = snapshotFailures(run);
  const before = changedFiles();
  const id = paletteId(draft.label);
  const seeds = kitFile('palettes/seeds.ts');
  const library = kitFile('palettes/library.ts');
  undo.keep(seeds);
  undo.keep(library);
  const text = readFileSync(seeds, 'utf8').trimEnd();
  if (!text.endsWith('};'))
    throw new GateFailure(
      'seeds.ts',
      'No reconozco el final de palettes/seeds.ts.',
    );
  writeFileSync(
    seeds,
    `${text.slice(0, -2)}  // Stitch: ${candidate.id}\n${seedSource(id, draft)}};\n`,
  );
  const built = run(['kit:palettes', '--write']);
  if (built.status !== 0)
    throw new GateFailure(
      'AA y distancia entre paletas (kit:palettes)',
      tail(built.out, 16),
    );
  const gates = [
    'AA por construcción (buildPalette)',
    'distancia ΔE00 ≥ 15 por giro (kit:palettes)',
    ...commonGates(
      run,
      undo,
      baseline,
      [
        repoRel(seeds),
        repoRel(library),
        repoRel(kitFile('catalog/catalog.manifest.json')),
        'apps/api/src/modules/sites/plan-catalog.generated.ts',
      ],
      before,
    ),
  ];
  return {
    id,
    gates: [...gates, ...usabilityNotes(draft.accent, draft.affinity, info)],
  };
}
