import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { type Database, DATABASE } from '../../database/database.module';
import {
  ChangeTemplateResponseDto,
  PublishSiteResponseDto,
  SaveSchemaResponseDto,
  SelectTemplateResponseDto,
  SiteSchemaResponseDto,
  UploadedAssetResponseDto,
} from './dto/sites.response.dto';
import {
  AssetUploadFailedException,
  NoAssetsProvidedException,
  NoTemplateAvailableException,
  SiteNotFoundException,
  SiteSchemaAlreadyExistsException,
  TemplateChangeRequiresConfirmationException,
  TemplateNotFoundException,
  TenantAccessDeniedException,
  TenantNotFoundException,
  UnsupportedAssetTypeException,
} from './sites.exceptions';
import { SupabaseStorageService } from './supabase-storage.service';

type Json = Record<string, unknown>;

/** The part of a multer file we use — avoids the ambient `Express.Multer` global. */
export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

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
interface CreatedAtRow {
  created_at: string | Date;
}
interface CurrentSiteSchemaRow {
  status: string;
  published_at: string | Date | null;
  updated_at: string | Date;
  created_at: string | Date;
}

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly storage: SupabaseStorageService,
  ) { }

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

    await this.triggerRevalidation(tenantId);

    return { published: true, publishedAt: toIso(row.published_at) };
  }

  /** First-time explicit template selection; creates the site_schemas row. */
  async selectTemplate(userSub: string, templateId: string): Promise<SelectTemplateResponseDto> {
    const tenantId = await this.resolveTenantId(userSub);
    const template = await this.requireActiveTemplate(templateId);

    const rows = await this.query<CreatedAtRow>(
      sql`INSERT INTO public.site_schemas (tenant_id, template_id, grapesjs_json, status)
          SELECT ${tenantId}::uuid, ${template.id}, ${JSON.stringify(template.grapesjs_json)}::jsonb, 'draft'
          WHERE NOT EXISTS (
            SELECT 1 FROM public.site_schemas WHERE tenant_id = ${tenantId}::uuid
          )
          RETURNING created_at`,
    );
    const row = rows[0];
    if (!row) throw new SiteSchemaAlreadyExistsException();

    return { tenantId, templateId: template.id, createdAt: toIso(row.created_at) };
  }

  /** Switches an existing site to a different template, resetting publish state. */
  async changeTemplate(
    tenantId: string,
    userSub: string,
    templateId: string,
    confirm: boolean,
  ): Promise<ChangeTemplateResponseDto> {
    await this.assertTenantOwnership(tenantId, userSub);

    const currentRows = await this.query<CurrentSiteSchemaRow>(
      sql`SELECT status, published_at, updated_at, created_at
          FROM public.site_schemas
          WHERE tenant_id = ${tenantId}::uuid
          LIMIT 1`,
    );
    const current = currentRows[0];
    if (!current) throw new SiteNotFoundException();

    const hasContent =
      current.status === 'published' ||
      current.published_at !== null ||
      toIso(current.updated_at) !== toIso(current.created_at);
    if (hasContent && !confirm) throw new TemplateChangeRequiresConfirmationException();

    const template = await this.requireActiveTemplate(templateId);

    const rows = await this.query<UpdatedAtRow>(
      sql`UPDATE public.site_schemas
          SET template_id = ${template.id},
              grapesjs_json = ${JSON.stringify(template.grapesjs_json)}::jsonb,
              exported_html = NULL,
              status = 'draft',
              published_at = NULL
          WHERE tenant_id = ${tenantId}::uuid
          RETURNING updated_at`,
    );
    const row = rows[0];
    if (!row) throw new SiteNotFoundException();

    return { tenantId, templateId: template.id, updatedAt: toIso(row.updated_at) };
  }

  /**
   * Stores editor assets in the public bucket and returns their CDN URLs, which
   * is what GrapesJS writes into the exported HTML — blob:/data: sources from
   * the editor session would 404 on the published site.
   */
  async uploadAssets(
    tenantId: string,
    userSub: string,
    files: UploadedFile[],
  ): Promise<UploadedAssetResponseDto[]> {
    await this.assertTenantOwnership(tenantId, userSub);
    if (!files?.length) throw new NoAssetsProvidedException();

    const assets: UploadedAssetResponseDto[] = [];

    for (const file of files) {
      if (!file.mimetype.startsWith('image/')) {
        throw new UnsupportedAssetTypeException(file.mimetype);
      }

      const assetId = randomUUID();
      // Path is derived server-side: a tenant can never write outside its prefix.
      const storagePath = `tenant-assets/${tenantId}/${assetId}${safeExtension(file.originalname)}`;

      try {
        const src = await this.storage.uploadPublic(
          storagePath,
          file.buffer,
          file.mimetype,
        );
        assets.push({
          id: assetId,
          src,
          name: file.originalname,
          mimeType: file.mimetype,
        });
      } catch (error) {
        this.logger.error(
          `[assets] Upload failed for ${file.originalname}: ${error instanceof Error ? error.message : String(error)
          }`,
        );
        throw new AssetUploadFailedException(file.originalname);
      }
    }

    return assets;
  }

  /**
   * Pings tenant-sites after publish. tenant-sites now reads from Supabase on
   * every request, so /api/revalidate is a no-op kept for backward
   * compatibility — the publish is live within seconds either way. Skipped when
   * the tenant has no domain, or the tenant-sites app isn't configured.
   */
  private async triggerRevalidation(tenantId: string): Promise<void> {
    const rows = await this.query<{ domain: string | null }>(
      sql`SELECT domain FROM public.tenants WHERE id = ${tenantId}::uuid LIMIT 1`,
    );
    const domain = rows[0]?.domain;
    if (!domain) return;

    const baseUrl = process.env.TENANT_SITES_URL;
    const secret = process.env.REVALIDATION_SECRET;
    if (!baseUrl || !secret) return;

    try {
      const response = await fetch(`${baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ tenantHostname: domain }),
        signal: AbortSignal.timeout(10_000),
        redirect: 'error',
      });
      console.log(`Revalidation response for ${domain}: ${response.status}`);
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.warn(
          `[revalidate] ${response.status} for ${domain}. ` +
          `Check TENANT_SITES_URL (no trailing slash) and ` +
          `REVALIDATION_SECRET in Vercel env vars. Body: ${body}`,
        );
        return;
      }
      this.logger.log(`[revalidate] Success for ${domain}`);
    } catch (error) {
      this.logger.warn(
        `[revalidate] Failed for ${domain}: ${error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async resolveTenantId(userSub: string): Promise<string> {
    const rows = await this.query<{ id: string }>(
      sql`SELECT id FROM public.tenants WHERE user_id = ${userSub}::uuid LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new TenantNotFoundException();
    return row.id;
  }

  private async requireActiveTemplate(templateId: string): Promise<TemplateRow> {
    const rows = await this.query<TemplateRow>(
      sql`SELECT id, grapesjs_json FROM public.templates
          WHERE id = ${templateId} AND is_active = true
          LIMIT 1`,
    );
    const template = rows[0];
    if (!template) throw new TemplateNotFoundException();
    return template;
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

/** Keeps only a plain alphanumeric extension so the filename can't shape the storage path. */
function safeExtension(filename: string): string {
  const ext = extname(filename).slice(1).toLowerCase();
  return /^[a-z0-9]{1,10}$/.test(ext) ? `.${ext}` : '.bin';
}

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
