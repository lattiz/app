import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'marquee',
  variant: 'urban-luxe',
  label: 'Cinta de especialidades',
  region: 'main',
  description:
    'Cinta en color de acento con lista de especialidades en desplazamiento infinito (se detiene con prefers-reduced-motion).',
  contentKeys: ['label', 'items[]'],
} satisfies SectionMeta;
