import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-caramelo-pop-bandas-01 (testimonios), rebuilt by hand
export default {
  slot: 'testimonials',
  variant: 'feature-stack',
  label: 'Reseñas',
  region: 'main',
  description:
    'Cabecera centrada y una reseña destacada a la izquierda (tarjeta clara, comilla grande, cita en tipografía mayor, estrellas opcionales) con las demás apiladas a la derecha en tarjetas tintadas. Cada firma lleva un círculo con iniciales y el barrio. Sin resumen de Google.',
  intent:
    'Una voz fuerte y dos de apoyo, con cara y barrio; para tiendas y negocios de regalo que quieren una cita larga como prueba social sin tablero de calificaciones.',
  numbered: true,
  tiers: ['pro'],
  archetypes: ['soft'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'reviews[].text',
    'reviews[].author',
    'reviews[].place?',
    'reviews[].initials?',
    'reviews[].stars?',
  ],
  sample: {
    kicker: 'Comunidad dulce',
    title: 'Lo que dicen los vecinos golosos',
    intro: 'La alegría de abrir una cajita, en voz de quienes ya la probaron.',
    reviews: [
      {
        text: 'Pedí una caja surtida para el cumple de mi hermano con puras gomitas de sandía y sodas de cereza. Llegó impecable y todos querían saber dónde las conseguí.',
        author: 'Mariana R.',
        place: 'Vecina de Azcapotzalco',
        initials: 'MR',
        stars: '★★★★★',
      },
      {
        text: 'Los chocolates con crema de cacahuate son adictivos. Siempre que paso por la tienda salgo con dos bolsitas.',
        author: 'Carlos T.',
        place: 'Lindavista',
        initials: 'CT',
      },
      {
        text: 'La atención por WhatsApp es rápida y te recomiendan combinaciones bien ricas para regalar.',
        author: 'Sofía M.',
        place: 'San Álvaro',
        initials: 'SM',
      },
    ],
  },
} satisfies SectionMeta;
