import { TemplateAccessService } from '../templates/template-access.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { computeIsEntitled } from '../../common/billing/entitlement';
import { PreviewCapabilityService } from '../../common/billing/preview-capability.service';
import { scheduledCancellation } from '../../common/billing/scheduled-cancellation';
import { previewUrl } from '../../common/preview/preview-url';
import { type Database, DATABASE } from '../../database/database.module';
import { describeStorageError } from '../storage/domain/object-storage.exceptions';
import {
  OBJECT_STORAGE_PORT,
  type ObjectStoragePort,
} from '../storage/domain/object-storage.port';
import {
  BrandingUploadResponseDto,
  TenantBrandingDto,
} from './dto/branding.response.dto';
import type { BrandingType } from './dto/upload-branding.dto';
import type { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import {
  TenantDomainDto,
  TenantMeResponseDto,
  TenantTemplateAccessDto,
  TenantSiteMetaDto,
  TenantSubscriptionDto,
} from './dto/tenants.response.dto';
import { isCustomSlug } from './tenant-slug';
import {
  BrandingFileTooLargeException,
  BrandingUploadFailedException,
  NoBrandingFileProvidedException,
  TenantAccessDeniedException,
  TenantNotFoundException,
  UnsupportedBrandingTypeException,
} from './tenants.exceptions';

/** Per-slot upload rules. Sizes are recommendations for the UI; only the max is enforced. */
const BRANDING_RULES: Record<
  BrandingType,
  { column: string; maxBytes: number; mimeTypes: readonly string[] }
> = {
  favicon_light: {
    column: 'favicon_light_url',
    maxBytes: 1024 * 1024,
    mimeTypes: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
  },
  favicon_dark: {
    column: 'favicon_dark_url',
    maxBytes: 1024 * 1024,
    mimeTypes: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
  },
  social_preview: {
    column: 'social_preview_url',
    maxBytes: 4 * 1024 * 1024,
    mimeTypes: ['image/png', 'image/jpeg'],
  },
};

/** The part of a multer file we use — avoids the ambient `Express.Multer` global. */
export interface UploadedBrandingFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const BRANDING_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
};

interface TenantRow {
  id: string;
  slug: string;
  name: string;
  plan: string;
  status: string;
  domain: string | null;
  vercel_domain_mapped: boolean;
  preview_started_at: string | Date | null;
}

interface SiteMetaRow {
  template_id: string | null;
  status: string;
  published_at: string | Date | null;
  updated_at: string | Date;
  created_at: string | Date;
  template_name: string | null;
}

interface DomainStatusRow {
  domain: string;
  source: TenantDomainDto['source'];
  dns_status: TenantDomainDto['dnsStatus'];
  vercel_mapped: boolean;
  ssl_active: boolean;
  is_mock: boolean;
  expires_at: string | Date | null;
  suspended_at: string | Date | null;
}

interface BrandingRow {
  favicon_light_url: string | null;
  favicon_dark_url: string | null;
  social_preview_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_site_name: string | null;
}

