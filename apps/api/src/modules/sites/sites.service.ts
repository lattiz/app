import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../database/database.module';
import { PublishSiteResponseDto, SaveSchemaResponseDto, SiteSchemaResponseDto } from './dto/sites.response.dto';
import {
  NoTemplateAvailableException,
  SiteNotFoundException,
  TenantAccessDeniedException,
} from './sites.exceptions';

type Json = Record<string, unknown>;

interface ProjectRow {
  grapesjs_json: Json;
}
interface TemplateRow {
  id: string;
  grapesjs_json: Json;
}
interface UpdatedAtRow {
  updated_at: string | Date;
}
interface PublishedAtRow {
  published_at: string | Date;
}

@Injectable()
export class SitesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /** Returns the editor project for a tenant, seeding it from a template on first load. */
  async getEditorProject(tenantId: string, userSub: string): Promise<SiteSchemaResponseDto> {
    await this.assertTenantOwnership(tenantId, userSub);

    const existing = await this.query<ProjectRow>(
      sql`SELECT grapesjs_json FROM public.site_schemas WHERE tenant_id = ${tenantId}::uuid LIMIT 1`,
    );
    if (existing[0]) return { project: existing[0].grapesjs_json };

    const templates = await this.query<TemplateRow>(
      sql`SELECT id, grapesjs_json FROM public.templates
          WHERE is_active = true
          ORDER BY sort_order ASC, created_at ASC
          LIMIT 1`,
    );
    const template = templates[0];
    if (!template) throw new NoTemplateAvailableException();

    await this.db.execute(
      sql`INSERT INTO public.site_schemas (tenant_id, template_id, grapesjs_json, status)
          VALUES (${tenantId}::uuid, ${template.id}, ${JSON.stringify(template.grapesjs_json)}::jsonb, 'draft')
          ON CONFLICT (tenant_id) DO NOTHING`,
    );

    return { project: template.grapesjs_json };
  }

  /** Persists an autosave of the editor project. */
  async saveEditorProject(
    tenantId: string,
    userSub: string,
    project: Json,
  ): Promise<SaveSchemaResponseDto> {
    await this.assertTenantOwnership(tenantId, userSub);

    const rows = await this.query<UpdatedAtRow>(
      sql`UPDATE public.site_schemas
          SET grapesjs_json = ${JSON.stringify(project)}::jsonb, status = 'draft'
          WHERE tenant_id = ${tenantId}::uuid
          RETURNING updated_at`,
    );
    const row = rows[0];
    if (!row) throw new SiteNotFoundException();

    return { saved: true, updatedAt: toIso(row.updated_at) };
  }

  /** Publishes the site: stores the export HTML and marks the row published. */
  async publishSite(
    tenantId: string,
    userSub: string,
    project: Json,
    exportedHtml: string,
  ): Promise<PublishSiteResponseDto> {
    await this.assertTenantOwnership(tenantId, userSub);

    const rows = await this.query<PublishedAtRow>(
      sql`UPDATE public.site_schemas
          SET grapesjs_json = ${JSON.stringify(project)}::jsonb,
              exported_html = ${exportedHtml},
              status = 'published',
              published_at = now()
          WHERE tenant_id = ${tenantId}::uuid
          RETURNING published_at`,
    );
    const row = rows[0];
    if (!row) throw new SiteNotFoundException();

    // TODO: call revalidatePath after Next.js app is ready
    return { published: true, publishedAt: toIso(row.published_at) };
  }

  private async assertTenantOwnership(tenantId: string, userSub: string): Promise<void> {
    const rows = await this.query<{ ok: number }>(
      sql`SELECT 1 AS ok FROM public.tenants
          WHERE id = ${tenantId}::uuid AND user_id = ${userSub}::uuid
          LIMIT 1`,
    );
    if (!rows[0]) throw new TenantAccessDeniedException();
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
