import { DASHBOARD_URLS } from '../domain/email-kinds';
import { escapeHtml } from './escape';
import {
  button,
  heading,
  highlightBox,
  layout,
  paragraph,
  type RenderedEmail,
  smallCapsLabel,
} from './layout';

export function renderDomainReady(data: { domain: string }): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const url = `https://${data.domain}`;
  const safeUrl = escapeHtml(url);
  const subject = `Tu dominio ${data.domain} ya está listo`;
  const bodyHtml = [
    heading('Dominio listo'),
    paragraph(
      `El DNS de <strong style="color:#0f172a;">${domain}</strong> ya está activo. Tu sitio responde en:`,
    ),
    highlightBox(
      `${smallCapsLabel('Tu dirección')}<p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:14px;line-height:22px;color:#0f172a;margin:0;"><a href="${safeUrl}" style="color:#1447e6;text-decoration:underline;">${safeUrl}</a></p>`,
    ),
    button(DASHBOARD_URLS.domain, 'Ver estado del dominio'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: `${data.domain} ya está activo.`,
      bodyHtml,
    }),
    text: [
      subject,
      '',
      `El DNS de ${data.domain} ya está activo.`,
      `Visita: ${url}`,
      `Panel: ${DASHBOARD_URLS.domain}`,
    ].join('\n'),
  };
}
