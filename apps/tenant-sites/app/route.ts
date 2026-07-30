import type { NextRequest } from 'next/server';
import { getTenantSiteByHostname } from '@/lib/tenant-data';

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
  canonicalUrl: string;
  ogImageUrl: string;
}

// Inject SEO tags into GrapesJS's exported <head>. If the document has no
// </head> (malformed), replace() leaves it untouched — no crash, no title.
function injectSeo(html: string, meta: SeoMeta): string {
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<link rel="canonical" href="${meta.canonicalUrl}">`,
    `<meta name="robots" content="index, follow">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${meta.canonicalUrl}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:image" content="${meta.ogImageUrl}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:image" content="${meta.ogImageUrl}">`,
  ].join('\n  ');

  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/i, '')
    .replace('</head>', `  ${tags}\n</head>`);
}

const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sitio no encontrado</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      min-height: 100vh; margin: 0; color: #374151;
    }
    h1 { font-size: 4rem; font-weight: 700; margin: 0; }
    p  { font-size: 1.125rem; margin: 0.5rem 0 0; color: #6b7280; }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>Sitio no encontrado.</p>
</body>
</html>`;

// Serve the GrapesJS document intact so the browser parses it top-to-bottom:
// the head CSS-variable init script runs before paint (no FOUC) and plugin
// DOMContentLoaded listeners fire on time. SEO is injected as raw tags because
// a Route Handler can't use generateMetadata(). proxy.ts injects the hostname.
export async function GET(request: NextRequest): Promise<Response> {
  const hostname =
    request.headers.get('x-tenant-hostname') ??
    request.headers.get('host') ??
    'localhost:3002';

  const site = await getTenantSiteByHostname(hostname);

  if (!site) {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const siteUrl = site.domain ? `https://${site.domain}` : `http://${hostname}`;
  const ogImageUrl = `${siteUrl}/api/og?h=${encodeURIComponent(hostname)}`;

  const html = injectSeo(site.exportedHtml, {
    title: site.tenantName,
    description: `Sitio web de ${site.tenantName}`,
    canonicalUrl: siteUrl,
    ogImageUrl,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': 'frame-ancestors *',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
