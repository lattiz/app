import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { bool, type Command, type Context, str } from '../lib/command';
import { EXIT, type ExitCode, usage } from '../lib/errors';
import { manifestFile, paths, REPO_ROOT } from '../lib/paths';
import { interactive, select, text } from '../lib/prompt';
import { writeState } from '../lib/state';
import {
  cleanOutput,
  compile,
  ID_RE,
  loadManifest,
  localIds,
  type Tier,
  tierLabel,
  validate,
} from '../lib/templates';
import { c, log, setQuiet } from '../lib/ui';
import { GIROS, nextCommands, rel } from '../lib/spec';
import { printBuildSummary, runBuild } from './build';
import { initFromFlags } from './spec';

interface Giro {
  label: string;
  category: string;
  basico: string;
  pro: string;
}
type TierChoice = 'pro' | 'basico' | 'ambos';
const TIER_KEY: Record<Tier, 'pro' | 'basico'> = {
  pro: 'pro',
  basic: 'basico',
};

function loadBases(): Record<string, Giro> {
  return (
    JSON.parse(readFileSync(paths.bases, 'utf8')) as {
      giros: Record<string, Giro>;
    }
  ).giros;
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
    .replace(/-+$/g, '');
}

/** Existing convention: Pro `<rubro>-<nombre>-v1`, Básico `<rubro>-base-<nombre>-v1`; no tier suffix. */
function suggestId(giro: string, name: string, tier: Tier): string {
  const slug = slugify(name).replace(new RegExp(`^${giro}-?`), '') || 'nueva';
  return tier === 'pro' ? `${giro}-${slug}-v1` : `${giro}-base-${slug}-v1`;
}

function tsString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function tierOf(id: string): string {
  return (
    /\btier:\s*'(basic|pro)'/.exec(
      readFileSync(manifestFile(id), 'utf8'),
    )?.[1] ?? '?'
  );
}

/** Index just past the `{…}` block that starts at `open` (plus a trailing comma). */
function blockEnd(src: string, open: number): number {
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') {
      depth -= 1;
      if (depth === 0) return src[i + 1] === ',' ? i + 2 : i + 1;
    }
  }
  throw new Error('unbalanced braces');
}

interface CloneSpec {
  base: string;
  id: string;
  tier: Tier;
  name: string;
  giro: string;
  giroLabel: string;
  category: string;
}

