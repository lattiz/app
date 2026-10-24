import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  lastLine,
  TEMPLATE_PREVIEWS_PROJECT,
  vercel,
} from '../../../../scripts/lib/vercel-cli';
import { bool, type Command, type Context } from '../lib/command';
import { EXIT, type ExitCode, gate, usage } from '../lib/errors';
import { paths, REPO_ROOT, stateFile } from '../lib/paths';
import { assertRemoteWrite, confirm } from '../lib/prompt';
import {
  hasEnv,
  previewsBaseUrl,
  previewUrl,
  remoteTemplate,
  remoteTemplates,
  waitFor200,
} from '../lib/remote';
import { readState, writeState } from '../lib/state';
import { c, log, plan } from '../lib/ui';
import { finalizeSeed } from './seed';

const VERIFY_TIMEOUT_MS = 120_000;

function pendingIds(): string[] {
  const dir = resolve(paths.work, 'state');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5))
    .filter((id) => readState(id).pendingFinalize && existsSync(stateFile(id)));
}

/** Preview folders that differ from git HEAD: they go live exactly as they are on disk. */
function uncommittedPreviews(): string[] {
  const out =
    spawnSync(
      'git',
      ['status', '--porcelain', '--', 'apps/template-previews/public'],
      { cwd: REPO_ROOT, encoding: 'utf8' },
    ).stdout ?? '';
  return [
    ...new Set(
      out
        .split('\n')
        .filter(Boolean)
        .map(
          (l) =>
            l
              .slice(3)
              .replace('apps/template-previews/public/', '')
              .split('/')[0],
        ),
    ),
  ];
}

/**
 * Active templates whose preview folder is not in this tree. The deploy replaces the whole site, so
 * shipping from a branch that lacks them (a stale branch, say) takes their pages down with a 404.
 */
async function missingActivePreviews(folders: string[]): Promise<string[]> {
  const rows = await remoteTemplates().catch(() => null);
  if (!rows) return [];
  return rows
    .filter((r) => r.is_active && !folders.includes(r.id))
    .map((r) => r.id);
}

export function requireDeployTooling(): void {
  if (!vercel(['--version']).ok)
    throw usage(
      'No encuentro el Vercel CLI.',
      'pnpm add -g vercel, luego vercel login (o VERCEL_TOKEN en .env).',
    );
  if (!existsSync(resolve(paths.previews, '.vercel/project.json')))
    throw usage(
      'apps/template-previews no está enlazado a Vercel.',
      'pnpm tsx scripts/setup-template-previews.ts (idempotente).',
    );
  if (!previewsBaseUrl())
    throw usage(
      'Falta TEMPLATE_PREVIEWS_BASE_URL.',
      'https://templates.lattiz.app en .env (ver .env.example).',
    );
}

/**
 * Deploys apps/template-previews to production, waits for it to answer, then finishes (thumbnail +
 * activation) every template seeded without a deploy. `expect` adds ids whose URL must answer 200.
 */
