import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type Aal = 'aal1' | 'aal2' | null;

interface AuthState {
  session: Session | null;
  status: AuthStatus;
  aal: Aal;
  applySession: (session: Session | null) => void;
  initialize: () => void;
}

let initialized = false;

// currentLevel is the `aal` claim. Decoding it here avoids calling back into
// supabase-js while onAuthStateChange still holds the auth lock.
function aalFromSession(session: Session | null): Aal {
  if (!session) return null;
  const segment = session.access_token.split('.')[1];
  if (!segment) return 'aal1';
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );
    const payload = JSON.parse(atob(padded)) as { aal?: unknown };
    return payload.aal === 'aal2' ? 'aal2' : 'aal1';
  } catch {
    return 'aal1';
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const applySession = (session: Session | null) =>
    set({
      session,
      status: session ? 'authenticated' : 'unauthenticated',
      aal: aalFromSession(session),
    });

  return {
    session: null,
    status: 'loading',
    aal: null,
    applySession,

    initialize: () => {
      if (initialized) return;
      initialized = true;

      void supabase.auth.getSession().then(({ data, error }) => {
        applySession(error ? null : data.session);
      });
      supabase.auth.onAuthStateChange((_event, session) => {
        applySession(session);
      });
    },
  };
});
