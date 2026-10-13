import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'faq',
  variant: 'grid',
  label: 'Preguntas frecuentes',
  region: 'main',
  description:
    'Preguntas en una retícula de dos columnas: cada pregunta en su propia celda teñida (<details open> nativo, siempre abierta), con el título y la introducción arriba y un CTA opcional a WhatsApp al final.',
  intent:
    'Respuestas a la vista: todas las dudas abiertas en celdas parejas que se escanean, no un acordeón largo; para dentistas, veterinarias y gimnasios con muchas preguntas de horario y precio.',
  tiers: ['basic', 'pro'],
  archetypes: ['trust', 'booking', 'soft'],
  contentKeys: [
    'title',
    'intro?',
    'cta?',
    'items[].question',
    'items[].answer',
  ],
} satisfies SectionMeta;
