import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { OpenproviderRequest } from './openprovider.client';
import { OpenproviderClient } from './openprovider.client';
import {
  MOCK_REGISTRAR_BALANCE_CENTS,
  MockOpenproviderRegistrarAdapter,
} from './mock-openprovider-registrar.adapter';
import { OpenproviderRegistrarAdapter } from './openprovider-registrar.adapter';
import {
  RegistrarApiException,
  RegistrarDomainNotActiveException,
} from '../../domains.exceptions';

interface RecordedCall {
  method: 'get' | 'post';
  path: string;
  operation: string;
  timeoutMs?: number;
  body?: unknown;
}

function adapterReturning(handler: (call: RecordedCall) => unknown): {
  adapter: OpenproviderRegistrarAdapter;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const client = {
    async get(path: string, opts: OpenproviderRequest) {
      const call: RecordedCall = {
        method: 'get',
        path,
        operation: opts.operation,
        timeoutMs: opts.timeoutMs,
      };
      calls.push(call);
      return handler(call);
    },
    async post(path: string, opts: OpenproviderRequest) {
      const call: RecordedCall = {
        method: 'post',
        path,
        operation: opts.operation,
        timeoutMs: opts.timeoutMs,
        body: opts.body,
      };
      calls.push(call);
      return handler(call);
    },
  } as unknown as OpenproviderClient;
  return {
    adapter: new OpenproviderRegistrarAdapter(client, 'handle'),
    calls,
  };
}

describe('OpenproviderRegistrarAdapter renewal', () => {
  it('renews with the domain split and a one-year period', async () => {
    const { adapter, calls } = adapterReturning(() => ({ status: 'ACT' }));
    await adapter.renewDomain({
      registrarDomainId: '99',
      domain: 'tienda.com',
      periodYears: 1,
    });
    assert.deepEqual(calls, [
      {
        method: 'post',
        path: 'domains/99/renew',
        operation: 'renewal',
        timeoutMs: 60_000,
        body: {
          domain: { name: 'tienda', extension: 'com' },
          period: 1,
        },
      },
    ]);
  });

  it('maps registrar code 327 to a not-active error and leaves other errors as-is', async () => {
    const inactive = adapterReturning(() => {
      throw new RegistrarApiException(
        'renewal',
        'This domain already exists in Openprovider but NOT active',
        400,
        327,
      );
    });
    await assert.rejects(
      () =>
        inactive.adapter.renewDomain({
          registrarDomainId: '99',
          domain: 'tienda.com',
          periodYears: 1,
        }),
      (err: unknown) => {
        assert.ok(err instanceof RegistrarDomainNotActiveException);
        assert.equal(err.code, 'REGISTRAR_DOMAIN_NOT_ACTIVE');
        assert.equal(err.registrarDomainId, '99');
        return true;
      },
    );
    assert.equal(inactive.calls.length, 1);

    const other = new RegistrarApiException('renewal', 'no credit', 402, 12);
    const failed = adapterReturning(() => {
      throw other;
    });
    await assert.rejects(
      () =>
        failed.adapter.renewDomain({
          registrarDomainId: '99',
          domain: 'tienda.com',
          periodYears: 1,
        }),
      (err: unknown) => {
        assert.equal(err, other);
        assert.ok(!(err instanceof RegistrarDomainNotActiveException));
        return true;
      },
    );
  });

  it('restores with the domain split and no period', async () => {
    const { adapter, calls } = adapterReturning(() => ({ status: 'ACT' }));
    await adapter.restoreDomain({
      registrarDomainId: '99',
      domain: 'tienda.com.mx',
    });
    assert.deepEqual(calls, [
      {
        method: 'post',
        path: 'domains/99/restore',
        operation: 'restore',
        timeoutMs: 60_000,
        body: { domain: { name: 'tienda', extension: 'com.mx' } },
      },
    ]);
  });
});

describe('OpenproviderRegistrarAdapter lifecycle', () => {
  it('maps an active domain', async () => {
    const { adapter } = adapterReturning(() => ({
      status: 'ACT',
      renewal_date: '2028-10-03 00:00:00',
      can_renew: true,
      is_deleted: false,
    }));
    assert.deepEqual(await adapter.getLifecycle('99'), {
      status: 'active',
      renewalDate: new Date('2028-10-03T00:00:00.000Z'),
      canRenew: true,
      restorableUntil: null,
    });
  });

  it('maps a deleted domain and its restore deadline', async () => {
    const { adapter } = adapterReturning(() => ({
      status: 'DEL',
      is_deleted: true,
      renewal_date: '2026-10-03 00:00:00',
      can_renew: false,
      restorable_until: '2026-11-15 00:00:00',
    }));
    assert.deepEqual(await adapter.getLifecycle('99'), {
      status: 'expired',
      renewalDate: new Date('2026-10-03T00:00:00.000Z'),
      canRenew: false,
      restorableUntil: new Date('2026-11-15T00:00:00.000Z'),
    });
  });

  it('treats zero timestamps as missing dates', async () => {
    const { adapter } = adapterReturning(() => ({
      status: 'ACT',
      renewal_date: '0000-00-00 00:00:00',
      can_renew: false,
      restorable_until: '0000-00-00 00:00:00',
    }));
    const lifecycle = await adapter.getLifecycle('99');
    assert.equal(lifecycle.renewalDate, null);
    assert.equal(lifecycle.restorableUntil, null);
    assert.equal(lifecycle.status, 'active');
  });

  it('maps in-flight registration to pending and FAI to unknown', async () => {
    const pending = adapterReturning(() => ({ status: 'REQ' }));
    assert.equal((await pending.adapter.getLifecycle('99')).status, 'pending');

    const unknown = adapterReturning(() => ({ status: 'FAI' }));
    assert.equal((await unknown.adapter.getLifecycle('99')).status, 'unknown');
  });
});

