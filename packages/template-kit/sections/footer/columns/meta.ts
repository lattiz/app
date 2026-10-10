import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'footer',
  variant: 'columns',
  label: 'Pie de página',
  region: 'footer',
  description:
    'Cuatro columnas sin wordmark: marca + redes, sucursales, anclas y contacto (WhatsApp, teléfono, correo); barra legal abajo.',
  contentKeys: [
    'about',
    'branchesTitle',
    'branches[].name',
    'branches[].address',
    'branches[].hours',
    'linksTitle',
    'links[].label',
    'links[].href',
    'contactTitle',
  ],
} satisfies SectionMeta;
