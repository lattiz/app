import { Inject, Injectable } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import type { PreviewPolicyConfig } from '../../../common/billing/preview-capability';
import { PreviewConfig } from '../../../common/billing/preview.config';
import { type Database, DATABASE } from '../../../database/database.module';
import { summarizeTrials } from './admin-trials.classify';
import type {
  AdminTrialListQueryDto,
  AdminTrialListResponseDto,
  AdminTrialSummaryDto,
} from './admin-trials.dto';
import {
  mapTrialItem,
  trialSample,
  type TrialRow,
} from './admin-trials.mapper';
import {
  trialListStatements,
  trialPopulationStatement,
} from './admin-trials.queries';

@Injectable()
export class AdminTrialsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly preview: PreviewConfig,
  ) {}

  async list(
    query: AdminTrialListQueryDto,
    now = new Date(),
  ): Promise<AdminTrialListResponseDto> {
    const policy = this.policy();
    const statements = trialListStatements(query, policy.trialDays);
    const [rows, totals] = await Promise.all([
      this.query<TrialRow>(statements.items),
      this.query<{ total: number | string }>(statements.count),
    ]);
    return {
      items: rows.map((row) => mapTrialItem(row, policy, now)),
      total: Number(totals[0]?.total ?? 0),
      page: statements.page,
      pageSize: statements.pageSize,
    };
  }

  async summary(now = new Date()): Promise<AdminTrialSummaryDto> {
    const policy = this.policy();
    const rows = await this.query<TrialRow>(trialPopulationStatement());
    const figures = summarizeTrials(
      rows.map((row) => trialSample(row, policy, now)),
      now,
    );
    return {
      ...figures,
      trialDays: policy.trialDays,
      enabled: policy.enabled,
    };
  }

  private policy(): PreviewPolicyConfig {
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
