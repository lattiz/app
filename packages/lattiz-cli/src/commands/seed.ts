import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { bool, type Command, type Context } from '../lib/command';
import { CliError, EXIT, type ExitCode, gate, usage } from '../lib/errors';
import { distDir, REPO_ROOT } from '../lib/paths';
import { assertRemoteWrite, confirm } from '../lib/prompt';
import {
  missingEnv,
  previewUrl,
  remoteTemplate,
  SEED_ENV,
  tenantsUsing,
} from '../lib/remote';
import { readState, writeState } from '../lib/state';
import {
  assertTemplate,
  compile,
  readDist,
  run,
  tierLabel,
} from '../lib/templates';
import { c, log, plan } from '../lib/ui';

// Same pattern the seed migrates (scripts/parse-and-seed-template.ts LOCAL_ASSET_RE).
const LOCAL_ASSET_RE =
  /(?<![\w/.:-])(?:\.\/)?assets\/[A-Za-z0-9._-]+\.(?:jpe?g|png|webp|avif|gif|svg|mp4|webm|woff2?|ttf|otf)\b/g;

/** `pnpm template:seed -- --only <id> …` (compile → validate → parse-and-seed-template.ts). */
export function templateSeed(id: string, flags: string[]): Promise<number> {
  return run('pnpm', ['-s', 'template:seed', '--', '--only', id, ...flags], {
    cwd: REPO_ROOT,
    inherit: true,
  }).then((r) => r.code);
}

/** Verify, thumbnail and activate a template whose preview a deploy already published. */
export async function finalizeSeed(id: string): Promise<number> {
  if (
    !existsSync(resolve(distDir(id), 'index.html')) &&
    (await compile(id)).code !== 0
  )
    return 1;
  const { manifest } = readDist(id);
  return run(
    'pnpm',
    [
      'exec',
      'tsx',
      'scripts/parse-and-seed-template.ts',
      '--dir',
      `packages/template-kit/dist/${id}`,
      '--id',
      id,
      '--name',
      manifest.name,
      '--category',
      manifest.category,
      '--description',
      manifest.description,
      '--finalize',
    ],
    { cwd: REPO_ROOT, inherit: true },
  ).then((r) => r.code);
}

export function requireSeedEnv(): void {
  const missing = missingEnv(SEED_ENV);
  if (missing.length > 0)
    throw usage(
      `Faltan variables para el seed: ${missing.join(', ')}.`,
      'Corre `pnpm lattiz doctor` para ver de dónde se leen.',
    );
}

interface SeedPlan {
  id: string;
  tier: string;
  name: string;
  category: string;
  description: string;
  assets: number;
  jsonKb: number;
  existing: { tier: string; is_active: boolean } | null | undefined;
  tenants: number | null;
  /** Spec `renews`: the template this one replaces (retired by hand in /admin, never by the seed). */
  renews?: {
    id: string;
    existing: { is_active: boolean } | null | undefined;
    tenants: number | null;
  };
}

async function buildPlan(id: string): Promise<SeedPlan> {
  const dist = readDist(id);
  const project = resolve(distDir(id), `${id}.grapesjs`);
  const refs = new Set(
    [
      ...dist.html.matchAll(LOCAL_ASSET_RE),
      ...readFileSync(project, 'utf8').matchAll(LOCAL_ASSET_RE),
    ].map((m) => m[0]),
  );
  let existing: SeedPlan['existing'];
  let tenants: number | null = null;
  try {
    existing = await remoteTemplate(id);
    if (existing) tenants = await tenantsUsing(id);
  } catch (error) {
    log.warn(`No pude leer la fila actual: ${(error as Error).message}`);
  }
  let renews: SeedPlan['renews'];
  if (dist.manifest.renews) {
    renews = { id: dist.manifest.renews, existing: undefined, tenants: null };
    try {
      renews.existing = await remoteTemplate(renews.id);
      if (renews.existing) renews.tenants = await tenantsUsing(renews.id);
    } catch (error) {
      log.warn(
        `No pude leer la fila de ${renews.id}: ${(error as Error).message}`,
      );
    }
  }
  return {
    id,
    tier: dist.meta.tier,
    name: dist.manifest.name,
    category: dist.manifest.category,
    description: dist.manifest.description,
    assets: refs.size,
    jsonKb: existsSync(project) ? Math.round(statSync(project).size / 1024) : 0,
    existing,
    tenants,
    ...(renews ? { renews } : {}),
  };
}

