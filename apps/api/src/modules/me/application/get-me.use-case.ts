import { Inject, Injectable } from '@nestjs/common';
import { type UserProfile } from '../domain/user.entity';
import {
  type UserRepositoryPort,
  USER_REPOSITORY_PORT,
} from '../domain/user-repository.port';

export interface MeView {
  sub: string;
  email: string | null;
  claims: Record<string, unknown>;
  profile: UserProfile | null;
}

/** Returns token identity + application profile (null if none exists yet). */
@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(input: {
    sub: string;
    claims: Record<string, unknown>;
  }): Promise<MeView> {
    const profile = await this.users.findById(input.sub);
    const email =
      typeof input.claims.email === 'string' ? input.claims.email : null;
    return { sub: input.sub, email, claims: input.claims, profile };
  }
}
