import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'centered-arch',
  label: 'Portada',
  region: 'main',
  description:
    'Portada centrada: antetítulo, título, texto y CTAs en columna, y debajo una foto con máscara de arco y contorno en acento. Contiene el único <h1>.',
  placeholder: { width: 1200, height: 900 },
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
