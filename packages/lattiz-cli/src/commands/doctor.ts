import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { browserPath } from '../lib/browser';
import type { Command } from '../lib/command';
import { EXIT } from '../lib/errors';
import { paths, REPO_ROOT } from '../lib/paths';
import {
  env,
  hasEnv,
  OPTIONAL_SEED_ENV,
  remoteTemplates,
  SEED_ENV,
} from '../lib/remote';
import { badge, c, log, type Status, table } from '../lib/ui';
import { vercel } from '../../../../scripts/lib/vercel-cli';

export const DEV_PORT = 4400;

interface Finding {
  area: string;
  status: Status;
  detail: string;
  fix?: string;
}

function sh(cmd: string, args: string[]): { ok: boolean; out: string } {
  const r = spawnSync(cmd, args, { cwd: REPO_ROOT, encoding: 'utf8' });
  return {
    ok: r.status === 0 && !r.error,
    out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim(),
  };
}

export function portFree(port: number): Promise<boolean> {
  return new Promise((done) => {
    const srv = createServer();
    srv.once('error', () => done(false));
    srv.listen(port, '127.0.0.1', () => srv.close(() => done(true)));
  });
}

async function diagnose(): Promise<Finding[]> {
  const out: Finding[] = [];
  const pkg = JSON.parse(
    readFileSync(resolve(REPO_ROOT, 'package.json'), 'utf8'),
  ) as {
    packageManager: string;
  };

  const major = Number(process.versions.node.split('.')[0]);
  out.push(
    major === 24
      ? { area: 'Node', status: 'PASS', detail: `v${process.versions.node}` }
      : {
          area: 'Node',
          status: 'FAIL',
          detail: `v${process.versions.node}; el repo pide >=24 <25`,
          fix: 'nvm install 24 && nvm use (lee .nvmrc)',
        },
  );

  const wanted = pkg.packageManager.split('@')[1];
  const pnpm = sh('pnpm', ['--version']);
  out.push(
    !pnpm.ok
      ? {
          area: 'pnpm',
          status: 'FAIL',
          detail: 'no encontrado',
          fix: 'corepack enable && corepack prepare',
        }
      : pnpm.out === wanted
        ? { area: 'pnpm', status: 'PASS', detail: pnpm.out }
        : {
            area: 'pnpm',
            status: 'WARN',
            detail: `${pnpm.out}; el repo fija ${wanted}`,
            fix: 'corepack enable (usa la versión de packageManager)',
          },
  );

  out.push(
    existsSync(resolve(REPO_ROOT, 'node_modules/.pnpm'))
      ? {
          area: 'Dependencias',
          status: 'PASS',
          detail: 'node_modules instalado',
        }
      : {
          area: 'Dependencias',
          status: 'FAIL',
          detail: 'falta node_modules',
          fix: 'pnpm install',
        },
  );

  const chrome = browserPath();
  out.push(
    chrome
      ? {
          area: 'Playwright Chromium',
          status: 'PASS',
          detail: `${chrome.source}: ${chrome.path}`,
        }
      : {
          area: 'Playwright Chromium',
          status: 'FAIL',
          detail: 'no instalado para esta versión de Playwright',
          fix: 'pnpm exec playwright install chromium (o LATTIZ_CHROMIUM_PATH=<ruta a chrome>)',
        },
  );

  const origins = env();
  for (const key of SEED_ENV) {
    const present = hasEnv(key);
    const wrongProvider =
      key === 'STORAGE_PROVIDER' &&
      present &&
      process.env[key]?.trim() !== 'r2';
    out.push(
      !present
        ? {
            area: key,
            status: 'FAIL',
            detail: 'falta',
            fix:
              key === 'TEMPLATE_PREVIEWS_BASE_URL'
                ? 'ponla en .env (https://templates.lattiz.app); ver .env.example'
                : 'ponla en .env o apps/api/.env (ver .env.example)',
          }
        : wrongProvider
          ? {
              area: key,
              status: 'FAIL',
              detail: 'presente, pero no es "r2"',
              fix: 'las plantillas viven en R2: STORAGE_PROVIDER=r2',
            }
          : {
              area: key,
              status: 'PASS',
              detail: `presente (${origins.get(key) ?? '?'})`,
            },
    );
  }
  for (const key of OPTIONAL_SEED_ENV) {
    out.push({
      area: key,
      status: hasEnv(key) ? 'PASS' : 'INFO',
      detail: hasEnv(key)
        ? `presente (${origins.get(key) ?? '?'})`
        : 'no definida (opcional)',
    });
  }

  if (hasEnv('SUPABASE_URL') && hasEnv('SUPABASE_SERVICE_ROLE_KEY')) {
    try {
      const rows = await remoteTemplates();
      out.push({
        area: 'Supabase (lectura)',
        status: 'PASS',
        detail: `${rows?.length ?? 0} fila(s) en public.templates`,
      });
    } catch (error) {
      out.push({
        area: 'Supabase (lectura)',
        status: 'FAIL',
        detail: (error as Error).message,
        fix: 'revisa SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY y la red',
      });
    }
  }

  const version = vercel(['--version']);
  if (!version.ok) {
    out.push({
      area: 'Vercel CLI',
      status: 'FAIL',
      detail: 'no encontrado (lo usa `lattiz deploy`)',
      fix: 'pnpm add -g vercel',
    });
  } else {
    out.push({
      area: 'Vercel CLI',
      status: 'PASS',
      detail: (version.stdout || version.stderr).split('\n').pop() ?? '',
    });
    const whoami = vercel(['whoami']);
    out.push(
      whoami.ok
        ? { area: 'Vercel sesión', status: 'PASS', detail: 'autenticado' }
        : {
            area: 'Vercel sesión',
            status: 'FAIL',
            detail: 'sin sesión',
            fix: 'vercel login (o VERCEL_TOKEN en .env)',
          },
    );
  }
  out.push(
    existsSync(resolve(paths.previews, '.vercel/project.json'))
      ? {
          area: 'Proyecto previews',
          status: 'PASS',
          detail: 'apps/template-previews enlazado',
        }
      : {
          area: 'Proyecto previews',
          status: 'FAIL',
          detail: 'apps/template-previews no está enlazado a Vercel',
          fix: 'pnpm tsx scripts/setup-template-previews.ts (idempotente)',
        },
  );

  out.push(
    (await portFree(DEV_PORT))
      ? {
          area: `Puerto ${DEV_PORT}`,
          status: 'PASS',
          detail: 'libre para `lattiz dev`',
        }
      : {
          area: `Puerto ${DEV_PORT}`,
          status: 'WARN',
          detail: 'ocupado',
          fix: `pnpm lattiz dev <id> --port ${DEV_PORT + 1}`,
        },
  );

  const git = sh('git', ['status', '--porcelain']);
  const dirty = git.out ? git.out.split('\n').length : 0;
  const branch = sh('git', ['branch', '--show-current']).out;
  out.push(
    dirty === 0
      ? { area: 'Git', status: 'PASS', detail: `limpio (${branch})` }
      : {
          area: 'Git',
          status: 'WARN',
          detail: `${dirty} archivo(s) sin commitear (${branch})`,
          fix: 'commitea antes de publicar: el deploy sube apps/template-previews/public tal como está',
        },
  );
  const ignored = sh('git', ['check-ignore', '-q', '.lattiz/state/x.json']).ok;
  if (!ignored)
    out.push({
      area: '.gitignore',
      status: 'WARN',
      detail: '.lattiz/ no está ignorado',
      fix: 'añade `.lattiz/` a .gitignore',
    });
  return out;
}

