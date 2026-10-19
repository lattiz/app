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

export type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: unknown;
};

/** Reads `{ error: { code, message, details } }` or a flat body that already has `code`. */
export function readApiErrorBody(error: unknown): ApiErrorBody {
  if (!error || typeof error !== 'object') return {};
  const record = error as Record<string, unknown>;
  const nested = record.error;
  if (nested && typeof nested === 'object')
    return pickBody(nested as Record<string, unknown>);
  if (typeof record.code === 'string') return pickBody(record);
  return {};
}

function readErrorCode(error: unknown): string | undefined {
  return readApiErrorBody(error).code;
}

function readErrorMessage(error: unknown): string | undefined {
  return readApiErrorBody(error).message;
}

function pickBody(record: Record<string, unknown>): ApiErrorBody {
  const code = typeof record.code === 'string' ? record.code : undefined;
  const rawMessage =
    typeof record.message === 'string' ? record.message.trim() : '';
  return {
    code,
    message: rawMessage.length > 0 ? rawMessage : undefined,
    details: record.details,
  };
}
