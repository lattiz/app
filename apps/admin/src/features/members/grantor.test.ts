import { describe, expect, it } from 'vitest';
import { grantorEmail } from './grantor';

const members = [
  { userId: 'u1', email: 'ana@lattiz.app' },
  { userId: 'u2', email: 'luis@lattiz.app' },
];

describe('grantorEmail', () => {
  it('resolves the member email from the user id', () => {
    expect(grantorEmail('u1', members)).toBe('ana@lattiz.app');
  });

  it('keeps an email that is already on the list', () => {
    expect(grantorEmail('luis@lattiz.app', members)).toBe('luis@lattiz.app');
  });

  it('uses a dash when the id is missing or unknown', () => {
    expect(grantorEmail(null, members)).toBe('—');
    expect(grantorEmail('   ', members)).toBe('—');
    expect(grantorEmail('u9', members)).toBe('—');
  });
});
