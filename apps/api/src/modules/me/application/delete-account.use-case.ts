import { Inject, Injectable } from '@nestjs/common';
import { DomainsService } from '../../domains/domains.service';
import {
  type AuthAdminPort,
  AUTH_ADMIN_PORT,
} from '../domain/auth-admin.port';
import {
  type UserRepositoryPort,
  USER_REPOSITORY_PORT,
} from '../domain/user-repository.port';

/** Hard-deletes the account: app profile first, then the Supabase auth user. */
@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly users: UserRepositoryPort,
    @Inject(AUTH_ADMIN_PORT)
    private readonly authAdmin: AuthAdminPort,
    private readonly domains: DomainsService,
  ) {}

  // Profile before auth user: if the privileged auth delete fails, we surface an
  // error rather than leaving an auth user pointing at a deleted profile.
  async execute(sub: string): Promise<void> {
    // The domain rows cascade away with the user; free their DNS zones (and Vercel mapping) before that.
    await this.domains.releaseDomainsForUser(sub);
    await this.users.delete(sub);
    await this.authAdmin.deleteUser(sub);
  }
}
