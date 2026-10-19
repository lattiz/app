import { type Located, readHarvest, reindex, setStatus } from '../library';
import type { PromotedRefs } from '../types';
import { promoteFonts } from './fonts';
import {
  failed,
  GateFailure,
  kitRunner,
  lattizRunner,
  type Runner,
  Undo,
} from './kit';
import { promotePalette } from './palette';
import { promoteSection } from './section';

export interface PromoteOptions {
  palette: boolean;
  fonts: boolean;
  section: boolean;
  pattern?: string;
  regenerateManifest: boolean;
  dryRun: boolean;
}

export interface PromoteReport {
  dryRun: boolean;
  kept: boolean;
  refs: PromotedRefs;
  gates: Record<string, string[]>;
}

export interface Runners {
  kit: Runner;
  lattiz: Runner;
}
export const defaultRunners: Runners = { kit: kitRunner, lattiz: lattizRunner };

/**
 * Promotes drafts of a harvested candidate into the kit. All-or-nothing: any failed gate restores
 * every file touched and leaves the candidate's flag as it was. A section is only kept with
 * `regenerateManifest` (it rewrites generated slices in apps/api and apps/web); without it the
 * section run is a dry run.
 */
export function promote(
  loc: Located,
  opts: PromoteOptions,
  runners: Runners = defaultRunners,
): PromoteReport {
  const c = loc.candidate;
  if (c.status !== 'harvested' && c.status !== 'promoted')
    throw failed(
      new GateFailure(
        'estado',
        `"${c.id}" está en ${c.status}: solo se promueve un candidato harvested.`,
      ),
    );
  if (!opts.palette && !opts.fonts && !opts.section)
    throw failed(
      new GateFailure(
        'qué promover',
        'Indica --palette, --fonts y/o --section.',
      ),
    );
  const harvest = readHarvest(loc);
  if (opts.section && !opts.regenerateManifest && (opts.palette || opts.fonts))
    throw failed(
      new GateFailure(
        'sección',
        'Una sección solo se conserva con --regenerate-manifest (reescribe archivos generados de apps/api y apps/web). Córrela sola para una prueba, o suma la bandera.',
      ),
    );
  const undo = new Undo();
  const refs: PromotedRefs = { ...c.promoted };
  const gates: Record<string, string[]> = {};
  let sectionKept = true;
  try {
    if (opts.palette) {
      const r = promotePalette(c, harvest, runners.kit, undo, runners.lattiz);
      refs.palette = r.id;
      gates.palette = r.gates;
    }
    if (opts.fonts) {
      const r = promoteFonts(c, harvest, runners.kit, undo);
      refs.fonts = r.id;
      gates.fonts = r.gates;
    }
    if (opts.section) {
      const r = promoteSection(
        c,
        harvest,
        { pick: opts.pattern, regenerateManifest: opts.regenerateManifest },
        runners.kit,
        runners.lattiz,
        undo,
      );
      gates.section = r.gates;
      if (opts.regenerateManifest) refs.section = r.id;
      else sectionKept = false;
    }
  } catch (error) {
    undo.restore();
    if (error instanceof GateFailure) throw failed(error);
    throw error;
  }
  const keeps = opts.palette || opts.fonts || sectionKept;
  if (opts.dryRun || !keeps) {
    undo.restore();
    return { dryRun: true, kept: false, refs, gates };
  }
  setStatus(loc, 'promoted', { promoted: refs });
  reindex();
  return { dryRun: false, kept: true, refs, gates };
}
