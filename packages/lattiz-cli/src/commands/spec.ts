import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { lockSpec, readSpecFile } from '../../../template-kit/src/spec/build';
import { specStem } from '../../../template-kit/src/spec/compile';
import { initSpec } from '../../../template-kit/src/spec/init';
import { DIRECTIONS } from '../../../template-kit/directions';
import { closest } from '../../../template-kit/src/spec/schema';
import {
  specJsonSchema,
  type Spec,
  type SpecTier,
} from '../../../template-kit/src/spec/schema';
import { lintCopy } from '../../../template-kit/src/spec/copy-lint';
import { validateSpec } from '../../../template-kit/src/spec/validate';
import { libraryFingerprints } from '../../../template-kit/src/lib/targets';
import { bool, type Command, type Context, str } from '../lib/command';
import { EXIT, type ExitCode, usage } from '../lib/errors';
import { select, text } from '../lib/prompt';
import {
  GIROS,
  idsOf,
  listSpecFiles,
  printProblems,
  rel,
  resolveSpecArg,
  specFile,
} from '../lib/spec';
import { ID_RE } from '../lib/templates';
import { c, log, setQuiet } from '../lib/ui';

type TierChoice = SpecTier | 'ambos';

export interface InitResult {
  file: string;
  spec: Spec;
  ids: string[];
}

