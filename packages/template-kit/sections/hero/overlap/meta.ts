import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'overlap',
  label: 'Portada',
  region: 'main',
  description:
    'Portada partida con un segundo marco: texto y CTAs a la izquierda, foto vertical grande a la derecha y una foto de detalle cuadrada con paspartú que se encima en el borde izquierdo de la foto (`detailImage?`; sin ella, solo la foto grande). Contiene el único <h1>.',
  intent:
    'Producto y oficio de cerca: la foto grande da el ambiente y el detalle muestra la textura (el plato, la flor, el corte); para restaurantes, florerías, tiendas y estéticas.',
  tiers: ['basic', 'pro'],
  archetypes: ['showcase', 'catalog', 'soft'],
  placeholder: { width: 1100, height: 1300 },
  contentKeys: [
    'image',
    'imageAlt',
    'detailImage?',
    'detailAlt?',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta',
    'secondaryHref',
  ],
  sample: {
    detailImage: 'gallery-02.jpg',
    detailAlt: 'Detalle de cerca del trabajo terminado',
  },
} satisfies SectionMeta;
