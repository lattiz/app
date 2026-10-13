import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'locations',
  variant: 'single-card',
  label: 'Ubicación',
  region: 'main',
  description:
    'Una sola sucursal como ficha: título y una tarjeta en tres columnas (dirección con «cómo llegar», horario, y los botones de WhatsApp y llamar). Sin mapa embebido ni formulario; el contacto ligero de Básico.',
  intent:
    'Ficha del local: lo que alguien necesita para llegar y escribir, en una sola tarjeta y sin iframe; para cualquier Básico de una sucursal.',
  tiers: ['basic'],
  archetypes: ['booking', 'trust', 'minimal'],
  contentKeys: [
    'title',
    'branch.name',
    'branch.address',
    'branch.hours',
    'branch.directionsUrl',
    'hoursLabel',
    'whatsappCta',
    'callCta',
    'directionsLabel',
  ],
} satisfies SectionMeta;
