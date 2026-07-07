import { Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { type AuthAdminPort } from '../domain/auth-admin.port';

/**
 * The one place the API uses the Supabase service_role key — a deliberate,
 * documented exception (see CONVENTIONS.md). Only reachable through the
 * protected DELETE /me route; the client is created lazily so the key is not
 * required to boot the API, only to actually delete an account.
 */
@Injectable()
export class SupabaseAuthAdminAdapter implements AuthAdminPort {
  private client?: SupabaseClient;

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.admin().auth.admin.deleteUser(id);
    if (error) throw new Error(`Supabase admin deleteUser failed: ${error.message}`);
  }

  private admin(): SupabaseClient {
    if (this.client) return this.client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for account deletion.',
      );
    }
    this.client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return this.client;
  }
}
