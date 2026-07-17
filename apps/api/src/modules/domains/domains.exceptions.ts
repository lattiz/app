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

/** A GoDaddy API call failed (availability, quote, registration or DNS). */
export class GodaddyApiException extends DomainException {
  readonly code = 'GODADDY_API_ERROR';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor(operation: string, httpStatus: number, detail?: string) {
    super(
      `GoDaddy ${operation} failed with status ${httpStatus}${detail ? `: ${detail}` : ''}.`,
    );
  }
}
