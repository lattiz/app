import { loadPreviewConfig } from './preview-config';

const PAGE_STYLE = `
    body {
      font-family: system-ui, sans-serif;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      min-height: 100vh; margin: 0; padding: 0 1.5rem; text-align: center; color: #374151;
    }
    h1 { font-size: 2.5rem; font-weight: 700; margin: 0; }
    p  { font-size: 1.125rem; margin: 0.5rem 0 0; color: #6b7280; }
    a.cta {
      display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.25rem;
      background: #111827; color: #fff; text-decoration: none; border-radius: 0.5rem;
      font-size: 1rem; font-weight: 600;
    }
    a.cta:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }`;

function page(
  title: string,
  heading: string,
  message: string,
  extra = '',
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${title}</title>
  <style>${PAGE_STYLE}
  </style>
</head>
<body>
  <h1>${heading}</h1>
  <p>${message}</p>
  ${extra}
</body>
</html>`;
}

const NOT_FOUND_HTML = page(
  'Sitio no encontrado',
  '404',
  'Sitio no encontrado.',
);

// Deliberately says nothing about why: the same page serves any tenant that is not live.
const UNAVAILABLE_HTML = page(
  'Sitio no disponible',
  'Sitio no disponible',
  'Este sitio no está disponible en este momento. Vuelve a intentarlo más tarde.',
);

// Both are 404, not 410: the unavailable state is recoverable and a different status would tell
// a visitor apart from "no such site". noindex keeps crawlers from keeping either page.
function statusResponse(html: string): Response {
  return new Response(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'no-store',
    },
  });
}

export function notFoundResponse(): Response {
  return statusResponse(NOT_FOUND_HTML);
}

export function unavailableResponse(): Response {
  return statusResponse(UNAVAILABLE_HTML);
}

export function expiredResponse(
  tenantName: string,
  upgradeUrl: string = loadPreviewConfig().upgradeUrl,
): Response {
  const name = escapeHtml(tenantName);
  const href = escapeHtml(upgradeUrl);
  return statusResponse(
    page(
      'Prueba gratuita terminada',
      'Prueba terminada',
      `La prueba gratuita de ${name} terminó`,
      `<a class="cta" href="${href}">Obtén tu dominio</a>`,
    ),
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
