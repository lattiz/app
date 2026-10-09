import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PreviewModule } from './common/billing/preview.module';
import { DEFAULT_RATE_LIMIT } from './common/throttling/rate-limits';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BillingModule } from './modules/billing/billing.module';
import { DomainsModule } from './modules/domains/domains.module';
import { EmailModule } from './modules/email/email.module';
import { HealthModule } from './modules/health/health.module';
import { MeModule } from './modules/me/me.module';
import { SitesModule } from './modules/sites/sites.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { TenantsModule } from './modules/tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PreviewModule,
    ScheduleModule.forRoot(),
    // In-memory store: correct for the single API instance; a shared store is needed before scaling out.
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ...DEFAULT_RATE_LIMIT }],
    }),
    AnalyticsModule,
    BillingModule,
    DomainsModule,
    EmailModule,
    HealthModule,
    MeModule,
    SitesModule,
    TemplatesModule,
    TenantsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
