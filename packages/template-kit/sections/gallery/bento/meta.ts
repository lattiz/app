import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'gallery',
  variant: 'bento',
  label: 'Galería',
  region: 'main',
  description:
    'Retícula tipo bento de 8 fotos con celdas de tamaños distintos (una grande, verticales y horizontales) y el pie de cada foto debajo, nunca encima. Con otro número de fotos cae a una retícula pareja.',
  intent:
    'El trabajo primero: ocho fotos en una composición con jerarquía, sin pastillas sobre la imagen; para estéticas, florerías, barberías y restaurantes con buenas fotos.',
  tiers: ['pro'],
  archetypes: ['showcase', 'bold'],
  placeholder: { width: 1200, height: 1200 },
  contentKeys: ['title', 'items[].image', 'items[].alt', 'items[].caption'],
} satisfies SectionMeta;
