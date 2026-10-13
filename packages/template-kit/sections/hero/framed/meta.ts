import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'framed',
  label: 'Portada',
  region: 'main',
  description:
    'Portada de vitrina: una foto grande enmarcada a lo ancho del contenedor y, encima de su esquina inferior izquierda, una tarjeta opaca con antetítulo, titular, texto y CTAs. Contiene el único <h1>.',
  intent:
    'Vitrina: la foto del trabajo llena la primera pantalla y el texto vive en una tarjeta, no sobre la imagen; para estéticas, tiendas y restaurantes con buena foto.',
  tiers: ['basic', 'pro'],
  archetypes: ['showcase', 'catalog'],
  placeholder: { width: 1800, height: 1100 },
  contentKeys: [
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta',
    'secondaryHref',
  ],
} satisfies SectionMeta;
