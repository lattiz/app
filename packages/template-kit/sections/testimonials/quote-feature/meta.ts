import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'testimonials',
  variant: 'quote-feature',
  label: 'Reseñas',
  region: 'main',
  description:
    'La primera reseña como cita destacada en tipografía display; las demás en dos columnas; calificación de Google y botones "ver todas" / "dejar reseña" al pie.',
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
