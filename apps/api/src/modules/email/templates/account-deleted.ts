import { DASHBOARD_URLS } from '../domain/email-kinds';
import { heading, layout, paragraph, type RenderedEmail } from './layout';

export function renderAccountDeleted(): RenderedEmail {
  const subject = 'Tu cuenta de Lattiz fue eliminada';
  const bodyHtml = [
    heading('Cuenta eliminada'),
    paragraph(
      'Confirmamos que tu cuenta de Lattiz y los datos asociados fueron eliminados. Si cambias de opinión en el futuro, puedes crear una cuenta nueva cuando quieras.',
    ),
    paragraph(
      `Si no solicitaste esta eliminación, escríbenos a <a href="mailto:hola@lattiz.app" style="color:#1447e6;text-decoration:underline;">hola@lattiz.app</a>.`,
    ),
  ].join('\n');

  return {
    subject,
    html: layout({
      title: `Lattiz — ${subject}`,
      preheader: 'Confirmamos la eliminación de tu cuenta.',
      bodyHtml,
      securityNote:
        'Este mensaje confirma una acción que solicitaste en Lattiz. Si no fuiste tú, contacta a soporte de inmediato.',
    }),
    text: [
      subject,
      '',
      'Confirmamos que tu cuenta de Lattiz fue eliminada.',
      'Si no solicitaste esta eliminación, escribe a hola@lattiz.app.',
      `Inicio: ${DASHBOARD_URLS.home}`,
    ].join('\n'),
  };
}
