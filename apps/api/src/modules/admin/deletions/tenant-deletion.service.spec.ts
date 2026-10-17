import { HttpStatus } from '@nestjs/common';
import type { Database } from '../../../database/database.module';
import type { CustomerDeletionBilling } from '../../billing/billing.service';
import type { BillingService } from '../../billing/billing.service';
import type { DnsProviderPort } from '../../domains/domain/dns-provider.port';
import type { DomainInspection } from '../../domains/domain-inspection';
import type { DomainsService } from '../../domains/domains.service';
import type { ObjectStoragePort } from '../../storage/domain/object-storage.port';
import {
  AdminMemberNotDeletableException,
  TenantDeleteConfirmException,
  TenantDeletionActiveException,
  TenantDeletionNotRetryableException,
} from '../admin.exceptions';
import type { AdminMembersService } from '../auth/admin-members.service';
import {
  deletionWarnings,
  renewalPaidNotRenewed,
  WHAT_IS_KEPT,
} from './tenant-deletion.model';
import {
  TenantDeletionRepository,
  type TenantDeletionContext,
} from './tenant-deletion.repository';
import type { TenantDeletionRunner } from './tenant-deletion.runner';
import { TenantDeletionService } from './tenant-deletion.service';

const TENANT = '11111111-1111-4111-8111-111111111111';
const USER = '22222222-2222-4222-8222-222222222222';
const ACTOR = '44444444-4444-4444-8444-444444444444';

function context(
  patch: Partial<TenantDeletionContext> = {},
): TenantDeletionContext {
  return {
    tenantId: TENANT,
    userId: USER,
    slug: 'cafe',
    email: 'secret-user@example.com',
    stripeCustomerId: 'cus_1',
    domain: {
      name: 'cafe.mx',
      source: 'lattiz_managed',
      registrarDomainId: 'reg-1',
      expiresAt: '2027-01-15T06:00:00.000Z',
      dnsProvider: 'cloudflare',
      dnsZoneId: 'zone-1',
    },
    ga4PropertyId: '123',
    analyticsIsMock: false,
    pendingEmails: 2,
    assetsObjects: 3,
    brandingObjects: 1,
    ...patch,
  };
}

function inspection(
  autoRenew: 'on' | 'off' | 'default' = 'off',
): DomainInspection {
  return {
    domain: null,
    renewal: {
      currentCycle: { status: 'paid' },
      cycles: [],
    } as unknown as DomainInspection['renewal'],
    registrar: {
      status: 'active',
      renewalDate: '2027-01-15T06:00:00.000Z',
      canRenew: false,
      restorableUntil: null,
      autoRenew,
      expiryMismatch: false,
    },
    dns: null,
    vercel: { inProject: true, configured: true },
  };
}

