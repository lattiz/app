import { Module } from '@nestjs/common';
import { PreviewModule } from '../../common/billing/preview.module';
import { DatabaseModule } from '../../database/database.module';
import { BillingCoreModule } from '../billing/billing-core.module';
import { StorageModule } from '../storage/storage.module';
import { AdminAuditInterceptor } from './audit/admin-audit.interceptor';
import { AdminAuditService } from './audit/admin-audit.service';
import { AdminGuard } from './auth/admin.guard';
import { AdminMembersService } from './auth/admin-members.service';
import { AdminSubscriptionsController } from './billing/admin-subscriptions.controller';
import { AdminSubscriptionsService } from './billing/admin-subscriptions.service';
import { AdminMeController } from './me/admin-me.controller';
import { StorageUsageService } from './storage/storage-usage.service';
import { AdminTenantsController } from './tenants/admin-tenants.controller';
import { AdminTenantsService } from './tenants/admin-tenants.service';

@Module({
  imports: [DatabaseModule, BillingCoreModule, PreviewModule, StorageModule],
  controllers: [
    AdminMeController,
    AdminTenantsController,
    AdminSubscriptionsController,
  ],
  providers: [
    AdminMembersService,
    AdminGuard,
    AdminAuditService,
    AdminAuditInterceptor,
    StorageUsageService,
    AdminTenantsService,
    AdminSubscriptionsService,
  ],
  exports: [
    AdminMembersService,
    AdminGuard,
    AdminAuditService,
    AdminAuditInterceptor,
    StorageUsageService,
  ],
})
export class AdminModule {}
