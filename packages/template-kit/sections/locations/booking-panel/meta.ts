import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-don-porfirio-01 (contacto), rebuilt by hand
export default {
  slot: 'locations',
  variant: 'booking-panel',
  label: 'Contacto y ubicación',
  region: 'main',
  description:
    'Una sola tarjeta enmarcada: a la izquierda antetítulo, título, línea de apoyo, tres canales con icono (WhatsApp, teléfono, correo, cada uno con una nota) y el botón de WhatsApp; a la derecha un panel con la dirección, el horario y el enlace «cómo llegar». Sin formulario ni mapa incrustado.',
  intent:
    'Cerrar la página con una reserva directa: la clienta o el cliente elige canal sin formularios y ve dónde y cuándo; para barberías, talleres y consultorios que atienden por WhatsApp.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['bold'],
  contentKeys: [
    'kicker?',
    'title',
    'contactText',
    'whatsappLabel',
    'whatsappValue',
    'whatsappNote?',
    'whatsappCta',
    'callLabel',
    'callNote?',
    'emailLabel',
    'emailNote?',
    'directionsLabel',
    'hoursLabel?',
    'branches[].name',
    'branches[].address',
    'branches[].hours',
    'branches[].directionsUrl',
  ],
  sample: {
    kicker: 'Sin intermediarios',
    hoursLabel: 'Horario',
    whatsappNote: 'Atención rápida para apartar tu turno',
    callNote: 'Llamada directa al mostrador',
    emailNote: 'Para eventos privados y grupos',
    whatsappCta: 'Escribir por WhatsApp ahora',
    branches: [
      {
        name: 'Ubicación y horarios',
        address:
          'Calle Dr. Atl 148, Col. Santa María la Ribera, 06400 Ciudad de México, CDMX.',
        hours: 'Lunes a sábado · 09:00 – 20:00 h',
        directionsUrl:
          'https://maps.google.com/?q=Calle+Dr.+Atl+148+Ciudad+de+Mexico',
      },
    ],
  },
} satisfies SectionMeta;
