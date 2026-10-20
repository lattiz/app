import {
  buildSpec,
  type BuildReport,
} from '../../../template-kit/src/spec/build';
import {
  IMAGE_MODES,
  resolveImageMode,
} from '../../../template-kit/src/spec/images';
import { bool, type Command, type Context, str } from '../lib/command';
import { type ExitCode, usage } from '../lib/errors';
import { nextCommands, printBuild, rel, resolveSpecArg } from '../lib/spec';
import { writeState } from '../lib/state';
import { c, duration, log, setQuiet } from '../lib/ui';

/** Builds one spec, records it in .lattiz/state and prints (or returns) the report. */
export async function runBuild(
  ctx: Context,
  specPath: string,
): Promise<{ code: ExitCode; report: BuildReport }> {
  const json = bool(ctx.flags, 'json');
  let resolved;
  try {
    resolved = resolveImageMode(str(ctx.flags, 'images'));
  } catch (error) {
    throw usage(
      (error as Error).message,
      (error as Error).message.includes('Pexels')
        ? undefined
        : `Opciones: ${IMAGE_MODES.join(', ')}`,
    );
  }
  const images = resolved.mode;
  const dryRun = bool(ctx.flags, 'dry-run');
  if (!json)
    log.title(`lattiz build ${rel(specPath)}${dryRun ? ' --dry-run' : ''}`);
  if (json) console.error(resolved.note);
  else log.info(resolved.note);
  const report = await buildSpec({
    spec: specPath,
    dryRun,
    diff: bool(ctx.flags, 'diff'),
    force: bool(ctx.flags, 'force'),
    images,
    out: str(ctx.flags, 'out'),
  });
  if (report.written && !str(ctx.flags, 'out'))
    for (const id of report.ids)
      writeState(id, {
        spec: {
          file: rel(specPath),
          hash: report.hash as string,
          at: new Date().toISOString(),
          images,
        },
      });
  return { code: report.code, report };
}

export function printBuildSummary(report: BuildReport): void {
  printBuild(report);
  log.plain();
  if (report.forced)
    log.plain(
      c.red(
        c.bold(
          '  ⚠⚠ --force: se escribió a pesar de hallazgos o ediciones a mano. Revísalo antes de publicar. ⚠⚠',
        ),
      ),
    );
  if (report.ok) {
    log.ok(
      `${report.dryRun ? 'Dry run: no se escribió nada' : 'Listo'} ${c.gray(`(${duration(report.ms)})`)}`,
    );
    if (!report.dryRun && report.written) {
      log.plain(`\n${c.bold('Siguiente:')}`);
      for (const id of report.ids) log.plain(`  pnpm lattiz dev ${id}`);
      const pro = report.tiers.find((t) => t.tier === 'pro');
      if (pro) log.plain(`  pnpm lattiz motion ${pro.id}`);
      for (const id of report.ids) log.plain(`  pnpm lattiz check ${id}`);
      log.plain(
        `  ${report.ids.length === 2 ? `pnpm lattiz ship ${[...report.ids].reverse().join(' ')}` : `pnpm lattiz publish ${report.ids[0]}`}`,
      );
    }
  } else log.fail(report.message ?? 'falló el build');
}

export const build: Command = {
  name: 'build',
  summary:
    'Compila un spec: manifiesto(s), tema(s), copy y perfil demo únicos en el giro, validados antes de escribir',
  usage: 'build <id|spec> [--dry-run] [--diff] [--images m] [--force]',
  help: [
    'Lee packages/template-kit/specs/<id>.spec.json (o la ruta que pases), elige paleta, tipografía,',
    'portada y titular libres en el giro, compila y corre kit:validate en una carpeta temporal y solo',
    'entonces escribe templates/, themes/, content/, demo-profiles/ y assets/, y compila dist/.',
    '',
    '  --dry-run   muestra el plan; no escribe nada',
    '  --diff      además, el diff contra los archivos actuales',
    '  --images placeholder|none|pixabay   (por defecto pixabay si hay PIXABAY_API_KEY; si no, placeholder)',
    '  --force     escribe aunque kit:validate tenga hallazgos o haya ediciones a mano (nunca sobre',
    '              archivos congelados: `pnpm lattiz unfreeze <id>`)',
    '  --json      salida JSON (el reporte completo)',
    '',
    'Códigos: 0 ok · 1 validación, unicidad, ediciones a mano o congelado · 2 spec inválido.',
  ],
  options: {
    'dry-run': { type: 'boolean' },
    diff: { type: 'boolean' },
    images: { type: 'string' },
    force: { type: 'boolean' },
    out: { type: 'string' },
    json: { type: 'boolean' },
  },
  async run(ctx) {
    const json = bool(ctx.flags, 'json');
    setQuiet(json);
    const { code, report } = await runBuild(
      ctx,
      resolveSpecArg(ctx.positionals[0]),
    );
    if (json)
      console.log(
        JSON.stringify({ ...report, next: nextCommands(report) }, null, 2),
      );
    else printBuildSummary(report);
    return code;
  },
};
