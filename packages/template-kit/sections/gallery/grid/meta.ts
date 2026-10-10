import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'gallery',
  variant: 'grid',
  label: 'Galería',
  region: 'main',
  description:
    'Mosaico CSS de 8 fotos (la primera grande) con pie de foto sobre un velo del color overlay; sin JS.',
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
