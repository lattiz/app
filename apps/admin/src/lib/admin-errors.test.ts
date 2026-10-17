import { describe, expect, it } from 'vitest';
import { classifyAdminError, readApiErrorMessage } from './admin-errors';

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

describe('readApiErrorMessage', () => {
  it('returns the API message', () => {
    expect(
      readApiErrorMessage({
        error: {
          code: 'ADMIN_STRIPE_UNAVAILABLE',
          message: 'Stripe no respondió',
        },
      }),
    ).toBe('Stripe no respondió');
  });

  it('falls back when the body has no message', () => {
    expect(readApiErrorMessage(null)).toBe(
      'No se pudo cargar esta información.',
    );
    expect(readApiErrorMessage({ error: { code: 'X' } })).toBe(
      'No se pudo cargar esta información.',
    );
    expect(readApiErrorMessage({ error: { message: '   ' } })).toBe(
      'No se pudo cargar esta información.',
    );
  });
});
