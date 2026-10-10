import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'testimonials',
  variant: 'cards',
  label: 'Reseñas',
  region: 'main',
  description:
    'Resumen de calificación de Google con "ver todas" y "dejar reseña" (opcional, writeReviewCta) y tres reseñas en tarjetas.',
  numbered: true,
  contentKeys: [
    'kicker',
    'score',
    'summary',
    'allReviewsCta',
    'writeReviewCta?',
    'reviews[].text',
    'reviews[].author',
  ],
} satisfies SectionMeta;
