import { bool, type Command, type Context } from '../lib/command';
import { CliError, EXIT, type ExitCode, usage } from '../lib/errors';
import { assertHeroPhotos } from '../lib/hero-photo';
import { assertRemoteWrite, confirm } from '../lib/prompt';
import { previewUrl, waitFor200 } from '../lib/remote';
import { writeState } from '../lib/state';
import { assertTemplate, readDist, tierLabel } from '../lib/templates';
import { c, duration, log } from '../lib/ui';
import { printCheck, runCheck, saveCheck } from './check';
import { deployPreviews, requireDeployTooling } from './deploy';
import { motionReport, printMotion } from './motion';
import { requireSeedEnv, seedOne } from './seed';

interface Step {
  label: string;
  /** Command that re-runs this step on its own. */
  resume: string;
  run(): Promise<void>;
}

/** check → (Pro) motion → seed each id → one previews deploy → verify every URL. */
async function pipeline(
  ctx: Context,
  ids: string[],
  opts: { force: boolean; lighthouse: boolean; overwriteMeta: boolean },
): Promise<ExitCode> {
  if (new Set(ids).size !== ids.length)
    throw usage('Los ids deben ser distintos.');
  assertHeroPhotos(ids);
  requireSeedEnv();
  requireDeployTooling();
  const started = Date.now();
  const steps: Step[] = [];
  for (const id of ids) {
    steps.push({
      label: `check ${id}`,
      resume: `pnpm lattiz check ${id}`,
      async run() {
        const outcome = await runCheck(id, { lighthouse: opts.lighthouse });
        printCheck(outcome);
        const forced = outcome.status === 'FAIL' && opts.force;
        saveCheck(outcome, forced);
        if (outcome.status === 'FAIL' && !forced)
          throw new CliError(
            `check de ${id} tiene FAIL.`,
            EXIT.GATE,
            'Arréglalo, o `--force` para publicar de todos modos (queda registrado).',
          );
        if (forced) {
          log.plain(
            c.red(
              c.bold(
                `\n  ⚠⚠ --force: se publica ${id} CON FAIL. Queda registrado en .lattiz/state/${id}.json (lastCheck.forced). ⚠⚠\n`,
              ),
            ),
          );
        }
      },
    });
    steps.push({
      label: `motion ${id}`,
      resume: `pnpm lattiz motion ${id}`,
      async run() {
        if (readDist(id).meta.tier !== 'pro') {
          log.info('Básico: Lattiz Motion no aplica.');
          return;
        }
        printMotion(id, motionReport(id));
        if (
          !(await confirm(
            ctx,
            `¿La clasificación de Motion de ${id} está bien? (continuar)`,
          ))
        )
          throw new CliError(
            'Detenido para ajustar Motion.',
            EXIT.GATE,
            `Ajusta motion.sections en el manifiesto y revisa con \`pnpm lattiz motion ${id}\`.`,
          );
      },
    });
  }
  for (const id of ids) {
    steps.push({
      label: `seed ${id}`,
      resume: `pnpm lattiz seed ${id}`,
      async run() {
        const code = await seedOne(ctx, id, {
          dryRun: false,
          deploy: false,
          overwriteMeta: opts.overwriteMeta,
        });
        if (code !== EXIT.OK)
          throw new CliError(`seed de ${id} no se completó.`, code);
      },
    });
  }
  steps.push({
    label: 'deploy templates.lattiz.app',
    resume: 'pnpm lattiz deploy',
    async run() {
      const code = await deployPreviews(ctx, {
        skipVerify: false,
        expect: ids,
      });
      if (code !== EXIT.OK)
        throw new CliError(
          'El deploy o la activación no se completaron.',
          code,
        );
    },
  });
  steps.push({
    label: 'verificar URLs',
    resume: `pnpm lattiz status ${ids[0]}`,
    async run() {
      for (const id of ids) {
        const url = previewUrl(id) as string;
        const res = await waitFor200(url, 60_000);
        if (!res.ok)
          throw new CliError(
            `${url} no responde 200 (último: ${res.last}).`,
            EXIT.GATE,
          );
        log.ok(`${url} → 200`);
      }
    },
  });

  log.title(`lattiz ${ids.length > 1 ? 'ship' : 'publish'} ${ids.join(' ')}`);
  steps.forEach((s, i) => log.plain(`  ${c.gray(`${i + 1}.`)} ${s.label}`));
  for (const [i, step] of steps.entries()) {
    log.title(`[${i + 1}/${steps.length}] ${step.label}`);
    try {
      await step.run();
    } catch (error) {
      log.plain();
      steps.forEach((s, j) =>
        log.plain(
          `  ${j < i ? c.green('✓') : j === i ? c.red('✗') : c.gray('·')} ${s.label}`,
        ),
      );
      if (error instanceof CliError) {
        log.fail(error.message);
        if (error.hint) log.hint(error.hint);
        log.hint(
          `Retoma desde este paso: ${step.resume}${
            i + 1 < steps.length
              ? `, luego lo que sigue (${steps
                  .slice(i + 1)
                  .map((s) => s.label)
                  .join(' → ')})`
              : ''
          }`,
        );
        return error.code;
      }
      throw error;
    }
  }
  log.plain();
  steps.forEach((s) => log.plain(`  ${c.green('✓')} ${s.label}`));
  log.plain();
  for (const id of ids) {
    log.ok(
      `${c.bold(id)} (${tierLabel(readDist(id).meta.tier)}): ${c.cyan(previewUrl(id) as string)}`,
    );
    writeState(id, {});
  }
  log.info(`Listo en ${duration(Date.now() - started)}.`);
  return EXIT.OK;
}

