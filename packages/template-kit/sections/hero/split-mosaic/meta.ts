import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-ceniza-fuego-humo-01 (portada), rebuilt by hand
export default {
  slot: 'hero',
  variant: 'split-mosaic',
  label: 'Portada partida con mosaico',
  region: 'main',
  description:
    'Portada partida a todo el alto: a la izquierda un panel oscuro con antetítulo enmarcado, un titular apilado, una línea, el CTA de WhatsApp y una nota con filete; a la derecha un mosaico de cuatro fotos de distinto encuadre con etiquetas pequeñas (platillo y detalle). Contiene el único <h1>.',
  intent:
    'Una portada rápida para pedir: el titular corto a un lado y el menú entero en cuatro fotos al otro; para parrillas y bares con versión de pedido directo.',
  placeholder: { width: 900, height: 900 },
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'editorial'],
  contentKeys: [
    'image',
    'imageAlt',
    'imageLabel?',
    'imageNote?',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'note?',
    'tiles[].photo?',
    'tiles[].photoAlt?',
    'tiles[].label',
    'tiles[].note?',
  ],
  sample: {
    note: 'Entrega rápida o para recoger',
    imageLabel: 'Burger Ceniza',
    imageNote: 'Carne ahumada · Brioche',
    tiles: [
      { photo: 'product-01.jpg', photoAlt: 'Corte de res sobre la parrilla', label: 'Rib eye', note: '400 g al carbón' },
      { photo: 'product-02.jpg', photoAlt: 'Alitas con salsa oscura', label: 'Alitas', note: 'Salsa ahumada' },
      { photo: 'product-03.jpg', photoAlt: 'Coctel con hielo y romero', label: 'Coctel', note: 'Mezcal y romero' },
    ],
  },
} satisfies SectionMeta;
