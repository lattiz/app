import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-barra-pedidos-01 (contacto + pie), rebuilt by hand
export default {
  slot: 'footer',
  variant: 'hours-blocks',
  label: 'Pie con horario',
  region: 'footer',
  description:
    'Pie sobre la superficie del tema con una cuadrícula asimétrica: marca con una línea de presentación (ancha) y tres bloques (ubicación con nota, horario por día y contacto); abajo, aviso legal y enlaces en línea bajo un filete. Sin redes.',
  intent:
    'Un pie que sirve de directorio práctico (dónde, cuándo, cómo escribir) sin repetir una sección de contacto; para cafeterías, panaderías y cocinas de barrio.',
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'catalog'],
  contentKeys: [
    'about?',
    'placeTitle',
    'placeNote?',
    'scheduleTitle',
    'schedule[].label',
    'schedule[].value',
    'contactTitle',
    'links[].label',
    'links[].href',
  ],
  sample: {
    about: 'Café de especialidad y cocina fría en la colonia. Pedidos por WhatsApp.',
    placeTitle: 'Ubicación',
    placeNote: 'A media cuadra del metro.',
    scheduleTitle: 'Horario',
    schedule: [
      { label: 'Martes a viernes', value: '7:30–19:00' },
      { label: 'Sábado y domingo', value: '8:30–18:00' },
      { label: 'Lunes', value: 'Cerrado' },
    ],
    contactTitle: 'Contacto',
  },
} satisfies SectionMeta;
