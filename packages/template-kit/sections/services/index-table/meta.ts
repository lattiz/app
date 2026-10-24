import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-abeto-indice-01 (servicios), rebuilt by hand
export default {
  slot: 'services',
  variant: 'index-table',
  label: 'Servicios y precios',
  region: 'main',
  description:
    'Cabecera con regla (número de sección y rótulo), título e introducción, y una tabla de servicios entre filetes: número en serif a la izquierda, nombre, descripción y a la derecha duración y precio. La fila con etiqueta se invierte (relleno de acento) como destacada. Un botón de WhatsApp cierra la sección.',
  intent:
    'Una carta de servicios que se lee como la tarifa de un taller: números, filetes y una fila invertida para el servicio de la casa; para barberías, estudios y despachos que prefieren una tabla clara antes que tarjetas.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'bold'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'cta?',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'prices[].duration?',
    'prices[].tag?',
  ],
  sample: {
    cta: 'Reservar cita',
    prices: [
      {
        name: 'Corte clásico',
        price: '$580',
        description: 'Corte a tijera, lavado previo y peinado con pomada.',
        duration: '45 min',
      },
      {
        name: 'Barba y navaja',
        price: '$520',
        description: 'Toalla caliente, navaja recta y tónico frío.',
        duration: '40 min',
      },
      {
        name: 'Servicio completo',
        price: '$980',
        description: 'Corte, barba a navaja, doble toalla y masaje craneal.',
        duration: '80 min',
        tag: 'La casa',
      },
    ],
  },
} satisfies SectionMeta;
