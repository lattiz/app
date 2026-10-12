/**
 * Read-only access to the remote project: the CLI's only writes go through the seed script.
 * Same env and precedence as the seed (scripts/lib/seed-env.ts).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadSeedEnv, OPTIONAL_SEED_ENV, SEED_ENV } from '../../../../scripts/lib/seed-env';

export { OPTIONAL_SEED_ENV, SEED_ENV };

let origins: Map<string, string> | null = null;

/** Loads ./.env and the shared apps/api/.env keys once; returns where each key came from. */
export function env(): Map<string, string> {
  origins ??= loadSeedEnv();
  return origins;
}

export function hasEnv(key: string): boolean {
  env();
  return Boolean(process.env[key]?.trim());
}

export function missingEnv(keys: readonly string[]): string[] {
  return keys.filter((k) => !hasEnv(k));
}

export function previewsBaseUrl(): string | null {
  env();
  return process.env.TEMPLATE_PREVIEWS_BASE_URL?.trim().replace(/\/+$/, '') || null;
}

export function previewUrl(id: string): string | null {
  const base = previewsBaseUrl();
  return base ? `${base}/${id}` : null;
}

export interface RemoteTemplate {
  id: string;
  name: string;
  category: string | null;
  tier: string;
  is_active: boolean;
  created_at: string;
  preview_url: string | null;
  thumbnail_url: string | null;
}

const COLUMNS = 'id, name, category, tier, is_active, created_at, preview_url, thumbnail_url';

function client(): SupabaseClient | null {
  if (missingEnv(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']).length > 0) return null;
  return createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** null when Supabase env is missing; throws on a query error. */
export async function remoteTemplates(ids?: string[]): Promise<RemoteTemplate[] | null> {
  const supabase = client();
  if (!supabase) return null;
  let query = supabase.from('templates').select(COLUMNS).order('id');
  if (ids) query = query.in('id', ids);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as RemoteTemplate[];
}

export async function remoteTemplate(id: string): Promise<RemoteTemplate | null | undefined> {
  const rows = await remoteTemplates([id]);
  if (rows === null) return undefined;
  return rows[0] ?? null;
}

/** Tenant sites using the template (they keep their own copy; a re-seed doesn't reach them). */
export async function tenantsUsing(id: string): Promise<number | null> {
  const supabase = client();
  if (!supabase) return null;
  const { count, error } = await supabase
    .from('site_schemas')
    .select('tenant_id', { count: 'exact', head: true })
    .eq('template_id', id);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function httpStatus(url: string, timeoutMs = 8000): Promise<number | string> {
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
    return res.status;
  } catch (error) {
    return (error as Error).message;
  }
}

/** Polls until 200 or the timeout. */
export async function waitFor200(
  url: string,
  timeoutMs: number,
  onTick?: (last: number | string) => void,
): Promise<{ ok: boolean; last: number | string }> {
  const deadline = Date.now() + timeoutMs;
  let last: number | string = 'sin respuesta';
  while (Date.now() < deadline) {
    last = await httpStatus(url, 10_000);
    if (last === 200) return { ok: true, last };
    onTick?.(last);
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { ok: false, last };
}
