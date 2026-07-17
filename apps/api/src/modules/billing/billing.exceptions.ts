import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

/** No tenant row exists yet for the authenticated user. */
export class BillingTenantNotFoundException extends DomainException {
  readonly code = 'TENANT_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('No tenant exists for this user.');
  }
}

/** The requested plan/period has no matching Stripe price (Dashboard setup missing). */
export class PriceNotConfiguredException extends DomainException {
  readonly code = 'PRICE_NOT_CONFIGURED';
  readonly status = HttpStatus.INTERNAL_SERVER_ERROR;

  constructor(lookupKey: string) {
    super(
      `No Stripe price found for lookup_key "${lookupKey}". See STRIPE_SETUP.md.`,
    );
  }
}

/** The tenant has no Stripe customer, so there is nothing to manage in the portal. */
export class NoStripeCustomerException extends DomainException {
  readonly code = 'NO_STRIPE_CUSTOMER';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('This tenant has no active subscription to manage.');
  }
}

/** Stripe webhook signature verification failed. */
export class InvalidWebhookSignatureException extends DomainException {
  readonly code = 'INVALID_WEBHOOK_SIGNATURE';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor() {
    super('Invalid Stripe webhook signature.');
  }
}
