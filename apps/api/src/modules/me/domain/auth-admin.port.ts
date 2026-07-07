/** Port for privileged auth-provider operations (Supabase admin API). */
export interface AuthAdminPort {
  /** Permanently deletes the auth user (Supabase `auth.users`). */
  deleteUser(id: string): Promise<void>;
}

/** DI token for {@link AuthAdminPort}. */
export const AUTH_ADMIN_PORT = Symbol('AUTH_ADMIN_PORT');
