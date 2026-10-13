import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'columns',
  label: 'Portada',
  region: 'main',
  description:
    'Portada editorial: antetítulo entre filetes como cabecera de revista, titular grande en dos tercios y una foto vertical angosta en el tercio derecho; texto y CTAs bajo el titular. Contiene el único <h1>.',
  intent:
    'Revista: el titular ocupa la página y la foto es una columna angosta, con filetes en vez de cajas; para despachos, florerías y restaurantes de autor.',
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'minimal', 'trust'],
  placeholder: { width: 900, height: 1200 },
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