/** Asks (or reads flags) and writes packages/template-kit/specs/<stem>.spec.json. */
export async function initFromFlags(
  ctx: Context,
  opts: { file?: string } = {},
): Promise<InitResult> {
  const choice = bool(ctx.flags, 'twin')
    ? 'ambos'
    : await select<TierChoice>(ctx, {
        message: '¿Qué tier?',
        flag: 'tier',
        value: str(ctx.flags, 'tier') as TierChoice | undefined,
        initial: 'ambos',
        options: [
          {
            value: 'ambos',
            label: 'Ambos (gemelas)',
            hint: 'Básico + Pro desde un spec',
          },
          {
            value: 'pro',
            label: 'Pro',
            hint: 'memorable: Motion, más secciones',
          },
          { value: 'basico', label: 'Básico', hint: 'bonito y rápido' },
        ],
      });
  const giro = await select(ctx, {
    message: '¿Giro?',
    flag: 'giro',
    value: str(ctx.flags, 'giro'),
    options: Object.values(GIROS).map((g) => ({ value: g.id, label: g.label })),
  });
  const nombre = await text(ctx, {
    message: 'Nombre del negocio',
    flag: 'nombre',
    value: str(ctx.flags, 'nombre'),
    validate: (v) => (v.trim().length < 2 ? 'escribe un nombre' : undefined),
  });
  const id = str(ctx.flags, 'id');
  if (id && (!ID_RE.test(id) || id.length > 60))
    throw usage(`Id inválido: "${id}".`, '^[a-z0-9]+(-[a-z0-9]+)*$, máx. 60.');
  if (id && choice === 'ambos')
    throw usage(
      '--id es para un solo tier; con --twin los ids salen del nombre.',
    );
  const direction = str(ctx.flags, 'direccion');
  if (direction && !DIRECTIONS[direction]) {
    const guess = closest(direction, Object.keys(DIRECTIONS));
    throw usage(
      `Dirección de arte desconocida: "${direction}".`,
      `${guess ? `¿Quisiste decir "${guess}"? ` : ''}Direcciones: ${Object.keys(DIRECTIONS).join(', ')} (pnpm lattiz direccion list).`,
    );
  }
  const spec = initSpec({
    giro,
    nombre,
    tier: choice,
    id,
    library: await libraryFingerprints(),
    ...(direction ? { direction } : {}),
  });
  const file = opts.file
    ? resolve(process.cwd(), opts.file)
    : specFile(specStem(spec));
  if (existsSync(file) && !bool(ctx.flags, 'force'))
    throw usage(
      `Ya existe ${rel(file)}.`,
      'Edítalo, o --force para reemplazarlo.',
    );
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(spec, null, 2)}\n`);
  return { file, spec, ids: idsOf(spec) };
}

async function runInit(ctx: Context): Promise<ExitCode> {
  const json = bool(ctx.flags, 'json');
  setQuiet(json);
  log.title('lattiz spec init');
  const { file, spec, ids } = await initFromFlags(ctx, {
    file: str(ctx.flags, 'out'),
  });
  if (json) {
    console.log(
      JSON.stringify({ file: rel(file), ids, todo: spec.todo }, null, 2),
    );
    return EXIT.OK;
  }
  log.ok(`${rel(file)} ${c.gray(`→ ${ids.join(' + ')}`)}`);
  log.plain(`\n${c.bold('Pendientes (campo "todo" del spec):')}`);
  for (const t of spec.todo ?? []) log.plain(`  · ${t}`);
  log.plain(`\n${c.bold('Siguiente:')}`);
  log.plain(`  1. Edita el copy y los datos en ${rel(file)}`);
  log.plain(`  2. pnpm lattiz spec validate ${specStem(spec)}`);
  log.plain(`  3. pnpm lattiz build ${specStem(spec)}`);
  return EXIT.OK;
}

async function runValidate(ctx: Context): Promise<ExitCode> {
  const json = bool(ctx.flags, 'json');
  setQuiet(json);
  const file = resolveSpecArg(ctx.positionals[1]);
  const { spec, problems } = readSpecFile(file);
  const strict = bool(ctx.flags, 'strict');
  const all = spec
    ? [
        ...problems,
        ...(await validateSpec(spec, file)),
        ...(strict ? await lintCopy(spec) : []),
      ]
    : problems;
  const errors = all.filter((p) => p.level === 'error').length;
  if (json) {
    console.log(
      JSON.stringify(
        {
          file: rel(file),
          ok: errors === 0,
          strict,
          ids: spec ? idsOf(spec) : [],
          errors,
          warnings: all.length - errors,
          problems: all,
        },
        null,
        2,
      ),
    );
    return errors ? EXIT.USAGE : EXIT.OK;
  }
  log.title(`lattiz spec validate ${rel(file)}${strict ? ' --strict' : ''}`);
  printProblems(all);
  if (errors) {
    log.fail(`${errors} error(es); corrige el spec y vuelve a validar.`);
    return EXIT.USAGE;
  }
  log.ok(
    `Spec válido${all.length ? ` (${all.length} aviso(s))` : ''} → ${spec ? idsOf(spec).join(' + ') : ''}`,
  );
  return EXIT.OK;
}

async function runLock(ctx: Context): Promise<ExitCode> {
  const json = bool(ctx.flags, 'json');
  setQuiet(json);
  const all = bool(ctx.flags, 'all');
  if (all && ctx.positionals[1]) throw usage('Usa un spec o --all, no ambos.');
  const files = all ? listSpecFiles() : [resolveSpecArg(ctx.positionals[1])];
  const refresh = bool(ctx.flags, 'refresh');
  if (!json)
    log.title(
      `lattiz spec lock${all ? ' --all' : ''}${refresh ? ' --refresh' : ''}`,
    );
  const reports = [];
  for (const file of files) {
    const r = await lockSpec(file, { refresh });
    reports.push(r);
    if (json) continue;
    if (r.code === 0)
      log.ok(
        `${r.lock} ${c.gray(`(${r.action === 'unchanged' ? 'ya estaba al día' : r.action === 'create' ? 'creado' : 'actualizado'}; reproduce ${r.files.length} archivo(s) → ${r.ids.join(' + ')})`)}`,
      );
    else {
      log.fail(`${rel(file)}: ${r.message ?? 'falló'}`);
      for (const f of r.files.filter((x) => !x.same))
        log.plain(`    ${c.red('≠')} ${f.path} ${c.gray(`(${f.state})`)}`);
      printProblems(r.problems.filter((p) => p.level === 'error'));
    }
  }
  const worst = Math.max(0, ...reports.map((r) => r.code)) as ExitCode;
  if (json) console.log(JSON.stringify(reports, null, 2));
  return worst;
}

export const spec: Command = {
  name: 'spec',
  summary:
    'Specs de plantilla: init (prellenado por giro), validate, lock, schema',
  usage: 'spec init|validate|lock|schema',
  help: [
    'spec init --giro <giro> --nombre "<nombre>" [--twin | --tier pro|basico] [--id <id>] [--direccion <id>] [--out archivo] [--force]',
    '    Escribe packages/template-kit/specs/<giro>-<nombre>.spec.json con el copy del giro, la paleta',
    '    y la tipografía libres en el giro y una lista "todo" de lo que falta revisar.',
    'spec validate <archivo|id> [--strict]',
    '    esquema + blueprint + copy completo (errores con ruta JSON). --strict además revisa el copy:',
    '    longitud por clave (lattiz giro show), relleno/TODO, promesas y superlativos, teléfonos o',
    '    correos escritos a mano (usa {{phone}}, {{email}}), marcas reales, acentos, frases repetidas',
    '    en la página, entre la gemela y contra otras plantillas del giro.',
    'spec lock <archivo|id> | --all [--refresh]',
    '    Escribe specs/<stem>.lock.json con lo que eligió el compilador (paleta, tipografía, forma,',
    '    variantes, arquetipo, catálogo) después de comprobar que el spec reproduce sus archivos',
    '    generados. `lattiz build` reusa el lock: un catálogo que crece no cambia la plantilla.',
    '    --refresh vuelve a elegir sin el lock (y solo escribe si sigue reproduciendo).',
    'spec schema                  JSON Schema del spec (autocompletado en el editor, skill de Claude)',
    '',
    `Giros: ${Object.keys(GIROS).join(', ')}. Todos aceptan --json.`,
  ],
  options: {
    giro: { type: 'string' },
    nombre: { type: 'string' },
    twin: { type: 'boolean' },
    tier: { type: 'string' },
    id: { type: 'string' },
    direccion: { type: 'string' },
    out: { type: 'string' },
    force: { type: 'boolean' },
    strict: { type: 'boolean' },
    json: { type: 'boolean' },
    all: { type: 'boolean' },
    refresh: { type: 'boolean' },
  },
  async run(ctx) {
    const sub = ctx.positionals[0];
    if (sub === 'init') return runInit(ctx);
    if (sub === 'validate') return runValidate(ctx);
    if (sub === 'lock') return runLock(ctx);
    if (sub === 'schema') {
      console.log(JSON.stringify(specJsonSchema(), null, 2));
      return EXIT.OK;
    }
    throw usage(
      sub ? `Subcomando desconocido: ${sub}` : 'Falta el subcomando.',
      'pnpm lattiz spec init|validate|lock|schema',
    );
  },
};
