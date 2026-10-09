import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

/** An unpaid tenant must confirm their email before publish, assets, or templates. */
export class EmailNotVerifiedException extends DomainException {
  readonly code = 'EMAIL_NOT_VERIFIED';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super(
      'Confirma tu correo para publicar, subir archivos o elegir una plantilla.',
    );
  }
}
