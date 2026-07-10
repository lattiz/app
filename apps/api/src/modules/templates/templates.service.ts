import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../database/database.module';
import { TemplateListItemDto } from './dto/template-list-item.dto';

interface TemplateRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

@Injectable()
export class TemplatesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /** Lists active templates for the gallery, lightest fields only (no grapesjs_json). */
  async findAll(): Promise<TemplateListItemDto[]> {
    const rows = await this.query<TemplateRow>(
      sql`SELECT id, name, description, category, preview_url, thumbnail_url, sort_order
          FROM public.templates
          WHERE is_active = true
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
    }));
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}
