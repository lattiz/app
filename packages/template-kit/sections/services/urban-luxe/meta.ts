import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'services',
  variant: 'urban-luxe',
  label: 'Servicios y precios',
  region: 'main',
  description:
    'Panel con lista de precios punteada y columna de promociones con CTA a WhatsApp.',
  numbered: true,
  contentKeys: [
    'kicker',
    'title',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'promos[].tag',
    'promos[].title',
    'promos[].text',
    'promos[].cta',
    'promos[].href',
  ],
} satisfies SectionMeta;
