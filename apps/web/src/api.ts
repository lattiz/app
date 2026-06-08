import { client } from '@lattiz/api-client';
import { supabase } from './supabase';

/** Configures base URL and attaches the Supabase session token on every request. */
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
