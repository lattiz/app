import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Manifest, ManifestMotion } from '../../../template-kit/src/types';
import { usage } from './errors';
import { distDir, KIT, manifestFile, paths } from './paths';

export const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export type Tier = 'basic' | 'pro';

export function tierLabel(tier: string | undefined): string {
  if (tier === 'pro') return 'Pro';
  if (tier === 'basic') return 'Básico';
  return tier ?? '?';
}

export function assertId(id: string | undefined): string {
  if (!id)
    throw usage(
      'Falta el id de la plantilla.',
      'Ejemplo: pnpm lattiz check barberia-norte-v1',
    );
  if (!ID_RE.test(id) || id.length > 60)
    throw usage(
      `Id inválido: "${id}".`,
      'Usa minúsculas, números y guiones simples (^[a-z0-9]+(-[a-z0-9]+)*$), máximo 60 caracteres.',
    );
  return id;
}

/** A valid id with a manifest in packages/template-kit/templates. */
export function assertTemplate(id: string | undefined): string {
  const valid = assertId(id);
  if (!existsSync(manifestFile(valid)))
    throw usage(
      `No existe packages/template-kit/templates/${valid}.ts.`,
      'Lista las plantillas con `pnpm lattiz list` o crea una con `pnpm lattiz new`.',
    );
  return valid;
}

export function localIds(): string[] {
  return readdirSync(paths.templates)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => f.slice(0, -3))
    .sort();
}

/** Reads the manifest straight from its TS module (tsx runs it). */
export async function loadManifest(id: string): Promise<Manifest> {
  const mod = (await import(`${manifestFile(id)}?t=${Date.now()}`)) as {
    default: Manifest;
  };
  return mod.default;
}

export interface DistMeta {
  tier: Tier;
  vertical: string;
  schemaType?: string;
  motion?: ManifestMotion;
  slots: { slot: string; variant: string; role: string; counted: boolean }[];
}

export interface Dist {
  dir: string;
  html: string;
  meta: DistMeta;
  manifest: Manifest;
}

export function readDist(id: string): Dist {
  const dir = distDir(id);
  const file = resolve(dir, 'index.html');
  if (!existsSync(file))
    throw usage(
      `No hay build de ${id}.`,
      `Compila con \`pnpm lattiz dev ${id}\` o \`pnpm lattiz check ${id}\`.`,
    );
  return {
    dir,
    html: readFileSync(file, 'utf8'),
    meta: JSON.parse(
      readFileSync(resolve(dir, 'template.meta.json'), 'utf8'),
    ) as DistMeta,
    manifest: (
      JSON.parse(readFileSync(resolve(dir, 'manifest.json'), 'utf8')) as {
        manifest: Manifest;
      }
    ).manifest,
  };
}

export interface RunResult {
  code: number;
  output: string;
  ms: number;
}

/** Runs a command, capturing output (or streaming it with `inherit`). */
export function run(
  cmd: string,
  args: string[],
  opts: { cwd: string; inherit?: boolean; env?: NodeJS.ProcessEnv },
): Promise<RunResult> {
  const started = Date.now();
  return new Promise((done) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: opts.env ?? process.env,
      stdio: opts.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout?.on('data', (d: Buffer) => (output += d));
    child.stderr?.on('data', (d: Buffer) => (output += d));
    child.on('error', (error) =>
      done({ code: 127, output: error.message, ms: Date.now() - started }),
    );
    child.on('close', (code) =>
      done({ code: code ?? 1, output, ms: Date.now() - started }),
    );
  });
}

/** kit:compile in a child process: manifests and content packs are TS modules this process would cache. */
export function compile(id: string): Promise<RunResult> {
  return run(
    'pnpm',
    ['exec', 'tsx', 'src/cli/compile.ts', `templates/${id}.ts`],
    { cwd: KIT },
  );
}

export function validate(id: string): Promise<RunResult> {
  return run('pnpm', ['exec', 'tsx', 'src/cli/validate.ts', `dist/${id}`], {
    cwd: KIT,
  });
}

/** Drops pnpm's engine warnings from captured output. */
export function cleanOutput(text: string): string {
  return text
    .split('\n')
    .filter((l) => !/Unsupported engine|WARN\s+Unsupported/.test(l))
    .join('\n')
    .trim();
}
