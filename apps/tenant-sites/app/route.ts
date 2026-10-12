import type { NextRequest } from 'next/server';
import { composeSiteHtml } from '@/lib/compose-site';
import { publishedSiteHeaders } from '@/lib/free-site';
import { loadPreviewConfig } from '@/lib/preview-config';
import {
  expiredResponse,
  notFoundResponse,
  unavailableResponse,
} from '@/lib/status-pages';
import { normalizeHostname, originFor } from '@/lib/tenant-host';
import { resolveTenantSite } from '@/lib/tenant-data';

// Serve the GrapesJS document intact so the browser parses it top-to-bottom:
// the head CSS-variable init script runs before paint (no FOUC) and plugin
// DOMContentLoaded listeners fire on time. SEO is injected as raw tags because
// a Route Handler can't use generateMetadata(). proxy.ts injects the hostname.
export async function GET(request: NextRequest): Promise<Response> {
  const hostname = normalizeHostname(
    request.headers.get('x-tenant-hostname') ??
      request.headers.get('host') ??
      'localhost:3002',
  );

  const resolution = await resolveTenantSite(hostname);
  if (resolution.status === 'not_found') return notFoundResponse();
  if (resolution.status === 'unavailable') return unavailableResponse();
  if (resolution.status === 'expired')
    return expiredResponse(resolution.tenantName);
  const { site } = resolution;
  const isPreview = site.hostKind === 'preview';

  // Only a fully live custom domain: sending visitors to one still propagating would break the site.
  if (site.redirectDomain) {
    const { pathname, search } = request.nextUrl;
    return new Response(null, {
      status: 301,
      headers: {
        Location: `https://${site.redirectDomain}${pathname}${search}`,
        // Bounded so the browser cannot pin the redirect if the domain ever stops serving.
        'Cache-Control': 'public, max-age=300, s-maxage=0',
      },
    });
  }

  // The preview points search engines at the custom domain once one is set.
  const canonicalOrigin =
    isPreview && site.domain ? `https://${site.domain}` : originFor(hostname);
  // An uploaded social preview wins; otherwise the auto-generated OG image,
  // served from the host that answered (a custom domain may not be live yet).
  const ogImageUrl =
    site.socialPreviewUrl ??
    `${originFor(hostname)}/api/og?h=${encodeURIComponent(hostname)}`;

  const preview = loadPreviewConfig();
  const html = composeSiteHtml({
    exportedHtml: site.exportedHtml,
    profile: site.businessProfile,
    tenantName: site.tenantName,
    seoTitle: site.seoTitle,
    seoDescription: site.seoDescription,
    ogSiteName: site.ogSiteName,
    canonicalOrigin,
    noindex: isPreview || !site.isPaid,
    ogImageUrl,
    faviconLightUrl: site.faviconLightUrl,
    faviconDarkUrl: site.faviconDarkUrl,
    isPaid: site.isPaid,
    isPro: site.isPro,
    analyticsMeasurementId: site.analyticsMeasurementId,
    preview,
  });

  return new Response(html, {
    status: 200,
    headers: publishedSiteHeaders({
      isPaid: site.isPaid,
      isPreview,
      hardenEnabled: preview.hardenEnabled,
    }),
  });
}
