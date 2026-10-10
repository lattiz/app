import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { DomainNotCoveredReason } from './domain/domain-pricing.policy';
import type { DomainJobErrorCode } from './dto/domains.response.dto';

/** No tenant row exists yet for the authenticated user. */
export class DomainsTenantNotFoundException extends DomainException {
  readonly code = 'TENANT_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('No tenant exists for this user.');
  }
}

/** The tenant already owns a provisioned domain (1 domain per tenant in MVP). */
export class TenantAlreadyHasDomainException extends DomainException {
  readonly code = 'TENANT_ALREADY_HAS_DOMAIN';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('This tenant already has a domain.');
  }
}

/** The account already received its one included domain, even if that domain was later released. */
export class IncludedDomainAlreadyUsedException extends DomainException {
  readonly code = 'INCLUDED_DOMAIN_ALREADY_USED';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super(
      'This account has already used its included domain. Contact Lattiz to add another.',
    );
  }
}

/** The requested provisioning job does not exist or belongs to another tenant. */
export class DomainJobNotFoundException extends DomainException {
  readonly code = 'DOMAIN_JOB_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('Domain provisioning job not found.');
  }
}

/** An Openprovider API call failed (availability, price, registration or DNS). */
export class RegistrarApiException extends DomainException {
  readonly code = 'REGISTRAR_API_ERROR';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor(
    readonly operation: string,
    detail: string,
    readonly httpStatus?: number,
    readonly registrarCode?: number,
    /** Our credentials/settings are wrong or missing, not the user's request. */
    readonly configError = false,
  ) {
    super(
      `Registrar ${operation} failed${httpStatus ? ` with status ${httpStatus}` : ''}: ${detail}.`,
    );
  }
}

/** Renewal refused: the domain is not active at the registrar (code 327). */
export class RegistrarDomainNotActiveException extends DomainException {
  readonly code = 'REGISTRAR_DOMAIN_NOT_ACTIVE';
  readonly status = HttpStatus.CONFLICT;

  constructor(readonly registrarDomainId: string) {
    super(
      `Registrar renewal failed: domain ${registrarDomainId} is not active.`,
    );
  }
}

/** A DNS provider (Cloudflare) API call failed (zone lookup/creation/deletion, records). */
export class DnsProviderApiException extends DomainException {
  readonly code = 'DNS_PROVIDER_API_ERROR';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor(
    operation: string,
    detail: string,
    readonly httpStatus?: number,
    readonly providerCode?: number,
  ) {
    super(
      `DNS provider ${operation} failed${httpStatus ? ` with status ${httpStatus}` : ''}: ${detail}.`,
    );
  }
}

/** A purchase pipeline step failed; `code` is the user-safe reason persisted on the job. */
export class PurchasePipelineException extends DomainException {
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor(
    readonly code: DomainJobErrorCode,
    detail: string,
  ) {
    super(detail);
  }
}

/** Another purchase for this tenant is already running (for a different domain). */
export class DomainPurchaseInProgressException extends DomainException {
  readonly code = 'DOMAIN_PURCHASE_IN_PROGRESS';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('Another domain purchase is already in progress for this tenant.');
  }
}

/** The domain is taken, premium, or already in the registrar account of someone else. */
export class DomainNotAvailableException extends DomainException {
  readonly code = 'DOMAIN_NOT_AVAILABLE';
  readonly status = HttpStatus.CONFLICT;

  constructor(domain: string) {
    super(`The domain ${domain} is not available for registration.`);
  }
}

/** The domain costs more than the plan absorbs (purchase cap, or the plan's renewal cap). */
export class DomainNotCoveredByPlanException extends DomainException {
  readonly code = 'DOMAIN_NOT_COVERED_BY_PLAN';
  readonly status = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(details: { reason: DomainNotCoveredReason }) {
    super('This domain is not covered by your plan.', details);
  }
}

/** The accepted agreements do not match the ones the quote required. */
export class DomainAgreementsRequiredException extends DomainException {
  readonly code = 'DOMAIN_AGREEMENTS_REQUIRED';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor() {
    super('The required agreements must be accepted to purchase a domain.');
  }
}

/** The domain is Lattiz's own (the preview base domain or a subdomain of it), never a tenant custom domain. */
export class DomainNotAllowedException extends DomainException {
  readonly code = 'DOMAIN_NOT_ALLOWED';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor() {
    super('This domain cannot be connected.');
  }
}

/** Renewal checkout is off, or this tenant has no open or overdue cycle. */
export class RenewalNotDueException extends DomainException {
  readonly code = 'RENEWAL_NOT_DUE';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('There is no domain renewal due for this tenant.');
  }
}

/** The live cycle is already paid (including a renewal that still needs an operator). */
export class RenewalAlreadyPaidException extends DomainException {
  readonly code = 'RENEWAL_ALREADY_PAID';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('This domain renewal has already been paid.');
  }
}

/** The overdue cycle is past `late_deadline_at`; the domain is about to lapse. */
export class RenewalWindowClosedException extends DomainException {
  readonly code = 'RENEWAL_WINDOW_CLOSED';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('The domain renewal payment window has closed.');
  }
}

/** Domain renewal is only sold to a tenant with a live subscription and a Stripe customer. */
export class RenewalRequiresActiveSubscriptionException extends DomainException {
  readonly code = 'RENEWAL_REQUIRES_ACTIVE_SUBSCRIPTION';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('An active subscription is required to renew a domain.');
  }
}