const shared = {
  options: {
    force: { type: 'boolean' },
    lighthouse: { type: 'boolean' },
    'overwrite-meta': { type: 'boolean' },
  },
  help: [
    '  --force           publica aunque check tenga FAIL (se avisa y queda registrado)',
    '  --lighthouse      corre Lighthouse dentro de check',
    '  --overwrite-meta  pisa nombre, descripción, categoría, orden y la miniatura del admin',
    '  --yes             confirma Motion, seed y deploy sin preguntar',
  ],
} as const;

export const publish: Command = {
  name: 'publish',
  summary:
    'check → Motion (Pro) → seed → deploy → verifica https://templates.lattiz.app/<id>',
  usage: 'publish <id> [--force] [--lighthouse] [--overwrite-meta]',
  help: [
    'Imprime los pasos antes de empezar; si uno falla dice qué comando re-ejecutar. Cada escritura',
    'remota (seed y deploy) pide confirmación.',
    '',
    ...shared.help,
  ],
  options: shared.options,
  run(ctx) {
    const id = assertTemplate(ctx.positionals[0]);
    assertRemoteWrite(ctx, `publish ${id}`);
    if (ctx.positionals.length > 1)
      throw usage(
        'publish recibe un id; para el par usa `pnpm lattiz ship <idA> <idB>`.',
      );
    return pipeline(ctx, [id], {
      force: bool(ctx.flags, 'force'),
      lighthouse: bool(ctx.flags, 'lighthouse'),
      overwriteMeta: bool(ctx.flags, 'overwrite-meta'),
    });
  },
};

export const ship: Command = {
  name: 'ship',
  summary:
    'publish de una o dos plantillas (el par Básico + Pro) con un solo deploy al final',
  usage: 'ship <idA> [idB] [--force] [--lighthouse] [--overwrite-meta]',
  help: [
    'Checks y seeds en orden, un solo deploy de previews al final, y las dos URLs.',
    '',
    ...shared.help,
  ],
  options: shared.options,
  run(ctx) {
    if (ctx.positionals.length < 1 || ctx.positionals.length > 2)
      throw usage('ship recibe uno o dos ids.');
    const ids = ctx.positionals.map((id) => assertTemplate(id));
    assertRemoteWrite(ctx, `ship ${ids.join(' ')}`);
    return pipeline(ctx, ids, {
      force: bool(ctx.flags, 'force'),
      lighthouse: bool(ctx.flags, 'lighthouse'),
      overwriteMeta: bool(ctx.flags, 'overwrite-meta'),
    });
  },
};