/** Text rewrite keeps the base's helpers and comments; the result is verified by importing it. */
function cloneSource(src: string, spec: CloneSpec): string {
  let out = src;
  const replaceOnce = (re: RegExp, value: string, what: string) => {
    if (!re.test(out))
      throw new Error(`no encontré ${what} en ${spec.base}.ts`);
    out = out.replace(re, value);
  };
  const date = new Date().toISOString().slice(0, 10);
  out = out.replace(
    /\/\*\*[\s\S]*?\*\/\s*\nexport default/,
    `/**\n * ${spec.name} — ${spec.giroLabel}, ${tierLabel(spec.tier)}. Cloned from ${spec.base} by \`pnpm lattiz new\` (${date}).\n` +
      ' * Before seeding give it its own theme, hero/services variants and copy: kit:validate rejects clones.\n */\nexport default',
  );
  replaceOnce(
    new RegExp(`^  id: '${spec.base}',`, 'm'),
    `  id: '${spec.id}',`,
    'el id',
  );
  replaceOnce(
    /^ {2}name: (['"]).*?\1,/m,
    `  name: ${tsString(spec.name)},`,
    'el nombre',
  );
  replaceOnce(
    /^ {2}category: (['"]).*?\1,/m,
    `  category: ${tsString(spec.category)},`,
    'la categoría',
  );
  replaceOnce(
    /^ {2}description:\s*(['"])(?:\\.|(?!\1).)*\1,/ms,
    `  description: ${tsString(`${spec.giroLabel}: plantilla ${tierLabel(spec.tier)} clonada de ${spec.base}; reescribe esta descripción`)},`,
    'la descripción',
  );

  const business = /^ {2}business: \{/m.exec(out);
  if (business) {
    const end = blockEnd(out, business.index + business[0].length - 1);
    let block = out.slice(business.index, end);
    block = /^ {4}name: /m.test(block)
      ? block.replace(
          /^ {4}name: (['"]).*?\1,/m,
          `    name: ${tsString(spec.name)},`,
        )
      : block.replace('{', `{\n    name: ${tsString(spec.name)},`);
    block = /^ {4}shortName: /m.test(block)
      ? block.replace(
          /^ {4}shortName: (['"]).*?\1,/m,
          `    shortName: ${tsString(spec.name)},`,
        )
      : block.replace('{', `{\n    shortName: ${tsString(spec.name)},`);
    out = out.slice(0, business.index) + block + out.slice(end);
  } else {
    replaceOnce(
      /^ {2}sections: \[/m,
      `  business: { name: ${tsString(spec.name)}, shortName: ${tsString(spec.name)} },\n  sections: [`,
      'sections',
    );
  }

  if (spec.tier === 'pro') {
    // Base-specific section types don't carry over: start with an empty override map.
    const motion = /^ {2}motion: \{/m.exec(out);
    const preset =
      /preset:\s*'(calm|editorial|none)'/.exec(
        motion ? out.slice(motion.index) : '',
      )?.[1] ?? 'calm';
    const line = `  motion: { preset: '${preset}', sections: {} },`;
    if (motion) {
      const end = blockEnd(out, motion.index + motion[0].length - 1);
      out = out.slice(0, motion.index) + line + out.slice(end);
    } else {
      replaceOnce(
        /\n\} satisfies Manifest;/,
        `\n${line}\n} satisfies Manifest;`,
        'el cierre del manifiesto',
      );
    }
  }
  return out;
}

/** Spec path: init the spec (unless --spec points at an existing one) and build it. */
async function runFromSpec(ctx: Context): Promise<ExitCode> {
  const json = bool(ctx.flags, 'json');
  setQuiet(json);
  log.title('lattiz new (desde spec)');
  const given = str(ctx.flags, 'spec');
  let file = given ? resolve(process.cwd(), given) : undefined;
  if (!file || !existsSync(file)) {
    const init = await initFromFlags(ctx, { file });
    file = init.file;
    log.ok(`${rel(file)} ${c.gray(`→ ${init.ids.join(' + ')}`)}`);
  } else log.info(`Spec: ${rel(file)}`);
  const { code, report } = await runBuild(ctx, file);
  if (json) {
    console.log(
      JSON.stringify(
        { spec: rel(file), build: report, next: nextCommands(report) },
        null,
        2,
      ),
    );
    return code;
  }
  printBuildSummary(report);
  if (report.ok && !report.dryRun)
    log.plain(
      c.gray(
        `
  El copy y los datos viven en ${rel(file)}: edítalo y vuelve a correr \`pnpm lattiz build ${report.ids[0]}\`.`,
      ),
    );
  return code;
}

export const newTemplate: Command = {
  name: 'new',
  summary:
    'Asistente: plantilla nueva desde un spec (recomendado) o clonando una base (legacy)',
  usage: 'new [--spec archivo] [--modo spec|clon] [--giro g] [--nombre n]',
  help: [
    'Desde spec (recomendado): escribe packages/template-kit/specs/<giro>-<nombre>.spec.json con el',
    'copy del giro y lo compila con `lattiz build` (único en el giro, validado antes de escribir).',
    `  Giros con spec: ${Object.keys(GIROS).join(', ')}.`,
    '  --spec <archivo>          usa ese spec (si no existe, lo crea con --giro/--nombre/--tier)',
    '  --modo spec|clon          sin terminal: spec solo con --spec o --modo spec',
    '  --twin                    el par Básico + Pro (igual que --tier ambos)',
    '  --images placeholder|none|pexels · --dry-run · --json (como en build)',
    '',
    'Clonar una base (legacy, Fase 1): copia un manifiesto existente en packages/template-kit/templates/<id>.ts',
    'y reescribe id, nombre, categoría, descripción, nombre del negocio y (Pro) motion. No reescribe el copy',
    'ni elige tema; mientras sea idéntico a su base, kit:validate falla para el rubro.',
    '',
    '  --tier pro|basico|ambos',
    '  --giro restaurante|barberia|clinica|floreria|despacho|estetica|tienda|otro',
    '  --nombre "Nombre del negocio"',
    '  --id <id>                id cuando es un solo tier',
    '  --id-pro / --id-basico   ids cuando son ambos',
    '  --base <id>              base cuando es un solo tier (por defecto: bases.json)',
    '  --base-pro / --base-basico',
    '',
    'Bases por giro: packages/lattiz-cli/bases.json',
    'Ejemplos:',
    '  pnpm lattiz new --modo spec --twin --giro floreria --nombre "Flores Lupita" --yes',
    '  pnpm lattiz new --spec packages/template-kit/specs/floreria-lupita.spec.json --yes --json',
    '  pnpm lattiz new --modo clon --tier ambos --giro floreria --nombre "Flores Lupita" --yes   (legacy)',
  ],
  options: {
    spec: { type: 'string' },
    modo: { type: 'string' },
    twin: { type: 'boolean' },
    images: { type: 'string' },
    'dry-run': { type: 'boolean' },
    force: { type: 'boolean' },
    json: { type: 'boolean' },
    tier: { type: 'string' },
    giro: { type: 'string' },
    nombre: { type: 'string' },
    id: { type: 'string' },
    'id-pro': { type: 'string' },
    'id-basico': { type: 'string' },
    base: { type: 'string' },
    'base-pro': { type: 'string' },
    'base-basico': { type: 'string' },
  },
  async run(ctx) {
    if (str(ctx.flags, 'spec')) return runFromSpec(ctx);
    const mode = await select<'spec' | 'clon'>(ctx, {
      message: '¿Cómo quieres crearla?',
      flag: 'modo',
      value: str(ctx.flags, 'modo') as 'spec' | 'clon' | undefined,
      // Without a terminal the Phase 1 behavior (clone) stays the default.
      initial: interactive(ctx) ? 'spec' : 'clon',
      options: [
        {
          value: 'spec',
          label: 'Desde spec (recomendado)',
          hint: 'copy y diseño del giro, única por construcción',
        },
        {
          value: 'clon',
          label: 'Clonar una base (legacy)',
          hint: 'copia una barbería; hay que diferenciarla a mano',
        },
      ],
    });
    if (mode === 'spec') return runFromSpec(ctx);
    if (bool(ctx.flags, 'json'))
      throw usage(
        '--json solo aplica al camino desde spec (--modo spec o --spec).',
      );
    return runClone(ctx);
  },
};

async function runClone(ctx: Context): Promise<ExitCode> {
  const bases = loadBases();
  log.title('lattiz new (clonar una base, legacy)');
  const choice = await select<TierChoice>(ctx, {
    message: '¿Qué tier?',
    flag: 'tier',
    value: str(ctx.flags, 'tier') as TierChoice | undefined,
    options: [
      {
        value: 'pro',
        label: 'Pro',
        hint: 'memorable: Lattiz Motion, más secciones',
      },
      { value: 'basico', label: 'Básico', hint: 'bonito y rápido' },
      {
        value: 'ambos',
        label: 'Ambos',
        hint: 'el par Básico + Pro para un prospecto',
      },
    ],
  });
  const giro = await select(ctx, {
    message: '¿Giro?',
    flag: 'giro',
    value: str(ctx.flags, 'giro'),
    options: Object.entries(bases).map(([value, g]) => ({
      value,
      label: g.label,
    })),
  });
  const g = bases[giro];
  const name = await text(ctx, {
    message: 'Nombre del negocio (se muestra en la plantilla)',
    flag: 'nombre',
    value: str(ctx.flags, 'nombre'),
    validate: (v) => (v.trim().length < 2 ? 'escribe un nombre' : undefined),
  });
  const tiers: Tier[] =
    choice === 'ambos'
      ? ['basic', 'pro']
      : [choice === 'pro' ? 'pro' : 'basic'];
  const existing = localIds();
  const specs: CloneSpec[] = [];
  for (const tier of tiers) {
    const key = TIER_KEY[tier];
    const single = tiers.length === 1;
    const id = await text(ctx, {
      message: `Id de la plantilla ${tierLabel(tier)}`,
      flag: single ? 'id' : `id-${key}`,
      value:
        str(ctx.flags, single ? 'id' : `id-${key}`) ??
        (single ? undefined : str(ctx.flags, 'id')),
      initial: suggestId(giro, name, tier),
      validate: (v) =>
        !ID_RE.test(v) || v.length > 60
          ? 'minúsculas, números y guiones (^[a-z0-9]+(-[a-z0-9]+)*$), máx. 60'
          : existing.includes(v) || specs.some((s) => s.id === v)
            ? `ya existe ${v}`
            : undefined,
    });
    const sameTier = existing.filter((x) => tierOf(x) === tier);
    const fallback = sameTier.includes(g[key]) ? g[key] : sameTier[0];
    const base = await select(ctx, {
      message: `Base a clonar para ${tierLabel(tier)}`,
      flag: single ? 'base' : `base-${key}`,
      value: str(ctx.flags, single ? 'base' : `base-${key}`),
      initial: fallback,
      options: sameTier.map((x) => ({
        value: x,
        label: x,
        hint: x === g[key] ? 'sugerida para el giro' : undefined,
      })),
    });
    specs.push({
      base,
      id,
      tier,
      name: name.trim(),
      giro,
      giroLabel: g.label,
      category: g.category,
    });
  }

  const created: string[] = [];
  for (const spec of specs) {
    const target = manifestFile(spec.id);
    if (existsSync(target))
      throw usage(`Ya existe ${relative(REPO_ROOT, target)}.`);
    let source: string;
    try {
      source = cloneSource(readFileSync(manifestFile(spec.base), 'utf8'), spec);
    } catch (error) {
      throw usage(
        `No pude clonar ${spec.base}: ${(error as Error).message}`,
        'Elige otra base con --base.',
      );
    }
    writeFileSync(target, source);
    const manifest = await loadManifest(spec.id).catch(() => null);
    if (
      !manifest ||
      manifest.id !== spec.id ||
      manifest.tier !== spec.tier ||
      manifest.name !== spec.name
    ) {
      unlinkSync(target);
      throw usage(
        `La copia de ${spec.base} no quedó bien (id/tier/nombre); no se creó nada.`,
      );
    }
    created.push(spec.id);
    log.ok(
      `${relative(REPO_ROOT, target)} ${c.gray(`(${tierLabel(spec.tier)}, clon de ${spec.base})`)}`,
    );
    writeState(spec.id, {});
    const built = await compile(spec.id);
    if (built.code !== 0) {
      log.fail(`kit:compile falló:\n${cleanOutput(built.output)}`);
      return EXIT.GATE;
    }
    log.ok(`compila ${c.gray(`(${built.ms} ms)`)}`);
    const valid = await validate(spec.id);
    if (valid.code === 0) log.ok('kit:validate sin hallazgos');
    else {
      const findings = cleanOutput(valid.output)
        .split('\n')
        .filter((l) => /✗|error|must|unique|similar/i.test(l));
      log.warn(
        `kit:validate: ${findings.length || 'varios'} hallazgo(s) — esperado en un clon (tema, titular y estructura iguales a la base).`,
      );
    }
  }

  log.plain(`\n${c.bold('Siguiente:')}`);
  for (const spec of specs) {
    const vertical = /\bvertical:\s*'([^']+)'/.exec(
      readFileSync(manifestFile(spec.id), 'utf8'),
    )?.[1];
    log.plain(`  ${c.bold(spec.id)} ${c.gray(`(${tierLabel(spec.tier)})`)}`);
    log.plain(
      `    1. Edita packages/template-kit/templates/${spec.id}.ts: tema propio (themes/), variantes de hero/servicios y textos.`,
    );
    if (vertical && vertical !== spec.giro)
      log.plain(
        `       ${c.yellow(`Ojo: el giro "${spec.giro}" aún no tiene vertical en el kit; el clon sigue siendo de "${vertical}" (secciones y copy).`)}`,
      );
    log.plain(`    2. pnpm lattiz dev ${spec.id}`);
    if (spec.tier === 'pro') log.plain(`    3. pnpm lattiz motion ${spec.id}`);
    log.plain(
      `    ${spec.tier === 'pro' ? 4 : 3}. pnpm lattiz check ${spec.id}`,
    );
  }
  log.plain(
    `  Publicar: ${specs.length === 2 ? `pnpm lattiz ship ${specs[0].id} ${specs[1].id}` : `pnpm lattiz publish ${specs[0].id}`}`,
  );
  log.plain();
  log.warn(
    'Mientras un clon sea idéntico a su base, kit:validate falla también para la base y el resto del rubro ' +
      '(tema, tipografía y titular deben ser únicos): sus seeds quedan bloqueados hasta que lo diferencies o lo borres.',
  );
  log.plain(
    c.gray(
      'El copy no se reescribe para el giro (Fase 2 / skill de Claude): sigue siendo el de la base.',
    ),
  );
  return EXIT.OK;
}
