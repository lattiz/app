import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

export const TEMPLATE_PREVIEWS_PROJECT = 'template-previews';
export const TEMPLATE_PREVIEWS_DIR = resolve(
  __dirname,
  '../../apps/template-previews',
);

export interface VercelResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

/** VERCEL_SCOPE / VERCEL_TOKEN make every call target the same account as the setup script. */
function accountFlags(): string[] {
  const flags: string[] = [];
  const scope = process.env.VERCEL_SCOPE?.trim();
  const token = process.env.VERCEL_TOKEN?.trim();
  if (scope) flags.push('--scope', scope);
  if (token) flags.push('--token', token);
  return flags;
}

/** The project always comes from apps/template-previews/.vercel, never from inherited env. */
function cliEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, FORCE_COLOR: '0' };
  delete env.VERCEL_PROJECT_ID;
  delete env.VERCEL_ORG_ID;
  return env;
}

export function vercel(
  args: string[],
  cwd = TEMPLATE_PREVIEWS_DIR,
): VercelResult {
  const result = spawnSync('vercel', [...args, ...accountFlags()], {
    cwd,
    encoding: 'utf8',
    env: cliEnv(),
  });
  if (result.error)
    return { ok: false, stdout: '', stderr: result.error.message };
  return {
    ok: result.status === 0,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

export function lastLine(text: string): string {
  return text.split('\n').filter(Boolean).pop() ?? '';
}
