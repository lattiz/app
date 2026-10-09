import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  ObjectStoragePort,
  UploadOptions,
} from '../domain/object-storage.port';
import {
  classifyHttpStatus,
  ObjectStorageException,
} from '../domain/object-storage.exceptions';
import {
  assertSafePath,
  assertSafePrefix,
  encodePath,
  pathFromPublicUrl,
} from '../domain/storage-path';

/** Public bucket already used for template assets; tenant uploads live under their own prefix. */
export const SUPABASE_ASSETS_BUCKET = 'template-assets';

export interface SupabaseStorageConfig {
  url?: string;
  serviceRoleKey?: string;
}

/**
 * Uploads to Supabase Storage with the service_role key — the second documented
 * exception to "service_role never leaves account deletion" (see CONVENTIONS.md);
 * storage RLS is bypassed and the tenant path is derived server-side, never from
 * the client. Lazy client so the API still boots without the key configured.
 */
export class SupabaseStorageAdapter implements ObjectStoragePort {
  private client?: SupabaseClient;

  constructor(private readonly config: SupabaseStorageConfig) {}

  async uploadPublic(
    path: string,
    body: Buffer,
    contentType: string,
    options: UploadOptions = {},
  ): Promise<string> {
    assertSafePath('upload', path);
    const { error } = await this.admin()
      .storage.from(SUPABASE_ASSETS_BUCKET)
      .upload(path, body, { contentType, upsert: options.upsert ?? false });
    if (error) throw toException('upload', error);

    return this.publicUrl(path);
  }

  async removePublic(path: string): Promise<void> {
    assertSafePath('delete', path);
    const { error } = await this.admin()
      .storage.from(SUPABASE_ASSETS_BUCKET)
      .remove([path]);
    if (error) throw toException('delete', error);
  }

  publicUrl(path: string): string {
    return `${this.publicBase()}/${encodePath(path)}`;
  }

  pathFromPublicUrl(url: string | null | undefined): string | null {
    return pathFromPublicUrl(
      url,
      this.config.url ? this.publicBase() : undefined,
    );
  }

  async usageBytes(prefix: string): Promise<number> {
    assertSafePrefix('usage', prefix);
    const folder = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    const limit = 1000;
    let total = 0;
    let offset = 0;
    for (;;) {
      const { data, error } = await this.admin()
        .storage.from(SUPABASE_ASSETS_BUCKET)
        .list(folder, { limit, offset });
      if (error) throw toException('usage', error);
      const entries = data ?? [];
      for (const entry of entries) {
        const size = entry.metadata?.size;
        if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
          total += size;
        }
      }
      if (entries.length < limit) return total;
      offset += entries.length;
    }
  }

  private publicBase(): string {
    const url = this.config.url?.replace(/\/+$/, '');
    if (!url) {
      throw new ObjectStorageException(
        'url',
        'config',
        'SUPABASE_URL is required to build asset URLs.',
      );
    }
    return `${url}/storage/v1/object/public/${SUPABASE_ASSETS_BUCKET}`;
  }

  private admin(): SupabaseClient {
    if (this.client) return this.client;
    const { url, serviceRoleKey } = this.config;
    if (!url || !serviceRoleKey) {
      throw new ObjectStorageException(
        'client',
        'config',
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to upload assets.',
      );
    }
    this.client = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return this.client;
  }
}

interface StorageErrorLike {
  message: string;
  statusCode?: string | number;
  status?: number;
}

function toException(
  operation: string,
  error: StorageErrorLike,
): ObjectStorageException {
  const raw = error.statusCode ?? error.status;
  const status = raw === undefined ? undefined : Number(raw);
  const httpStatus = Number.isFinite(status) ? status : undefined;
  return new ObjectStorageException(
    operation,
    classifyHttpStatus(httpStatus),
    error.message,
    httpStatus,
  );
}
