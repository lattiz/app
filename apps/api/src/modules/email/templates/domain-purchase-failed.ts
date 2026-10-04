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

export function renderDomainPurchaseFailed(data: {
  domain: string;
}): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const subject = `No pudimos registrar ${data.domain}`;
  const bodyHtml = [
    heading('Compra de dominio no completada'),
    paragraph(
      `No pudimos registrar <strong style="color:#0f172a;">${domain}</strong>. No se te cobró por este intento. Elige otro dominio para continuar.`,
    ),
    highlightBox(
      `${smallCapsLabel('Siguiente paso')}${paragraph('Busca otro nombre disponible desde el panel de dominio.')}`,
    ),
    button(DASHBOARD_URLS.domain, 'Buscar otro dominio'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: 'No pudimos registrar ese dominio. Elige otro.',
      bodyHtml,
    }),
    text: [
      subject,
      '',
      `No pudimos registrar ${data.domain}. No se te cobró por este intento.`,
      `Busca otro dominio: ${DASHBOARD_URLS.domain}`,
    ].join('\n'),
  };
}
