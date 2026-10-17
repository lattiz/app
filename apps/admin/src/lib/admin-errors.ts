export type AdminErrorKind =
  | 'unauthenticated'
  | 'mfa_required'
  | 'access_denied'
  | 'forbidden'
  | 'unknown';

const KIND_BY_CODE: Record<string, AdminErrorKind> = {
  UNAUTHORIZED: 'unauthenticated',
  ADMIN_MFA_REQUIRED: 'mfa_required',
  ADMIN_ACCESS_DENIED: 'access_denied',
  ADMIN_ROLE_FORBIDDEN: 'forbidden',
};

/** Maps the thrown `{ error: { code } }` body from the generated client. */
export function classifyAdminError(error: unknown): AdminErrorKind {
  const code = readErrorCode(error);
  if (!code) return 'unknown';
  return KIND_BY_CODE[code] ?? 'unknown';
}

const FALLBACK_MESSAGE = 'No se pudo cargar esta información.';

/** Reads `{ error: { message } }` from the body the generated client throws. */
export function readApiErrorMessage(error: unknown): string {
  const message = readErrorMessage(error);
  if (!message) return FALLBACK_MESSAGE;
  return message;
}

export function isAdminNotFound(error: unknown): boolean {
  return readErrorCode(error) === 'ADMIN_NOT_FOUND';
}

function readErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const record = error as { code?: unknown; error?: unknown };
  const nested = record.error;
  if (nested && typeof nested === 'object') {
    const nestedCode = (nested as { code?: unknown }).code;
    if (typeof nestedCode === 'string') return nestedCode;
  }
  return typeof record.code === 'string' ? record.code : undefined;
}

function readErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const nested = (error as { error?: unknown }).error;
  if (!nested || typeof nested !== 'object') return undefined;
  const message = (nested as { message?: unknown }).message;
  if (typeof message !== 'string') return undefined;
  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
