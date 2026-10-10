import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { computeIsEntitled } from '../../common/billing/entitlement';
import { PreviewCapabilityService } from '../../common/billing/preview-capability.service';
import { previewHost } from '../../common/preview/preview-url';
import { type Database, DATABASE } from '../../database/database.module';
import { describeStorageError } from '../storage/domain/object-storage.exceptions';
import {
  OBJECT_STORAGE_PORT,
  type ObjectStoragePort,
} from '../storage/domain/object-storage.port';
import { tenantAssetsPrefix } from '../storage/domain/storage-path';
import {
  evaluateTemplateAccess,
  TEMPLATE_ACCESS_ASSUMPTIONS,
} from '../templates/template-access.policy';
import { TemplateAccessService } from '../templates/template-access.service';
import { assetMagic } from './asset-magic';
import { HTML_SANITIZER, type HtmlSanitizerPort } from './html-sanitizer.port';
import {
  ChangeTemplateResponseDto,
  PublishSiteResponseDto,
  SaveSchemaResponseDto,
  SelectTemplateResponseDto,
  SiteSchemaResponseDto,
  UploadedAssetResponseDto,
} from './dto/sites.response.dto';
import {
  AssetQuotaExceededException,
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
  tier: string;
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
interface TenantPreviewRow {
  plan: string;
  preview_started_at: string | Date | null;
  status: string | null;
  current_period_end: string | Date | null;
}

interface SqlExecutor {
  execute(query: SQL): Promise<unknown>;
}

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(OBJECT_STORAGE_PORT) private readonly storage: ObjectStoragePort,
    private readonly preview: PreviewCapabilityService,
    @Inject(HTML_SANITIZER) private readonly htmlSanitizer: HtmlSanitizerPort,
    private readonly templateAccess: TemplateAccessService,
  ) {}

  /** Returns the editor project for a tenant, seeding it from a template on first load. */
  async getEditorProject(
    tenantId: string,
    userSub: string,
  ): Promise<SiteSchemaResponseDto> {
    await this.assertTenantOwnership(tenantId, userSub);
    await this.templateAccess.assertNotLocked(tenantId);

    const existing = await this.query<ProjectRow>(
      sql`SELECT grapesjs_json FROM public.site_schemas WHERE tenant_id = ${tenantId}::uuid LIMIT 1`,
    );
    if (existing[0]) return { project: existing[0].grapesjs_json };

    // First load seeds the first template the tenant's plan includes.
    const { templatePlan } = await this.templateAccess.stateForTenant(tenantId);
    const templates = await this.query<TemplateRow>(
      sql`SELECT id, tier, grapesjs_json FROM public.templates
          WHERE is_active = true
          ORDER BY sort_order ASC, created_at ASC`,
    );
    const template = templates.find(
      (t) => evaluateTemplateAccess(templatePlan, t.tier).allowed,
    );
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
    await this.templateAccess.assertNotLocked(tenantId);

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
    await this.templateAccess.assertNotLocked(tenantId);

    const row = await this.db.transaction(async (tx) => {
      const tenant = await this.loadTenantPreview(tx, tenantId);
      const html = this.htmlToStore(tenant, exportedHtml);
      const rows = await this.queryWith<PublishedAtRow>(
        tx,
        sql`UPDATE public.site_schemas
            SET grapesjs_json = ${JSON.stringify(project)}::jsonb,
                exported_html = ${html},
                status = 'published',
                published_at = now()
            WHERE tenant_id = ${tenantId}::uuid
            RETURNING published_at`,
      );
      const published = rows[0];
      if (!published) throw new SiteNotFoundException();
      await this.sealPreviewWindow(tx, tenantId, tenant);
      return published;
    });

    await this.triggerRevalidation(tenantId);

    return { published: true, publishedAt: toIso(row.published_at) };
  }

  /** First-time explicit template selection; creates the site_schemas row. */
  async selectTemplate(
    userSub: string,
    templateId: string,
  ): Promise<SelectTemplateResponseDto> {
    const tenantId = await this.resolveTenantId(userSub);
    const template = await this.requireActiveTemplate(templateId);
    this.templateAccess.assertCanUse(
      await this.templateAccess.stateForTenant(tenantId),
      template.id,
      template.tier,
    );

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

    return {
      tenantId,
      templateId: template.id,
      createdAt: toIso(row.created_at),
    };
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
    if (hasContent && !confirm)
      throw new TemplateChangeRequiresConfirmationException();

    const template = await this.requireActiveTemplate(templateId);
    // A locked tenant may always switch: that is how they leave the lock.
    this.templateAccess.assertCanUse(
      await this.templateAccess.stateForTenant(tenantId),
      template.id,
      template.tier,
    );

    const row = await this.db.transaction((tx) =>
      this.archiveAndReplaceProject(tx, tenantId, template, 'template_switch'),
    );

    return {
      tenantId,
      templateId: template.id,
      updatedAt: toIso(row.updated_at),
    };
  }

  /**
   * Copies the tenant's current project (and published HTML) into
   * `template_archives`, then replaces it with the template's — both inside the
   * caller's transaction, so a failed replace rolls the archive back and leaves
   * the original untouched. Nothing is ever deleted.
   */
  async archiveAndReplaceProject(
    tx: SqlExecutor,
    tenantId: string,
    template: TemplateRow,
    reason: 'template_switch',
  ): Promise<UpdatedAtRow> {
    const archived = await this.queryWith<{ id: string }>(
      tx,
      sql`INSERT INTO public.template_archives
            (tenant_id, template_id, project_data, exported_html, reason)
          SELECT tenant_id, template_id, grapesjs_json, exported_html, ${reason}
          FROM public.site_schemas
          WHERE tenant_id = ${tenantId}::uuid
          FOR UPDATE
          RETURNING id`,
    );
    if (!archived[0]) throw new SiteNotFoundException();

    const project = projectForSwitch(template);
    const rows = await this.queryWith<UpdatedAtRow>(
      tx,
      sql`UPDATE public.site_schemas
          SET template_id = ${template.id},
              grapesjs_json = ${JSON.stringify(project)}::jsonb,
              exported_html = NULL,
              status = 'draft',
              published_at = NULL
          WHERE tenant_id = ${tenantId}::uuid
          RETURNING updated_at`,
    );
    const row = rows[0];
    if (!row) throw new SiteNotFoundException();
    this.logger.log(
      `[template-switch] Tenant ${tenantId} → ${template.id}; previous project archived (${archived[0].id})`,
    );
    return row;
  }

  /**
   * Stores editor assets in the public bucket and returns their public URLs, which
   * is what GrapesJS writes into the exported HTML — blob:/data: sources from
   * the editor session would 404 on the published site.
   */
  async uploadAssets(
    tenantId: string,
    userSub: string,
    files: UploadedFile[],
  ): Promise<UploadedAssetResponseDto[]> {
    await this.assertTenantOwnership(tenantId, userSub);
    await this.templateAccess.assertNotLocked(tenantId);
    if (!files?.length) throw new NoAssetsProvidedException();

    const tenant = await this.loadTenantPreview(this.db, tenantId);
    const isEntitled = tenant ? this.tenantIsEntitled(tenant) : false;
    const verifyBytes = this.preview.shouldVerifyAssetBytes(isEntitled);
    this.assertAssetTypes(files, verifyBytes);
    await this.assertAssetQuota(tenantId, files, isEntitled);

    const assets: UploadedAssetResponseDto[] = [];

    for (const file of files) {
      const assetId = randomUUID();
      const extension = verifyBytes
        ? (assetMagic.extensionFor(declaredMime(file.mimetype)) ?? '.bin')
        : safeExtension(file.originalname);
      // Path is derived server-side: a tenant can never write outside its prefix.
      const storagePath = `${tenantAssetsPrefix(tenantId)}${assetId}${extension}`;

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
          `[assets] Upload failed for ${file.originalname}: ${describeStorageError(error)}`,
        );
        throw new AssetUploadFailedException(file.originalname);
      }
    }

    return assets;
  }

  private assertAssetTypes(files: UploadedFile[], verifyBytes: boolean): void {
    if (!verifyBytes) {
      for (const file of files) {
        if (!file.mimetype.startsWith('image/')) {
          throw new UnsupportedAssetTypeException(file.mimetype);
        }
      }
      return;
    }

    const allowed = new Set(this.preview.allowedAssetMime());
    for (const file of files) {
      const mime = declaredMime(file.mimetype);
      if (!allowed.has(mime) || !assetMagic.matches(mime, file.buffer)) {
        throw new UnsupportedAssetTypeException(file.mimetype);
      }
    }
  }

  private async assertAssetQuota(
    tenantId: string,
    files: UploadedFile[],
    isEntitled: boolean,
  ): Promise<void> {
    const limit = this.preview.unpaidAssetByteLimit(isEntitled);
    if (limit === null) return;
    const incoming = files.reduce((sum, file) => sum + file.buffer.length, 0);
    const used = await this.storage.usageBytes(tenantAssetsPrefix(tenantId));
    if (used + incoming > limit) throw new AssetQuotaExceededException(limit);
  }

  /**
   * Pings tenant-sites after publish, once per host the site answers on (preview
   * address and custom domain). tenant-sites now reads from Supabase on every
   * request, so /api/revalidate is a no-op kept for backward compatibility —
   * the publish is live within seconds either way. Skipped when the
   * tenant-sites app isn't configured.
   */
  private async triggerRevalidation(tenantId: string): Promise<void> {
    const rows = await this.query<{ slug: string; domain: string | null }>(
      sql`SELECT slug, domain FROM public.tenants WHERE id = ${tenantId}::uuid LIMIT 1`,
    );
    const tenant = rows[0];
    if (!tenant) return;

    const baseUrl = process.env.TENANT_SITES_URL;
    const secret = process.env.REVALIDATION_SECRET;
    if (!baseUrl || !secret) return;

    const hosts = [previewHost(tenant.slug)];
    if (tenant.domain) hosts.push(tenant.domain);
    for (const host of hosts) {
      await this.revalidateHost(baseUrl, secret, host);
    }
  }

  private async revalidateHost(
    baseUrl: string,
    secret: string,
    host: string,
  ): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ tenantHostname: host }),
        signal: AbortSignal.timeout(10_000),
        redirect: 'error',
      });
      console.log(`Revalidation response for ${host}: ${response.status}`);
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.warn(
          `[revalidate] ${response.status} for ${host}. ` +
            `Check TENANT_SITES_URL (no trailing slash) and ` +
            `REVALIDATION_SECRET in Vercel env vars. Body: ${body}`,
        );
        return;
      }
      this.logger.log(`[revalidate] Success for ${host}`);
    } catch (error) {
      this.logger.warn(
        `[revalidate] Failed for ${host}: ${
          error instanceof Error ? error.message : String(error)
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

  private async requireActiveTemplate(
    templateId: string,
  ): Promise<TemplateRow> {
    const rows = await this.query<TemplateRow>(
      sql`SELECT id, tier, grapesjs_json FROM public.templates
          WHERE id = ${templateId} AND is_active = true
          LIMIT 1`,
    );
    const template = rows[0];
    if (!template) throw new TemplateNotFoundException();
    return template;
  }

  private async assertTenantOwnership(
    tenantId: string,
    userSub: string,
  ): Promise<void> {
    const rows = await this.query<{ ok: number }>(
      sql`SELECT 1 AS ok FROM public.tenants
          WHERE id = ${tenantId}::uuid AND user_id = ${userSub}::uuid
          LIMIT 1`,
    );
    if (!rows[0]) throw new TenantAccessDeniedException();
  }

  private htmlToStore(
    tenant: TenantPreviewRow | undefined,
    exportedHtml: string,
  ): string {
    const isEntitled = tenant ? this.tenantIsEntitled(tenant) : false;
    if (!this.preview.shouldSanitizePublishedHtml(isEntitled))
      return exportedHtml;
    return this.htmlSanitizer.sanitizeUnpaidSiteHtml(exportedHtml);
  }

  private tenantIsEntitled(tenant: TenantPreviewRow): boolean {
    return computeIsEntitled(
      tenant.status
        ? {
            status: tenant.status,
            currentPeriodEnd: tenant.current_period_end,
          }
        : null,
    );
  }

  private async loadTenantPreview(
    tx: SqlExecutor,
    tenantId: string,
  ): Promise<TenantPreviewRow | undefined> {
    const rows = await this.queryWith<TenantPreviewRow>(
      tx,
      sql`SELECT t.plan, t.preview_started_at, s.status, s.current_period_end
          FROM public.tenants t
          LEFT JOIN public.subscriptions s ON s.tenant_id = t.id
          WHERE t.id = ${tenantId}::uuid
          ORDER BY s.created_at DESC NULLS LAST
          LIMIT 1`,
    );
    return rows[0];
  }

  /**
   * Stamps the free-preview clock once, in the same transaction as the publish.
   * The `IS NULL` predicate is the race backstop: a concurrent publish cannot
   * move a stamp that is already set.
   */
  private async sealPreviewWindow(
    tx: SqlExecutor,
    tenantId: string,
    tenant: TenantPreviewRow | undefined,
  ): Promise<void> {
    if (!tenant) return;

    const isEntitled = this.tenantIsEntitled(tenant);
    if (
      !this.preview.shouldSeal({
        isEntitled,
        plan: tenant.plan,
        previewStartedAt: tenant.preview_started_at,
      })
    ) {
      return;
    }

    await tx.execute(
      sql`UPDATE public.tenants
          SET preview_started_at = now()
          WHERE id = ${tenantId}::uuid
            AND plan = 'none'
            AND preview_started_at IS NULL`,
    );
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    return this.queryWith<T>(this.db, statement);
  }

  private async queryWith<T>(
    executor: SqlExecutor,
    statement: SQL,
  ): Promise<T[]> {
    const rows = await executor.execute(statement);
    return rows as unknown as T[];
  }
}

/** A4: the new template's project as-is; the previous content is archived, not migrated. */
function projectForSwitch(template: TemplateRow): Json {
  if (TEMPLATE_ACCESS_ASSUMPTIONS.migrateContentOnSwitch) {
    throw new Error('Content migration on template switch is not implemented.');
  }
  return template.grapesjs_json;
}

function declaredMime(mimetype: string): string {
  return mimetype.split(';', 1)[0].trim().toLowerCase();
}

/** Keeps only a plain alphanumeric extension so the filename can't shape the storage path. */
function safeExtension(filename: string): string {
  const ext = extname(filename).slice(1).toLowerCase();
  return /^[a-z0-9]{1,10}$/.test(ext) ? `.${ext}` : '.bin';
}

function toIso(value: string | Date): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}
