import { Inject, Injectable } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import { AdminNotFoundException } from '../admin.exceptions';
import type {
  AdminTemplateDetailDto,
  AdminTemplateListQueryDto,
  AdminTemplateListResponseDto,
} from './admin-templates.dto';
import {
  mapTemplateDetail,
  mapTemplateListItem,
  type TemplateDetailRow,
  type TemplateListRow,
  type TemplateTenantRow,
} from './admin-templates.mapper';
import {
  templateDetailStatement,
  templateListStatement,
  templateTenantsStatement,
} from './admin-templates.queries';

@Injectable()
export class AdminTemplatesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(
    query: AdminTemplateListQueryDto,
  ): Promise<AdminTemplateListResponseDto> {
    const rows = await this.query<TemplateListRow>(
      templateListStatement(query),
    );
    return { items: rows.map(mapTemplateListItem) };
  }

  async get(id: string): Promise<AdminTemplateDetailDto> {
    const rows = await this.query<TemplateDetailRow>(
      templateDetailStatement(id),
    );
    const row = rows[0];
    if (!row) {
      throw new AdminNotFoundException('No se encontró la plantilla.');
    }
    const tenants = await this.query<TemplateTenantRow>(
      templateTenantsStatement(id),
    );
    return mapTemplateDetail(row, tenants);
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}
