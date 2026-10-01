import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

/** No tenant row exists yet for the authenticated user. */
export class AnalyticsTenantNotFoundException extends DomainException {
  readonly code = 'TENANT_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('No tenant exists for this user.');
  }
}

/** The GA4 Data API failed and there is no cached report to fall back on. */
export class AnalyticsUpstreamException extends DomainException {
  readonly code = 'ANALYTICS_UPSTREAM_ERROR';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor() {
    super('No pudimos obtener tus analíticas. Inténtalo de nuevo en unos minutos.');
  }
}

/** A manual retry was requested again before the cooldown elapsed. */
export class AnalyticsRetryCooldownException extends DomainException {
  readonly code = 'ANALYTICS_RETRY_COOLDOWN';
  readonly status = HttpStatus.TOO_MANY_REQUESTS;

  constructor(retryAfterSeconds: number) {
    super('Espera un momento antes de reintentar.', { retryAfterSeconds });
  }
}

/** Manual retry only applies to a Pro tenant whose provisioning failed. */
export class AnalyticsRetryNotAllowedException extends DomainException {
  readonly code = 'ANALYTICS_RETRY_NOT_ALLOWED';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('No hay una activación fallida que reintentar.');
  }
}
