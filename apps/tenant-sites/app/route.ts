import type { NextRequest } from 'next/server';
import { composePublishedHtml, publishedSiteHeaders } from '@/lib/free-site';
import { loadPreviewConfig } from '@/lib/preview-config';
import {
  expiredResponse,
  notFoundResponse,
  unavailableResponse,
} from '@/lib/status-pages';
import { normalizeHostname, originFor } from '@/lib/tenant-host';
import { resolveTenantSite } from '@/lib/tenant-data';

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface SeoMeta {
  title: string;
  description: string;
  ogSiteName: string | null;
  canonicalUrl: string;
  /** The preview address is a staging copy: crawlers must not index it. */
  noindex: boolean;
  ogImageUrl: string;
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
}

// Tenant favicons are per-scheme. Browsers that ignore `media` on <link
// rel="icon"> need an unconditional icon last, so one is always emitted.
function buildFaviconTags(meta: {
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
}): string[] {
  const { faviconLightUrl, faviconDarkUrl } = meta;
  if (!faviconLightUrl && !faviconDarkUrl) {
    return [
      `<link rel="icon" href="/favicon.png" sizes="any">`,
      `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    ];
  }

  const tags: string[] = [];
  if (faviconLightUrl) {
    tags.push(
      `<link rel="icon" href="${esc(faviconLightUrl)}" media="(prefers-color-scheme: light)">`,
    );
  }
  if (faviconDarkUrl) {
    tags.push(
      `<link rel="icon" href="${esc(faviconDarkUrl)}" media="(prefers-color-scheme: dark)">`,
    );
  }

  const fallback = esc(faviconLightUrl ?? faviconDarkUrl ?? '');
  tags.push(`<link rel="icon" href="${fallback}">`);
  tags.push(`<link rel="apple-touch-icon" href="${fallback}">`);
  return tags;
}

// Inject SEO tags into GrapesJS's exported <head>. If the document has no
// </head> (malformed), replace() leaves it untouched — no crash, no title.
function injectSeo(html: string, meta: SeoMeta): string {
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<link rel="canonical" href="${meta.canonicalUrl}">`,
    `<meta name="robots" content="${meta.noindex ? 'noindex, nofollow' : 'index, follow'}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${meta.canonicalUrl}">`,
    `<meta property="og:site_name" content="${esc(meta.ogSiteName || meta.title)}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:image" content="${esc(meta.ogImageUrl)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:image" content="${esc(meta.ogImageUrl)}">`,
    ...buildFaviconTags(meta),
  ].join('\n  ');

  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/i, '')
    .replace('</head>', `  ${tags}\n</head>`);
}

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

  const seoHtml = injectSeo(site.exportedHtml, {
    title: site.seoTitle || site.tenantName,
    description: site.seoDescription || `Sitio web de ${site.tenantName}`,
    ogSiteName: site.ogSiteName,
    canonicalUrl: canonicalOrigin,
    noindex: isPreview || !site.isPaid,
    ogImageUrl,
    faviconLightUrl: site.faviconLightUrl,
    faviconDarkUrl: site.faviconDarkUrl,
  });
  const preview = loadPreviewConfig();
  const html = composePublishedHtml({
    seoHtml,
    isPaid: site.isPaid,
    analyticsMeasurementId: site.analyticsMeasurementId,
    hardenEnabled: preview.hardenEnabled,
    upgradeUrl: preview.upgradeUrl,
    abuseReportUrl: preview.abuseReportUrl,
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
