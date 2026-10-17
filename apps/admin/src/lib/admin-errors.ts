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
