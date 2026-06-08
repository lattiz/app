import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Browser Supabase client used ONLY for auth flows (signup, login, OAuth,
 * reset). Application data never goes through Supabase directly — it goes
 * through the Lattiz API. Only the anon/publishable key belongs here; the
 * service_role key must never reach the client bundle.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = supabase !== null;
