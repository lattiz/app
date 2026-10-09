import { injectAnalytics } from './analytics-snippet';

/** Header kept for every paid site, preview or custom domain. */
export const PAID_CONTENT_SECURITY_POLICY = 'frame-ancestors *';

export const FREE_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  'img-src https: data:',
  "style-src 'unsafe-inline' https:",
  'font-src https: data:',
  "script-src 'none'",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  'frame-ancestors *',
].join('; ');

// s-maxage=0 keeps the CDN from masking a publish; the browser holds the page for 5s at most.
export const PUBLISHED_CACHE_CONTROL =
  'public, max-age=5, stale-while-revalidate=10, s-maxage=0';

const BANNER_STYLE = [
  '#lz-preview-banner{position:fixed;z-index:2147483647;left:0;right:0;bottom:0;',
  'display:flex;flex-wrap:wrap;align-items:center;justify-content:center;',
  'gap:.35rem .75rem;margin:0;padding:.55rem 1rem;box-sizing:border-box;',
  'background:#111827;color:#f9fafb;',
  'font:13px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center}',
  '#lz-preview-banner a{color:#fff;font-weight:600;text-underline-offset:2px}',
  '#lz-preview-banner a:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}',
  '@media (max-width:480px){#lz-preview-banner{font-size:12px;padding:.5rem .75rem}}',
].join('');

export function contentSecurityPolicy(input: {
  isPaid: boolean;
  hardenEnabled: boolean;
}): string {
  if (!input.isPaid && input.hardenEnabled) return FREE_CONTENT_SECURITY_POLICY;
  return PAID_CONTENT_SECURITY_POLICY;
}

/** Headers route.ts attaches to a 200 published document. Paid sites keep the historical set. */
export function publishedSiteHeaders(input: {
  isPaid: boolean;
  isPreview: boolean;
  hardenEnabled: boolean;
}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': contentSecurityPolicy(input),
    'Cache-Control': PUBLISHED_CACHE_CONTROL,
  };
  if (input.isPreview || !input.isPaid) headers['X-Robots-Tag'] = 'noindex';
  return headers;
}

export function composePublishedHtml(input: {
  seoHtml: string;
  isPaid: boolean;
  analyticsMeasurementId: string | null;
  hardenEnabled: boolean;
  upgradeUrl: string;
  abuseReportUrl: string;
}): string {
  const withAnalytics =
    input.isPaid && input.analyticsMeasurementId
      ? injectAnalytics(input.seoHtml, input.analyticsMeasurementId)
      : input.seoHtml;
  if (input.isPaid || !input.hardenEnabled) return withAnalytics;
  return injectFreeSiteBanner(
    withAnalytics,
    input.upgradeUrl,
    input.abuseReportUrl,
  );
}

export function injectFreeSiteBanner(
  html: string,
  upgradeUrl: string,
  abuseReportUrl: string,
): string {
  const banner =
    `<style>${BANNER_STYLE}</style>` +
    '<div id="lz-preview-banner" role="region" aria-label="Sitio de prueba">' +
    'Sitio de prueba creado con Lattiz · ' +
    `<a href="${escapeHtml(upgradeUrl)}">Obtén tu dominio</a>` +
    ' · ' +
    `<a href="${escapeHtml(abuseReportUrl)}">Reportar abuso</a>` +
    '</div>';
  const bodyClose = html.toLowerCase().lastIndexOf('</body>');
  if (bodyClose === -1) return html + banner;
  return html.slice(0, bodyClose) + banner + html.slice(bodyClose);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
