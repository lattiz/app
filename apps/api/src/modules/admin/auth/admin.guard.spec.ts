import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import {
  AdminAccessDeniedException,
  AdminMfaRequiredException,
  AdminRoleForbiddenException,
} from '../admin.exceptions';
import { AdminGuard } from './admin.guard';
import type { AdminMembersService } from './admin-members.service';
import type { AdminRole } from './admin-roles.decorator';

const USER_ID = '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11';

function contextFor(request: Partial<Request>): ExecutionContext {
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AdminGuard', () => {
  const findActiveMember = jest.fn();
  const getAllAndOverride = jest.fn();
  const guard = new AdminGuard(
    { findActiveMember } as unknown as AdminMembersService,
    { getAllAndOverride } as unknown as Reflector,
  );

  function user(
    role: AdminRole,
    claims: Record<string, unknown>,
  ): Partial<Request> {
    findActiveMember.mockResolvedValue({ userId: USER_ID, role });
    return { user: { sub: USER_ID, claims } };
  }

  it('rejects a request without a user', async () => {
    const error = await guard
      .canActivate(contextFor({}))
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getStatus()).toBe(401);
    expect(findActiveMember).not.toHaveBeenCalled();
  });

  it('rejects someone who is not a member before mentioning MFA', async () => {
    findActiveMember.mockResolvedValue(null);
    const request: Partial<Request> = {
      user: { sub: USER_ID, claims: { aal: 'aal1' } },
    };

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(
      AdminAccessDeniedException,
    );
  });

  it('rejects a revoked member (service returns null)', async () => {
    findActiveMember.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        contextFor({ user: { sub: USER_ID, claims: { aal: 'aal2' } } }),
      ),
    ).rejects.toBeInstanceOf(AdminAccessDeniedException);
  });

  it.each([{ aal: 'aal1' }, {}])(
    'requires aal2 (claims %p)',
    async (claims) => {
      const request = user('owner', claims);

      await expect(
        guard.canActivate(contextFor(request)),
      ).rejects.toBeInstanceOf(AdminMfaRequiredException);
      expect(request.admin).toBeUndefined();
    },
  );

  it('rejects a viewer on a route without @AdminRoles', async () => {
    getAllAndOverride.mockReturnValue(undefined);
    const request = user('viewer', { aal: 'aal2' });

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(
      AdminRoleForbiddenException,
    );
  });

  it('allows an owner on a route without @AdminRoles', async () => {
    getAllAndOverride.mockReturnValue(undefined);
    const request = user('owner', { aal: 'aal2', email: 'owner@example.com' });

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.admin).toEqual({
      userId: USER_ID,
      role: 'owner',
      email: 'owner@example.com',
    });
  });

  it('allows a viewer when the route lists every role and sets request.admin', async () => {
    getAllAndOverride.mockReturnValue(['owner', 'operator', 'viewer']);
    const request = user('viewer', { aal: 'aal2', email: 'view@example.com' });

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.admin).toEqual({
      userId: USER_ID,
      role: 'viewer',
      email: 'view@example.com',
    });
  });
});