describe('OpenproviderRegistrarAdapter balance', () => {
  it('subtracts the reserved amount and rounds to cents', async () => {
    const { adapter, calls } = adapterReturning(() => ({
      balance: 10.375,
      reserved_balance: 0.25,
    }));
    assert.deepEqual(await adapter.getBalance(), { availableCents: 1013 });
    assert.deepEqual(calls, [
      {
        method: 'get',
        path: 'resellers',
        operation: 'balance lookup',
        timeoutMs: 10_000,
      },
    ]);
  });

  it('rejects a balance that is not a finite number', async () => {
    const { adapter } = adapterReturning(() => ({
      balance: '12.00',
      reserved_balance: 1,
    }));
    await assert.rejects(
      () => adapter.getBalance(),
      (err: unknown) => {
        assert.ok(err instanceof RegistrarApiException);
        assert.ok(!(err instanceof RegistrarDomainNotActiveException));
        return true;
      },
    );
  });
});

describe('MockOpenproviderRegistrarAdapter renewal', () => {
  function mockAdapter(): MockOpenproviderRegistrarAdapter {
    const fail = () => Promise.reject(new Error('network'));
    const client = {
      get: fail,
      post: fail,
      put: fail,
      delete: fail,
    } as unknown as OpenproviderClient;
    return new MockOpenproviderRegistrarAdapter(client, '');
  }

  it('adds the renewal period to the stored expiry and stays active', async () => {
    const adapter = mockAdapter();
    adapter.seedDomain('mock_fixed', {
      renewalDate: new Date('2027-10-03T00:00:00.000Z'),
    });
    await adapter.renewDomain({
      registrarDomainId: 'mock_fixed',
      domain: 'tienda.com',
      periodYears: 1,
    });
    const lifecycle = await adapter.getLifecycle('mock_fixed');
    assert.equal(lifecycle.status, 'active');
    assert.equal(lifecycle.canRenew, true);
    assert.equal(
      lifecycle.renewalDate?.toISOString(),
      '2028-10-03T00:00:00.000Z',
    );
    assert.deepEqual(await adapter.getBalance(), {
      availableCents: MOCK_REGISTRAR_BALANCE_CENTS,
    });
  });

  it('reports a scripted expired domain and refuses a plain renewal', async () => {
    const adapter = mockAdapter();
    const until = new Date('2026-12-01T00:00:00.000Z');
    adapter.seedDomain('mock_dead', {
      status: 'expired',
      renewalDate: new Date('2026-10-03T00:00:00.000Z'),
      restorableUntil: until,
    });
    const lifecycle = await adapter.getLifecycle('mock_dead');
    assert.equal(lifecycle.status, 'expired');
    assert.equal(lifecycle.canRenew, false);
    assert.equal(lifecycle.restorableUntil?.toISOString(), until.toISOString());
    await assert.rejects(
      () =>
        adapter.renewDomain({
          registrarDomainId: 'mock_dead',
          domain: 'tienda.com',
          periodYears: 1,
        }),
      (err: unknown) => {
        assert.ok(err instanceof RegistrarDomainNotActiveException);
        return true;
      },
    );
    assert.equal(
      (await adapter.getLifecycle('mock_dead')).renewalDate?.toISOString(),
      '2026-10-03T00:00:00.000Z',
    );
  });

  it('fails a scripted renewal without moving the expiry', async () => {
    const adapter = mockAdapter();
    adapter.seedDomain('mock_fail', {
      renewalDate: new Date('2027-10-03T00:00:00.000Z'),
      failRenewal: true,
    });
    await assert.rejects(
      () =>
        adapter.renewDomain({
          registrarDomainId: 'mock_fail',
          domain: 'tienda.com',
          periodYears: 1,
        }),
      (err: unknown) => {
        assert.ok(err instanceof RegistrarApiException);
        assert.ok(!(err instanceof RegistrarDomainNotActiveException));
        return true;
      },
    );
    assert.equal(
      (await adapter.getLifecycle('mock_fail')).renewalDate?.toISOString(),
      '2027-10-03T00:00:00.000Z',
    );
  });
});
