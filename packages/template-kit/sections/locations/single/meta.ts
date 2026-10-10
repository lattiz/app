import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'locations',
  variant: 'single',
  label: 'Ubicación',
  region: 'main',
  description:
    'Una sola sucursal: datos, horario y botones (WhatsApp, llamar, cómo llegar) junto a un mapa embebido. Contacto compacto de Basic; sin formulario.',
  numbered: true,
  contentKeys: [
    'kicker',
    'title',
    'branch.name',
    'branch.address',
    'branch.hours',
    'branch.directionsUrl',
    'branch.mapUrl',
    'branch.mapTitle',
    'hoursLabel',
    'whatsappCta',
    'callCta',
    'directionsLabel',
  ],
} satisfies SectionMeta;
