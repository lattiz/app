import { Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Public bucket already used for template assets; tenant uploads live under their own prefix. */
export const ASSETS_BUCKET = 'template-assets';

/**
 * Uploads to Supabase Storage with the service_role key — the second documented
 * exception to "service_role never leaves account deletion" (see CONVENTIONS.md);
 * storage RLS is bypassed and the tenant path is derived server-side, never from
 * the client. Lazy client so the API still boots without the key configured.
 */
@Injectable()
export class SupabaseStorageService {
  private client?: SupabaseClient;

  /** Uploads a buffer and returns its public CDN URL. */
  async uploadPublic(
    path: string,
    body: Buffer,
    contentType: string,
    options: { upsert?: boolean } = {},
  ): Promise<string> {
    const storage = this.admin().storage.from(ASSETS_BUCKET);

    const { error } = await storage.upload(path, body, {
      contentType,
      upsert: options.upsert ?? false,
    });
    if (error) throw new Error(error.message);

    return storage.getPublicUrl(path).data.publicUrl;
  }

  /** Removes an object; a missing object is not an error for the caller. */
  async removePublic(path: string): Promise<void> {
    const { error } = await this.admin()
      .storage.from(ASSETS_BUCKET)
      .remove([path]);
    if (error) throw new Error(error.message);
  }

  private admin(): SupabaseClient {
    if (this.client) return this.client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to upload assets.',
      );
    }
    this.client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return this.client;
  }
}
