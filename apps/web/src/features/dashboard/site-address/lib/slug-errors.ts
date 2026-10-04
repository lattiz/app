interface ApiErrorBody {
  error?: { code?: string };
}

/** The generated client throws the raw `{ error: { code, message } }` body. */
function apiErrorCode(err: unknown): string | undefined {
  return (err as ApiErrorBody | null | undefined)?.error?.code;
}

const INVALID =
  'Usa de 3 a 32 letras minúsculas sin acentos, números o guiones. No puede empezar ni terminar con guion, ni tener dos guiones seguidos.';
const RESERVED = 'Esa dirección está reservada. Elige otra.';
const TAKEN = 'Esa dirección ya está en uso. Prueba con otra.';
const TOO_MANY =
  'Hiciste demasiadas solicitudes en poco tiempo. Espera un minuto e inténtalo de nuevo.';
const INACTIVE = 'Activa tu suscripción para cambiar la dirección de tu sitio.';
const GENERIC = 'No pudimos guardar la dirección. Inténtalo de nuevo.';

/** Message for a reason returned by the availability check. */
export function slugReasonMessage(reason: string | null | undefined): string {
  switch (reason) {
    case 'SLUG_INVALID':
      return INVALID;
    case 'SLUG_RESERVED':
      return RESERVED;
    case 'SLUG_TAKEN':
      return TAKEN;
    default:
      return GENERIC;
  }
}

/** Message for a failed PATCH; unknown codes fall back to a generic one. */
export function slugSaveErrorMessage(err: unknown): string {
  switch (apiErrorCode(err)) {
    case 'SLUG_INVALID':
      return INVALID;
    case 'SLUG_RESERVED':
      return RESERVED;
    case 'SLUG_TAKEN':
      return 'Esa dirección acaba de ser tomada por alguien más. Elige otra.';
    case 'SUBSCRIPTION_INACTIVE':
      return INACTIVE;
    case 'TOO_MANY_REQUESTS':
      return TOO_MANY;
    default:
      return GENERIC;
  }
}

export function slugCheckErrorMessage(err: unknown): string {
  return apiErrorCode(err) === 'TOO_MANY_REQUESTS'
    ? TOO_MANY
    : 'No pudimos comprobar la disponibilidad. Inténtalo de nuevo en unos segundos.';
}
