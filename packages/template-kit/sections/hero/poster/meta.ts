import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'poster',
  label: 'Portada',
  region: 'main',
  description:
    'Portada tipo cartel: titular a todo el ancho, una franja de foto a sangre debajo y, al final, el texto de apoyo con los dos CTA en una fila. Contiene el único <h1>.',
  intent:
    'Cartel: la tipografía manda y la foto corre de borde a borde como una cinta; para negocios con actitud (barbería, gimnasio, taquería).',
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'showcase'],
  placeholder: { width: 1800, height: 800 },
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
