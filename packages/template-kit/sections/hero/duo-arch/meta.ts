import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'duo-arch',
  label: 'Portada',
  region: 'main',
  description:
    'Portada amable: texto y CTAs a la izquierda; a la derecha una foto en arco y, si hay detailImage, un arco más chico que se encima abajo a la izquierda. Contiene el único <h1>.',
  intent:
    'Suave: dos arcos encimados como ventanas de una casa, sin cajas; para estéticas, florerías, veterinarias y consultorios cálidos.',
  tiers: ['basic', 'pro'],
  archetypes: ['soft', 'booking'],
  placeholder: { width: 900, height: 1200 },
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
    detailImage: 'gallery-01.jpg',
    detailAlt: 'Detalle del trabajo terminado, visto de cerca',
  },
} satisfies SectionMeta;
