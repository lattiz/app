import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AnalyticsConfig } from './analytics.config';
import { MockGa4Gateway, RealGa4Gateway } from './ga4.gateway';

const EDITOR_ROLE_MESSAGE =
  'La cuenta de servicio necesita rol de editor en la cuenta de GA4';

class GatewayWithAdmin extends RealGa4Gateway {
  constructor(private readonly deleteImpl: (name: string) => Promise<void>) {
    super({} as AnalyticsConfig);
  }

  protected override adminClient() {
    return {
      deleteProperty: async (request: { name?: string | null } = {}) => {
        await this.deleteImpl(request.name ?? '');
        return [{}, request, undefined];
      },
    } as unknown as ReturnType<RealGa4Gateway['adminClient']>;
  }
}

function grpcError(code: number, message: string): Error {
  return Object.assign(new Error(message), { code });
}

describe('MockGa4Gateway.deleteProperty', () => {
  const gateway = new MockGa4Gateway({} as AnalyticsConfig);

  it('reports mock property ids as deleted', async () => {
    assert.deepEqual(await gateway.deleteProperty('mock-42'), { deleted: true });
  });

  it('rejects ids that are not mock property ids', async () => {
    for (const propertyId of ['12345', '', 'mock-', 'templates/x']) {
      await assert.rejects(
        () => gateway.deleteProperty(propertyId),
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.equal((error as { code?: number }).code, 3);
          return true;
        },
      );
    }
  });
});

describe('RealGa4Gateway.deleteProperty', () => {
  it('calls deleteProperty with the property resource name', async () => {
    const names: string[] = [];
    const gateway = new GatewayWithAdmin(async (name) => {
      names.push(name);
    });

    assert.deepEqual(await gateway.deleteProperty('12345'), { deleted: true });
    assert.deepEqual(names, ['properties/12345']);
  });

  it('treats NOT_FOUND as an idempotent miss', async () => {
    const gateway = new GatewayWithAdmin(async () => {
      throw grpcError(5, '5 NOT_FOUND: Property not found');
    });

    assert.deepEqual(await gateway.deleteProperty('12345'), { deleted: false });
  });

  it('tells the caller when the service account is not an editor', async () => {
    const gateway = new GatewayWithAdmin(async () => {
      throw grpcError(7, '7 PERMISSION_DENIED');
    });

    await assert.rejects(
      () => gateway.deleteProperty('12345'),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.message, EDITOR_ROLE_MESSAGE);
        return true;
      },
    );
  });

  it('rethrows any other admin error', async () => {
    const gateway = new GatewayWithAdmin(async () => {
      throw grpcError(14, '14 UNAVAILABLE');
    });

    await assert.rejects(() => gateway.deleteProperty('12345'), /UNAVAILABLE/);
  });
});
