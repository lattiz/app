import { Inject, Injectable } from '@nestjs/common';
import { BillingService } from '../../billing/billing.service';
import { DomainsService } from '../../domains/domains.service';
import { EmailOutboxService } from '../../email/application/email-outbox.service';
import { type AuthAdminPort, AUTH_ADMIN_PORT } from '../domain/auth-admin.port';
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
    private readonly billing: BillingService,
    private readonly emails: EmailOutboxService,
  ) {}

  // Profile before auth user: if the privileged auth delete fails, we surface an
  // error rather than leaving an auth user pointing at a deleted profile.
  async execute(sub: string): Promise<void> {
    // Capture before auth.users disappears; outbox has no FK so the row survives.
    const email = await this.emails.resolveEmailForUser(sub).catch(() => null);

    // First and blocking: a deleted user can no longer reach the portal to stop being charged.
    await this.billing.cancelSubscriptionsForUser(sub);
    // The domain rows cascade away with the user; free their DNS zones (and Vercel mapping) before that.
    await this.domains.releaseDomainsForUser(sub);
    await this.users.delete(sub);
    await this.authAdmin.deleteUser(sub);

    if (email) {
      await this.emails.enqueue(
        'account_deleted',
        email,
        {},
        `account_deleted:${sub}`,
        null,
      );
    }
  }
}
