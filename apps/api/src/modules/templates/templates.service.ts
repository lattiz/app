import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../database/database.module';
import {
  TemplateGalleryItemDto,
  TemplateListItemDto,
} from './dto/template-list-item.dto';
import {
  evaluateTemplateAccess,
  isTemplateTier,
  TEMPLATE_ACCESS_ASSUMPTIONS,
  templatePlanFor,
} from './template-access.policy';
import { TemplateAccessService } from './template-access.service';

interface TemplateRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
  tier: string;
}

@Injectable()
export class TemplatesService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly access: TemplateAccessService,
  ) {}

  /** Gallery for the caller: every active template with its access for the caller's plan. */
  async findAllFor(userSub: string): Promise<TemplateGalleryItemDto[]> {
    const tenantId = await this.access.tenantIdForUser(userSub);
    const plan = tenantId
      ? (await this.access.stateForTenant(tenantId)).templatePlan
      : templatePlanFor({ plan: null, isEntitled: false });
    const items = (await this.list(sql`is_active = true`)).map((item) => {
      const decision = evaluateTemplateAccess(plan, item.tier);
      return {
        ...item,
        accessible: decision.allowed,
        lockedReason: decision.reason,
      };
    });
    return TEMPLATE_ACCESS_ASSUMPTIONS.showLockedTemplates
      ? items
      : items.filter((item) => item.accessible);
  }

  /** Public catalog: only templates whose preview and thumbnail are ready to show. */
  async findPublished(): Promise<TemplateListItemDto[]> {
    return this.list(
      sql`is_active = true AND preview_url IS NOT NULL AND thumbnail_url IS NOT NULL`,
    );
  }

  private async list(where: SQL): Promise<TemplateListItemDto[]> {
    const rows = await this.query<TemplateRow>(
      sql`SELECT id, name, description, category, preview_url, thumbnail_url, sort_order, tier
          FROM public.templates
          WHERE ${where}
          ORDER BY sort_order ASC, created_at ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      previewUrl: row.preview_url,
      thumbnailUrl: row.thumbnail_url,
      sortOrder: row.sort_order,
      // The CHECK constraint allows only these; anything else is treated as Pro by the policy.
      tier: isTemplateTier(row.tier) ? row.tier : 'pro',
    }));
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}
