import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'about',
  variant: 'text-image-offset',
  label: 'Nosotros',
  region: 'main',
  description:
    'Foto 4:5 con marco desplazado y sticker, título con acento serif, párrafos y fila de cifras.',
  numbered: true,
  placeholder: { width: 1000, height: 1250 },
  contentKeys: [
    'kicker',
    'image',
    'imageAlt',
    'sticker?',
    'title',
    'paragraphs[]',
    'stats[].value',
    'stats[].label',
  ],
} satisfies SectionMeta;
