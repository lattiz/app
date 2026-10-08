import { client } from '@lattiz/api-client';
import { supabase } from './supabase';

function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (!import.meta.env.DEV || typeof window === 'undefined') return configured;
  const host = window.location.hostname;
  // Phone opens the Vite Network URL; localhost would point at the phone itself.
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return configured;
  const url = new URL(configured);
  url.hostname = host;
  return url.origin;
}

/** Configures base URL, attaches the Supabase token, and signs out on any 401. */
export function configureApiClient(): void {
  client.setConfig({ baseUrl: apiBaseUrl() });

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
