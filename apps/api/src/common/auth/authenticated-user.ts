import type { JWTPayload } from 'jose';

/**
 * The authenticated principal attached to the request by
 * {@link SupabaseJwtGuard} after a Supabase JWT is verified.
 */
export interface AuthenticatedUser {
  /** Supabase user id (the `sub` claim). */
  sub: string;
  /** The full set of verified JWT claims. */
  claims: JWTPayload;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
