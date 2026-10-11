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

/** Same address the account-deleted template already uses. */
const CONTACT_EMAIL = 'hola@lattiz.app';

export interface RenewalEmailData {
  domain: string;
  expiresAt: string;
  lateDeadlineAt: string | null;
  daysLeft: number;
  baseCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  subscriptionActive: boolean;
  /** Set when the site was offline because the previous expiry had passed. */
  siteWasOffline?: boolean;
}

function formatExpires(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return expiresAt;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Mexico_City',
  });
}

function formatMoney(cents: number, currency: string): string {
  const code = currency.trim().toUpperCase() || 'MXN';
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: code,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${code}`;
  }
}

function remainingPhrase(days: number): string {
  if (days <= 0) return 'vence hoy';
  if (days === 1) return 'falta 1 día';
  return `faltan ${days} días`;
}

function renderMessage(input: {
  subject: string;
  preheader: string;
  bodyHtml: string;
  text: string[];
}): RenderedEmail {
  return {
    subject: input.subject,
    html: layout({
      title: escapeHtml(`Lattiz — ${input.subject}`),
      preheader: escapeHtml(input.preheader),
      bodyHtml: input.bodyHtml,
    }),
    text: input.text.join('\n'),
  };
}

function chargeBox(data: RenewalEmailData): { html: string; text: string } {
  const base = formatMoney(data.baseCents, data.currency);
  const tax = formatMoney(data.taxCents, data.currency);
  const total = formatMoney(data.totalCents, data.currency);
  return {
    html: highlightBox(
      `${smallCapsLabel('Total a pagar')}${paragraph(
        `Cuota ${escapeHtml(base)}<br/>IVA ${escapeHtml(tax)}<br/><strong style="color:#0f172a;">Total ${escapeHtml(total)}</strong>`,
      )}`,
    ),
    text: `Cuota ${base}\nIVA ${tax}\nTotal ${total}`,
  };
}

function subscriptionLine(data: RenewalEmailData): { html: string; text: string } {
  if (data.subscriptionActive) return { html: '', text: '' };
  return {
    html: paragraph(
      `Para pagar la renovación primero reactiva tu plan: <a href="${DASHBOARD_URLS.subscription}" style="color:#1447e6;text-decoration:underline;">tu suscripción</a>.`,
    ),
    text: `Para pagar la renovación primero reactiva tu plan: ${DASHBOARD_URLS.subscription}`,
  };
}

function deadlineSentence(data: RenewalEmailData): {
  html: string;
  text: string;
} {
  const when = formatExpires(data.lateDeadlineAt);
  if (!when) {
    return {
      html: 'Puedes pagarlo hasta la fecha límite que aparece en el panel.',
      text: 'Puedes pagarlo hasta la fecha límite que aparece en el panel.',
    };
  }
  const safe = escapeHtml(when);
  return {
    html: `Puedes pagarlo hasta el <strong style="color:#0f172a;">${safe}</strong> para recuperarlo todo.`,
    text: `Puedes pagarlo hasta el ${when} para recuperarlo todo.`,
  };
}

export function renderRenewalUpcoming(data: RenewalEmailData): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const when = escapeHtml(formatExpires(data.expiresAt) ?? data.expiresAt);
  const whenText = formatExpires(data.expiresAt) ?? data.expiresAt;
  const days = remainingPhrase(data.daysLeft);
  const subject =
    data.daysLeft <= 0
      ? `Tu dominio ${data.domain} vence hoy`
      : data.daysLeft === 1
        ? `Tu dominio ${data.domain} vence en 1 día`
        : `Tu dominio ${data.domain} vence en ${data.daysLeft} días`;
  const charge = chargeBox(data);
  const subscription = subscriptionLine(data);
  const late = deadlineSentence(data);
  const bodyHtml = [
    heading('Aviso de renovación'),
    paragraph(
      `El dominio <strong style="color:#0f172a;">${domain}</strong> vence el <strong style="color:#0f172a;">${when}</strong> (${days}).`,
    ),
    charge.html,
    highlightBox(
      `${smallCapsLabel('Si no pagas')}${paragraph(
        'Al vencer, el dominio y el correo asociado al dominio dejan de funcionar, y el sitio completo queda fuera de línea, también en su subdominio de Lattiz.',
      )}${paragraph(late.html)}`,
    ),
    paragraph('Esta cuota no se reembolsa.'),
    subscription.html,
    button(DASHBOARD_URLS.domain, 'Pagar renovación'),
  ]
    .filter(Boolean)
    .join('\n');

  return renderMessage({
    subject,
    preheader: `${data.domain} ${days}.`,
    bodyHtml,
    text: [
      subject,
      '',
      `El dominio ${data.domain} vence el ${whenText} (${days}).`,
      charge.text,
      'Si no pagas, al vencer el dominio y el correo asociado dejan de funcionar, y el sitio completo queda fuera de línea, también en su subdominio de Lattiz.',
      late.text,
      'Esta cuota no se reembolsa.',
      subscription.text,
      `Pagar renovación: ${DASHBOARD_URLS.domain}`,
    ].filter((line) => line !== ''),
  });
}

export function renderDomainExpired(data: RenewalEmailData): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const when = escapeHtml(formatExpires(data.expiresAt) ?? data.expiresAt);
  const whenText = formatExpires(data.expiresAt) ?? data.expiresAt;
  const subject = `Tu dominio ${data.domain} venció`;
  const charge = chargeBox(data);
  const subscription = subscriptionLine(data);
  const late = deadlineSentence(data);
  const bodyHtml = [
    heading('Dominio vencido'),
    paragraph(
      `El dominio <strong style="color:#0f172a;">${domain}</strong> venció el <strong style="color:#0f172a;">${when}</strong>.`,
    ),
    highlightBox(
      `${smallCapsLabel('Tu sitio ahora')}${paragraph(
        'Tu sitio está fuera de línea, también en su subdominio de Lattiz. El correo del dominio tampoco funciona.',
      )}${paragraph(late.html)}`,
    ),
    charge.html,
    paragraph('Esta cuota no se reembolsa.'),
    subscription.html,
    button(DASHBOARD_URLS.domain, 'Pagar renovación'),
  ]
    .filter(Boolean)
    .join('\n');

  return renderMessage({
    subject,
    preheader: `${data.domain} venció y el sitio está fuera de línea.`,
    bodyHtml,
    text: [
      subject,
      '',
      `El dominio ${data.domain} venció el ${whenText}.`,
      'Tu sitio está fuera de línea, también en su subdominio de Lattiz. El correo del dominio tampoco funciona.',
      late.text,
      charge.text,
      'Esta cuota no se reembolsa.',
      subscription.text,
      `Pagar renovación: ${DASHBOARD_URLS.domain}`,
    ].filter((line) => line !== ''),
  });
}

export function renderRenewalLastNotice(data: RenewalEmailData): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const lateWhen = formatExpires(data.lateDeadlineAt);
  const lateHtml = lateWhen
    ? `La fecha límite para pagarlo es el <strong style="color:#0f172a;">${escapeHtml(lateWhen)}</strong>.`
    : 'La fecha límite para pagarlo es la que aparece en el panel.';
  const lateText = lateWhen
    ? `La fecha límite para pagarlo es el ${lateWhen}.`
    : 'La fecha límite para pagarlo es la que aparece en el panel.';
  const subject = `Tu dominio ${data.domain} sigue fuera de línea`;
  const charge = chargeBox(data);
  const subscription = subscriptionLine(data);
  const bodyHtml = [
    heading('El dominio sigue vencido'),
    paragraph(
      `El dominio <strong style="color:#0f172a;">${domain}</strong> sigue vencido y tu sitio sigue fuera de línea, también en su subdominio de Lattiz. El correo del dominio tampoco funciona.`,
    ),
    highlightBox(
      `${smallCapsLabel('Fecha límite')}${paragraph(
        `${lateHtml} Después de esa fecha el dominio se pierde definitivamente.`,
      )}`,
    ),
    charge.html,
    paragraph('Esta cuota no se reembolsa.'),
    subscription.html,
    button(DASHBOARD_URLS.domain, 'Pagar renovación'),
  ]
    .filter(Boolean)
    .join('\n');

  return renderMessage({
    subject,
    preheader: `${data.domain} sigue fuera de línea.`,
    bodyHtml,
    text: [
      subject,
      '',
      `El dominio ${data.domain} sigue vencido y tu sitio sigue fuera de línea, también en su subdominio de Lattiz. El correo del dominio tampoco funciona.`,
      `${lateText} Después de esa fecha el dominio se pierde definitivamente.`,
      charge.text,
      'Esta cuota no se reembolsa.',
      subscription.text,
      `Pagar renovación: ${DASHBOARD_URLS.domain}`,
    ].filter((line) => line !== ''),
  });
}

export function renderDomainLost(data: RenewalEmailData): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const subject = `Se perdió el dominio ${data.domain}`;
  const bodyHtml = [
    heading('Dominio perdido'),
    paragraph(
      `El dominio <strong style="color:#0f172a;">${domain}</strong> se perdió de forma definitiva.`,
    ),
    paragraph(
      'Tu sitio vuelve a estar disponible en su subdominio de Lattiz. Tu plan sigue activo.',
    ),
    paragraph(
      `Para un dominio nuevo, escríbenos a <a href="mailto:${CONTACT_EMAIL}" style="color:#1447e6;text-decoration:underline;">${CONTACT_EMAIL}</a>. No puedes comprar otro dominio por tu cuenta.`,
    ),
  ].join('\n');

  return renderMessage({
    subject,
    preheader: `${data.domain} se perdió. Tu sitio sigue en el subdominio de Lattiz.`,
    bodyHtml,
    text: [
      subject,
      '',
      `El dominio ${data.domain} se perdió de forma definitiva.`,
      'Tu sitio vuelve a estar disponible en su subdominio de Lattiz. Tu plan sigue activo.',
      `Para un dominio nuevo, escríbenos a ${CONTACT_EMAIL}. No puedes comprar otro dominio por tu cuenta.`,
    ],
  });
}

export function renderDomainRenewed(data: RenewalEmailData): RenderedEmail {
  const domain = escapeHtml(data.domain);
  const when = escapeHtml(formatExpires(data.expiresAt) ?? data.expiresAt);
  const whenText = formatExpires(data.expiresAt) ?? data.expiresAt;
  const subject = `Renovamos el dominio ${data.domain}`;
  const backOnline = data.siteWasOffline
    ? paragraph(
        'Si tu sitio estaba fuera de línea, ya vuelve a estar en línea.',
      )
    : '';
  const bodyHtml = [
    heading('Dominio renovado'),
    paragraph(
      `Renovamos el dominio <strong style="color:#0f172a;">${domain}</strong>. La nueva fecha de vencimiento es el <strong style="color:#0f172a;">${when}</strong>.`,
    ),
    backOnline,
    button(DASHBOARD_URLS.domain, 'Ver dominio'),
  ]
    .filter(Boolean)
    .join('\n');

  return renderMessage({
    subject,
    preheader: `${data.domain} quedó renovado.`,
    bodyHtml,
    text: [
      subject,
      '',
      `Renovamos el dominio ${data.domain}. La nueva fecha de vencimiento es el ${whenText}.`,
      data.siteWasOffline
        ? 'Si tu sitio estaba fuera de línea, ya vuelve a estar en línea.'
        : '',
      `Ver dominio: ${DASHBOARD_URLS.domain}`,
    ].filter((line) => line !== ''),
  });
}
