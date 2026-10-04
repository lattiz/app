import { DASHBOARD_URLS } from '../domain/email-kinds';
import {
  button,
  heading,
  highlightBox,
  layout,
  paragraph,
  type RenderedEmail,
  smallCapsLabel,
} from './layout';

export function renderPaymentFailed(data: {
  attempt: number;
  maxAttempts: number;
}): RenderedEmail {
  const attempt = Math.max(1, Math.floor(data.attempt));
  const max = Math.max(attempt, Math.floor(data.maxAttempts));
  const subject = `No pudimos cobrar tu suscripción (intento ${attempt} de ${max})`;
  const bodyHtml = [
    heading('Problema con el pago'),
    paragraph(
      `No pudimos procesar el cobro de tu suscripción. Este es el intento ${attempt} de ${max}. Actualiza tu método de pago para evitar que tu sitio se suspenda.`,
    ),
    highlightBox(
      `${smallCapsLabel('Acción requerida')}${paragraph('Abre el portal de facturación y actualiza tu tarjeta.')}`,
    ),
    button(DASHBOARD_URLS.subscription, 'Actualizar método de pago'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: 'Actualiza tu método de pago para mantener tu sitio activo.',
      bodyHtml,
    }),
    text: [
      subject,
      '',
      `No pudimos procesar el cobro (intento ${attempt} de ${max}).`,
      `Actualiza tu método de pago: ${DASHBOARD_URLS.subscription}`,
    ].join('\n'),
  };
}