export const doctor: Command = {
  name: 'doctor',
  summary:
    'Revisa Node, pnpm, Chromium, Vercel, variables del seed, puerto y git',
  usage: 'doctor',
  help: [
    'Solo lee: nunca escribe en Supabase, R2 ni Vercel. De las variables muestra nombre y',
    'presencia, nunca el valor. Sale con 2 si algo bloquea el flujo completo.',
  ],
  options: {},
  async run() {
    log.title('lattiz doctor');
    const findings = await diagnose();
    console.log(
      table(
        ['Área', 'Estado', 'Detalle'],
        findings.map((f) => [f.area, badge(f.status), f.detail]),
      ),
    );
    const fixes = findings.filter(
      (f) => f.fix && (f.status === 'FAIL' || f.status === 'WARN'),
    );
    if (fixes.length > 0) {
      log.plain(`\n${c.bold('Cómo arreglarlo:')}`);
      for (const f of fixes)
        log.plain(`  ${badge(f.status)} ${f.area}: ${f.fix}`);
    }
    const fails = findings.filter((f) => f.status === 'FAIL').length;
    log.plain();
    if (fails === 0) {
      log.ok('Listo para el flujo completo.');
      return EXIT.OK;
    }
    log.fail(
      `${fails} problema(s) bloquean parte del flujo (dev y check funcionan sin Supabase ni Vercel).`,
    );
    return EXIT.USAGE;
  },
};
