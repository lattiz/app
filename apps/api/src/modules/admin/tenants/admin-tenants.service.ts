import { Inject, Injectable } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import type { PreviewPolicyConfig } from '../../../common/billing/preview-capability';
import { PreviewConfig } from '../../../common/billing/preview.config';
import { type Database, DATABASE } from '../../../database/database.module';
import { AdminNotFoundException } from '../admin.exceptions';
import { StorageUsageService } from '../storage/storage-usage.service';
import type { AdminStorageUsageDto } from '../storage/storage-usage.dto';
import type {
  AdminTenantDetailDto,
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
  tenantIdentityStatement,
  tenantListStatements,
  tenantOverviewStatement,
  tenantSubscriptionsStatement,
} from './admin-tenants.queries';

export interface StorageRefreshResult {
  before: AdminStorageUsageDto | null;
  usage: AdminStorageUsageDto;
}

@Injectable()
export class AdminTenantsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly preview: PreviewConfig,
    private readonly storageUsage: StorageUsageService,
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

  async refreshStorage(tenantId: string): Promise<StorageRefreshResult> {
    const found = await this.query<{ ok: number }>(
      tenantExistsStatement(tenantId),
    );
    if (!found[0]) throw new AdminNotFoundException();
    const before = await this.storageUsage.find(tenantId);
    const usage = await this.storageUsage.measure(tenantId);
    return { before, usage };
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
