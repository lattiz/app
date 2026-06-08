import { type UserProfile } from './user.entity';

/**
 * Port for reading/writing application user profiles.
 *
 * This is the seam the deferred ORM decision plugs into: the in-memory adapter
 * used this session implements it, and a Drizzle/Prisma adapter will later
 * implement the same interface with zero changes to the application layer.
 */
export interface UserRepositoryPort {
  findById(id: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<UserProfile>;
}

/** DI token for {@link UserRepositoryPort}. */
export const USER_REPOSITORY_PORT = Symbol('USER_REPOSITORY_PORT');
