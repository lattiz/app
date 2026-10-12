import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseEnv } from 'node:util';

const REPO_ROOT = resolve(__dirname, '../..');
const SHARED_API_KEY_RE =
  /^(SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|STORAGE_PROVIDER|R2_[A-Z_]+)$/;

/** Variables the seed needs (names only; values are never printed). */
export const SEED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STORAGE_PROVIDER',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
  'TEMPLATE_PREVIEWS_BASE_URL',
] as const;
export const OPTIONAL_SEED_ENV = ['VERCEL_SCOPE', 'VERCEL_TOKEN'] as const;

/**
 * Root .env first; apps/api/.env fills only the keys the seed shares with the API (Supabase, R2).
 * Returns where each key came from.
 */
export function loadSeedEnv(): Map<string, '.env' | 'apps/api/.env' | 'shell'> {
  const origin = new Map<string, '.env' | 'apps/api/.env' | 'shell'>();
  for (const key of Object.keys(process.env)) origin.set(key, 'shell');
  const root = join(REPO_ROOT, '.env');
  if (existsSync(root)) {
    for (const key of Object.keys(parseEnv(readFileSync(root, 'utf8'))))
      if (!origin.has(key)) origin.set(key, '.env');
    process.loadEnvFile(root);
  }

  // Never import the API's VERCEL_* (tenant-sites project/token) — the CLI would deploy there.
  const api = join(REPO_ROOT, 'apps/api/.env');
  if (!existsSync(api)) return origin;
  const shared = parseEnv(readFileSync(api, 'utf8'));
  for (const [key, value] of Object.entries(shared)) {
    if (SHARED_API_KEY_RE.test(key) && process.env[key] === undefined) {
      process.env[key] = value;
      origin.set(key, 'apps/api/.env');
    }
  }
  return origin;
}
