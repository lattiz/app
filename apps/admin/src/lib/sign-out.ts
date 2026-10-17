import { adminMeControllerMeQueryKey } from '@lattiz/api-client';
import { queryClient } from './query-client';
import { supabase } from './supabase';

/** Drops the cached admin profile before the session, so the next account refetches. */
export async function signOutAdmin(): Promise<void> {
  queryClient.removeQueries({ queryKey: adminMeControllerMeQueryKey() });
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
