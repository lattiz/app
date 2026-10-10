import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'faq',
  variant: 'list',
  label: 'Preguntas frecuentes',
  region: 'main',
  description:
    'Lista a todo el ancho de preguntas en <details open> nativos (sin JS): abiertas para poder editarlas en el editor, el visitante puede plegarlas.',
  numbered: true,
  contentKeys: ['kicker', 'title', 'items[].question', 'items[].answer'],
} satisfies SectionMeta;
