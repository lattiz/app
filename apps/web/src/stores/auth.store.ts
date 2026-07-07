import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  initialize: () => void;
}

let initialized = false;

// Reactive mirror of the supabase-js session. supabase-js remains the single
// source of truth for tokens; this store just exposes session state to React
// and to the router's `beforeLoad` guards.
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: 'loading',

  initialize: () => {
    if (initialized) return;
    initialized = true;

    const apply = (session: Session | null) =>
      set({
        session,
        user: session?.user ?? null,
        status: session ? 'authenticated' : 'unauthenticated',
      });

    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    supabase.auth.onAuthStateChange((_event, session) => apply(session));
  },
}));
