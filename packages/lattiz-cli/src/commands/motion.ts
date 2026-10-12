import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';
import {
  classificationTable,
  motionHtml,
  type SectionOverrides,
  type SectionRow,
} from '../../../../scripts/lib/motion-sections';
import { bool, type Command } from '../lib/command';
import { EXIT, usage } from '../lib/errors';
import { manifestFile, REPO_ROOT } from '../lib/paths';
import {
  assertTemplate,
  cleanOutput,
  compile,
  readDist,
  tierLabel,
} from '../lib/templates';
import { c, log } from '../lib/ui';

export interface MotionReport {
  preset: string;
  rows: SectionRow[];
  overrides: SectionOverrides;
  table: string;
  /** Non-skipped sections the runtime won't animate (preset none or type none). */
  untyped: number;
  groups: number;
}

export function motionReport(id: string): MotionReport {
  const dist = readDist(id);
  const preset = dist.meta.motion?.preset ?? 'none';
  const overrides = (dist.meta.motion?.sections ?? {}) as SectionOverrides;
  const { result } = motionHtml(dist.html, preset, overrides, false);
  const typed = result.rows.filter((r) => r.type !== 'skip');
  return {
    preset,
    rows: result.rows,
    overrides,
    table: classificationTable(id, result.rows),
    untyped:
      preset === 'none'
        ? typed.length
        : typed.filter((r) => r.type === 'none').length,
    groups: result.rows.reduce((n, r) => n + r.groups, 0),
  };
}

export function printMotion(id: string, report: MotionReport): void {
  log.info(
    `preset ${c.bold(report.preset)} · ${report.rows.filter((r) => r.type !== 'skip').length} sección(es) animables · ${report.groups} grupo(s)`,
  );
  console.log(report.table);
  if (report.untyped > 0)
    log.warn(
      report.preset === 'none'
        ? 'preset none: el runtime no anima nada. Pon motion.preset (calm | editorial) en el manifiesto.'
        : `${report.untyped} sección(es) con tipo none (no se animan).`,
    );
  const manual = Object.keys(report.overrides);
  log.plain(
    `  ${c.gray('Ajustes manuales:')} ${relative(REPO_ROOT, manifestFile(id))} › motion.sections ` +
      c.gray(
        manual.length
          ? `(${manual.join(', ')})`
          : '(vacío: todo viene del clasificador)',
      ),
  );
  log.plain(
    c.gray(
      "  Claves: nombre del slot, '#id' o el # de la tabla. Tipos: hero text cards gallery stats cta footer none",
    ),
  );
}

export const motion: Command = {
  name: 'motion',
  summary:
    'Pro: tabla del clasificador de secciones de Lattiz Motion (dry-run) y dónde ajustarla',
  usage: 'motion <id> [--edit]',
  help: [
    'Compila y corre el mismo clasificador que el seed (scripts/lib/motion-sections.ts) sin escribir',
    'nada. Los tipos manuales van en el manifiesto, en motion.sections (no hay motion.json).',
    '',
    '  --edit   abre el manifiesto en $EDITOR',
  ],
  options: { edit: { type: 'boolean' } },
  async run(ctx) {
    const id = assertTemplate(ctx.positionals[0]);
    log.title(`lattiz motion ${id}`);
    const built = await compile(id);
    if (built.code !== 0) {
      log.fail(`kit:compile falló\n${cleanOutput(built.output)}`);
      return EXIT.GATE;
    }
    const { meta } = readDist(id);
    if (meta.tier !== 'pro') {
      log.info(
        `${id} es ${tierLabel(meta.tier)}: Lattiz Motion solo corre en sitios Pro, así que no aplica. ` +
          'Los sitios Básico se sirven estáticos y completamente visibles.',
      );
      return EXIT.OK;
    }
    printMotion(id, motionReport(id));
    if (bool(ctx.flags, 'edit')) {
      const editor = process.env.VISUAL || process.env.EDITOR;
      if (!editor)
        throw usage(
          'No hay $EDITOR ni $VISUAL.',
          `Abre ${relative(REPO_ROOT, manifestFile(id))} a mano.`,
        );
      spawnSync(`${editor} ${JSON.stringify(manifestFile(id))}`, {
        stdio: 'inherit',
        shell: true,
      });
    }
    return EXIT.OK;
  },
};
