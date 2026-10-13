import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'about',
  variant: 'portrait',
  label: 'Nosotros',
  region: 'main',
  description:
    'Nosotros como página de revista: el título a lo ancho, debajo un retrato vertical y el texto corrido en dos columnas, y las cifras en una fila con filetes al final.',
  intent:
    'Doble página de revista: el texto se lee como un artículo junto a un retrato, sin tarjeta ni marco desplazado; para despachos, florerías, restaurantes y estéticas con historia.',
  tiers: ['pro'],
  archetypes: ['editorial', 'trust', 'minimal'],
  placeholder: { width: 900, height: 1200 },
  contentKeys: [
    'image',
    'imageAlt',
    'title',
    'paragraphs[]',
    'stats[].value?',
    'stats[].label?',
  ],
} satisfies SectionMeta;
