import { Inject, Injectable } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import type { PreviewPolicyConfig } from '../../../common/billing/preview-capability';
import { PreviewConfig } from '../../../common/billing/preview.config';
import { type Database, DATABASE } from '../../../database/database.module';
import {
  AdminNotFoundException,
  TenantStatusConflictException,
} from '../admin.exceptions';
import { AdminMetricsService } from '../metrics/admin-metrics.service';
import { StorageUsageService } from '../storage/storage-usage.service';
import type { AdminStorageUsageDto } from '../storage/storage-usage.dto';
import type {
  AdminTenantDetailDto,
  AdminTenantFlagsPatchDto,
  AdminTenantListQueryDto,
  AdminTenantListResponseDto,
} from './admin-tenants.dto';
import {
  mapTenantDetail,
  mapTenantListItem,
  type AnalyticsRow,
  type ArchiveRow,
  type AuthIdentityRow,
  type EmailRow,
  type SubscriptionRow,
  type TenantListRow,
  type TenantOverviewRow,
} from './admin-tenants.mapper';
import {
  tenantAnalyticsStatement,
  tenantArchivesStatement,
  tenantEmailsStatement,
  tenantExistsStatement,
  tenantFlagsStatement,
  tenantFlagsUpsertStatement,
  tenantIdentityStatement,
  tenantListStatements,
  tenantOverviewStatement,
  tenantSetStatusStatement,
  tenantStatusStatement,
  tenantSubscriptionsStatement,
} from './admin-tenants.queries';

export interface StorageRefreshResult {
  before: AdminStorageUsageDto | null;
  usage: AdminStorageUsageDto;
}

export interface TenantFlagsState {
  isInternal: boolean;
  tags: string[];
  notes: string | null;
}

export interface TenantStatusResult {
  reason?: string;
  before: { status: string };
  after: { status: string };
  detail: AdminTenantDetailDto;
}

export interface TenantFlagsResult {
  before: TenantFlagsState;
  after: TenantFlagsState;
  detail: AdminTenantDetailDto;
}

interface FlagRow {
  is_internal: boolean | string | null;
  tags: unknown;
  notes: string | null;
}

