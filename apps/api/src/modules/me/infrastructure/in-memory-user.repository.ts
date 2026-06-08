import { Injectable } from '@nestjs/common';
import { type UserProfile } from '../domain/user.entity';
import { type UserRepositoryPort } from '../domain/user-repository.port';

/**
 * In-memory mock adapter for {@link UserRepositoryPort}.
 *
 * State lives in a `Map` and is lost on restart — sufficient to exercise the
 * port end-to-end this session, with no real database connection.
 */
@Injectable()
export class InMemoryUserRepository implements UserRepositoryPort {
  private readonly store = new Map<string, UserProfile>();

  async findById(id: string): Promise<UserProfile | null> {
    return this.store.get(id) ?? null;
  }

  async save(profile: UserProfile): Promise<UserProfile> {
    this.store.set(profile.id, profile);
    return profile;
  }
}
