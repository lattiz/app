import { existsSync, readFileSync } from 'node:fs';
import { bool, type Command } from '../lib/command';
import { EXIT } from '../lib/errors';
import { manifestFile, previewFile } from '../lib/paths';
import {
  httpStatus,
  previewsBaseUrl,
  previewUrl,
  type RemoteTemplate,
  remoteTemplates,
} from '../lib/remote';
import { readState, type TemplateState } from '../lib/state';
import { assertTemplate, localIds, tierLabel } from '../lib/templates';
import { badge, c, log, table } from '../lib/ui';

function localTier(id: string): string {
  const src = readFileSync(manifestFile(id), 'utf8');
  return /\btier:\s*'(basic|pro)'/.exec(src)?.[1] ?? '?';
}

function ago(iso: string | undefined): string {
  if (!iso) return c.gray('—');
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (mins < 60) return `hace ${mins} min`;
  if (mins < 48 * 60) return `hace ${Math.round(mins / 60)} h`;
  return iso.slice(0, 10);
}

function checkCell(state: TemplateState): string {
  const check = state.lastCheck;
  if (!check) return c.gray('—');
  return `${badge(check.result)} ${c.gray(ago(check.at))}`;
}

export const list: Command = {
  name: 'list',
  aliases: ['status'],
  summary:
    'Plantillas locales + estado remoto (tier, activa, preview) + último check/seed/deploy',
  usage: 'list [id] [--offline] [--json]',
  help: [
    'Con id muestra el detalle de una plantilla. La consulta remota es de solo lectura',
    '(public.templates y la URL del preview). La tabla no tiene updated_at: se muestra created_at.',
    '',
    '  --offline   no consulta Supabase ni templates.lattiz.app',
    '  --json      salida JSON',
  ],
  options: { offline: { type: 'boolean' }, json: { type: 'boolean' } },
  async run(ctx) {
    const one = ctx.positionals[0];
    const ids = one ? [assertTemplate(one)] : localIds();
    const offline = bool(ctx.flags, 'offline');
    let remote: RemoteTemplate[] | null = null;
    let remoteError: string | null = null;
    const live = new Map<string, number | string>();
    if (!offline) {
      try {
        remote = await remoteTemplates(one ? ids : undefined);
      } catch (error) {
        remoteError = (error as Error).message;
      }
      if (previewsBaseUrl()) {
        await Promise.all(
          ids.map(async (id) =>
            live.set(id, await httpStatus(previewUrl(id) as string, 6000)),
          ),
        );
      }
    }
    const byId = new Map((remote ?? []).map((r) => [r.id, r]));
    const rows = ids.map((id) => ({
      id,
      tier: localTier(id),
      state: readState(id),
      remote: byId.get(id) ?? null,
      previewFile: existsSync(previewFile(id)),
      live: live.get(id),
    }));

    if (bool(ctx.flags, 'json')) {
      console.log(JSON.stringify({ remoteError, rows }, null, 2));
      return EXIT.OK;
    }

    log.title(one ? `lattiz status ${one}` : 'lattiz list');
    if (offline) log.info('Modo --offline: sin estado remoto.');
    else if (remote === null && !remoteError)
      log.warn(
        'Sin SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY: sin estado remoto (pnpm lattiz doctor).',
      );
    if (remoteError) log.warn(`Supabase no respondió: ${remoteError}`);

    const liveCell = (s: number | string | undefined) =>
      s === undefined
        ? c.gray('—')
        : s === 200
          ? c.green('200')
          : c.red(String(s).slice(0, 20));
    console.log(
      table(
        [
          'id',
          'tier',
          'remoto',
          'activa',
          'creada',
          'preview',
          'último check',
          'seed',
          'deploy',
        ],
        rows.map((r) => [
          r.id,
          tierLabel(r.tier),
          r.remote
            ? r.remote.tier === r.tier
              ? tierLabel(r.remote.tier)
              : c.yellow(`${tierLabel(r.remote.tier)} ≠ local`)
            : c.gray(remote ? 'no existe' : '—'),
          r.remote
            ? r.remote.is_active
              ? c.green('sí')
              : c.yellow('no')
            : c.gray('—'),
          r.remote ? r.remote.created_at.slice(0, 10) : c.gray('—'),
          `${r.previewFile ? 'archivo' : c.gray('sin archivo')} · ${liveCell(r.live)}`,
          checkCell(r.state),
          r.state.lastSeed
            ? `${ago(r.state.lastSeed.at)}${r.state.pendingFinalize ? c.yellow(' (falta deploy)') : ''}`
            : c.gray('—'),
          r.state.lastDeploy ? ago(r.state.lastDeploy.at) : c.gray('—'),
        ]),
      ),
    );
    const orphans = (remote ?? []).filter((r) => !ids.includes(r.id));
    if (!one && orphans.length > 0) {
      log.info(
        `En Supabase sin manifiesto en template-kit (legado, no se tocan): ${orphans.map((r) => r.id).join(', ')}`,
      );
    }
    if (one) {
      const r = rows[0];
      log.plain();
      if (r.remote?.preview_url)
        log.info(`preview_url: ${r.remote.preview_url}`);
      if (r.remote?.thumbnail_url)
        log.info(`thumbnail_url: ${r.remote.thumbnail_url}`);
      if (r.state.lastCheck) {
        log.info(
          `último check: ${r.state.lastCheck.result} (${r.state.lastCheck.fail} FAIL, ${r.state.lastCheck.warn} WARN) · capturas en ${r.state.lastCheck.shots}`,
        );
      }
      if (r.state.pendingFinalize)
        log.warn(
          'Sembrada sin deploy: corre `pnpm lattiz deploy` para publicar el preview y activarla.',
        );
    }
    return EXIT.OK;
  },
};
