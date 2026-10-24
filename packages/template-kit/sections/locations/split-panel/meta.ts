import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-abeto-indice-01 (contacto), rebuilt by hand
export default {
  slot: 'locations',
  variant: 'split-panel',
  label: 'Contacto y ubicación',
  region: 'main',
  description:
    'Cabecera con regla (número de sección y rótulo), título y línea de apoyo, y un panel partido por un filete: a la izquierda los canales (botón grande de WhatsApp, teléfono y correo) y, por sucursal, dos fichas con dirección y horario; a la derecha un plano decorativo en SVG (calles, plaza y un alfiler con el nombre del local) dentro de un marco con filete y el enlace «Cómo llegar». Sin formulario ni mapa incrustado.',
  intent:
    'Reservar por el canal directo y saber dónde y cuándo llegar con un plano a la vista; para barberías, estudios y despachos con cita previa en un local de barrio.',
  numbered: true,
  tiers: ['pro'],
  archetypes: ['editorial', 'bold'],
  contentKeys: [
    'kicker?',
    'title',
    'contactText',
    'whatsappCta',
    'callLabel',
    'directionsLabel',
    'hoursLabel?',
    'branches[].name',
    'branches[].address',
    'branches[].hours',
    'branches[].directionsUrl',
  ],
  sample: {
    kicker: '07 / Contacto y reserva',
    hoursLabel: 'Horario',
    whatsappCta: 'Reservar por WhatsApp',
    branches: [
      {
        name: 'La casa',
        address: 'Plaza principal 18, Col. Centro, CDMX.',
        hours: 'Martes a sábado: 10:00 – 20:00 h<br>Domingo y lunes: cerrado',
        directionsUrl: 'https://maps.google.com/?q=Plaza+principal+CDMX',
      },
    ],
  },
} satisfies SectionMeta;
