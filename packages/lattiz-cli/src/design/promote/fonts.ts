import { readFileSync, writeFileSync } from 'node:fs';
import { entireMetricsCollection } from '@capsizecss/metrics/entireMetricsCollection';
import { EXTENDED_FONT_PAIRS } from '../../../../template-kit/font-pairs';
import { FONT_PAIRS } from '../../../../template-kit/src/spec/presets';
import type { Candidate, Harvest } from '../types';
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

const idPart = (family: string) =>
  family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const plus = (family: string) => family.replace(/ /g, '+');

const metricsOf = (family: string) =>
  Object.values(entireMetricsCollection).find((m) => m.familyName === family);

/** Existing pair (legacy or extended) that already uses these two faces, if any. */
export function existingPair(
  display: string,
  body: string,
): string | undefined {
  const id = `${idPart(display)}+${idPart(body)}`;
  if (FONT_PAIRS[id] || EXTENDED_FONT_PAIRS[id]) return id;
  return undefined;
}

export function pairSource(
  candidate: Candidate,
  harvest: Harvest,
  display: string,
  body: string,
): { id: string; source: string } {
  const scale = harvest.typography.scale;
  const weights = (family: string) =>
    [
      ...new Set(
        scale.filter((s) => s.family === family).map((s) => s.weight ?? 400),
      ),
    ]
      .sort((a, b) => a - b)
      .join(';');
  const big = scale.find((s) => s.family === display) ?? scale[0];
  const leading = big?.lineHeightPx
    ? Math.round((big.lineHeightPx / big.sizePx) * 100) / 100
    : 1.1;
  const spacing = big?.letterSpacingEm ?? 0;
  const category = (f: string) =>
    metricsOf(f)?.category === 'serif' ? 'serif' : 'sans-serif';
  const id = `${idPart(display)}+${idPart(body)}`;
  const q = (v: string) => `'${v}'`;
  const source = `  ${q(id)}: {
    label: ${q(`${display} + ${body} (Stitch)`)},
    display: "'${display}', ${category(display)}",
    serif: "'${display}', ${category(display)}",
    body: "'${body}', ${category(body)}",
    googleFonts: ${q(`family=${plus(display)}:wght@${weights(display) || '400'}&family=${plus(body)}:wght@${weights(body) || '400'}`)},
    displayTransform: 'none',
    displayLeading: ${q(String(leading))},
    displayWeight: ${q(String(big?.weight ?? 400))},
    displayScale: '1',
    accentStyle: 'normal',
    accentTransform: 'none',
    mood: ['stitch'],
    affinity: [${q(candidate.giro)}],
    case: 'none',
    tracking: ${q(spacing < -0.01 ? 'tight' : spacing > 0.03 ? 'wide' : 'normal')},
    typeScale: 'normal',
    licenses: { ${q(display)}: 'OFL-1.1', ${q(body)}: 'OFL-1.1' },
  },
`;
  return { id, source };
}

/** Same faces already in the kit → reuse; otherwise a new extended pair gated by kit:fonts. */
export function promoteFonts(
  candidate: Candidate,
  harvest: Harvest,
  run: Runner,
  undo: Undo,
): PromoteOutcome {
  const t = harvest.typography;
  if (!t.displayFamily || !t.bodyFamily)
    throw new GateFailure(
      'tipografía',
      'El harvest no encontró fuente de títulos y de texto.',
    );
  if (t.displayFamily === t.bodyFamily)
    throw new GateFailure(
      'tipografía',
      'Un par necesita dos familias distintas.',
    );
  const bad = [t.displayFamily, t.bodyFamily].filter((f) =>
    t.unsupportedFamilies.includes(f),
  );
  if (bad.length)
    throw new GateFailure(
      'fuente utilizable',
      `Sin fuente de Google Fonts: ${bad.join(', ')}. El kit solo envía familias libres.`,
    );
  const reuse = existingPair(t.displayFamily, t.bodyFamily);
  if (reuse)
    return {
      id: reuse,
      gates: ['el par ya existe en el kit: se reutiliza, sin cambios'],
    };
  const missing = [t.displayFamily, t.bodyFamily].filter((f) => !metricsOf(f));
  if (missing.length)
    throw new GateFailure(
      'métricas Capsize',
      `Sin métricas para ${missing.join(', ')}: no hay fallback local medido (CLS).`,
    );
  const dirty = changedFiles().filter((f) =>
    /font-pairs\/library\.ts$|catalog\.manifest\.json$/.test(f),
  );
  if (dirty.length)
    throw new GateFailure(
      'árbol limpio',
      `Cambios sin commitear en ${dirty.join(', ')}.`,
    );
  const baseline = snapshotFailures(run);
  const before = changedFiles();
  const { id, source } = pairSource(
    candidate,
    harvest,
    t.displayFamily,
    t.bodyFamily,
  );
  const file = kitFile('font-pairs/library.ts');
  undo.keep(file);
  const text = readFileSync(file, 'utf8').trimEnd();
  if (!text.endsWith('};'))
    throw new GateFailure(
      'library.ts',
      'No reconozco el final de font-pairs/library.ts.',
    );
  writeFileSync(file, `${text.slice(0, -2)}${source}};\n`);
  const audit = run(['kit:fonts', '--only', id]);
  if (audit.status !== 0 || !audit.out.includes(id))
    throw new GateFailure(
      'auditoría de fuentes (kit:fonts)',
      tail(audit.out, 16),
    );
  return {
    id,
    gates: [
      'licencia, glifos y peso (kit:fonts)',
      'métricas Capsize presentes',
      ...commonGates(
        run,
        undo,
        baseline,
        [
          repoRel(file),
          repoRel(kitFile('catalog/catalog.manifest.json')),
          'apps/api/src/modules/sites/plan-catalog.generated.ts',
        ],
        before,
      ),
    ],
  };
}
