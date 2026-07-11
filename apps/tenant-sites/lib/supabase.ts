import { createClient } from '@supabase/supabase-js';

// Public-facing renderer: ANON key only, no user session. The public-read RLS
// policies expose only published sites / active tenants. NEVER the service role.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[tenant-sites] Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
