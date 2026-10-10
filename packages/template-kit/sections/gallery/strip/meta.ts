import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'gallery',
  variant: 'strip',
  label: 'Galería',
  region: 'main',
  description:
    'Tira horizontal desplazable (scroll-snap, sin JS) de fotos verticales 3:4 con pie de foto numerado debajo.',
  numbered: true,
  placeholder: { width: 1200, height: 1200 },
  contentKeys: [
    'kicker',
    'title',
    'items[].image',
    'items[].alt',
    'items[].caption',
  ],
} satisfies SectionMeta;
