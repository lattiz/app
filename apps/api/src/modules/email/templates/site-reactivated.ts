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

export function renderSiteReactivated(data: {
  domain?: string;
}): RenderedEmail {
  const domain = data.domain ? escapeHtml(data.domain) : null;
  const subject = 'Tu sitio en Lattiz volvió a estar activo';
  const bodyHtml = [
    heading('Sitio reactivado'),
    paragraph(
      domain
        ? `Buenas noticias: <strong style="color:#0f172a;">${domain}</strong> ya está publicado de nuevo.`
        : 'Buenas noticias: tu sitio ya está publicado de nuevo.',
    ),
    highlightBox(
      `${smallCapsLabel('Listo')}${paragraph('Puedes revisar el estado de tu dominio y tu sitio desde el panel.')}`,
    ),
    button(DASHBOARD_URLS.domain, 'Ver mi dominio'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: 'Tu sitio volvió a estar publicado.',
      bodyHtml,
    }),
    text: [
      subject,
      '',
      domain
        ? `Tu sitio ${data.domain} ya está publicado de nuevo.`
        : 'Tu sitio ya está publicado de nuevo.',
      `Ver dominio: ${DASHBOARD_URLS.domain}`,
    ].join('\n'),
  };
}
