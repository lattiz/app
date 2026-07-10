import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../database/database.module';
import { TenantMeResponseDto, TenantSiteMetaDto } from './dto/tenants.response.dto';
import { TenantNotFoundException } from './tenants.exceptions';

interface TenantRow {
  id: string;
  slug: string;
  name: string;
  plan: string;
  status: string;
  domain: string | null;
  vercel_domain_mapped: boolean;
}

interface SiteMetaRow {
  template_id: string | null;
  status: string;
  published_at: string | Date | null;
  updated_at: string | Date;
  template_name: string | null;
}

@Injectable()
export class TenantsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /** Resolves the authenticated user's tenant (single-tenant-per-user model). */
  async getMyTenant(userSub: string): Promise<TenantMeResponseDto> {
    const rows = await this.query<TenantRow>(
      sql`SELECT id, slug, name, plan, status, domain, vercel_domain_mapped
          FROM public.tenants
          WHERE user_id = ${userSub}::uuid
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new TenantNotFoundException();

    return {
      tenantId: row.id,
      slug: row.slug,
      name: row.name,
      plan: row.plan,
      status: row.status as TenantMeResponseDto['status'],
      domain: row.domain,
      vercelDomainMapped: row.vercel_domain_mapped,
      site: await this.getSiteMeta(row.id),
    };
  }

  private async getSiteMeta(tenantId: string): Promise<TenantSiteMetaDto | null> {
    const rows = await this.query<SiteMetaRow>(
      sql`SELECT s.template_id, s.status, s.published_at, s.updated_at, t.name AS template_name
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
    };
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
