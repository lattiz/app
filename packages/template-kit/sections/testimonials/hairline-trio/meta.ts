import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-abeto-indice-01 (testimonios), rebuilt by hand
export default {
  slot: 'testimonials',
  variant: 'hairline-trio',
  label: 'Reseñas',
  region: 'main',
  description:
    'Cabecera con regla (número de sección y rótulo), título e introducción y una sola franja de citas (hasta cuatro) separadas por filetes verticales dentro de un marco: comilla grande en serif, cita en cursiva y, bajo un filete, firma con el oficio o la colonia. Sin resumen de Google; un botón opcional a WhatsApp cierra la sección.',
  intent:
    'Voces de clientela habitual en una sola línea, sin tarjetas ni estrellas, como una página de revista; para barberías, estudios y despachos cuya reputación se cuenta con citas cortas y firmadas.',
  numbered: true,
  tiers: ['pro'],
  archetypes: ['editorial', 'bold'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'cta?',
    'reviews[].text',
    'reviews[].author',
    'reviews[].place?',
  ],
  sample: {
    kicker: '05 / Testimonios',
    title: 'La estima de quienes vuelven',
    reviews: [
      {
        text: 'La pausa que necesitaba en la semana: silencio, navaja afilada y técnica impecable.',
        author: 'Rodrigo V.',
        place: 'Arquitecto · cliente desde 2021',
      },
      {
        text: 'Sin artificios ni prisas. El trato más sobrio y exacto que he encontrado.',
        author: 'Fernando M.',
        place: 'Editor · cliente desde 2022',
      },
      {
        text: 'La toalla caliente y la navaja tradicional son insuperables. Puntualidad total.',
        author: 'Carlos S.',
        place: 'Diseñador · cliente desde 2020',
      },
    ],
  },
} satisfies SectionMeta;
