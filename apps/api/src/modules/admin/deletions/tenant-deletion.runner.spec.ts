import {
  tenantAssetsPrefix,
  tenantBrandingPrefix,
} from '../../storage/domain/storage-path';
import {
  canClaimDeletionJob,
  DELETION_CLAIM_STALE_MS,
  DELETION_STEP_KEYS,
  initialSteps,
  maskEmail,
  type DeletionJob,
  type DeletionSnapshot,
  type DeletionStep,
} from './tenant-deletion.model';
import {
  runTenantDeletion,
  type DeletionEffects,
  type DeletionJobStore,
} from './tenant-deletion.runner';
import { toDeletionJobDto } from './tenant-deletion.service';

const TENANT = '11111111-1111-4111-8111-111111111111';
const USER = '22222222-2222-4222-8222-222222222222';
const JOB_ID = '33333333-3333-4333-8333-333333333333';
const ACTOR = '44444444-4444-4444-8444-444444444444';
const RAW_EMAIL = 'secret-user@example.com';
const GA4_EDITOR =
  'La cuenta de servicio necesita rol de editor en la cuenta de GA4';

class MemoryStore implements DeletionJobStore {
  job: DeletionJob;

  constructor(job: DeletionJob) {
    this.job = clone(job);
  }

  claim(id: string): Promise<DeletionJob | null> {
    if (this.job.id !== id) return Promise.resolve(null);
    if (
      !canClaimDeletionJob(
        this.job.status,
        new Date(this.job.updatedAt),
        new Date(),
      )
    ) {
      return Promise.resolve(null);
    }
    this.job = {
      ...this.job,
      status: 'running',
      updatedAt: new Date().toISOString(),
    };
    return Promise.resolve(clone(this.job));
  }

  writeSteps(id: string, steps: DeletionStep[]): Promise<boolean> {
    if (this.job.id !== id || this.job.status !== 'running') {
      return Promise.resolve(false);
    }
    this.job = {
      ...this.job,
      steps: clone(steps),
      updatedAt: new Date().toISOString(),
    };
    return Promise.resolve(true);
  }

  finish(input: {
    id: string;
    status: 'completed' | 'completed_manual' | 'failed';
    steps: DeletionStep[];
    clearNotifyEmail: boolean;
  }): Promise<boolean> {
    if (this.job.id !== input.id || this.job.status !== 'running') {
      return Promise.resolve(false);
    }
    this.job = {
      ...this.job,
      status: input.status,
      steps: clone(input.steps),
      finishedAt: new Date().toISOString(),
      notifyEmail: input.clearNotifyEmail ? null : this.job.notifyEmail,
      updatedAt: new Date().toISOString(),
    };
    return Promise.resolve(true);
  }
}

function makeJob(snapshot?: Partial<DeletionSnapshot>): DeletionJob {
  const base = snapshotOf();
  return {
    id: JOB_ID,
    tenantId: TENANT,
    userId: USER,
    slug: 'cafe',
    snapshot: { ...base, ...snapshot, domain: snapshot?.domain ?? base.domain },
    notifyEmail: RAW_EMAIL,
    notifyCustomer: true,
    status: 'pending',
    steps: initialSteps(),
    reason: 'cierre pedido',
    actorUserId: ACTOR,
    actorEmail: 'owner@lattiz.app',
    createdAt: '2026-10-17T00:00:00.000Z',
    updatedAt: '2026-10-17T00:00:00.000Z',
    finishedAt: null,
  };
}

function snapshotOf(): DeletionSnapshot {
  return {
    tenantId: TENANT,
    userId: USER,
    slug: 'cafe',
    emailMasked: 's***@example.com',
    domain: {
      name: 'cafe.mx',
      source: 'lattiz_managed',
      registrarDomainId: 'reg-1',
      expiresAt: '2027-01-15T06:00:00.000Z',
      dnsProvider: 'cloudflare',
      dnsZoneId: 'zone-1',
      autoRenew: 'off',
      renewalDate: '2027-01-15T06:00:00.000Z',
      vercelInProject: true,
    },
    ga4PropertyId: '12345',
    analyticsIsMock: false,
    stripeCustomerId: 'cus_1',
    subscriptionIds: ['sub_1'],
    r2Bytes: 10,
    r2Objects: 1,
    pendingEmails: 1,
  };
}

