import { type UserProfile } from './user.entity';

/** Port for user profile persistence. Swap adapter (Drizzle, mock) without touching use cases. */
export interface UserRepositoryPort {
  findById(id: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<UserProfile>;
}

/** DI token for {@link UserRepositoryPort}. */
export const USER_REPOSITORY_PORT = Symbol('USER_REPOSITORY_PORT');
