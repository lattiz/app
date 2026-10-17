import { describe, expect, it } from 'vitest';
import { classifyAdminError } from './admin-errors';

function body(code: string) {
  return { error: { code, message: 'detalle' } };
}

describe('classifyAdminError', () => {
  it('maps the admin API codes', () => {
    expect(classifyAdminError(body('ADMIN_ACCESS_DENIED'))).toBe(
      'access_denied',
    );
    expect(classifyAdminError(body('ADMIN_MFA_REQUIRED'))).toBe('mfa_required');
    expect(classifyAdminError(body('ADMIN_ROLE_FORBIDDEN'))).toBe('forbidden');
  });

  it('maps a 401 body to unauthenticated', () => {
    expect(classifyAdminError(body('UNAUTHORIZED'))).toBe('unauthenticated');
  });

  it('accepts a code sitting on the error itself', () => {
    expect(classifyAdminError({ code: 'ADMIN_MFA_REQUIRED' })).toBe(
      'mfa_required',
    );
  });

  it('returns unknown for anything else', () => {
    expect(classifyAdminError(null)).toBe('unknown');
    expect(classifyAdminError(undefined)).toBe('unknown');
    expect(classifyAdminError('ADMIN_ACCESS_DENIED')).toBe('unknown');
    expect(classifyAdminError(new Error('ADMIN_ACCESS_DENIED'))).toBe(
      'unknown',
    );
    expect(classifyAdminError(body('INTERNAL_ERROR'))).toBe('unknown');
    expect(classifyAdminError({ error: { message: 'sin código' } })).toBe(
      'unknown',
    );
    expect(classifyAdminError({})).toBe('unknown');
  });
});