function makeEffects(
  overrides: Partial<DeletionEffects> = {},
): DeletionEffects & { order: string[] } {
  const order: string[] = [];
  let tick = 0;
  const effects: DeletionEffects = {
    now: () => new Date(Date.UTC(2026, 0, 1, 0, 0, tick++)).toISOString(),
    setOffline: jest.fn(async () => {
      order.push('offline');
    }),
    cancelSubscriptions: jest.fn(async () => {
      order.push('stripe');
    }),
    releaseDomain: jest.fn(async () => {
      order.push('domain');
    }),
    activeDnsProvider: () => 'cloudflare',
    deleteProperty: jest.fn(async () => {
      order.push('analytics');
      return { deleted: true };
    }),
    ga4IsMock: false,
    removePrefix: jest.fn(async () => {
      order.push('storage');
      return { deletedObjects: 2, deletedBytes: 40 };
    }),
    usageBytes: jest.fn(async () => {
      order.push('usage');
      return 0;
    }),
    cancelPendingEmails: jest.fn(async () => {
      order.push('emails');
    }),
    enqueueAccountDeleted: jest.fn(async () => {
      order.push('enqueue');
      return true;
    }),
    pendingEmailKinds: jest.fn(async () => []),
    isActiveAdmin: jest.fn(async () => {
      order.push('admin');
      return false;
    }),
    deleteProfile: jest.fn(async () => {
      order.push('profile');
    }),
    deleteAuthUser: jest.fn(async () => {
      order.push('auth');
    }),
    liveSubscriptionIds: jest.fn(async () => []),
    tenantAndUserGone: jest.fn(async () => ({ tenant: true, user: true })),
    zoneExists: jest.fn(async () => false),
    auditFinish: jest.fn(async () => undefined),
  };
  return Object.assign(effects, overrides, { order });
}

async function claimAndRun(
  store: MemoryStore,
  effects: DeletionEffects,
): Promise<void> {
  const job = await store.claim(JOB_ID);
  if (!job) return;
  await runTenantDeletion(job, store, effects);
}

