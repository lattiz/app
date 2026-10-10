import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DomainsModule } from '../domains/domains.module';
import { EmailModule } from '../email/email.module';
import { TemplatesModule } from '../templates/templates.module';
import { BillingCoreModule } from './billing-core.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PlanChangeImpactController } from './plan-change-impact.controller';
import { PlanChangeService } from './plan-change.service';

@Module({
  imports: [
    BillingCoreModule,
    DatabaseModule,
    DomainsModule,
    EmailModule,
    TemplatesModule,
  ],
  controllers: [BillingController, PlanChangeImpactController],
  providers: [BillingService, PlanChangeService],
  exports: [BillingService],
})
export class BillingModule {}
