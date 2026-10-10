import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'about',
  variant: 'statement',
  label: 'Nosotros',
  region: 'main',
  description:
    'Una declaración grande a todo el ancho; debajo, retrato pequeño desplazado y los párrafos en columna angosta.',
  numbered: true,
  placeholder: { width: 1000, height: 1250 },
  contentKeys: [
    'kicker',
    'statement',
    'image',
    'imageAlt',
    'paragraphs[]',
  ],
} satisfies SectionMeta;
