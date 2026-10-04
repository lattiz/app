export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface LayoutContent {
  title: string;
  preheader?: string;
  bodyHtml: string;
  securityNote?: string;
}

const LOGO_URL = 'https://lattiz.app/lattiz_completo_black.png';

/** Bulletproof table button (#1447e6, white text, radius 6). */
export function button(href: string, label: string): string {
  const safeHref = href.replace(/"/g, '&quot;');
  const safeLabel = label
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 8px 0;">
  <tbody>
    <tr>
      <td align="center" bgcolor="#1447e6" style="border-radius:6px;background-color:#1447e6;">
        <a href="${safeHref}" target="_blank"
           style="display:inline-block;padding:12px 24px;font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;font-weight:600;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:6px;">
          ${safeLabel}
        </a>
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

export function highlightBox(innerHtml: string): string {
  return `
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
       style="background-color:#f8f8ff;border:1.5px solid #1447e6;border-radius:6px;margin-bottom:28px;">
  <tbody>
    <tr>
      <td style="padding:20px 24px;">
        ${innerHtml}
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

export function smallCapsLabel(text: string): string {
  return `<p style="font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#1447e6;margin:0 0 10px 0;">${text}</p>`;
}

export function paragraph(html: string): string {
  return `<p style="font-size:14px;line-height:24px;color:#475569;margin:0 0 16px 0;">${html}</p>`;
}

export function heading(text: string): string {
  return `<h1 style="font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;font-size:20px;font-weight:700;margin:0 0 12px 0;line-height:1.3;">${text}</h1>`;
}

/** Shared Lattiz transactional layout (mirrors Supabase Auth templates, lang=es). */
export function layout(content: LayoutContent): string {
  const year = new Date().getFullYear();
  const security =
    content.securityNote ??
    'Lattiz nunca te pedirá tu contraseña, número de tarjeta de crédito ni ninguna información confidencial por correo electrónico. Si no esperabas este correo, puedes ignorarlo.';
  const preheader = content.preheader
    ? `<div style="display:none;font-size:1px;color:#f0f0f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${content.preheader}</div>`
    : '';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="es">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${content.title}</title>
    <!--[if !mso]><!-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
    <!--<![endif]-->
  </head>
  <body dir="ltr" lang="es" style="background-color:#ffffff;margin:0;padding:0;">
    ${preheader}
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td dir="ltr" lang="es" style="background-color:#ffffff;font-family:'JetBrains Mono','Courier New',monospace;color:#1a1a2e;">
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                   style="max-width:480px;margin-right:auto;margin-left:auto;background-color:#f0f0f5;">
              <tbody>
                <tr style="width:100%">
                  <td style="padding:24px 16px;">
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                           style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
                      <tbody>
                        <tr>
                          <td>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                                   style="background-color:#1447e6;padding:28px 0;">
                              <tbody>
                                <tr>
                                  <td align="center">
                                    <img alt="Lattiz" src="${LOGO_URL}" width="120" height="40"
                                         style="display:block;outline:none;border:none;text-decoration:none;" />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                                   style="padding:36px 40px 28px 40px;">
                              <tbody>
                                <tr>
                                  <td>
                                    ${content.bodyHtml}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <hr style="width:100%;border:none;border-top:1px solid #e2e8f0;margin:0;" />
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                                   style="padding:20px 40px;">
                              <tbody>
                                <tr>
                                  <td>
                                    <p style="font-size:12px;line-height:20px;color:#94a3b8;margin:0;">${security}</p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p style="font-size:11px;line-height:20px;color:#94a3b8;margin:20px 0 0 0;text-align:center;padding:0 8px;">
                      © ${year} Lattiz. Todos los derechos reservados.<br/>
                      Recibiste este correo relacionado con tu cuenta en
                      <a href="https://lattiz.app" style="color:#1447e6;text-decoration:underline;">lattiz.app</a>.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
}
