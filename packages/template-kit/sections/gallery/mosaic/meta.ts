import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'gallery',
  variant: 'mosaic',
  label: 'Galería',
  region: 'main',
  description:
    'Mosaico en columnas (CSS columns, sin JS) con fotos de proporciones alternas, borde del tema y pie numerado en tipografía mono.',
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
