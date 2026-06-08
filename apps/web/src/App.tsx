import {
  healthControllerHealthOptions,
  meControllerMeOptions,
} from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { isSupabaseConfigured } from './supabase';

/**
 * Minimal screen proving the end-to-end type pipeline: the shapes returned by
 * `useQuery` below come straight from `apps/api/openapi.json` via
 * `@lattiz/api-client` — nothing here is hand-typed.
 */
export function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const health = useQuery(healthControllerHealthOptions());
  const me = useQuery({
    ...meControllerMeOptions(),
    // /me is protected — only worth calling once we may hold a session.
    enabled: loggedIn,
  });

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 640, margin: '2rem auto' }}>
      <h1>Lattiz</h1>
      <p>Type pipeline smoke test: API → openapi.json → @lattiz/api-client → React.</p>

      <section>
        <h2>Auth (Supabase)</h2>
        {isSupabaseConfigured ? (
          <LoginForm onSignedIn={() => setLoggedIn(true)} />
        ) : (
          <p>
            <code>VITE_SUPABASE_URL</code> / <code>VITE_SUPABASE_ANON_KEY</code> not
            set — copy <code>.env.example</code> to <code>.env</code> to enable login.
          </p>
        )}
      </section>

      <section>
        <h2>GET /health (public)</h2>
        <pre>{renderQuery(health)}</pre>
      </section>

      <section>
        <h2>GET /me (protected)</h2>
        {!loggedIn && <p>Sign in above to call this endpoint.</p>}
        {loggedIn && <pre>{renderQuery(me)}</pre>}
      </section>
    </main>
  );
}

function renderQuery(query: {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: unknown;
}): string {
  if (query.isLoading) return 'Loading…';
  if (query.isError) return `Error: ${describeError(query.error)}`;
  return JSON.stringify(query.data, null, 2);
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