@Injectable()
export class AdminTenantsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly preview: PreviewConfig,
    private readonly storageUsage: StorageUsageService,
    private readonly metrics: AdminMetricsService,
  ) {}

  async list(
    query: AdminTenantListQueryDto,
    now = new Date(),
  ): Promise<AdminTenantListResponseDto> {
    const statements = tenantListStatements(query);
    const policy = this.previewPolicy();
    const [rows, totals] = await Promise.all([
      this.query<TenantListRow>(statements.items),
      this.query<{ total: number | string }>(statements.count),
    ]);
    return {
      items: rows.map((row) => mapTenantListItem(row, policy, now)),
      total: Number(totals[0]?.total ?? 0),
      page: statements.page,
      pageSize: statements.pageSize,
    };
  }

  async get(tenantId: string, now = new Date()): Promise<AdminTenantDetailDto> {
    const overviews = await this.query<TenantOverviewRow>(
      tenantOverviewStatement(tenantId),
    );
    const overview = overviews[0];
    if (!overview) throw new AdminNotFoundException();

    const [users, archives, subscriptions, analytics, emails, storage] =
      await Promise.all([
        this.query<AuthIdentityRow>(tenantIdentityStatement(overview.user_id)),
        this.query<ArchiveRow>(tenantArchivesStatement(tenantId)),
        this.query<SubscriptionRow>(tenantSubscriptionsStatement(tenantId)),
        this.query<AnalyticsRow>(tenantAnalyticsStatement(tenantId)),
        this.query<EmailRow>(tenantEmailsStatement(tenantId)),
        this.storageUsage.find(tenantId),
      ]);

    return mapTenantDetail({
      overview,
      user: users[0] ?? null,
      archives,
      subscriptions,
      analytics: analytics[0] ?? null,
      emails,
      storage,
      maxAssetBytes: this.preview.maxAssetBytes,
      policy: this.previewPolicy(),
      now,
    });
  }

  async suspend(tenantId: string, reason: string): Promise<TenantStatusResult> {
    const current = await this.readStatus(tenantId);
    if (current !== 'active') {
      throw new TenantStatusConflictException(suspendConflict(current));
    }
    const updated = await this.query<{ status: string }>(
      tenantSetStatusStatement(tenantId, 'inactive', 'active'),
    );
    if (!updated[0]) {
      throw new TenantStatusConflictException(
        suspendConflict(await this.readStatus(tenantId)),
      );
    }
    return {
      reason,
      before: { status: 'active' },
      after: { status: 'inactive' },
      detail: await this.get(tenantId),
    };
  }

  async reactivate(tenantId: string): Promise<TenantStatusResult> {
    const current = await this.readStatus(tenantId);
    if (current !== 'inactive') {
      throw new TenantStatusConflictException(reactivateConflict(current));
    }
    const updated = await this.query<{ status: string }>(
      tenantSetStatusStatement(tenantId, 'active', 'inactive'),
    );
    if (!updated[0]) {
      throw new TenantStatusConflictException(
        reactivateConflict(await this.readStatus(tenantId)),
      );
    }
    return {
      before: { status: 'inactive' },
      after: { status: 'active' },
      detail: await this.get(tenantId),
    };
  }

  async updateFlags(
    tenantId: string,
    patch: AdminTenantFlagsPatchDto,
    actorUserId: string,
  ): Promise<TenantFlagsResult> {
    const found = await this.query<{ ok: number }>(
      tenantExistsStatement(tenantId),
    );
    if (!found[0]) throw new AdminNotFoundException();

    const before = await this.readFlags(tenantId);
    const next: TenantFlagsState = {
      isInternal: patch.isInternal ?? before.isInternal,
      tags: patch.tags ?? before.tags,
      notes: patch.notes === undefined ? before.notes : patch.notes,
    };
    const rows = await this.query<FlagRow>(
      tenantFlagsUpsertStatement(tenantId, next, actorUserId),
    );
    const after = rows[0] ? mapFlags(rows[0]) : next;
    if (before.isInternal !== after.isInternal) this.metrics.invalidate();
    return { before, after, detail: await this.get(tenantId) };
  }

  async refreshStorage(tenantId: string): Promise<StorageRefreshResult> {
    const found = await this.query<{ ok: number }>(
      tenantExistsStatement(tenantId),
    );
    if (!found[0]) throw new AdminNotFoundException();
    const before = await this.storageUsage.find(tenantId);
    const usage = await this.storageUsage.measure(tenantId);
    return { before, usage };
  }

  private async readStatus(tenantId: string): Promise<string> {
    const rows = await this.query<{ status: string }>(
      tenantStatusStatement(tenantId),
    );
    const status = rows[0]?.status;
    if (!status) throw new AdminNotFoundException();
    return status;
  }

  private async readFlags(tenantId: string): Promise<TenantFlagsState> {
    const rows = await this.query<FlagRow>(tenantFlagsStatement(tenantId));
    const row = rows[0];
    if (!row) return { isInternal: false, tags: [], notes: null };
    return mapFlags(row);
  }

  private previewPolicy(): PreviewPolicyConfig {
    return {
      enabled: this.preview.enabled,
      trialDays: this.preview.trialDays,
    };
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function mapFlags(row: FlagRow): TenantFlagsState {
  return {
    isInternal: row.is_internal === true || row.is_internal === 'true',
    tags: Array.isArray(row.tags)
      ? row.tags.filter((item): item is string => typeof item === 'string')
      : [],
    notes: row.notes,
  };
}

function suspendConflict(status: string): string {
  if (status === 'inactive') return 'El sitio ya está suspendido.';
  if (status === 'cancelled') {
    return 'El sitio está cancelado y no se puede suspender.';
  }
  return 'El sitio no se puede suspender en su estado actual.';
}

function reactivateConflict(status: string): string {
  if (status === 'active') return 'El sitio ya está activo.';
  return 'Solo se puede reactivar un sitio suspendido.';
}
