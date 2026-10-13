import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'services',
  variant: 'menu-columns',
  label: 'Servicios',
  region: 'main',
  description:
    'Carta a dos columnas: cada servicio con nombre, línea punteada hasta el precio y descripción debajo; las promociones van en una fila de tarjetas con filete superior y CTA a WhatsApp.',
  intent:
    'Carta que se escanea: dos columnas de precios con líderes punteados, sin cajas, como el menú impreso del local; para restaurantes, barberías y estéticas con muchos precios.',
  tiers: ['basic', 'pro'],
  archetypes: ['catalog', 'editorial'],
  contentKeys: [
    'title',
    'intro?',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'promos[].tag?',
    'promos[].title',
    'promos[].text?',
    'promos[].cta',
    'promos[].href',
  ],
} satisfies SectionMeta;
