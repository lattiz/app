import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-don-porfirio-01 (footer), rebuilt by hand
export default {
  slot: 'footer',
  variant: 'signature-bar',
  label: 'Pie de página',
  region: 'footer',
  description:
    'Pie en dos filas bajo un filete: marca con monograma en caja y lema con una cinta de barbero; abajo las anclas en línea y el aviso legal. Sin columnas ni redes: el contacto ya está en la sección anterior.',
  intent:
    'Un cierre sobrio de una sola franja que firma la página sin repetir el contacto; para barberías, despachos y talleres cuyo pie es una firma, no un directorio.',
  tiers: ['basic', 'pro'],
  archetypes: ['bold'],
  contentKeys: ['monogram?', 'motto?', 'links[].label', 'links[].href'],
  sample: { monogram: 'DP', motto: 'Oficio · Filo · Tradición' },
} satisfies SectionMeta;
