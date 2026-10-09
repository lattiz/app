import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

/** The free preview window has ended. Draft edits stay allowed. */
export class PreviewExpiredException extends DomainException {
  readonly code = 'PREVIEW_EXPIRED';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super(
      'Tu prueba gratuita terminó. Para publicar necesitas una suscripción activa.',
    );
  }
}