describe('runTenantDeletion', () => {
  it('runs every step in order and finishes completed', async () => {
    const store = new MemoryStore(makeJob());
    const effects = makeEffects();
    await claimAndRun(store, effects);

    expect(store.job.steps.map((step) => step.key)).toEqual([
      ...DELETION_STEP_KEYS,
    ]);
    for (let index = 1; index < store.job.steps.length; index += 1) {
      const previous = store.job.steps[index - 1]?.finishedAt ?? '';
      const current = store.job.steps[index]?.startedAt ?? '';
      expect(previous < current).toBe(true);
    }
    expect(effects.order).toEqual([
      'offline',
      'stripe',
      'domain',
      'analytics',
      'storage',
      'storage',
      'emails',
      'enqueue',
      'admin',
      'profile',
      'auth',
      'usage',
      'usage',
    ]);
    expect(store.job.status).toBe('completed');
    expect(store.job.notifyEmail).toBeNull();
    expect(effects.auditFinish).toHaveBeenCalledWith(
      expect.objectContaining({ id: JOB_ID }),
      'completed',
      expect.any(Array),
    );
  });

  it('stops when Stripe cancellation fails and touches nothing else', async () => {
    const store = new MemoryStore(makeJob());
    const effects = makeEffects({
      cancelSubscriptions: jest.fn(async () => {
        throw new Error('stripe down');
      }),
    });
    await claimAndRun(store, effects);

    expect(store.job.status).toBe('failed');
    expect(store.job.steps.find((step) => step.key === 'stripe')?.status).toBe(
      'failed',
    );
    expect(store.job.steps.find((step) => step.key === 'domain')?.status).toBe(
      'pending',
    );
    expect(effects.releaseDomain).not.toHaveBeenCalled();
    expect(effects.deleteProperty).not.toHaveBeenCalled();
    expect(effects.removePrefix).not.toHaveBeenCalled();
    expect(effects.cancelPendingEmails).not.toHaveBeenCalled();
    expect(effects.enqueueAccountDeleted).not.toHaveBeenCalled();
    expect(effects.deleteProfile).not.toHaveBeenCalled();
    expect(effects.deleteAuthUser).not.toHaveBeenCalled();
    expect(store.job.notifyEmail).toBe(RAW_EMAIL);
  });

  it('retries a storage failure without repeating earlier steps', async () => {
    const store = new MemoryStore(makeJob());
    const removePrefix = jest
      .fn()
      .mockRejectedValueOnce(new Error('r2 down'))
      .mockResolvedValue({ deletedObjects: 1, deletedBytes: 4 });
    const effects = makeEffects({ removePrefix });
    await claimAndRun(store, effects);
    const registrarStarted = store.job.steps.find(
      (step) => step.key === 'registrar',
    )?.startedAt;
    expect(store.job.status).toBe('failed');
    expect(store.job.notifyEmail).toBe(RAW_EMAIL);

    await claimAndRun(store, effects);

    expect(effects.cancelSubscriptions).toHaveBeenCalledTimes(1);
    expect(effects.releaseDomain).toHaveBeenCalledTimes(1);
    expect(effects.deleteProperty).toHaveBeenCalledTimes(1);
    expect(
      store.job.steps.find((step) => step.key === 'registrar')?.startedAt,
    ).toBe(registrarStarted);
    expect(store.job.status).toBe('completed');
    expect(store.job.notifyEmail).toBeNull();
    const prefixes = removePrefix.mock.calls.map((call) => call[0]);
    expect(prefixes).toEqual([
      tenantAssetsPrefix(TENANT),
      tenantAssetsPrefix(TENANT),
      tenantBrandingPrefix(TENANT),
    ]);
  });

  it('marks a foreign DNS zone manual and still completes', async () => {
    const job = makeJob();
    job.snapshot.domain = {
      ...job.snapshot.domain!,
      dnsProvider: 'openprovider',
    };
    const store = new MemoryStore(job);
    const effects = makeEffects({
      zoneExists: jest.fn(async () => true),
    });
    await claimAndRun(store, effects);

    expect(effects.releaseDomain).toHaveBeenCalledWith(TENANT);
    expect(effects.zoneExists).not.toHaveBeenCalled();
    expect(store.job.steps.find((step) => step.key === 'domain')).toMatchObject(
      {
        status: 'manual',
        detail: 'Borra la zona cafe.mx en openprovider',
      },
    );
    expect(store.job.status).toBe('completed_manual');
    expect(store.job.notifyEmail).toBeNull();
  });

  it('leaves registrar manual when auto-renew is on or unknown', async () => {
    for (const autoRenew of ['on', null] as const) {
      const job = makeJob();
      job.snapshot.domain = { ...job.snapshot.domain!, autoRenew };
      const store = new MemoryStore(job);
      await claimAndRun(store, makeEffects());
      expect(
        store.job.steps.find((step) => step.key === 'registrar'),
      ).toMatchObject({
        status: 'manual',
        detail: 'Apaga la renovación automática en Openprovider para cafe.mx',
      });
      expect(store.job.status).toBe('completed_manual');
    }
  });

  it('treats GA4 NOT_FOUND as done and PERMISSION_DENIED as manual', async () => {
    const missing = new MemoryStore(makeJob());
    const missingEffects = makeEffects({
      deleteProperty: jest.fn(async () => ({ deleted: false })),
    });
    await claimAndRun(missing, missingEffects);
    expect(
      missing.job.steps.find((step) => step.key === 'analytics'),
    ).toMatchObject({
      status: 'done',
      detail: 'La propiedad ya no existía.',
    });
    expect(missing.job.status).toBe('completed');

    const denied = new MemoryStore(makeJob());
    await claimAndRun(
      denied,
      makeEffects({
        deleteProperty: jest.fn(async () => {
          throw new Error(GA4_EDITOR);
        }),
      }),
    );
    expect(
      denied.job.steps.find((step) => step.key === 'analytics'),
    ).toMatchObject({
      status: 'manual',
      detail: GA4_EDITOR,
    });
    expect(denied.job.status).toBe('completed_manual');
    expect(denied.job.notifyEmail).toBeNull();
  });

  it('skips a mock property when the gateway is real', async () => {
    const job = makeJob({ ga4PropertyId: 'mock-1', analyticsIsMock: true });
    const store = new MemoryStore(job);
    const effects = makeEffects();
    await claimAndRun(store, effects);
    expect(effects.deleteProperty).not.toHaveBeenCalled();
    expect(
      store.job.steps.find((step) => step.key === 'analytics')?.detail,
    ).toBe('propiedad simulada, nada que borrar en Google');
  });

  it('fails the account step when the user became an admin', async () => {
    const store = new MemoryStore(makeJob());
    const effects = makeEffects({
      isActiveAdmin: jest.fn(async () => true),
    });
    await claimAndRun(store, effects);
    expect(effects.deleteProfile).not.toHaveBeenCalled();
    expect(effects.deleteAuthUser).not.toHaveBeenCalled();
    expect(effects.tenantAndUserGone).not.toHaveBeenCalled();
    expect(
      store.job.steps.find((step) => step.key === 'account'),
    ).toMatchObject({ status: 'failed', error: 'Revócalo del equipo primero' });
    expect(store.job.status).toBe('failed');
  });

  it('removes only the two tenant prefixes', async () => {
    const store = new MemoryStore(makeJob());
    const effects = makeEffects();
    await claimAndRun(store, effects);
    expect(effects.removePrefix).toHaveBeenCalledTimes(2);
    expect(effects.removePrefix).toHaveBeenNthCalledWith(
      1,
      tenantAssetsPrefix(TENANT),
    );
    expect(effects.removePrefix).toHaveBeenNthCalledWith(
      2,
      tenantBrandingPrefix(TENANT),
    );
    expect(effects.usageBytes).toHaveBeenNthCalledWith(
      1,
      tenantAssetsPrefix(TENANT),
    );
    expect(effects.usageBytes).toHaveBeenNthCalledWith(
      2,
      tenantBrandingPrefix(TENANT),
    );
  });

  it('lets only one of two concurrent runs execute', async () => {
    const store = new MemoryStore(makeJob());
    let entered = 0;
    const effects = makeEffects({
      cancelSubscriptions: jest.fn(async () => {
        entered += 1;
        await new Promise((resolve) => setTimeout(resolve, 20));
      }),
    });
    await Promise.all([
      claimAndRun(store, effects),
      claimAndRun(store, effects),
    ]);
    expect(entered).toBe(1);
    expect(effects.releaseDomain).toHaveBeenCalledTimes(1);
  });

  it('enqueues the admin deletion notice and hides the raw email', async () => {
    const store = new MemoryStore(makeJob());
    const effects = makeEffects();
    await claimAndRun(store, effects);
    expect(effects.enqueueAccountDeleted).toHaveBeenCalledWith(
      RAW_EMAIL,
      `account_deleted:admin:${TENANT}`,
    );
    const dto = toDeletionJobDto({
      ...store.job,
      notifyEmail: RAW_EMAIL,
      snapshot: { ...store.job.snapshot, emailMasked: maskEmail(RAW_EMAIL) },
    });
    expect(dto).not.toHaveProperty('notifyEmail');
    expect(JSON.stringify(dto)).not.toContain('secret-user');
    expect(dto.snapshot.emailMasked).toBe('s***@example.com');
  });

  it('does not claim a run that is still inside the stale window', async () => {
    const job = makeJob();
    job.status = 'running';
    job.updatedAt = new Date().toISOString();
    const store = new MemoryStore(job);
    await claimAndRun(store, makeEffects());
    expect(store.job.status).toBe('running');

    const stale = makeJob();
    stale.status = 'running';
    stale.updatedAt = new Date(
      Date.now() - DELETION_CLAIM_STALE_MS - 1000,
    ).toISOString();
    const staleStore = new MemoryStore(stale);
    await claimAndRun(staleStore, makeEffects());
    expect(staleStore.job.status).toBe('completed');
  });
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
