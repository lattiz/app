import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'services',
  variant: 'product-grid',
  label: 'Catálogo de productos',
  region: 'main',
  description:
    'Retícula de productos con foto, nombre, precio y un botón para pedir cada uno por WhatsApp (tiendas y catálogos).',
  numbered: true,
  placeholder: { width: 800, height: 1000 },
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'cta',
    'products[].name',
    'products[].price',
    'products[].description',
    'products[].image',
    'products[].imageAlt',
    'products[].href',
  ],
} satisfies SectionMeta;
