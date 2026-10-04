interface ApiErrorBody {
  error?: { code?: string };
}

/** The generated client throws the raw `{ error: { code, message } }` body. */
function apiErrorCode(err: unknown): string | undefined {
  return (err as ApiErrorBody | null | undefined)?.error?.code;
}

const TOO_MANY_REQUESTS =
  'Hiciste demasiadas solicitudes en poco tiempo. Espera un minuto e inténtalo de nuevo.';
const STORAGE_UNAVAILABLE =
  'No pudimos guardar la imagen en este momento. Inténtalo de nuevo en unos minutos.';
const TOO_LARGE =
  'La imagen es demasiado pesada. Reduce su tamaño e inténtalo de nuevo.';
const NO_FILE =
  'No se recibió ningún archivo. Selecciona una imagen e inténtalo de nuevo.';

/** Message for a failed editor-image or branding-image upload, keyed by the API's stable error code. */
export function uploadErrorMessage(err: unknown): string {
  switch (apiErrorCode(err)) {
    case 'ASSET_UPLOAD_FAILED':
    case 'BRANDING_UPLOAD_FAILED':
      return STORAGE_UNAVAILABLE;
    case 'UNSUPPORTED_ASSET_TYPE':
      return 'Ese archivo no es una imagen. Sube un archivo de imagen (PNG, JPG, WebP, GIF).';
    case 'UNSUPPORTED_BRANDING_TYPE':
      return 'Formato no admitido para esta imagen.';
    case 'BRANDING_FILE_TOO_LARGE':
    case 'PAYLOAD_TOO_LARGE':
      return TOO_LARGE;
    case 'NO_ASSETS_PROVIDED':
    case 'NO_BRANDING_FILE_PROVIDED':
      return NO_FILE;
    case 'TOO_MANY_REQUESTS':
      return TOO_MANY_REQUESTS;
    case 'TENANT_ACCESS_DENIED':
      return 'No tienes acceso a este sitio.';
    default:
      return 'No se pudo subir la imagen. Intenta de nuevo.';
  }
}
