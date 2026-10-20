import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-caramelo-pop-bandas-01 (hero), rebuilt by hand
export default {
  slot: 'hero',
  variant: 'arch-sticker',
  label: 'Portada',
  region: 'main',
  description:
    'Portada en dos columnas: antetítulo en cápsula con punto de acento, titular, texto, dos CTAs (WhatsApp con flecha y uno secundario) y una línea de confianza con paloma; a la derecha una foto en arco con borde claro y un sello redondo girado que se monta sobre su pie. Contiene el único <h1>.',
  intent:
    'Una portada amable y gráfica donde el producto manda: arco, sello y botones en cápsula; para tiendas de dulces, florerías y negocios de regalo que venden por WhatsApp.',
  placeholder: { width: 1000, height: 1250 },
  tiers: ['basic', 'pro'],
  archetypes: ['soft'],
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
    'note?',
  ],
  sample: {
    sticker: 'Importados<br>de EE. UU.',
    note: 'Entrega rápida en la ciudad y envíos a todo el país',
  },
} satisfies SectionMeta;
