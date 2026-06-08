/**
 * Minimal application-side user profile.
 *
 * This is distinct from the Supabase auth user: Supabase owns identity, while
 * this profile is application data that will eventually live in our own
 * datastore (behind {@link UserRepositoryPort}).
 */
export interface UserProfile {
  /** Matches the Supabase user id (`sub`). */
  id: string;
  displayName: string;
}
