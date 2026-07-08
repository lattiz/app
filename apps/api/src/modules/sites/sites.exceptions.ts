import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

/** The authenticated user does not own the requested tenant. */
export class TenantAccessDeniedException extends DomainException {
  readonly code = 'TENANT_ACCESS_DENIED';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('You do not have access to this tenant.');
  }
}

/** No site row exists yet for the tenant (load the schema first). */
export class SiteNotFoundException extends DomainException {
  readonly code = 'SITE_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('No site exists for this tenant yet.');
  }
}

/** No active template is available to seed a new site from. */
export class NoTemplateAvailableException extends DomainException {
  readonly code = 'NO_TEMPLATE_AVAILABLE';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('No active template is available to initialize a site.');
  }
}
