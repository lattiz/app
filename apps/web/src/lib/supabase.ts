import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in apps/web/.env.',
  );
}

// Auth-only client. Anon key only — the service_role key must never reach the
// bundle. sessionStorage (not localStorage) so the session dies with the tab —
// appropriate for an admin dashboard. supabase-js owns token refresh/persistence.
export const supabase = createClient(url, anonKey, {
  auth: {
    storage: window.sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
