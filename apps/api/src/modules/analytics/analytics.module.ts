import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AnalyticsConfig } from './analytics.config';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { createGa4Gateway, GA4_GATEWAY } from './ga4.gateway';

// SubscriptionActiveGuard lives in common/auth, so no BillingModule import is
// needed; BillingModule must never import this module (provisioning is lazy + cron).
@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsConfig,
    AnalyticsService,
    { provide: GA4_GATEWAY, useFactory: createGa4Gateway, inject: [AnalyticsConfig] },
  ],
})
export class AnalyticsModule {}
