import { escapeHtml } from './escape';
import {
  heading,
  layout,
  paragraph,
  type RenderedEmail,
} from './layout';

export interface AdminAlertEmailData {
  title: string;
  summary: string;
  details: Record<string, string | number | null>;
}

function detailsTable(
  details: Record<string, string | number | null>,
): string {
  const rows = Object.entries(details)
    .map(([label, value]) => {
      const shown = value === null ? '—' : String(value);
      return `<tr>
        <td style="padding:6px 12px 6px 0;font-size:13px;line-height:20px;color:#64748b;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:6px 0;font-size:13px;line-height:20px;color:#0f172a;vertical-align:top;">${escapeHtml(shown)}</td>
      </tr>`;
    })
    .join('\n');
  return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 8px 0;">
  <tbody>
    ${rows}
  </tbody>
</table>`;
}

export function renderAdminAlert(data: AdminAlertEmailData): RenderedEmail {
  const subject = `[Lattiz] ${data.title}`;
  const bodyHtml = [
    heading(escapeHtml(data.title)),
    paragraph(escapeHtml(data.summary)),
    detailsTable(data.details),
  ].join('\n');
  const textRows = Object.entries(data.details).map(([label, value]) => {
    const shown = value === null ? '—' : String(value);
    return `${label}: ${shown}`;
  });

  return {
    subject,
    html: layout({
      title: escapeHtml(subject),
      preheader: escapeHtml(data.summary),
      bodyHtml,
    }),
    text: [subject, '', data.summary, '', ...textRows].join('\n'),
  };
}
