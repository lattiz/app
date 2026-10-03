import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

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
    operation: string,
    detail: string,
    readonly httpStatus?: number,
    readonly registrarCode?: number,
  ) {
    super(
      `Registrar ${operation} failed${httpStatus ? ` with status ${httpStatus}` : ''}: ${detail}.`,
    );
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

/** The registrar's current price is above the price the user accepted. */
export class DomainPriceChangedException extends DomainException {
  readonly code = 'DOMAIN_PRICE_CHANGED';
  readonly status = HttpStatus.CONFLICT;

  constructor(currentPriceUsdCents: number, acceptedPriceUsdCents: number) {
    super('The domain price changed since it was quoted.', {
      currentPriceUsdCents,
      acceptedPriceUsdCents,
    });
  }
}

/** The domain costs more than the plan absorbs (DOMAIN_MAX_COST_USD_CENTS). */
export class DomainNotCoveredByPlanException extends DomainException {
  readonly code = 'DOMAIN_NOT_COVERED_BY_PLAN';
  readonly status = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor() {
    super('This domain is not covered by your plan.');
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
