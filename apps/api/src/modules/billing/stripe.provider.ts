import { Logger } from '@nestjs/common';
import Stripe from 'stripe';

export const STRIPE_CLIENT = Symbol('STRIPE_CLIENT');

export const StripeProvider = {
  provide: STRIPE_CLIENT,
  useFactory: (): Stripe => {
    const apiVersion = (process.env.STRIPE_API_VERSION ??
      '2025-06-30.basil') as Stripe.LatestApiVersion;
    // The API boots without STRIPE_SECRET_KEY (mirrors the service_role policy);
    // any real Stripe call then fails with 401 until the key is configured.
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      new Logger('StripeProvider').warn(
        'STRIPE_SECRET_KEY is not set — billing calls will fail until configured.',
      );
    }
    return new Stripe(key ?? 'sk_test_not_configured', {
      apiVersion,
      typescript: true,
    });
  },
};
