import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'locations',
  variant: 'with-contact',
  label: 'Contacto y sucursales',
  region: 'main',
  description:
    'Bloque de contacto (WhatsApp, teléfono y correo como filas-botón) sobre las tarjetas de sucursal con horario, "cómo llegar" y mapa. Sin formulario.',
  numbered: true,
  contentKeys: [
    'kicker',
    'title',
    'contactText',
    'whatsappLabel',
    'whatsappValue',
    'callLabel',
    'emailLabel',
    'directionsLabel',
    'branches[].name',
    'branches[].address',
    'branches[].hours',
    'branches[].directionsUrl',
    'branches[].mapUrl',
    'branches[].mapTitle',
  ],
} satisfies SectionMeta;
