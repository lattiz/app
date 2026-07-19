import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../database/database.module';
import {
  TenantDomainDto,
  TenantMeResponseDto,
  TenantSiteMetaDto,
  TenantSubscriptionDto,
} from './dto/tenants.response.dto';
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

interface DomainStatusRow {
  domain: string;
  source: TenantDomainDto['source'];
  dns_status: TenantDomainDto['dnsStatus'];
  vercel_mapped: boolean;
  ssl_active: boolean;
  is_mock: boolean;
  expires_at: string | Date | null;
}

interface SubscriptionRow {
  plan: 'basico' | 'pro';
  billing_period: 'monthly' | 'annual';
  status: string;
  current_period_end: string | Date | null;
  cancel_at_period_end: boolean;
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
      domainStatus: await this.getDomainStatus(row.id),
      site: await this.getSiteMeta(row.id),
      subscription: await this.getSubscription(row.id),
    };
  }

  private async getDomainStatus(
    tenantId: string,
  ): Promise<TenantDomainDto | null> {
    const rows = await this.query<DomainStatusRow>(
      sql`SELECT domain, source, dns_status, vercel_mapped, ssl_active, is_mock, expires_at
          FROM public.domains
          WHERE tenant_id = ${tenantId}::uuid
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
    };
  }

  private async getSubscription(
    tenantId: string,
  ): Promise<TenantSubscriptionDto | null> {
    const rows = await this.query<SubscriptionRow>(
      sql`SELECT plan, billing_period, status, current_period_end, cancel_at_period_end
          FROM public.subscriptions
          WHERE tenant_id = ${tenantId}::uuid
          ORDER BY created_at DESC
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) return null;

    return {
      plan: row.plan,
      status: row.status,
      billingPeriod: row.billing_period,
      currentPeriodEnd: row.current_period_end
        ? toIso(row.current_period_end)
        : null,
      cancelAtPeriodEnd: row.cancel_at_period_end,
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
