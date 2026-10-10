import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'about',
  variant: 'brief',
  label: 'Nosotros',
  region: 'main',
  description:
    'Nosotros en corto, sin foto: título a la izquierda, un párrafo y fila de cifras a la derecha.',
  numbered: true,
  contentKeys: ['kicker', 'title', 'summary', 'stats[].value', 'stats[].label'],
} satisfies SectionMeta;
