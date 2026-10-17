import { Module } from '@nestjs/common';
import { PreviewModule } from '../../common/billing/preview.module';
import { SettingsModule } from '../../common/settings/settings.module';
import { DatabaseModule } from '../../database/database.module';
import { BillingCoreModule } from '../billing/billing-core.module';
import { DomainsModule } from '../domains/domains.module';
import { StorageModule } from '../storage/storage.module';
import { AdminAuditController } from './audit/admin-audit.controller';
import { AdminAuditInterceptor } from './audit/admin-audit.interceptor';
import { AdminAuditLogService } from './audit/admin-audit-log.service';
import { AdminAuditService } from './audit/admin-audit.service';
import { AdminGuard } from './auth/admin.guard';
import { AdminMembersService } from './auth/admin-members.service';
import { AdminSubscriptionsController } from './billing/admin-subscriptions.controller';
import { AdminSubscriptionsService } from './billing/admin-subscriptions.service';
import { AdminDomainController } from './domains/admin-domain.controller';
import { AdminDomainService } from './domains/admin-domain.service';
import { AdminMembersController } from './members/admin-members.controller';
import { AdminMembershipService } from './members/admin-membership.service';
import { AdminMeController } from './me/admin-me.controller';
import { AdminSettingsController } from './settings/admin-settings.controller';
import { AdminSettingsService } from './settings/admin-settings.service';
import { AdminMetricsController } from './metrics/admin-metrics.controller';
import { AdminMetricsService } from './metrics/admin-metrics.service';
import { KpiSnapshotCron } from './metrics/kpi-snapshot.cron';
import { StorageUsageCron } from './storage/storage-usage.cron';
import { StorageUsageService } from './storage/storage-usage.service';
import { AdminTemplatesController } from './templates/admin-templates.controller';
import { AdminTemplatesService } from './templates/admin-templates.service';
import { AdminTenantsController } from './tenants/admin-tenants.controller';
import { AdminTenantsService } from './tenants/admin-tenants.service';
import { AdminTrialsController } from './trials/admin-trials.controller';
import { AdminTrialsService } from './trials/admin-trials.service';

@Module({
  imports: [
    DatabaseModule,
    BillingCoreModule,
    DomainsModule,
    PreviewModule,
    SettingsModule,
    StorageModule,
  ],
  controllers: [
    AdminMeController,
    AdminSettingsController,
    AdminMembersController,
    AdminAuditController,
    AdminTenantsController,
    AdminDomainController,
    AdminSubscriptionsController,
    AdminTemplatesController,
    AdminTrialsController,
    AdminMetricsController,
  ],
  providers: [
    AdminMembersService,
    AdminMembershipService,
    AdminSettingsService,
    AdminAuditLogService,
    AdminGuard,
    AdminAuditService,
    AdminAuditInterceptor,
    StorageUsageService,
    StorageUsageCron,
    AdminTenantsService,
    AdminDomainService,
    AdminSubscriptionsService,
    AdminTemplatesService,
    AdminTrialsService,
    AdminMetricsService,
    KpiSnapshotCron,
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
