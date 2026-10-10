import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'about',
  variant: 'stats-strip',
  label: 'Nosotros',
  region: 'main',
  description:
    'Título y resumen, y una franja a todo el ancho en color de acento con las cifras en tipografía display gigante.',
  numbered: true,
  contentKeys: [
    'kicker',
    'title',
    'summary',
    'stats[].value',
    'stats[].label',
  ],
} satisfies SectionMeta;
