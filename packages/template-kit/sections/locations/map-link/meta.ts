import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'locations',
  variant: 'map-link',
  label: 'Sucursales',
  region: 'main',
  description:
    'Contacto y sucursales sin mapa embebido: título, texto y los tres canales (WhatsApp, teléfono, correo) como filas a la izquierda; las sucursales como una libreta de direcciones con horario y un enlace «cómo llegar» a Google Maps. Sin iframes ni formulario.',
  intent:
    'Libreta de direcciones: los datos que la gente copia (dirección, horario, teléfono) en grande y el mapa a un toque, sin el peso de un iframe; para cualquier giro con una o varias sucursales.',
  tiers: ['pro'],
  archetypes: ['trust', 'booking', 'minimal', 'editorial'],
  contentKeys: [
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
  ],
} satisfies SectionMeta;
