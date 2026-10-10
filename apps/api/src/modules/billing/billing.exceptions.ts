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

/** The requested plan/period has no active Stripe price (Dashboard setup missing). */
export class PriceNotConfiguredException extends DomainException {
  readonly code = 'PRICE_NOT_CONFIGURED';
  readonly status = HttpStatus.SERVICE_UNAVAILABLE;

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

/** Stripe could not confirm the cancellation, so deleting the account would leave the customer being charged. */
export class SubscriptionCancellationFailedException extends DomainException {
  readonly code = 'SUBSCRIPTION_CANCELLATION_FAILED';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor() {
    super(
      'The subscription could not be canceled; the account was not deleted.',
    );
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

/** Stripe could not be reached and there is no cached copy to fall back on. */
export class BillingProviderUnavailableException extends DomainException {
  readonly code = 'BILLING_PROVIDER_UNAVAILABLE';
  readonly status = HttpStatus.SERVICE_UNAVAILABLE;

  constructor() {
    super('Prices are temporarily unavailable. Try again in a moment.');
  }
}

/** The requested plan change is not allowed right now; `details.blockers` lists why. */
export class PlanChangeNotAllowedException extends DomainException {
  readonly code = 'PLAN_CHANGE_NOT_ALLOWED';
  readonly status = HttpStatus.CONFLICT;

  constructor(blockers: readonly string[]) {
    super('This plan change is not allowed right now.', { blockers });
  }
}

/** Upgrades need the dedicated portal configuration (`STRIPE_PORTAL_CONFIGURATION_PLAN_CHANGE`). */
export class PlanChangeNotConfiguredException extends DomainException {
  readonly code = 'PLAN_CHANGE_NOT_CONFIGURED';
  readonly status = HttpStatus.SERVICE_UNAVAILABLE;

  constructor() {
    super('Plan changes are not configured yet.');
  }
}

/** There is no scheduled plan change to cancel. */
export class NoPendingPlanChangeException extends DomainException {
  readonly code = 'NO_PENDING_PLAN_CHANGE';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('There is no scheduled plan change.');
  }
}

/** The tenant already has a live Stripe subscription, so a second checkout must not start. */
export class SubscriptionAlreadyActiveException extends DomainException {
  readonly code = 'SUBSCRIPTION_ALREADY_ACTIVE';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('Ya tienes una suscripción vigente.');
  }
}

/** The subscription on record belongs to another Stripe customer; nothing is changed. */
export class SubscriptionOwnershipMismatchException extends DomainException {
  readonly code = 'SUBSCRIPTION_OWNERSHIP_MISMATCH';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('The subscription does not belong to this account.');
  }
}

/** Stripe failed while scheduling the change; any half-created schedule was released. */
export class PlanChangeFailedException extends DomainException {
  readonly code = 'PLAN_CHANGE_FAILED';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor() {
    super('The plan change could not be scheduled. Try again in a moment.');
  }
}

/** The downgrade loses something (e.g. a Pro template) and the tenant has not acknowledged it yet. */
export class PlanChangeImpactNotAcknowledgedException extends DomainException {
  readonly code = 'PLAN_CHANGE_IMPACT_NOT_ACKNOWLEDGED';
  readonly status = HttpStatus.CONFLICT;

  constructor(items: readonly unknown[]) {
    super('Acknowledge what this plan change removes before confirming it.', {
      items,
    });
  }
}

/** The tenant in the path is not the caller's. */
export class BillingTenantAccessDeniedException extends DomainException {
  readonly code = 'TENANT_ACCESS_DENIED';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('You do not have access to this tenant.');
  }
}
