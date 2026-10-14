import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'bento',
  label: 'Portada',
  region: 'main',
  description:
    'Portada en celdas: el titular con antetítulo, texto y CTAs en una celda ancha, la foto vertical en una celda alta a la derecha y, debajo del titular, una celda por cada dato (cifra + etiqueta; 2 a 3, el cuarto no se muestra). Los datos solo aparecen desde 993 px: en tabletas y teléfonos la portada es titular, CTAs y foto. Sin datos, el titular ocupa su fila. Contiene el único <h1>.',
  intent:
    'Hechos al frente: la portada muestra años, calificación o volumen en cifras grandes junto a la foto; para negocios con números que convencen (clínicas, gimnasios, talleres, restaurantes con historia).',
  tiers: ['basic', 'pro'],
  archetypes: ['catalog', 'trust', 'showcase'],
  placeholder: { width: 1000, height: 1250 },
  contentKeys: [
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta',
    'secondaryHref',
    'facts[].value?',
    'facts[].label?',
  ],
  sample: {
    facts: [
      { value: '14 años', label: 'En el mismo local de la colonia' },
      { value: '4.8', label: 'Calificación de ejemplo en Google' },
      { value: '6 días', label: 'Abierto a la semana' },
    ],
  },
} satisfies SectionMeta;
