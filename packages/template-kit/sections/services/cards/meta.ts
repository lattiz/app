import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'services',
  variant: 'cards',
  label: 'Servicios y precios',
  region: 'main',
  description:
    'Retícula de tarjetas (precio grande arriba, nombre y descripción) y una fila de promociones como enlaces a WhatsApp.',
  numbered: true,
  contentKeys: [
    'kicker',
    'title',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'promos[].tag',
    'promos[].title',
    'promos[].cta',
    'promos[].href',
  ],
} satisfies SectionMeta;