describe('TenantDeletionService', () => {
  const loadContext = jest.fn();
  const insert = jest.fn();
  const find = jest.fn();
  const kick = jest.fn();
  const inspectForTenant = jest.fn();
  const describeCustomerForDeletion = jest.fn();
  const usageBytes = jest.fn();
  const invalidate = jest.fn();
  const findActiveMember = jest.fn();

  const service = new TenantDeletionService(
    {
      loadContext,
      insert,
      find,
    } as unknown as TenantDeletionRepository,
    { kick } as unknown as TenantDeletionRunner,
    { inspectForTenant } as unknown as DomainsService,
    {
      describeCustomerForDeletion,
    } as unknown as BillingService,
    {
      invalidate,
      findActiveMember,
    } as unknown as AdminMembersService,
    { usageBytes } as unknown as ObjectStoragePort,
    { provider: 'cloudflare' } as DnsProviderPort,
  );

  beforeEach(() => {
    loadContext.mockResolvedValue(context());
    insert.mockResolvedValue({ id: 'job-1' });
    kick.mockResolvedValue(true);
    inspectForTenant.mockResolvedValue(inspection('off'));
    describeCustomerForDeletion.mockResolvedValue({
      balance: 0,
      openInvoices: 0,
      liveSubscriptionIds: ['sub_1'],
    } satisfies CustomerDeletionBilling);
    usageBytes.mockResolvedValue(12);
    findActiveMember.mockResolvedValue(null);
  });

  it('rejects a confirmSlug that is not the tenant slug', async () => {
    await expect(
      service.start(
        TENANT,
        { confirmSlug: 'otro', reason: 'porque sí', notifyCustomer: true },
        { userId: ACTOR, email: null },
      ),
    ).rejects.toBeInstanceOf(TenantDeleteConfirmException);
    expect(insert).not.toHaveBeenCalled();
    expect(inspectForTenant).not.toHaveBeenCalled();
  });

  it('rejects an active admin member before creating the job', async () => {
    findActiveMember.mockResolvedValue({ userId: USER, role: 'operator' });
    await expect(
      service.start(
        TENANT,
        { confirmSlug: 'cafe', reason: 'porque sí' },
        { userId: ACTOR, email: 'owner@lattiz.app' },
      ),
    ).rejects.toBeInstanceOf(AdminMemberNotDeletableException);
    expect(insert).not.toHaveBeenCalled();
  });

  it('stores the raw email only when the customer is notified', async () => {
    await service.start(
      TENANT,
      { confirmSlug: 'cafe', reason: 'porque sí', notifyCustomer: false },
      { userId: ACTOR, email: null },
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        notifyEmail: null,
        notifyCustomer: false,
        snapshot: expect.objectContaining({
          emailMasked: 's***@example.com',
          subscriptionIds: ['sub_1'],
        }),
      }),
    );
    expect(kick).toHaveBeenCalledWith('job-1');

    insert.mockClear();
    await service.start(
      TENANT,
      { confirmSlug: 'cafe', reason: 'porque sí' },
      { userId: ACTOR, email: null },
    );
    const saved = insert.mock.calls[0]?.[0] as { notifyEmail: string };
    expect(saved.notifyEmail).toBe('secret-user@example.com');
    expect(JSON.stringify(saved)).toContain('s***@example.com');
  });

  it('previews warnings and blocks an admin member', async () => {
    describeCustomerForDeletion.mockResolvedValue({
      balance: -50,
      openInvoices: 1,
      liveSubscriptionIds: ['sub_1'],
    });
    inspectForTenant.mockResolvedValue(inspection('on'));
    findActiveMember.mockResolvedValue({ userId: USER, role: 'owner' });
    loadContext.mockResolvedValue(
      context({
        domain: {
          ...context().domain!,
          dnsProvider: 'openprovider',
        },
      }),
    );

    const preview = await service.preview(TENANT);
    expect(preview.blocking).toBe(true);
    expect(preview.warnings).toEqual([
      'Hay un ciclo de renovación pagado que todavía no se renovó.',
      'El cliente de Stripe tiene saldo o facturas abiertas.',
      'La zona DNS está en openprovider, no en el proveedor activo.',
      'La renovación automática no está apagada.',
      'Es miembro del equipo de administración. Revócalo del equipo primero.',
    ]);
    expect(preview.whatIsKept).toEqual([...WHAT_IS_KEPT]);
    expect(preview.storage).toEqual({
      assetsBytes: 12,
      brandingBytes: 12,
      assetsObjects: 3,
      brandingObjects: 1,
    });
    expect(JSON.stringify(preview)).not.toContain('secret-user');
  });

  it('refuses to retry a job that is not failed or stale', async () => {
    find.mockResolvedValue({
      id: 'job-1',
      status: 'completed',
      updatedAt: new Date().toISOString(),
    });
    await expect(service.retry('job-1')).rejects.toBeInstanceOf(
      TenantDeletionNotRetryableException,
    );
    expect(kick).not.toHaveBeenCalled();
  });

  it('refuses to retry a pending job that is still in progress', async () => {
    find.mockResolvedValue({
      id: 'job-1',
      status: 'pending',
      updatedAt: new Date().toISOString(),
    });
    await expect(service.retry('job-1')).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });
    expect(kick).not.toHaveBeenCalled();
  });

  it('retries a pending job left unclaimed for three minutes', async () => {
    find.mockResolvedValue({
      id: 'job-1',
      status: 'pending',
      updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    });
    await expect(service.retry('job-1')).resolves.toEqual({ jobId: 'job-1' });
    expect(kick).toHaveBeenCalledWith('job-1');
  });
});

describe('tenant deletion warnings', () => {
  it('flags a paid cycle that was not renewed', () => {
    expect(
      renewalPaidNotRenewed({
        domain: null,
        renewal: {
          currentCycle: null,
          cycles: [{ paidAt: '2026-01-01', renewedAt: null }],
        } as unknown as DomainInspection['renewal'],
        registrar: null,
        dns: null,
        vercel: null,
      }),
    ).toBe(true);
    expect(
      deletionWarnings({
        paidNotRenewed: false,
        balance: 0,
        openInvoices: 0,
        otherDnsProvider: null,
        autoRenewNeedsAttention: false,
        adminMember: false,
      }).blocking,
    ).toBe(false);
  });
});

describe('TenantDeletionRepository.insert', () => {
  it('maps a unique violation to a live-job conflict', async () => {
    const execute = jest
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('duplicate'), { code: '23505' }),
      );
    const repo = new TenantDeletionRepository({
      execute,
    } as unknown as Database);
    await expect(
      repo.insert({
        tenantId: TENANT,
        userId: USER,
        slug: 'cafe',
        snapshot: {
          tenantId: TENANT,
          userId: USER,
          slug: 'cafe',
          emailMasked: null,
          domain: null,
          ga4PropertyId: null,
          analyticsIsMock: false,
          stripeCustomerId: null,
          subscriptionIds: [],
          r2Bytes: 0,
          r2Objects: 0,
          pendingEmails: 0,
        },
        notifyEmail: null,
        notifyCustomer: false,
        steps: [],
        reason: 'porque sí',
        actorUserId: ACTOR,
        actorEmail: null,
      }),
    ).rejects.toBeInstanceOf(TenantDeletionActiveException);
  });
});
