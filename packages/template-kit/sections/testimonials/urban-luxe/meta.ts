import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'testimonials',
  variant: 'urban-luxe',
  label: 'Reseñas',
  region: 'main',
  description:
    'Resumen de calificación de Google con CTA y tres reseñas en tarjetas.',
  numbered: true,
  contentKeys: [
    'kicker',
    'score',
    'summary',
    'allReviewsCta',
    'reviews[].text',
    'reviews[].author',
  ],
} satisfies SectionMeta;
