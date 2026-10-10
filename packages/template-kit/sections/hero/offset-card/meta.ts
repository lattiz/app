import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'offset-card',
  label: 'Portada',
  region: 'main',
  description:
    'Título gigante a todo el ancho; debajo, el texto y los CTAs junto a una tarjeta de foto girada que se monta sobre el título. Contiene el único <h1>.',
  placeholder: { width: 1000, height: 800 },
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
