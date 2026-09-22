import { supabase } from './supabase';

export interface TenantSiteData {
  tenantId: string;
  tenantName: string;
  slug: string;
  domain: string | null;
  exportedHtml: string;
  publishedAt: string | null;
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
  socialPreviewUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogSiteName: string | null;
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
  favicon_light_url: string | null;
  favicon_dark_url: string | null;
  social_preview_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_site_name: string | null;
  site_schemas: SiteSchemaRow | SiteSchemaRow[] | null;
}

/**
 * Fetches the published site for a hostname directly from Supabase on every
 * call. No "use cache": tag invalidation from a raw-Response Route Handler
 * never reached Vercel's Full Route Cache, so publishes kept serving stale
 * HTML. Browser-level freshness is handled by Cache-Control in app/route.ts.
 */
export async function getTenantSiteByHostname(
  hostname: string,
): Promise<TenantSiteData | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select(
      `
      id,
      name,
      slug,
      domain,
      favicon_light_url,
      favicon_dark_url,
      social_preview_url,
      seo_title,
      seo_description,
      og_site_name,
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
    faviconLightUrl: tenant.favicon_light_url ?? null,
    faviconDarkUrl: tenant.favicon_dark_url ?? null,
    socialPreviewUrl: tenant.social_preview_url ?? null,
    seoTitle: tenant.seo_title ?? null,
    seoDescription: tenant.seo_description ?? null,
    ogSiteName: tenant.og_site_name ?? null,
  };
}
