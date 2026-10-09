import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { BillingPricesService } from './billing-prices.service';
import { EffectivePlanService } from './effective-plan.service';
import { StripeProvider } from './stripe.provider';
import { SubscriptionStateService } from './subscription-state.service';

/**
 * Stripe reads with no dependency on DomainsModule, so DomainsModule can import
 * them while BillingModule keeps importing DomainsModule.
 */
@Module({
  imports: [DatabaseModule],
  providers: [
    StripeProvider,
    BillingPricesService,
    SubscriptionStateService,
    EffectivePlanService,
  ],
  exports: [
    StripeProvider,
    BillingPricesService,
    SubscriptionStateService,
    EffectivePlanService,
  ],
})
export class BillingCoreModule {}
