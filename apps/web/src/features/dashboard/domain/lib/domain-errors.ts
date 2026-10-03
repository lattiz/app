import type { DomainJobStatusDto } from '@lattiz/api-client';

interface ApiErrorBody {
  error?: {
    code?: string;
    details?: { currentPriceUsdCents?: number };
  };
}

/** The generated client throws the raw `{ error: { code, message, details? } }` body. */
export function apiErrorCode(err: unknown): string | undefined {
  return (err as ApiErrorBody | null | undefined)?.error?.code;
}

export function currentPriceFromError(err: unknown): number | undefined {
  const price = (err as ApiErrorBody | null | undefined)?.error?.details
    ?.currentPriceUsdCents;
  return typeof price === 'number' ? price : undefined;
}

const PROVIDER_UNAVAILABLE =
  'Nuestro proveedor de dominios no está disponible en este momento. Inténtalo de nuevo en unos minutos.';

export function quoteErrorMessage(err: unknown): string {
  return apiErrorCode(err) === 'REGISTRAR_API_ERROR'
    ? PROVIDER_UNAVAILABLE
    : 'No se pudo obtener el precio';
}

export function purchaseErrorMessage(err: unknown): string {
  switch (apiErrorCode(err)) {
    case 'DOMAIN_NOT_AVAILABLE':
      return 'Este dominio ya no está disponible. Elige otro.';
    case 'DOMAIN_NOT_COVERED_BY_PLAN':
      return 'Tu plan no cubre este dominio. Elige otro.';
    case 'DOMAIN_AGREEMENTS_REQUIRED':
      return 'Debes aceptar los términos y condiciones de Lattiz para continuar.';
    case 'TENANT_ALREADY_HAS_DOMAIN':
      return 'Tu sitio ya tiene un dominio asociado.';
    case 'REGISTRAR_API_ERROR':
    case 'DNS_PROVIDER_API_ERROR':
      return PROVIDER_UNAVAILABLE;
    case 'DOMAIN_PURCHASE_IN_PROGRESS':
      return 'Ya estamos procesando la compra de otro dominio para tu sitio. Espera a que termine.';
    default:
      return 'No se pudo iniciar la compra del dominio';
  }
}

type JobErrorCode = NonNullable<DomainJobStatusDto['errorCode']>;

export interface JobFailureView {
  message: string;
  /** What the user can do: retry resumes the same purchase; search abandons this domain. */
  next: 'retry' | 'search';
}

const CONTACT_SUPPORT = 'Si el problema continúa, contacta a soporte.';

const JOB_FAILURES: Record<JobErrorCode, JobFailureView> = {
  DNS_PROVIDER_UNAVAILABLE: {
    message:
      'No pudimos preparar el DNS de tu dominio porque nuestro proveedor no respondió. Todavía no se registró nada ni se te cobró. Inténtalo de nuevo en unos minutos.',
    next: 'retry',
  },
  DNS_ZONE_REJECTED: {
    message:
      'No pudimos preparar el DNS para este dominio. No se registró nada ni se te cobró. Prueba con otro dominio o contacta a soporte.',
    next: 'search',
  },
  SERVICE_CONFIGURATION_ERROR: {
    message: `Tuvimos un problema de configuración de nuestro lado, no por algo que hayas hecho. Ya quedó registrado para que lo revisemos. Si el dominio ya se había registrado, no se volverá a comprar. Inténtalo de nuevo más tarde. ${CONTACT_SUPPORT}`,
    next: 'retry',
  },
  REGISTRAR_UNAVAILABLE: {
    message:
      'Nuestro proveedor de dominios no respondió a tiempo y es posible que el registro siga en proceso. Espera unos minutos y pulsa «Intentar de nuevo»: continuaremos donde se quedó, sin comprarlo dos veces.',
    next: 'retry',
  },
  REGISTRATION_REJECTED: {
    message:
      'El registro rechazó la compra y no pudimos registrar este dominio. No se te cobró por este intento. Elige otro dominio o contacta a soporte.',
    next: 'search',
  },
  DOMAIN_NO_LONGER_AVAILABLE: {
    message:
      'Alguien más registró este dominio antes de que terminara tu compra. No se te cobró nada. Elige otro dominio.',
    next: 'search',
  },
  REGISTRATION_PENDING: {
    message:
      'El registro de tu dominio sigue en proceso. Espera unos minutos y pulsa «Intentar de nuevo»: continuaremos donde se quedó, sin comprarlo otra vez.',
    next: 'retry',
  },
  DNS_SETUP_FAILED: {
    message: `Tu dominio ya quedó registrado, pero no pudimos terminar la configuración de su DNS. No necesitas comprarlo de nuevo: pulsa «Intentar de nuevo» para continuar. ${CONTACT_SUPPORT}`,
    next: 'retry',
  },
  VERCEL_SETUP_FAILED: {
    message: `Tu dominio ya quedó registrado y su DNS está listo, pero no pudimos conectarlo a tu sitio. Pulsa «Intentar de nuevo» para continuar sin comprarlo otra vez. ${CONTACT_SUPPORT}`,
    next: 'retry',
  },
  PURCHASE_INTERRUPTED: {
    message:
      'La compra se interrumpió antes de terminar. Pulsa «Intentar de nuevo»: si el dominio ya se había registrado, continuaremos sin comprarlo otra vez.',
    next: 'retry',
  },
  UNEXPECTED_ERROR: {
    message: `Algo salió mal al configurar tu dominio. Inténtalo de nuevo. ${CONTACT_SUPPORT}`,
    next: 'retry',
  },
};

const UNKNOWN_FAILURE: JobFailureView = {
  message: `Algo salió mal al configurar tu dominio. Inténtalo de nuevo. ${CONTACT_SUPPORT}`,
  next: 'retry',
};

/** Unknown or missing codes (older jobs, newer API) fall back to a generic message; raw provider text is never shown. */
export function jobFailureView(code: string | null | undefined): JobFailureView {
  return (code && (JOB_FAILURES as Record<string, JobFailureView>)[code]) || UNKNOWN_FAILURE;
}
