import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DomainsModule } from '../domains/domains.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { StripeProvider } from './stripe.provider';

@Module({
  imports: [DatabaseModule, DomainsModule],
  controllers: [BillingController],
  providers: [BillingService, StripeProvider],
  exports: [BillingService],
})
export class BillingModule {}
