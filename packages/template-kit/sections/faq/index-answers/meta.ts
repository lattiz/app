import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-abeto-indice-01 (faq), rebuilt by hand
export default {
  slot: 'faq',
  variant: 'index-answers',
  label: 'Preguntas frecuentes',
  region: 'main',
  description:
    'Dos columnas: a la izquierda, fija al hacer scroll, la regla con el número de sección, el título, la introducción y un botón de WhatsApp; a la derecha, todas las respuestas visibles como paneles abiertos entre filetes con el número de cada pregunta en serif.',
  intent:
    'Resolver dudas con la calma de un índice: la pregunta y su respuesta siempre a la vista, numeradas, junto a un título que no se mueve; para barberías, estudios y despachos con cita previa.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'bold'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'cta?',
    'items[].question',
    'items[].answer',
  ],
  sample: {
    kicker: '06 / Preguntas frecuentes',
  },
} satisfies SectionMeta;
