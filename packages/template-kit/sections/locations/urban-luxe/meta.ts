import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'locations',
  variant: 'urban-luxe',
  label: 'Sucursales',
  region: 'main',
  description:
    'Tarjetas de sucursal con dirección, horario, botón "cómo llegar" y mapa embebido de Google.',
  numbered: true,
  contentKeys: [
    'kicker',
    'directionsLabel',
    'branches[].name',
    'branches[].address',
    'branches[].hours',
    'branches[].directionsUrl',
    'branches[].mapUrl',
    'branches[].mapTitle',
  ],
} satisfies SectionMeta;
