import type { BusinessProfile } from './business-profile';
import { composePublishedHtml } from './free-site';
import { buildLocalBusinessJsonLd, injectJsonLd } from './json-ld';
import { injectMotion } from './lz-motion';
import type { PreviewConfig } from './preview-config';
import { bindSiteTokens, stripSiteTokens } from './site-tokens';

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

/** A failing serve-time step logs and falls back to its input: it must never break the page. */
function step(
  name: string,
  html: string,
  fn: (html: string) => string,
  fallback = html,
): string {
  try {
    return fn(html);
  } catch (error) {
    console.error(`[tenant-sites] ${name} step failed:`, error);
    return fallback;
  }
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

export interface ComposeSiteInput {
  exportedHtml: string;
  profile: BusinessProfile;
  tenantName: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogSiteName: string | null;
  canonicalOrigin: string;
  noindex: boolean;
  ogImageUrl: string;
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
  isPaid: boolean;
  isPro: boolean;
  analyticsMeasurementId: string | null;
  preview: PreviewConfig;
}

/**
 * The published document exactly as visitors get it. Shared by route.ts and
 * the template CLI's local preview so the two never drift.
 */
export function composeSiteHtml(input: ComposeSiteInput): string {
  // Order matters: tokens → SEO → JSON-LD → analytics (composePublishedHtml) → motion.
  const { profile } = input;
  const displayName = profile.name || input.tenantName;
  const tokenHtml = step(
    'tokens',
    input.exportedHtml,
    (html) => bindSiteTokens(html, profile),
    stripSiteTokens(input.exportedHtml),
  );
  const withSeo = step('seo', tokenHtml, (html) =>
    injectSeo(html, {
      title: input.seoTitle || displayName,
      description:
        input.seoDescription ||
        profile.description ||
        `Sitio web de ${displayName}`,
      ogSiteName: input.ogSiteName || displayName,
      canonicalUrl: input.canonicalOrigin,
      noindex: input.noindex,
      ogImageUrl: input.ogImageUrl,
      faviconLightUrl: input.faviconLightUrl,
      faviconDarkUrl: input.faviconDarkUrl,
    }),
  );
  const seoHtml = step('json-ld', withSeo, (html) =>
    injectJsonLd(
      html,
      buildLocalBusinessJsonLd(profile, input.canonicalOrigin),
      profile.timezone,
    ),
  );
  const composed = composePublishedHtml({
    seoHtml,
    isPaid: input.isPaid,
    analyticsMeasurementId: input.analyticsMeasurementId,
    hardenEnabled: input.preview.hardenEnabled,
    upgradeUrl: input.preview.upgradeUrl,
    abuseReportUrl: input.preview.abuseReportUrl,
  });
  // Lattiz Motion is a Pro feature; Básico serves the same HTML static and fully visible.
  return input.isPro ? step('motion', composed, injectMotion) : composed;
}
