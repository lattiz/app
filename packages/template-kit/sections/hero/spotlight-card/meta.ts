import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-barra-saludable-01 (hero), rebuilt by hand
export default {
  slot: 'hero',
  variant: 'spotlight-card',
  label: 'Portada con foto destacada',
  region: 'main',
  description:
    'Portada en dos columnas: a la izquierda antetítulo en píldora, titular grande, texto, dos botones y una fila de chips con datos; a la derecha una tarjeta con etiqueta flotante, la foto con un pie (nombre y detalle del producto estrella) y una línea de dato. Contiene el único <h1>.',
  intent:
    'Una portada que enseña el producto estrella y resume el negocio en tres datos cortos; para barras de bebidas, cafeterías, nutrición y tiendas de producto fresco.',
  placeholder: { width: 1000, height: 800 },
  tiers: ['basic', 'pro'],
  archetypes: ['catalog'],
  contentKeys: [
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta?',
    'secondaryHref?',
    'chips[]?',
    'sticker?',
    'spotlightTitle?',
    'spotlightText?',
    'metaLabel?',
    'metaValue?',
  ],
  sample: {
    chips: [
      'Hasta 25 g de proteína',
      'Fruta y verdura reales',
      'Hecho al momento',
    ],
    sticker: 'Preparado al momento',
    spotlightTitle: 'Verde matcha',
    spotlightText: 'Espinaca, matcha y leche de almendra.',
    metaLabel: 'Tiempo promedio: 3 a 5 min',
    metaValue: 'Hecho frente a ti',
  },
} satisfies SectionMeta;