export async function deployPreviews(
  ctx: Context,
  opts: { skipVerify: boolean; expect?: string[]; allowMissing?: boolean },
): Promise<ExitCode> {
  log.title('lattiz deploy');
  requireDeployTooling();
  const base = previewsBaseUrl() as string;
  const folders = readdirSync(paths.previewsPublic).filter((f) =>
    statSync(resolve(paths.previewsPublic, f)).isDirectory(),
  );
  const pending = pendingIds();
  const changed = uncommittedPreviews();
  const missing = opts.allowMissing ? [] : await missingActivePreviews(folders);
  if (missing.length > 0)
    throw gate(
      `Este árbol no tiene la carpeta de preview de ${missing.length} plantilla(s) activa(s) en Supabase: ${missing.join(', ')}. Desplegar ahora las dejaría en 404.`,
      'Trae esas carpetas a la rama (git merge origin/main) y repite; con --allow-missing sigues a propósito (por ejemplo, si las retiraste).',
    );
  log.plain(
    plan('Deploy de previews', [
      [
        'Proyecto',
        `Vercel "${TEMPLATE_PREVIEWS_PROJECT}" (producción)${hasEnv('VERCEL_SCOPE') ? c.gray(' · VERCEL_SCOPE definido') : ''}`,
      ],
      [
        'Sube',
        `apps/template-previews/public completo: ${folders.length} plantilla(s)`,
      ],
      ['Sin commitear', changed.length ? c.yellow(changed.join(', ')) : 'nada'],
      [
        'Termina',
        pending.length
          ? `${pending.join(', ')} (miniatura + activar)`
          : 'ninguna pendiente',
      ],
      ['URL', base],
    ]),
  );
  const unexpected = changed.filter(
    (f) => !pending.includes(f) && !(opts.expect ?? []).includes(f),
  );
  if (unexpected.length > 0)
    log.warn(
      `Hay previews modificados que no sembraste en esta sesión: ${unexpected.join(', ')}. Saldrán tal cual.`,
    );
  log.plain();
  if (!(await confirm(ctx, `¿Desplegar ${base} a producción?`))) {
    log.warn('Cancelado: no se desplegó nada.');
    return EXIT.GATE;
  }

  const deploy = vercel(['deploy', '--prod', '--yes']);
  const at = new Date().toISOString();
  if (!deploy.ok) {
    for (const id of new Set([...pending, ...(opts.expect ?? [])]))
      writeState(id, { lastDeploy: { at, url: base, ok: false } });
    throw gate(
      `vercel deploy falló:\n${deploy.stderr || deploy.stdout}`,
      'Revisa `vercel whoami` y VERCEL_SCOPE; luego `pnpm lattiz deploy`.',
    );
  }
  log.ok(`Desplegado: ${lastLine(deploy.stdout)}`);

  if (!opts.skipVerify) {
    for (const url of [
      `${base}/`,
      ...new Set(
        [...pending, ...(opts.expect ?? [])].map(
          (id) => previewUrl(id) as string,
        ),
      ),
    ]) {
      const res = await waitFor200(url, VERIFY_TIMEOUT_MS);
      if (!res.ok)
        throw gate(
          `${url} no respondió 200 en ${VERIFY_TIMEOUT_MS / 1000} s (último: ${res.last}).`,
          'Vuelve a intentar con `pnpm lattiz deploy`.',
        );
      log.ok(`${url} → 200`);
    }
  } else log.warn('--skip-verify: no se comprobó la URL.');

  let failed = 0;
  for (const id of pending) {
    log.title(`Terminando ${id} (miniatura + activar)`);
    const code = await finalizeSeed(id);
    const row = await remoteTemplate(id).catch(() => undefined);
    const ok = code === 0 && Boolean(row?.is_active && row.thumbnail_url);
    writeState(id, {
      lastDeploy: { at, url: previewUrl(id) as string, ok },
      pendingFinalize: !ok,
    });
    if (ok) log.ok(`${id}: activa, miniatura lista`);
    else {
      failed += 1;
      log.fail(
        `${id}: no quedó activa. Reintenta con \`pnpm lattiz deploy\` (sigue pendiente).`,
      );
    }
  }
  for (const id of opts.expect ?? [])
    if (!pending.includes(id))
      writeState(id, {
        lastDeploy: { at, url: previewUrl(id) as string, ok: true },
      });
  return failed > 0 ? EXIT.GATE : EXIT.OK;
}

export const deploy: Command = {
  name: 'deploy',
  summary:
    'Despliega templates.lattiz.app (Vercel CLI) con confirmación y espera a que responda 200',
  usage: 'deploy [--skip-verify] [--allow-missing]',
  help: [
    'Sube apps/template-previews/public completo al proyecto "template-previews" (producción), sondea',
    'la URL hasta 200 y termina las plantillas sembradas sin deploy (miniatura + activar).',
    '',
    '  --skip-verify   no sondea la URL',
    '  --allow-missing despliega aunque falten carpetas de plantillas activas (se quedarían en 404)',
  ],
  options: {
    'skip-verify': { type: 'boolean' },
    'allow-missing': { type: 'boolean' },
  },
  run(ctx) {
    assertRemoteWrite(ctx, 'deploy');
    return deployPreviews(ctx, {
      skipVerify: bool(ctx.flags, 'skip-verify'),
      allowMissing: bool(ctx.flags, 'allow-missing'),
    });
  },
};