function printPlan(p: SeedPlan, deploy: boolean, overwriteMeta: boolean): void {
  const row =
    p.existing === undefined
      ? c.gray('sin consultar (sin credenciales de Supabase o sin respuesta)')
      : p.existing === null
        ? `${c.green('INSERT')} (nueva, queda inactiva hasta tener preview y miniatura)`
        : `${c.yellow('UPDATE')} por id (conserva is_active=${p.existing.is_active}` +
          (overwriteMeta
            ? '; --overwrite-meta pisa nombre, descripción, categoría, orden y miniatura)'
            : '; conserva nombre, descripción, categoría, orden y miniatura del admin)');
  log.plain(
    plan(`Seed de ${p.id}`, [
      [
        'Plantilla',
        `${p.name} · ${tierLabel(p.tier)} · categoría ${p.category}`,
      ],
      ['Supabase', `1 fila de public.templates (id = '${p.id}'): ${row}`],
      [
        'Campos',
        (overwriteMeta || !p.existing
          ? 'name, description, category, sort_order, tier, grapesjs_json, preview_url, kit_meta'
          : 'tier, grapesjs_json, preview_url, kit_meta') +
          c.gray(` (${p.jsonKb} KB antes de reescribir URLs)`),
      ],
      [
        'R2',
        `${p.assets} asset(s) → templates/${p.id}/ (WebP ≤ 2000 px; los existentes no se resuben)`,
      ],
      ['Archivo', `apps/template-previews/public/${p.id}/index.html`],
      [
        'Preview',
        `${previewUrl(p.id) ?? c.gray('TEMPLATE_PREVIEWS_BASE_URL sin definir')} ${deploy ? '' : c.gray('(se publica con `pnpm lattiz deploy`)')}`,
      ],
      ['Otras plantillas', 'no se tocan'],
    ]),
  );
  if (p.renews) {
    const r = p.renews;
    if (r.existing === null) log.info(`Renueva ${r.id} (no está sembrada).`);
    else if (r.existing && !r.existing.is_active)
      log.info(`Renueva ${r.id} (ya está inactiva).`);
    else
      log.warn(
        `Renueva ${r.id}${r.existing ? `, que sigue activa con ${r.tenants ?? '?'} sitio(s)` : ''}. ` +
          `Cuando ${p.id} esté publicada y verificada, retira ${r.id} en /admin (Plantillas → Retirar); el seed no la toca y sus clientes conservan su copia.`,
      );
  }
  if (p.existing && p.existing.tier !== p.tier) {
    log.warn(
      `Cambia el tier ${tierLabel(p.existing.tier)} → ${tierLabel(p.tier)}; ${p.tenants ?? '?'} sitio(s) la usan. ` +
        'Esos clientes conservan su copia, pero el acceso por plan se calcula con el tier nuevo.',
    );
  }
}

async function verifyRow(id: string, tier: string): Promise<void> {
  const row = await remoteTemplate(id);
  if (!row)
    throw gate(
      `La fila ${id} no aparece en public.templates después del seed.`,
    );
  if (row.tier !== tier)
    throw gate(`La fila quedó con tier ${row.tier}, se esperaba ${tier}.`);
  log.ok(
    `Fila verificada: tier ${tierLabel(row.tier)} · is_active=${row.is_active} · created_at ${row.created_at}`,
  );
  if (row.preview_url) log.info(`preview_url: ${row.preview_url}`);
}

/**
 * Seeds one template (never others). Without --deploy the preview is written but not published:
 * `lattiz deploy` publishes it and finishes thumbnail + activation.
 */
