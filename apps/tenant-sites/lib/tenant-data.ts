import { supabase } from './supabase';
import {
  isUnderPreviewBase,
  parseTenantHost,
  type TenantLookup,
} from './tenant-host';

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
  /** Non-null only for a Pro tenant with a ready, well-formed GA4 Measurement ID. */
  analyticsMeasurementId: string | null;
  /** Which kind of address the request came in on. */
  hostKind: TenantLookup['kind'];
  /** Custom domain to 301 to: set only on the preview address and only once that domain is live. */
  redirectDomain: string | null;
}

export type SiteResolution =
  | { status: 'not_found' }
  | { status: 'unavailable' }
  | { status: 'ok'; site: TenantSiteData };

const MEASUREMENT_ID_RE = /^G-[A-Z0-9]{4,20}$/;

// GA4_MOCK rows live in the same DB as real ones; never ship a fake tag to a live site.
function isUsableMeasurementId(id: string): boolean {
  if (!MEASUREMENT_ID_RE.test(id)) return false;
  return !(process.env.NODE_ENV === 'production' && id.startsWith('G-MOCK'));
}

// Row of get_public_tenant_site(). Every column but tenant_id/is_serving is NULL unless is_serving.
interface PublicTenantSiteRow {
  tenant_id: string;
  is_serving: boolean;
  tenant_name: string | null;
  slug: string | null;
  domain: string | null;
  domain_live: boolean;
  exported_html: string | null;
  published_at: string | null;
  favicon_light_url: string | null;
  favicon_dark_url: string | null;
  social_preview_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_site_name: string | null;
  ga4_measurement_id: string | null;
}

/**
 * Resolves a request host to its published site straight from Supabase on
 * every call. No "use cache": tag invalidation from a raw-Response Route
 * Handler never reached Vercel's Full Route Cache, so publishes kept serving
 * stale HTML. Browser-level freshness is handled by Cache-Control in
 * app/route.ts. The anon key reaches tenants only through the
 * get_public_tenant_site() function, which also decides whether the tenant is
 * entitled to be served.
 */
export async function resolveTenantSite(
  hostname: string,
): Promise<SiteResolution> {
  const lookup = parseTenantHost(hostname);
  if (!lookup) return { status: 'not_found' };

  const { data, error } = await supabase.rpc(
    'get_public_tenant_site',
    lookup.kind === 'preview'
      ? { p_slug: lookup.slug }
      : { p_domain: lookup.domain },
  );
  if (error) {
    // Fail closed: an outage must not look like a site that exists.
    console.error(
      '[tenant-sites] get_public_tenant_site failed:',
      error.message,
    );
    return { status: 'not_found' };
  }

  const row = (data as PublicTenantSiteRow[] | null)?.[0];
  if (!row) return { status: 'not_found' };
  if (!row.is_serving) return { status: 'unavailable' };
  if (!row.exported_html || !row.tenant_name || !row.slug) {
    return { status: 'not_found' };
  }

  const measurementId =
    row.ga4_measurement_id && isUsableMeasurementId(row.ga4_measurement_id)
      ? row.ga4_measurement_id
      : null;
  // A domain under our own base would loop back here, so it is never a redirect target.
  const redirectDomain =
    lookup.kind === 'preview' &&
    row.domain_live &&
    row.domain &&
    !isUnderPreviewBase(row.domain)
      ? row.domain
      : null;

  return {
    status: 'ok',
    site: {
      tenantId: row.tenant_id,
      tenantName: row.tenant_name,
      slug: row.slug,
      domain: row.domain,
      exportedHtml: row.exported_html,
      publishedAt: row.published_at,
      faviconLightUrl: row.favicon_light_url,
      faviconDarkUrl: row.favicon_dark_url,
      socialPreviewUrl: row.social_preview_url,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      ogSiteName: row.og_site_name,
      analyticsMeasurementId: measurementId,
      hostKind: lookup.kind,
      redirectDomain,
    },
  };
}

/** The site when it is live and published, else null — for callers that need no distinction. */
export async function getTenantSiteByHostname(
  hostname: string,
): Promise<TenantSiteData | null> {
  const resolution = await resolveTenantSite(hostname);
  return resolution.status === 'ok' ? resolution.site : null;
}
