import { client } from '@lattiz/api-client';
import { supabase } from './supabase';

/**
 * Points the generated `@lattiz/api-client` at the Lattiz API and attaches
 * the caller's Supabase access token as a bearer header on every request.
 *
 * This is the only place the front end touches the API base URL or the auth
 * header — everything else uses the typed SDK / TanStack Query hooks.
 */
export function configureApiClient(): void {
  client.setConfig({ baseUrl: import.meta.env.VITE_API_BASE_URL });

  client.interceptors.request.use(async (request) => {
    const token = await currentAccessToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  });
}

async function currentAccessToken(): Promise<string | undefined> {
  if (!supabase) return undefined;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}
