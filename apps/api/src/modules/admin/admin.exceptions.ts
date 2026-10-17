import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

/** No hay fila activa en admin.members para este usuario. */
export class AdminAccessDeniedException extends DomainException {
  readonly code = 'ADMIN_ACCESS_DENIED';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('No tienes acceso al panel de administración.');
  }
}

/** La sesión no completó MFA (el claim `aal` no es `aal2`). */
export class AdminMfaRequiredException extends DomainException {
  readonly code = 'ADMIN_MFA_REQUIRED';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('Confirma el segundo factor para entrar al panel de administración.');
  }
}

/** El cliente no existe. */
export class AdminNotFoundException extends DomainException {
  readonly code = 'ADMIN_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('No se encontró el cliente.');
  }
}

/** El rol activo no está en la lista que exige la ruta. */
export class AdminRoleForbiddenException extends DomainException {
  readonly code = 'ADMIN_ROLE_FORBIDDEN';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('Tu rol no permite esta operación.');
  }
}
