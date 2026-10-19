import { PgDialect } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';
import type { Database } from '../../../database/database.module';
import type { ObjectStoragePort } from '../../storage/domain/object-storage.port';
import { StorageUsageService } from './storage-usage.service';

const dialect = new PgDialect();
const TENANT = '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11';
const OTHER = '7a2c1d4f-9b3e-4a6c-8d82-3f5e9b1c8d22';

function usageRow(overrides: Record<string, unknown> = {}) {
  return {
    tenant_id: TENANT,
    assets_bytes: '120',
    assets_objects: 0,
    branding_bytes: '30',
    branding_objects: 0,
    measured_at: '2026-10-17T03:00:00.000Z',
    ...overrides,
  };
}

describe('StorageUsageService.measure', () => {
  it('stores both prefix sizes and leaves object counts at 0', async () => {
    const usageBytes = jest.fn(async (prefix: string) => {
      if (prefix === `tenant-assets/${TENANT}/`) return 120;
      if (prefix === `tenant-branding/${TENANT}/`) return 30;
      throw new Error(`unexpected prefix ${prefix}`);
    });
    const execute = jest.fn(async (statement: SQL) => {
      const rendered = dialect.sqlToQuery(statement);
      expect(rendered.sql).toContain('INSERT INTO admin.storage_usage');
      expect(rendered.sql).toContain('ON CONFLICT');
      expect(rendered.params).toEqual(
        expect.arrayContaining([TENANT, 120, 30]),
      );
      expect(rendered.params.every((param) => !(param instanceof Date))).toBe(
        true,
      );
      expect(rendered.sql).toMatch(/,\s*0,\s*/);
      return [usageRow()];
    });
    const service = new StorageUsageService(
      { execute } as unknown as Database,
      { usageBytes } as unknown as ObjectStoragePort,
    );

    const row = await service.measure(TENANT);

    expect(usageBytes).toHaveBeenNthCalledWith(1, `tenant-assets/${TENANT}/`);
    expect(usageBytes).toHaveBeenNthCalledWith(2, `tenant-branding/${TENANT}/`);
    expect(row).toEqual({
      tenantId: TENANT,
      assetsBytes: 120,
      assetsObjects: 0,
      brandingBytes: 30,
      brandingObjects: 0,
      measuredAt: '2026-10-17T03:00:00.000Z',
    });
  });
});

describe('StorageUsageService.measureAll', () => {
  it('measures tenants one at a time and counts failures', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const usageBytes = jest.fn(async (prefix: string) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      inFlight -= 1;
      if (prefix.includes(OTHER)) throw new Error('listing failed');
      return 10;
    });
    const execute = jest.fn(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql;
      if (text.includes('FROM public.tenants')) {
        return [{ id: TENANT }, { id: OTHER }];
      }
      return [usageRow()];
    });
    const service = new StorageUsageService(
      { execute } as unknown as Database,
      { usageBytes } as unknown as ObjectStoragePort,
    );

    await expect(service.measureAll({ batch: 25 })).resolves.toEqual({
      measured: 1,
      failed: 1,
    });
    expect(maxInFlight).toBe(1);
  });
});
