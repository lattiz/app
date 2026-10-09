import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'image-bg',
  label: 'Portada',
  region: 'main',
  description:
    'Portada a pantalla completa con foto de fondo, velo de color (overlay) y texto claro al pie; contiene el único <h1>. Usa siempre el esquema overlay/on-overlay, aun en temas claros.',
  placeholder: { width: 1600, height: 1000 },
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
  ],
} satisfies SectionMeta;
