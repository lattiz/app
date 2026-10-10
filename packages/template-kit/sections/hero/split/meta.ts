import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'split',
  label: 'Portada',
  region: 'main',
  description:
    'Portada en dos columnas sobre el fondo del tema: texto y CTAs a la izquierda, retrato 4:5 a la derecha con sticker. Contiene el único <h1>.',
  placeholder: { width: 1000, height: 1250 },
  contentKeys: [
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta',
    'secondaryHref',
    'sticker?',
  ],
} satisfies SectionMeta;
