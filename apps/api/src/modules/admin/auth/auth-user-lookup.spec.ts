import { findAuthUsersByEmail } from './auth-user-lookup';

describe('findAuthUsersByEmail', () => {
  it('looks up auth.users by a case-insensitive email', async () => {
    const query = jest.fn().mockResolvedValue([
      { id: 'user-1', email: 'ana@lattiz.test' },
      { id: 12, email: 'skip' },
    ]);

    const rows = await findAuthUsersByEmail(query, 'Ana@lattiz.test');

    expect(rows).toEqual([{ id: 'user-1', email: 'ana@lattiz.test' }]);
    const [strings, email] = query.mock.calls[0] as [
      TemplateStringsArray,
      string,
    ];
    expect(strings.join(' ')).toContain('FROM auth.users');
    expect(strings.join(' ')).toContain('lower(email)');
    expect(email).toBe('Ana@lattiz.test');
  });
});
