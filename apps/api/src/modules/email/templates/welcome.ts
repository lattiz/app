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

export function renderWelcome(data: { tenantName?: string }): RenderedEmail {
  const name = data.tenantName ? escapeHtml(data.tenantName) : 'tu sitio';
  const subject = '¡Bienvenido a Lattiz! Tu suscripción está activa';
  const bodyHtml = [
    heading('Tu suscripción está activa'),
    paragraph(
      `Gracias por unirte a Lattiz. ${name} ya tiene acceso a tu plan. El siguiente paso es configurar tu dominio o personalizar tu sitio.`,
    ),
    highlightBox(
      `${smallCapsLabel('Siguiente paso')}${paragraph('Abre el panel para gestionar tu suscripción y tu sitio.')}`,
    ),
    button(DASHBOARD_URLS.home, 'Ir al panel'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: 'Tu suscripción de Lattiz ya está activa.',
      bodyHtml,
    }),
    text: [
      subject,
      '',
      `Gracias por unirte a Lattiz. ${data.tenantName ?? 'Tu sitio'} ya tiene acceso a tu plan.`,
      `Abre el panel: ${DASHBOARD_URLS.home}`,
    ].join('\n'),
  };
}
