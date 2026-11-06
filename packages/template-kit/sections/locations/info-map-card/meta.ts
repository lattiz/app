import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-barra-saludable-01 (contacto), rebuilt by hand
export default {
  slot: 'locations',
  variant: 'info-map-card',
  label: 'Ubicación con tarjeta de mapa',
  region: 'main',
  description:
    'Dos columnas: a la izquierda antetítulo, título, cuatro filas con ícono en círculo (dirección, horario, teléfono y correo) y dos botones (WhatsApp y abrir en el mapa); a la derecha una tarjeta con un plano de calles en SVG con alfiler, una etiqueta flotante con el nombre del local y una cápsula inferior con una nota y un dato destacado. Sin formulario ni mapa incrustado: el botón abre el mapa real.',
  intent:
    'Dejar todos los datos de contacto a la vista junto a un mapa enmarcado; para barras, cafeterías, clínicas de nutrición y tiendas con un local donde la gente pasa a recoger.',
  numbered: true,
  tiers: ['pro'],
  archetypes: ['catalog'],
  contentKeys: [
    'kicker',
    'title',
    'addressLabel',
    'hoursLabel',
    'callLabel',
    'emailLabel',
    'whatsappCta',
    'directionsLabel',
    'mapNote?',
    'noteText?',
    'noteTag?',
    'branches[].name',
    'branches[].address',
    'branches[].hours',
    'branches[].directionsUrl',
  ],
  sample: {
    kicker: 'Visítanos',
    title: 'Ubicación y horarios',
    addressLabel: 'Dirección',
    hoursLabel: 'Horario de barra',
    callLabel: 'Teléfono',
    emailLabel: 'Correo',
    whatsappCta: 'WhatsApp de la barra',
    directionsLabel: 'Ver en Google Maps',
    mapNote: 'A dos cuadras del parque',
    noteText: 'Biciletero afuera de la barra.',
    noteTag: 'Sin estacionamiento propio',
  },
} satisfies SectionMeta;
