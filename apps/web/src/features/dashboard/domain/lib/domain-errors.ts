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

const REGISTRAR_UNAVAILABLE =
  'Nuestro proveedor de dominios no está disponible en este momento. Inténtalo de nuevo en unos minutos.';

export function quoteErrorMessage(err: unknown): string {
  return apiErrorCode(err) === 'REGISTRAR_API_ERROR'
    ? REGISTRAR_UNAVAILABLE
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
      return REGISTRAR_UNAVAILABLE;
    default:
      return 'No se pudo iniciar la compra del dominio';
  }
}
