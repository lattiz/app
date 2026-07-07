import { client } from '@lattiz/api-client';
import { supabase } from './supabase';

/** Configures base URL, attaches the Supabase token, and signs out on any 401. */
export function configureApiClient(): void {
  client.setConfig({ baseUrl: import.meta.env.VITE_API_BASE_URL });

  client.interceptors.request.use(async (request) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  });

  // A 401 means the token is gone or invalid — drop the session. The resulting
  // auth-state change propagates to the store and the router redirects to /login.
  client.interceptors.response.use(async (response) => {
    if (response.status === 401) await supabase.auth.signOut();
    return response;
  });
}