export async function seedOne(
  ctx: Context,
  id: string,
  opts: { dryRun: boolean; deploy: boolean; overwriteMeta: boolean },
): Promise<ExitCode> {
  log.title(`lattiz seed ${id}${opts.dryRun ? ' --dry-run' : ''}`);
  if (!opts.dryRun) requireSeedEnv();
  // The seed's own dry run: compile, validate, motion table, asset list. Writes nothing.
  const dry = await templateSeed(id, ['--dry-run', '--no-deploy']);
  if (dry !== 0)
    throw new CliError(
      `El dry-run del seed falló (código ${dry}).`,
      EXIT.GATE,
      `Revisa con \`pnpm lattiz check ${id}\`.`,
    );
  const p = await buildPlan(id);
  log.plain();
  printPlan(p, opts.deploy, opts.overwriteMeta);
  if (opts.dryRun) {
    log.plain();
    log.ok('Dry run: no se escribió nada en Supabase, R2 ni Vercel.');
    return EXIT.OK;
  }
  log.plain();
  if (
    !(await confirm(
      ctx,
      `¿Sembrar ${id} (${tierLabel(p.tier)}) en el proyecto remoto?`,
    ))
  ) {
    log.warn('Cancelado: no se escribió nada.');
    return EXIT.GATE;
  }
  const code = await templateSeed(id, [
    ...(opts.deploy ? [] : ['--no-deploy']),
    ...(opts.overwriteMeta ? ['--overwrite-meta'] : []),
  ]);
  if (code !== 0)
    throw new CliError(
      `El seed falló (código ${code}).`,
      EXIT.GATE,
      `Arregla lo de arriba y vuelve a correr \`pnpm lattiz seed ${id}\` (es idempotente).`,
    );
  writeState(id, {
    lastSeed: {
      at: new Date().toISOString(),
      tier: p.tier,
      deployed: opts.deploy,
    },
    pendingFinalize: !opts.deploy,
  });
  await verifyRow(id, p.tier);
  if (!opts.deploy)
    log.info(
      `Siguiente: ${c.bold('pnpm lattiz deploy')} publica el preview y activa la plantilla.`,
    );
  return EXIT.OK;
}

export const seed: Command = {
  name: 'seed',
  summary:
    'Siembra UNA plantilla (fila + R2 + archivo de preview) con confirmación; --dry-run no escribe',
  usage: 'seed <id> [--dry-run] [--deploy] [--overwrite-meta]',
  help: [
    'Envuelve `pnpm template:seed -- --only <id>`. Primero corre siempre el dry-run del seed',
    '(compila, valida, tabla de Motion, assets), luego muestra exactamente qué escribirá y pide',
    'confirmación (--yes la salta). Después verifica la fila con una consulta de solo lectura.',
    '',
    '  --dry-run          no escribe nada (ni Supabase, ni R2, ni Vercel)',
    '  --deploy           también despliega previews, toma miniatura y activa (el seed de siempre);',
    '                     sin él, `pnpm lattiz deploy` termina esos pasos',
    '  --overwrite-meta   pisa nombre, descripción, categoría, orden y la miniatura del admin',
  ],
  options: {
    'dry-run': { type: 'boolean' },
    deploy: { type: 'boolean' },
    'overwrite-meta': { type: 'boolean' },
  },
  run(ctx) {
    const id = assertTemplate(ctx.positionals[0]);
    if (!bool(ctx.flags, 'dry-run')) assertRemoteWrite(ctx, `seed ${id}`);
    if (readState(id).lastCheck?.result === 'FAIL')
      log.warn(`El último \`lattiz check ${id}\` tuvo FAIL.`);
    return seedOne(ctx, id, {
      dryRun: bool(ctx.flags, 'dry-run'),
      deploy: bool(ctx.flags, 'deploy'),
      overwriteMeta: bool(ctx.flags, 'overwrite-meta'),
    });
  },
};
