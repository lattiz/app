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

function formatExpires(expiresAt: string): string {
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return expiresAt;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function renderRenewalUpcoming(data: {
  domain: string;
  expiresAt: string;
}): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const when = escapeHtml(formatExpires(data.expiresAt));
  const subject = `Tu dominio ${data.domain} se renueva pronto`;
  const bodyHtml = [
    heading('Aviso de renovación'),
    paragraph(
      `El dominio <strong style="color:#0f172a;">${domain}</strong> vence el <strong style="color:#0f172a;">${when}</strong> (faltan unos 30 días).`,
    ),
    highlightBox(
      `${smallCapsLabel('Revisa tu dominio')}${paragraph('Confirma que tu suscripción y método de pago estén al día.')}`,
    ),
    button(DASHBOARD_URLS.domain, 'Revisar dominio'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: `${data.domain} se renueva en unos 30 días.`,
      bodyHtml,
    }),
    text: [
      subject,
      '',
      `El dominio ${data.domain} vence el ${formatExpires(data.expiresAt)}.`,
      `Revisar: ${DASHBOARD_URLS.domain}`,
    ].join('\n'),
  };
}

export function renderRenewalLastNotice(data: {
  domain: string;
  expiresAt: string;
}): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const when = escapeHtml(formatExpires(data.expiresAt));
  const subject = `Último aviso: ${data.domain} vence pronto`;
  const bodyHtml = [
    heading('Último aviso de renovación'),
    paragraph(
      `Quedan unos 7 días: <strong style="color:#0f172a;">${domain}</strong> vence el <strong style="color:#0f172a;">${when}</strong>.`,
    ),
    highlightBox(
      `${smallCapsLabel('Acción recomendada')}${paragraph('Asegúrate de que tu suscripción esté activa para no perder el dominio.')}`,
    ),
    button(DASHBOARD_URLS.subscription, 'Revisar suscripción'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: `Último aviso: ${data.domain} vence en unos 7 días.`,
      bodyHtml,
    }),
    text: [
      subject,
      '',
      `Quedan unos 7 días: ${data.domain} vence el ${formatExpires(data.expiresAt)}.`,
      `Revisar suscripción: ${DASHBOARD_URLS.subscription}`,
    ].join('\n'),
  };
}

export function renderDomainRenewed(data: {
  domain: string;
  expiresAt: string;
}): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const when = escapeHtml(formatExpires(data.expiresAt));
  const subject = `Dominio renovado: ${data.domain}`;
  const bodyHtml = [
    heading('Dominio renovado'),
    paragraph(
      `Confirmamos la renovación de <strong style="color:#0f172a;">${domain}</strong>. La nueva fecha de vencimiento es <strong style="color:#0f172a;">${when}</strong>.`,
    ),
    button(DASHBOARD_URLS.domain, 'Ver dominio'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: `${data.domain} fue renovado.`,
      bodyHtml,
    }),
    text: [
      subject,
      '',
      `Confirmamos la renovación de ${data.domain}. Nueva fecha: ${formatExpires(data.expiresAt)}.`,
      `Ver: ${DASHBOARD_URLS.domain}`,
    ].join('\n'),
  };
}

export function renderDomainExpired(data: { domain: string }): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const subject = `Tu dominio ${data.domain} expiró`;
  const bodyHtml = [
    heading('Dominio expirado'),
    paragraph(
      `El dominio <strong style="color:#0f172a;">${domain}</strong> ya no está activo en Lattiz. Si quieres recuperarlo o elegir otro, abre el panel.`,
    ),
    button(DASHBOARD_URLS.domain, 'Gestionar dominio'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: `${data.domain} expiró.`,
      bodyHtml,
    }),
    text: [
      subject,
      '',
      `El dominio ${data.domain} ya no está activo en Lattiz.`,
      `Gestionar: ${DASHBOARD_URLS.domain}`,
    ].join('\n'),
  };
}