interface SubscriptionRow {
  plan: 'basico' | 'pro';
  billing_period: 'monthly' | 'annual';
  status: string;
  current_period_end: string | Date | null;
  cancel_at_period_end: boolean;
  cancel_at: string | Date | null;
}

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(OBJECT_STORAGE_PORT) private readonly storage: ObjectStoragePort,
    private readonly preview: PreviewCapabilityService,
    private readonly templateAccess: TemplateAccessService,
  ) {}

  /** Resolves the authenticated user's tenant (single-tenant-per-user model). */
  async getMyTenant(userSub: string): Promise<TenantMeResponseDto> {
    const rows = await this.query<TenantRow>(
      sql`SELECT id, slug, name, plan, status, domain, vercel_domain_mapped,
                 preview_started_at
          FROM public.tenants
          WHERE user_id = ${userSub}::uuid
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new TenantNotFoundException();

    const subscription = await this.getSubscription(row.id);
    const isEntitled = computeIsEntitled(subscription);
    const capability = this.preview.evaluate({
      isEntitled,
      plan: row.plan,
      previewStartedAt: row.preview_started_at,
    });

    return {
      tenantId: row.id,
      slug: row.slug,
      previewUrl: previewUrl(row.slug),
      slugIsCustom: isCustomSlug(row.slug),
      name: row.name,
      plan: row.plan,
      status: row.status as TenantMeResponseDto['status'],
      domain: row.domain,
      vercelDomainMapped: row.vercel_domain_mapped,
      domainStatus: await this.getDomainStatus(row.id),
      site: await this.getSiteMeta(row.id),
      subscription,
      isEntitled,
      previewState: capability.state,
      canPublish: capability.canPublish,
      previewExpiresAt: capability.previewExpiresAt
        ? toIso(capability.previewExpiresAt)
        : null,
      branding: await this.getBranding(row.id),
      templateAccess: await this.getTemplateAccess(row.id),
    };
  }

  private async getTemplateAccess(
    tenantId: string,
  ): Promise<TenantTemplateAccessDto> {
    const state = await this.templateAccess.stateForTenant(tenantId);
    return { current: state.current, locked: state.locked };
  }

  private async getDomainStatus(
    tenantId: string,
  ): Promise<TenantDomainDto | null> {
    const rows = await this.query<DomainStatusRow>(
      sql`SELECT domain, source, dns_status, vercel_mapped, ssl_active, is_mock, expires_at,
                 suspended_at
          FROM public.domains
          WHERE tenant_id = ${tenantId}::uuid AND released_at IS NULL
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) return null;

    return {
      domain: row.domain,
      source: row.source,
      dnsStatus: row.dns_status,
      vercelMapped: row.vercel_mapped,
      sslActive: row.ssl_active,
      isMock: row.is_mock,
      expiresAt: row.expires_at ? toIso(row.expires_at) : null,
      suspended: row.suspended_at !== null,
    };
  }

  private async getSubscription(
    tenantId: string,
  ): Promise<TenantSubscriptionDto | null> {
    const rows = await this.query<SubscriptionRow>(
      sql`SELECT plan, billing_period, status, current_period_end, cancel_at_period_end, cancel_at
          FROM public.subscriptions
          WHERE tenant_id = ${tenantId}::uuid
          ORDER BY created_at DESC
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) return null;

    const scheduled = scheduledCancellation(row);
    return {
      plan: row.plan,
      status: row.status,
      billingPeriod: row.billing_period,
      currentPeriodEnd: row.current_period_end
        ? toIso(row.current_period_end)
        : null,
      cancelAt: scheduled.cancelAt,
      cancelAtPeriodEnd: scheduled.cancelAtPeriodEnd,
    };
  }

  private async getSiteMeta(
    tenantId: string,
  ): Promise<TenantSiteMetaDto | null> {
    const rows = await this.query<SiteMetaRow>(
      sql`SELECT s.template_id, s.status, s.published_at, s.updated_at, s.created_at, t.name AS template_name
          FROM public.site_schemas s
          LEFT JOIN public.templates t ON t.id = s.template_id
          WHERE s.tenant_id = ${tenantId}::uuid
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) return null;

    return {
      templateId: row.template_id,
      templateName: row.template_name,
      siteStatus: row.status as TenantSiteMetaDto['siteStatus'],
      lastPublishedAt: row.published_at ? toIso(row.published_at) : null,
      updatedAt: toIso(row.updated_at),
      createdAt: toIso(row.created_at),
    };
  }

  /** Stores one branding image and points the matching `tenants` column at it. */
  async uploadBranding(
    tenantId: string,
    userSub: string,
    type: BrandingType,
    file?: UploadedBrandingFile,
  ): Promise<BrandingUploadResponseDto> {
    await this.assertTenantOwnership(tenantId, userSub);
    if (!file?.buffer?.length) throw new NoBrandingFileProvidedException();

    const rule = BRANDING_RULES[type];
    if (!rule.mimeTypes.includes(file.mimetype)) {
      throw new UnsupportedBrandingTypeException(file.mimetype, rule.mimeTypes);
    }
    if (file.size > rule.maxBytes) {
      throw new BrandingFileTooLargeException(rule.maxBytes);
    }

    // Unique key per upload (immutable at the CDN, so no cache-busting); the old object is deleted below.
    const storagePath = `${brandingPrefix(tenantId)}${type}-${randomUUID()}.${BRANDING_EXTENSIONS[file.mimetype]}`;
    const previousUrl =
      (await this.getBrandingColumn(tenantId, rule.column)) ?? null;

    let url: string;
    try {
      url = await this.storage.uploadPublic(
        storagePath,
        file.buffer,
        file.mimetype,
      );
    } catch (error) {
      this.logger.error(
        `[branding] Upload failed for ${tenantId}/${type}: ${describeStorageError(error)}`,
      );
      throw new BrandingUploadFailedException();
    }

    try {
      await this.db.execute(
        sql`UPDATE public.tenants
            SET ${sql.raw(rule.column)} = ${url}
            WHERE id = ${tenantId}::uuid`,
      );
    } catch (error) {
      await this.removeQuietly(storagePath);
      throw error;
    }

    const previousPath = this.ownedPath(tenantId, previousUrl);
    if (previousPath) await this.removeQuietly(previousPath);

    return { url };
  }

  /** Clears one branding slot and deletes the stored object. */
  async removeBranding(
    tenantId: string,
    userSub: string,
    type: BrandingType,
  ): Promise<TenantBrandingDto> {
    await this.assertTenantOwnership(tenantId, userSub);

    const rule = BRANDING_RULES[type];
    const previousUrl = await this.getBrandingColumn(tenantId, rule.column);

    await this.db.execute(
      sql`UPDATE public.tenants
          SET ${sql.raw(rule.column)} = NULL
          WHERE id = ${tenantId}::uuid`,
    );

    const previousPath = this.ownedPath(tenantId, previousUrl);
    if (previousPath) await this.removeQuietly(previousPath);

    return this.getBranding(tenantId);
  }

  private async getBranding(tenantId: string): Promise<TenantBrandingDto> {
    const rows = await this.query<BrandingRow>(
      sql`SELECT favicon_light_url, favicon_dark_url, social_preview_url,
                 seo_title, seo_description, og_site_name
          FROM public.tenants
          WHERE id = ${tenantId}::uuid
          LIMIT 1`,
    );
    const row = rows[0];

    return {
      faviconLightUrl: row?.favicon_light_url ?? null,
      faviconDarkUrl: row?.favicon_dark_url ?? null,
      socialPreviewUrl: row?.social_preview_url ?? null,
      seoTitle: row?.seo_title ?? null,
      seoDescription: row?.seo_description ?? null,
      ogSiteName: row?.og_site_name ?? null,
    };
  }

  /** Updates only the provided SEO fields; a blank value is stored as NULL. */
  async updateSiteSettings(
    tenantId: string,
    userSub: string,
    dto: UpdateSiteSettingsDto,
  ): Promise<TenantBrandingDto> {
    await this.assertTenantOwnership(tenantId, userSub);

    const fields: Array<[string, string | undefined]> = [
      ['seo_title', dto.title],
      ['seo_description', dto.description],
      ['og_site_name', dto.ogSiteName],
    ];
    const assignments = fields
      .filter(([, value]) => value !== undefined)
      .map(
        ([column, value]) => sql`${sql.raw(column)} = ${value?.trim() || null}`,
      );

    if (assignments.length > 0) {
      await this.db.execute(
        sql`UPDATE public.tenants
            SET ${sql.join(assignments, sql`, `)}
            WHERE id = ${tenantId}::uuid`,
      );
    }

    return this.getBranding(tenantId);
  }

  private async getBrandingColumn(
    tenantId: string,
    column: string,
  ): Promise<string | null> {
    const rows = await this.query<Record<string, string | null>>(
      sql`SELECT ${sql.raw(column)} FROM public.tenants WHERE id = ${tenantId}::uuid LIMIT 1`,
    );
    return rows[0]?.[column] ?? null;
  }

  /** Only objects under this tenant's own branding prefix are ever deleted, whatever the stored URL says. */
  private ownedPath(tenantId: string, url: string | null): string | null {
    const path = this.storage.pathFromPublicUrl(url);
    return path?.startsWith(brandingPrefix(tenantId)) ? path : null;
  }

  /** A stale object left behind must not fail an otherwise successful request. */
  private async removeQuietly(path: string): Promise<void> {
    try {
      await this.storage.removePublic(path);
    } catch (error) {
      this.logger.warn(
        `[branding] Could not delete ${path}: ${describeStorageError(error)}`,
      );
    }
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

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function toIso(value: string | Date): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function brandingPrefix(tenantId: string): string {
  return `tenant-branding/${tenantId}/`;
}
