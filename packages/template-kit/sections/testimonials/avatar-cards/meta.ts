import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-barra-saludable-01 (resenas), rebuilt by hand
export default {
  slot: 'testimonials',
  variant: 'avatar-cards',
  label: 'Reseñas con avatar',
  region: 'main',
  description:
    'Cabecera centrada con antetítulo y resumen de calificación (nota grande, estrellas y texto), tarjetas de reseña con estrellas, cita y firma con avatar de inicial en círculo de color, y botones a todas las reseñas y a dejar una.',
  intent:
    'Reseñas cortas y cercanas, con cara de comunidad, sobre un fondo ligeramente teñido; para negocios de barrio con clientela fiel (barras, gimnasios, nutrición, tiendas).',
  numbered: true,
  tiers: ['pro'],
  archetypes: ['catalog'],
  contentKeys: [
    'kicker',
    'score',
    'summary',
    'allReviewsCta',
    'writeReviewCta?',
    'reviews[].text',
    'reviews[].author',
    'reviews[].place?',
    'reviews[].initial?',
  ],
  sample: {
    kicker: 'Lo que dicen en el barrio',
    score: '4.9',
    summary: 'en reseñas de Google',
    allReviewsCta: 'Ver todas en Google',
    writeReviewCta: 'Dejar reseña',
    reviews: [
      {
        text: 'Paso después de entrenar y mi smoothie ya va saliendo. El de frutos rojos con vainilla es mi favorito.',
        author: 'Sofía M.',
        place: 'Vecina de Polanco',
        initial: 'S',
      },
      {
        text: 'Me gusta que digan qué lleva cada vaso y cuánta proteína trae. Cero sorpresas.',
        author: 'Rodrigo G.',
        place: 'Entrena CrossFit',
        initial: 'R',
      },
      {
        text: 'Pido por WhatsApp desde la oficina y lo recojo con mi nombre en el vaso.',
        author: 'Camila R.',
        place: 'Clienta habitual',
        initial: 'C',
      },
    ],
  },
} satisfies SectionMeta;
