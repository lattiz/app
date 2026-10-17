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

/** La fila pedida no existe. El mensaje por defecto es el de clientes. */
export class AdminNotFoundException extends DomainException {
  readonly code = 'ADMIN_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor(message = 'No se encontró el cliente.') {
    super(message);
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

/** Stripe no respondió. El overview de métricas conserva el mensaje por defecto. */
export class AdminStripeUnavailableException extends DomainException {
  readonly code = 'ADMIN_STRIPE_UNAVAILABLE';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor(
    message = 'Stripe no está disponible para calcular los ingresos.',
  ) {
    super(message);
  }
}

/** La suscripción ya está en un estado terminal y no admite cancelación. */
export class SubscriptionNotCancelableException extends DomainException {
  readonly code = 'SUBSCRIPTION_NOT_CANCELABLE';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('La suscripción ya terminó y no se puede cancelar.');
  }
}

/** Un schedule activo (el downgrade) no se mezcla con una cancelación de soporte. */
export class SubscriptionScheduleActiveException extends DomainException {
  readonly code = 'SUBSCRIPTION_SCHEDULE_ACTIVE';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super(
      'La suscripción tiene un schedule activo. Cancelarla aquí se mezclaría con el cambio de plan.',
    );
  }
}

/** No hay una cancelación programada que se pueda deshacer, o ya terminó. */
export class SubscriptionNotResumableException extends DomainException {
  readonly code = 'SUBSCRIPTION_NOT_RESUMABLE';
  readonly status = HttpStatus.CONFLICT;

  constructor(message: string) {
    super(message);
  }
}

/** El status del tenant no permite suspender o reactivar. */
export class TenantStatusConflictException extends DomainException {
  readonly code = 'TENANT_STATUS_CONFLICT';
  readonly status = HttpStatus.CONFLICT;

  constructor(message: string) {
    super(message);
  }
}

/** Activar exige vista previa y miniatura, igual que el catálogo público. */
export class TemplateNotReadyException extends DomainException {
  readonly code = 'TEMPLATE_NOT_READY';
  readonly status = HttpStatus.CONFLICT;

  constructor(missing: readonly string[]) {
    super('La plantilla no tiene vista previa o miniatura para activarse.', {
      missing: [...missing],
    });
  }
}

/** Hay sitios o archivos que todavía apuntan a la plantilla. */
export class TemplateInUseException extends DomainException {
  readonly code = 'TEMPLATE_IN_USE';
  readonly status = HttpStatus.CONFLICT;

  constructor(sites: number, archives: number) {
    super('La plantilla sigue en uso y no se puede borrar.', {
      sites,
      archives,
    });
  }
}

/** El orden trae ids repetidos o que no existen en el catálogo. */
export class TemplateOrderInvalidException extends DomainException {
  readonly code = 'TEMPLATE_ORDER_INVALID';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor(details: { unknown?: string[]; duplicates?: string[] }) {
    super('La lista tiene ids repetidos o desconocidos.', details);
  }
}

/** La clave no está en el registro de configuración. */
export class SettingUnknownException extends DomainException {
  readonly code = 'SETTING_UNKNOWN';
  readonly status = HttpStatus.NOT_FOUND;

  constructor(key: string) {
    super(`No existe la clave de configuración ${key}.`);
  }
}

/** El valor no pasa el tipo o el rango del registro. */
export class SettingValueInvalidException extends DomainException {
  readonly code = 'SETTING_VALUE_INVALID';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor(message: string) {
    super(message);
  }
}

/** Alta, rol o revocación que dejaría el equipo en un estado inválido. */
export class AdminMemberConflictException extends DomainException {
  readonly code = 'ADMIN_MEMBER_CONFLICT';
  readonly status = HttpStatus.CONFLICT;

  constructor(message: string) {
    super(message);
  }
}

/** confirmId no es el id de la ruta. */
export class TemplateDeleteConfirmException extends DomainException {
  readonly code = 'TEMPLATE_DELETE_CONFIRM';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor() {
    super('confirmId tiene que ser el id de la plantilla.');
  }
}

/** El archivo no es jpeg, png o webp, o la firma no coincide con el tipo. */
export class TemplateThumbnailRejectedException extends DomainException {
  readonly code = 'TEMPLATE_THUMBNAIL_REJECTED';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(
      'La miniatura debe ser jpeg, png o webp y coincidir con la firma del archivo.',
    );
  }
}

/** Por encima del límite de 2 MB. */
export class TemplateThumbnailTooLargeException extends DomainException {
  readonly code = 'TEMPLATE_THUMBNAIL_TOO_LARGE';
  readonly status = HttpStatus.PAYLOAD_TOO_LARGE;

  constructor(maxBytes: number) {
    super('La miniatura supera el tamaño permitido.', { maxBytes });
  }
}
