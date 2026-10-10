import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'services',
  variant: 'editorial-table',
  label: 'Servicios y precios',
  region: 'main',
  description:
    'Carta editorial: título e introducción fijos a la izquierda; a la derecha filas numeradas (01, 02…) con nombre, descripción y precio separados por filetes, y notas de promociones al pie.',
  numbered: true,
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'promos[].title',
    'promos[].text',
    'promos[].cta',
    'promos[].href',
  ],
} satisfies SectionMeta;
