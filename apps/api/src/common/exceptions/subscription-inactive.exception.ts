import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

/** The caller's tenant has no entitlement — lapsed, canceled, or never subscribed. */
export class SubscriptionInactiveException extends DomainException {
  readonly code = 'SUBSCRIPTION_INACTIVE';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('Tu suscripción no está activa o ha vencido.');
  }
}
