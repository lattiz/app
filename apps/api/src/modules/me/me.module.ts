import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { BillingModule } from '../billing/billing.module';
import { DomainsModule } from '../domains/domains.module';
import { DeleteAccountUseCase } from './application/delete-account.use-case';
import { GetMeUseCase } from './application/get-me.use-case';
import { AUTH_ADMIN_PORT } from './domain/auth-admin.port';
import { USER_REPOSITORY_PORT } from './domain/user-repository.port';
import { DrizzleUserRepository } from './infrastructure/drizzle-user.repository';
import { SupabaseAuthAdminAdapter } from './infrastructure/supabase-auth-admin.adapter';
import { MeController } from './interface/me.controller';

@Module({
  imports: [DatabaseModule, BillingModule, DomainsModule],
  controllers: [MeController],
  providers: [
    GetMeUseCase,
    DeleteAccountUseCase,
    { provide: USER_REPOSITORY_PORT, useClass: DrizzleUserRepository },
    { provide: AUTH_ADMIN_PORT, useClass: SupabaseAuthAdminAdapter },
  ],
})
export class MeModule {}
