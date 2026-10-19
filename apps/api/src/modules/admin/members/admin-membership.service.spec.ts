import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { Database } from '../../../database/database.module';
import { AdminMemberConflictException } from '../admin.exceptions';
import type { AdminMembersService } from '../auth/admin-members.service';
import { AdminMembershipService } from './admin-membership.service';

const dialect = new PgDialect();
const ACTOR = '11111111-1111-4111-8111-111111111111';
const USER = '22222222-2222-4222-8222-222222222222';
const TENANT = '33333333-3333-4333-8333-333333333333';

interface MemberState {
  role: string;
  revoked_at: string | null;
}

describe('AdminMembershipService', () => {
  const texts: string[] = [];
  const invalidate = jest.fn();
  let member: MemberState | null = null;
  let owners = 2;
  let users: { id: string; email: string }[] = [];

  const execute = jest.fn(async (statement: SQL) => {
    const text = dialect.sqlToQuery(statement).sql.replace(/\s+/g, ' ');
    texts.push(text);
    if (text.includes("role = 'owner'") && text.includes('FOR UPDATE')) {
      return Array.from({ length: owners }, (_, index) => ({
        user_id: `owner-${index}`,
      }));
    }
    if (text.includes('last_sign_in_at')) {
      return [
        {
          user_id: USER,
          email: 'ana@lattiz.test',
          role: 'operator',
          created_at: '2026-01-01T00:00:00.000Z',
          created_by_email: 'boss@lattiz.test',
          revoked_at: member?.revoked_at ?? null,
          last_sign_in_at: '2026-10-01T00:00:00.000Z',
        },
      ];
    }
    if (text.includes('lower(email)')) return users;
    if (text.includes('LIMIT')) return member ? [member] : [];
    if (text.includes('INSERT INTO admin.members')) return [{ user_id: USER }];
    if (text.includes('public.tenants')) return [{ id: TENANT }];
    if (text.includes('tenant_flags')) return [];
    if (text.includes('SET role')) return [{ role: 'operator' }];
    if (text.includes('SET revoked_at')) {
      return [{ revoked_at: '2026-10-17T00:00:00.000Z' }];
    }
    throw new Error(text);
  });

  const db = {
    execute,
    transaction: async <T>(
      fn: (tx: { execute: typeof execute }) => Promise<T>,
    ) => fn({ execute }),
  };

  const service = new AdminMembershipService(
    db as unknown as Database,
    { invalidate } as unknown as AdminMembersService,
  );

  beforeEach(() => {
    texts.length = 0;
    invalidate.mockClear();
    execute.mockClear();
    member = null;
    owners = 2;
    users = [{ id: USER, email: 'ana@lattiz.test' }];
  });

  it('refuses to revoke or demote the last active owner', async () => {
    member = { role: 'owner', revoked_at: null };
    owners = 1;

    await expect(service.revoke(ACTOR, USER)).rejects.toBeInstanceOf(
      AdminMemberConflictException,
    );
    await expect(service.revoke(ACTOR, USER)).rejects.toThrow(/owner activo/);
    await expect(service.updateRole(ACTOR, USER, 'operator')).rejects.toThrow(
      /owner activo/,
    );

    expect(texts.some((text) => text.includes('SET revoked_at'))).toBe(false);
    expect(texts.some((text) => text.includes('SET role'))).toBe(false);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('refuses a self role change and a self revoke', async () => {
    await expect(service.revoke(ACTOR, ACTOR)).rejects.toThrow(/propio/);
    await expect(service.updateRole(ACTOR, ACTOR, 'viewer')).rejects.toThrow(
      /propio/,
    );
    expect(execute).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('restores a revoked member and invalidates the membership cache', async () => {
    member = { role: 'viewer', revoked_at: '2026-01-02T00:00:00.000Z' };

    const result = await service.grant(ACTOR, 'Ana@lattiz.test', 'operator');

    expect(result.before).toEqual({
      role: 'viewer',
      revokedAt: '2026-01-02T00:00:00.000Z',
    });
    expect(result.after).toEqual({ role: 'operator', revokedAt: null });
    expect(
      texts.some((text) => text.includes('INSERT INTO admin.members')),
    ).toBe(true);
    expect(texts.some((text) => text.includes('tenant_flags'))).toBe(true);
    expect(invalidate).toHaveBeenCalledWith(USER);
  });

  it('invalidates the cache after a role change and a revoke', async () => {
    member = { role: 'operator', revoked_at: null };

    await service.updateRole(ACTOR, USER, 'viewer');
    await service.revoke(ACTOR, USER);

    expect(invalidate).toHaveBeenNthCalledWith(1, USER);
    expect(invalidate).toHaveBeenNthCalledWith(2, USER);
  });
});
