import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-caramelo-pop-bandas-01 (galeria), rebuilt by hand
export default {
  slot: 'gallery',
  variant: 'collage',
  label: 'Galería',
  region: 'main',
  description:
    'Cabecera centrada y un mosaico asimétrico de 12 columnas con cinco formas que se repiten: arco alto, círculo, tarjeta vertical, píldora ancha y arco chico. Cada foto lleva su pie en una cápsula sobre la imagen. En móvil cae a dos columnas y luego a una.',
  intent:
    'Una galería que se ve a mano, con piezas de tamaños y formas distintos en vez de una retícula pareja; para tiendas, florerías y pastelerías con fotos de producto coloridas.',
  numbered: true,
  placeholder: { width: 1200, height: 1200 },
  tiers: ['pro'],
  archetypes: ['soft'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'items[].image',
    'items[].alt',
    'items[].caption',
  ],
} satisfies SectionMeta;
