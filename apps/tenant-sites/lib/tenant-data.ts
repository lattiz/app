import { cacheLife, cacheTag } from 'next/cache';
import { supabase } from './supabase';

export interface TenantSiteData {
  tenantId: string;
  tenantName: string;
  slug: string;
  domain: string | null;
  exportedHtml: string;
  publishedAt: string | null;
}

interface SiteSchemaRow {
  exported_html: string | null;
  status: string;
  published_at: string | null;
}

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  site_schemas: SiteSchemaRow | SiteSchemaRow[] | null;
}

/**
 * Fetches and caches the published site for a hostname (Cache Components:
 * "use cache" + cacheTag + cacheLife). Invalidated on publish by the API
 * calling POST /api/revalidate with the matching `tenant-site:{hostname}` tag.
 */
export async function getTenantSiteByHostname(
  hostname: string,
): Promise<TenantSiteData | null> {
  'use cache';
  cacheTag(`tenant-site:${hostname}`);
  cacheLife('max');

  const { data, error } = await supabase
    .from('tenants')
    .select(
      `
      id,
      name,
      slug,
      domain,
      site_schemas (
        exported_html,
        status,
        published_at
      )
    `,
    )
    .eq('domain', hostname)
    .eq('status', 'active')
    .eq('site_schemas.status', 'published')
    .maybeSingle();

  if (error || !data) return null;

  const tenant = data as TenantRow;
  const schema = Array.isArray(tenant.site_schemas)
    ? tenant.site_schemas[0]
    : tenant.site_schemas;

  if (!schema?.exported_html) return null;

  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    slug: tenant.slug,
    domain: tenant.domain ?? null,
    exportedHtml: schema.exported_html,
    publishedAt: schema.published_at ?? null,
  };
}
