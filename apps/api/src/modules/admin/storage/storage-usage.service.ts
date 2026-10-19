import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import {
  OBJECT_STORAGE_PORT,
  type ObjectStoragePort,
} from '../../storage/domain/object-storage.port';
import {
  tenantAssetsPrefix,
  tenantBrandingPrefix,
} from '../../storage/domain/storage-path';
import { AdminNotFoundException } from '../admin.exceptions';
import { AdminStorageUsageDto } from './storage-usage.dto';

/** One cron tick must not walk an unbounded tenant list. */
const MAX_MEASURE_BATCH = 500;

const TENANT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface StorageUsageRow {
  tenant_id: string;
  assets_bytes: number | string;
  assets_objects: number | string;
  branding_bytes: number | string;
  branding_objects: number | string;
  measured_at: string | Date;
}

export interface StorageMeasureBatchResult {
  measured: number;
  failed: number;
}

@Injectable()
export class StorageUsageService {
  private readonly logger = new Logger(StorageUsageService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(OBJECT_STORAGE_PORT)
    private readonly storage: ObjectStoragePort,
  ) {}

  async find(tenantId: string): Promise<AdminStorageUsageDto | null> {
    assertTenantId(tenantId);
    const rows = await this.query<StorageUsageRow>(sql`
      SELECT
        tenant_id,
        assets_bytes,
        assets_objects,
        branding_bytes,
        branding_objects,
        measured_at
      FROM admin.storage_usage
      WHERE tenant_id = ${tenantId}::uuid
    `);
    const row = rows[0];
    return row ? mapStorageUsage(row) : null;
  }

  /**
   * Measures both prefixes and upserts `admin.storage_usage`.
   * Object counts stay 0: `usageBytes` only returns a size. They will move
   * when the port can list keys (same change that adds `removePrefix`).
   */
  async measure(tenantId: string): Promise<AdminStorageUsageDto> {
    assertTenantId(tenantId);
    const assetsBytes = asByteCount(
      await this.storage.usageBytes(tenantAssetsPrefix(tenantId)),
    );
    const brandingBytes = asByteCount(
      await this.storage.usageBytes(tenantBrandingPrefix(tenantId)),
    );
    const measuredAt = new Date().toISOString();
    const rows = await this.query<StorageUsageRow>(sql`
      INSERT INTO admin.storage_usage (
        tenant_id,
        assets_bytes,
        assets_objects,
        branding_bytes,
        branding_objects,
        measured_at
      ) VALUES (
        ${tenantId}::uuid,
        ${assetsBytes}::bigint,
        0,
        ${brandingBytes}::bigint,
        0,
        ${measuredAt}::timestamptz
      )
      ON CONFLICT (tenant_id) DO UPDATE SET
        assets_bytes = EXCLUDED.assets_bytes,
        assets_objects = EXCLUDED.assets_objects,
        branding_bytes = EXCLUDED.branding_bytes,
        branding_objects = EXCLUDED.branding_objects,
        measured_at = EXCLUDED.measured_at
      RETURNING
        tenant_id,
        assets_bytes,
        assets_objects,
        branding_bytes,
        branding_objects,
        measured_at
    `);
    const row = rows[0];
    if (!row) throw new AdminNotFoundException();
    return mapStorageUsage(row);
  }

  /**
   * Stalest tenants first, one at a time (the VM cannot list prefixes in parallel).
   * A failure is counted and the loop continues.
   */
  async measureAll(options: {
    batch: number;
  }): Promise<StorageMeasureBatchResult> {
    const batch = Math.floor(options.batch);
    if (!Number.isFinite(batch) || batch < 1) {
      return { measured: 0, failed: 0 };
    }
    const limit = Math.min(batch, MAX_MEASURE_BATCH);
    const tenants = await this.query<{ id: string }>(sql`
      SELECT t.id
      FROM public.tenants t
      LEFT JOIN admin.storage_usage su ON su.tenant_id = t.id
      ORDER BY su.measured_at ASC NULLS FIRST, t.id
      LIMIT ${limit}::int
    `);

    let measured = 0;
    let failed = 0;
    for (const tenant of tenants) {
      try {
        await this.measure(tenant.id);
        measured += 1;
      } catch (error: unknown) {
        failed += 1;
        const message =
          error instanceof Error ? error.message : 'unknown error';
        this.logger.warn(
          `Storage measure failed for tenant ${tenant.id}: ${message}`,
        );
      }
    }
    return { measured, failed };
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function assertTenantId(tenantId: string): void {
  if (!TENANT_ID.test(tenantId)) throw new AdminNotFoundException();
}

function asByteCount(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('usageBytes returned an invalid byte count');
  }
  return Math.trunc(value);
}

function mapStorageUsage(row: StorageUsageRow): AdminStorageUsageDto {
  return {
    tenantId: row.tenant_id,
    assetsBytes: asStoredInt(row.assets_bytes),
    assetsObjects: asStoredInt(row.assets_objects),
    brandingBytes: asStoredInt(row.branding_bytes),
    brandingObjects: asStoredInt(row.branding_objects),
    measuredAt: toIso(row.measured_at),
  };
}

function asStoredInt(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.trunc(parsed);
}

function toIso(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('storage_usage.measured_at is not a timestamp');
  }
  return date.toISOString();
}
