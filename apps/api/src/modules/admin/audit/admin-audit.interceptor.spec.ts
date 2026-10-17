import {
  Logger,
  type CallHandler,
  type ExecutionContext,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { firstValueFrom, of, throwError } from 'rxjs';
import {
  AdminAccessDeniedException,
  AdminStripeUnavailableException,
} from '../admin.exceptions';
import type { AdminAuditMetadata } from './admin-audit.decorator';
import { AdminAuditInterceptor } from './admin-audit.interceptor';
import type { AdminAuditService } from './admin-audit.service';

function contextFor(request: Partial<Request>): ExecutionContext {
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AdminAuditInterceptor', () => {
  const record = jest.fn();
  const getAllAndOverride = jest.fn();
  const interceptor = new AdminAuditInterceptor(
    { record } as unknown as AdminAuditService,
    { getAllAndOverride } as unknown as Reflector,
  );

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not record GET', async () => {
    getAllAndOverride.mockReturnValue({ action: 'admin.me' });
    const next: CallHandler = { handle: () => of({ ok: true }) };

    await expect(
      firstValueFrom(
        interceptor.intercept(contextFor({ method: 'GET' }), next),
      ),
    ).resolves.toEqual({ ok: true });
    expect(record).not.toHaveBeenCalled();
  });

  it('records a POST with @AdminAudit, the route param, ip and user-agent', async () => {
    const metadata: AdminAuditMetadata = {
      action: 'tenant.flag',
      targetType: 'tenant',
      targetParam: 'tenantId',
    };
    getAllAndOverride.mockReturnValue(metadata);
    const request: Partial<Request> = {
      method: 'POST',
      ip: '203.0.113.8',
      headers: { 'user-agent': 'JestAgent' },
      params: { tenantId: 'tenant-9' },
      baseUrl: '',
      route: { path: '/admin/tenants/:tenantId' },
      admin: {
        userId: 'user-1',
        role: 'operator',
        email: 'ops@example.com',
      },
    };
    const next: CallHandler = { handle: () => of('saved') };

    await expect(
      firstValueFrom(interceptor.intercept(contextFor(request), next)),
    ).resolves.toBe('saved');

    expect(record).toHaveBeenCalledWith({
      actorUserId: 'user-1',
      actorEmail: 'ops@example.com',
      action: 'tenant.flag',
      targetType: 'tenant',
      targetId: 'tenant-9',
      reason: undefined,
      before: undefined,
      after: undefined,
      ip: '203.0.113.8',
      userAgent: 'JestAgent',
    });
    expect(Logger.prototype.warn).not.toHaveBeenCalled();
  });

  it('records "POST <route>" and warns when @AdminAudit is missing', async () => {
    getAllAndOverride.mockReturnValue(undefined);
    const request: Partial<Request> = {
      method: 'POST',
      ip: '127.0.0.1',
      headers: {},
      baseUrl: '',
      route: { path: '/admin/members' },
      admin: { userId: 'user-1', role: 'owner', email: undefined },
    };

    await firstValueFrom(
      interceptor.intercept(contextFor(request), { handle: () => of(null) }),
    );

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'POST /admin/members' }),
    );
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      'Mutating admin route without @AdminAudit: POST /admin/members',
    );
  });

  it('records action.failed and rethrows the handler error', async () => {
    getAllAndOverride.mockReturnValue({ action: 'member.revoke' });
    const error = new AdminAccessDeniedException();
    const request: Partial<Request> = {
      method: 'POST',
      ip: '127.0.0.1',
      headers: { 'user-agent': 'JestAgent' },
      admin: { userId: 'user-1', role: 'owner', email: 'owner@example.com' },
      route: { path: '/admin/members/1' },
      baseUrl: '',
    };

    await expect(
      firstValueFrom(
        interceptor.intercept(contextFor(request), {
          handle: () => throwError(() => error),
        }),
      ),
    ).rejects.toBe(error);

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'member.revoke.failed',
        after: { error: 'ADMIN_ACCESS_DENIED' },
      }),
    );
  });

  it('records subscription.cancel.failed and rethrows that same error', async () => {
    getAllAndOverride.mockReturnValue({
      action: 'subscription.cancel',
      targetType: 'subscription',
      targetParam: 'id',
    });
    const error = new AdminStripeUnavailableException(
      'Stripe no está disponible para cambiar la suscripción.',
    );
    const request: Partial<Request> = {
      method: 'POST',
      ip: '127.0.0.1',
      headers: {},
      params: { id: 'sub-row' },
      admin: { userId: 'user-1', role: 'owner', email: 'owner@example.com' },
      route: { path: '/admin/subscriptions/:id/cancel' },
      baseUrl: '',
    };

    await expect(
      firstValueFrom(
        interceptor.intercept(contextFor(request), {
          handle: () => throwError(() => error),
        }),
      ),
    ).rejects.toBe(error);

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'subscription.cancel.failed',
        targetId: 'sub-row',
        after: { error: 'ADMIN_STRIPE_UNAVAILABLE' },
      }),
    );
  });

  it('keeps the handler error when the audit insert also fails', async () => {
    getAllAndOverride.mockReturnValue({ action: 'member.revoke' });
    const handlerError = new AdminAccessDeniedException();
    const auditError = new Error('insert failed');
    record.mockRejectedValueOnce(auditError);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const request: Partial<Request> = {
      method: 'POST',
      ip: '127.0.0.1',
      headers: {},
      admin: { userId: 'user-1', role: 'owner', email: 'owner@example.com' },
      route: { path: '/admin/members/1' },
      baseUrl: '',
    };

    await expect(
      firstValueFrom(
        interceptor.intercept(contextFor(request), {
          handle: () => throwError(() => handlerError),
        }),
      ),
    ).rejects.toBe(handlerError);

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Admin audit insert failed for member.revoke.failed: insert failed',
    );
  });
});
