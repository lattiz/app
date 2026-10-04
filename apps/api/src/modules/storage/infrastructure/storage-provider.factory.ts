import type { ObjectStoragePort } from '../domain/object-storage.port';
import { R2StorageAdapter } from './r2-storage.adapter';
import { SupabaseStorageAdapter } from './supabase-storage.adapter';

export type StorageProviderName = 'r2' | 'supabase';

type EnvReader = (key: string) => string | undefined;

const R2_REQUIRED_KEYS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
] as const;

/** Defaults to supabase until the flip; an unknown value throws instead of silently picking one. */
export function resolveStorageProvider(env: EnvReader): StorageProviderName {
  const provider = (env('STORAGE_PROVIDER') ?? '').trim().toLowerCase();
  if (provider === '' || provider === 'supabase') return 'supabase';
  if (provider === 'r2') return 'r2';
  throw new Error(
    `Unknown STORAGE_PROVIDER "${provider}"; expected "r2" or "supabase".`,
  );
}

/** Throws at boot (never per request) when the selected provider is misconfigured. */
export function createObjectStorage(env: EnvReader): ObjectStoragePort {
  if (resolveStorageProvider(env) === 'supabase') {
    return new SupabaseStorageAdapter({
      url: env('SUPABASE_URL')?.trim(),
      serviceRoleKey: env('SUPABASE_SERVICE_ROLE_KEY')?.trim(),
    });
  }

  const missing = R2_REQUIRED_KEYS.filter((key) => !env(key)?.trim());
  if (missing.length > 0) {
    throw new Error(
      `STORAGE_PROVIDER=r2 requires ${missing.join(', ')} to be set.`,
    );
  }
  const value = (key: (typeof R2_REQUIRED_KEYS)[number]): string =>
    (env(key) as string).trim();

  return new R2StorageAdapter({
    accountId: value('R2_ACCOUNT_ID'),
    accessKeyId: value('R2_ACCESS_KEY_ID'),
    secretAccessKey: value('R2_SECRET_ACCESS_KEY'),
    bucket: value('R2_BUCKET'),
    publicUrl: parsePublicUrl(value('R2_PUBLIC_URL')),
  });
}

/** Stored URLs are `${publicUrl}/${path}`, so it must be a bare http(s) origin plus optional path. */
function parsePublicUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('R2_PUBLIC_URL must be a valid URL, e.g. https://assets.lattiz.app.');
  }
  if (
    (url.protocol !== 'https:' && url.protocol !== 'http:') ||
    url.search ||
    url.hash
  ) {
    throw new Error('R2_PUBLIC_URL must be an http(s) URL without query or hash.');
  }
  return raw.replace(/\/+$/, '');
}
