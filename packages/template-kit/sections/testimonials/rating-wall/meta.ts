import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'testimonials',
  variant: 'rating-wall',
  label: 'Reseñas',
  region: 'main',
  description:
    'Calificación grande con estrellas marcadas como ejemplo, el resumen y los botones «ver todas» y «dejar reseña» a la izquierda; las reseñas como citas en dos columnas a la derecha, sin tarjetas ni estrellas por reseña.',
  intent:
    'Prueba social sin inflar: una sola calificación, marcada «de ejemplo» hasta que el negocio ponga la suya, y citas reales con nombre; para clínicas, despachos y cualquier giro de confianza.',
  tiers: ['pro'],
  archetypes: ['trust', 'booking', 'minimal'],
  contentKeys: [
    'score',
    'scoreNote',
    'summary',
    'allReviewsCta',
    'writeReviewCta?',
    'reviews[].text',
    'reviews[].author',
  ],
  sample: {
    scoreNote: 'Calificación de ejemplo',
  },
} satisfies SectionMeta;
