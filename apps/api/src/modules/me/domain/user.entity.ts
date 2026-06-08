/** Application profile. id = Supabase auth sub. Distinct from auth.users. */
export interface UserProfile {
  id: string;
  displayName: string;
}
