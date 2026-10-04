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

export function renderSiteSuspended(data: { domain?: string }): RenderedEmail {
  const domain = data.domain ? escapeHtml(data.domain) : null;
  const subject = 'Tu sitio en Lattiz fue suspendido';
  const bodyHtml = [
    heading('Sitio suspendido'),
    paragraph(
      domain
        ? `Tu sitio <strong style="color:#0f172a;">${domain}</strong> dejó de estar publicado porque la suscripción ya no está activa.`
        : 'Tu sitio dejó de estar publicado porque la suscripción ya no está activa.',
    ),
    highlightBox(
      `${smallCapsLabel('Cómo reactivarlo')}${paragraph('Renueva o reactiva tu suscripción desde el panel. Cuando el pago esté al día, tu sitio volverá a publicarse.')}`,
    ),
    button(DASHBOARD_URLS.subscription, 'Reactivar suscripción'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader:
        'Tu sitio fue suspendido. Reactiva tu suscripción para recuperarlo.',
      bodyHtml,
    }),
    text: [
      subject,
      '',
      domain
        ? `Tu sitio ${data.domain} dejó de estar publicado porque la suscripción ya no está activa.`
        : 'Tu sitio dejó de estar publicado porque la suscripción ya no está activa.',
      `Reactiva tu suscripción: ${DASHBOARD_URLS.subscription}`,
    ].join('\n'),
  };
}
