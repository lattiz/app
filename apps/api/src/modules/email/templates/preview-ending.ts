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

function formatEnds(endsAt: string): string {
  const d = new Date(endsAt);
  if (Number.isNaN(d.getTime())) return endsAt;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Mexico_City',
  });
}

export function renderPreviewEnding(data: {
  endsAt: string;
  siteName: string;
}): RenderedEmail {
  const rawName = data.siteName.trim() || 'tu sitio';
  const siteName = escapeHtml(rawName);
  const when = formatEnds(data.endsAt);
  const whenHtml = escapeHtml(when);
  const subject = 'Tu sitio de prueba en Lattiz termina pronto';
  const bodyHtml = [
    heading('Tu prueba termina pronto'),
    paragraph(
      `El sitio <strong style="color:#0f172a;">${siteName}</strong> deja de estar en línea el <strong style="color:#0f172a;">${whenHtml}</strong>.`,
    ),
    highlightBox(
      `${smallCapsLabel('Al vencer')}${paragraph('Tu sitio deja de verse. Tu borrador se conserva y puedes publicarlo de nuevo cuando elijas un plan.')}`,
    ),
    button(DASHBOARD_URLS.subscription, 'Elegir un plan'),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: `${siteName} deja de verse el ${whenHtml}. Tu borrador se conserva.`,
      bodyHtml,
    }),
    text: [
      subject,
      '',
      `El sitio ${rawName} deja de estar en línea el ${when}.`,
      'Cuando venza, tu sitio deja de verse. Tu borrador se conserva.',
      `Elige un plan: ${DASHBOARD_URLS.subscription}`,
    ].join('\n'),
  };
}
