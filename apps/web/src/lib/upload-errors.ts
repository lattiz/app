import { toast } from 'sonner';
import { templateAccessCopy } from '@/features/templates/template-access.copy';

interface ApiErrorBody {
  error?: { code?: string };
  status?: number;
  response?: { status?: number };
}

/** The generated client throws the raw `{ error: { code, message } }` body. */
function apiErrorCode(err: unknown): string | undefined {
  const code = (err as ApiErrorBody | null | undefined)?.error?.code;
  if (code) return code;
  const status =
    (err as ApiErrorBody | null | undefined)?.status ??
    (err as ApiErrorBody | null | undefined)?.response?.status;
  if (status === 429) return 'TOO_MANY_REQUESTS';
  return undefined;
}

const EMAIL_NOT_VERIFIED = 'Verifica tu correo para publicar';
const PREVIEW_EXPIRED =
  'Tu prueba gratuita terminó. Elige un plan para seguir publicando';
const SUBSCRIPTION_INACTIVE =
  'Tu suscripción no está activa. Elige un plan para continuar.';
const ASSET_QUOTA = 'Alcanzaste el límite de imágenes de la prueba';
const UNSUPPORTED_FILE =
  'Ese archivo no es una imagen. Sube un archivo de imagen (PNG, JPG, WebP, GIF).';
const RATE_LIMIT = 'Demasiados intentos, espera un momento';
const TEMPLATE_REQUIRES_PRO = templateAccessCopy.requiresProError;
const TEMPLATE_LOCKED_BY_PLAN = templateAccessCopy.lockedError;

export interface SiteActionError {
  code: string | undefined;
  message: string;
  /** PREVIEW_EXPIRED and SUBSCRIPTION_INACTIVE recover by choosing a plan. */
  plansAction: boolean;
}

/** Spanish message for publish, editor asset upload, and template select/change. */
export function siteActionError(
  err: unknown,
  context: 'publish' | 'upload' | 'template',
): SiteActionError {
  const code = apiErrorCode(err);
  switch (code) {
    case 'EMAIL_NOT_VERIFIED':
      return { code, message: EMAIL_NOT_VERIFIED, plansAction: false };
    case 'PREVIEW_EXPIRED':
      return { code, message: PREVIEW_EXPIRED, plansAction: true };
    case 'SUBSCRIPTION_INACTIVE':
      return { code, message: SUBSCRIPTION_INACTIVE, plansAction: true };
    case 'ASSET_QUOTA_EXCEEDED':
      return { code, message: ASSET_QUOTA, plansAction: false };
    case 'UNSUPPORTED_ASSET_TYPE':
      return { code, message: UNSUPPORTED_FILE, plansAction: false };
    case 'TOO_MANY_REQUESTS':
      return { code, message: RATE_LIMIT, plansAction: false };
    case 'TEMPLATE_REQUIRES_PRO':
      return { code, message: TEMPLATE_REQUIRES_PRO, plansAction: true };
    case 'TEMPLATE_LOCKED_BY_PLAN':
      return { code, message: TEMPLATE_LOCKED_BY_PLAN, plansAction: true };
    default:
      return {
        code,
        message:
          context === 'upload'
            ? uploadErrorMessage(err)
            : context === 'template'
              ? 'No se pudo cambiar la plantilla. Intenta de nuevo.'
              : 'No se pudo publicar tu sitio. Inténtalo de nuevo.',
        plansAction: false,
      };
  }
}

/** Toast the mapped message. `PREVIEW_EXPIRED` and template-lock codes refresh GET /tenants/me. */
export function reportSiteActionError(
  err: unknown,
  context: 'publish' | 'upload' | 'template',
  options?: { onPlans?: () => void; onPreviewExpired?: () => void },
): void {
  const mapped = siteActionError(err, context);
  toast.error(
    mapped.message,
    mapped.plansAction && options?.onPlans
      ? { action: { label: 'Elige un plan', onClick: options.onPlans } }
      : undefined,
  );
  if (
    mapped.code === 'PREVIEW_EXPIRED' ||
    mapped.code === 'TEMPLATE_LOCKED_BY_PLAN' ||
    mapped.code === 'TEMPLATE_REQUIRES_PRO'
  )
    options?.onPreviewExpired?.();
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
      return UNSUPPORTED_FILE;
    case 'ASSET_QUOTA_EXCEEDED':
      return ASSET_QUOTA;
    case 'EMAIL_NOT_VERIFIED':
      return EMAIL_NOT_VERIFIED;
    case 'PREVIEW_EXPIRED':
      return PREVIEW_EXPIRED;
    case 'SUBSCRIPTION_INACTIVE':
      return SUBSCRIPTION_INACTIVE;
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
    case 'TEMPLATE_LOCKED_BY_PLAN':
      return TEMPLATE_LOCKED_BY_PLAN;
    default:
      return 'No se pudo subir la imagen. Intenta de nuevo.';
  }
}
