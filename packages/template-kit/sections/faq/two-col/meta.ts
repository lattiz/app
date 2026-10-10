import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'faq',
  variant: 'two-col',
  label: 'Preguntas frecuentes',
  region: 'main',
  description:
    'Dos columnas: título, introducción y CTA a WhatsApp fijos a la izquierda; preguntas en <details open> nativos a la derecha (sin JS).',
  numbered: true,
  contentKeys: [
    'kicker',
    'title',
    'intro',
    'cta',
    'items[].question',
    'items[].answer',
  ],
} satisfies SectionMeta;
