import { queryClient } from './query-client';
import { supabase } from './supabase';

/** Clears every cached query before the session ends, so the next account cannot see the previous one's clients. */
export async function signOutAdmin(): Promise<void> {
  queryClient.clear();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
