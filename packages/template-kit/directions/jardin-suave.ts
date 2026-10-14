import type { ArtDirection } from './types';

export default {
  id: 'jardin-suave',
  name: 'Jardín suave',
  intent:
    'Amable y redondo: fondos teñidos, arcos, botones en cápsula y sans de formas abiertas; para estéticas, veterinarias, consultorios pediátricos y florerías.',
  voice: {
    register: 'Tú cálido y tranquilo; explica sin tecnicismos.',
    rules: [
      'Habla de lo que siente el cliente antes y después, sin prometer resultados.',
      'Frases de 8 a 14 palabras; nada de listas en la portada.',
      'Nombres propios y lugares reales del barrio (ficticios), no genéricos.',
      'Un solo CTA amable: «Agendar cita», «Escríbenos».',
    ],
    avoid: ['transforma', 'tu mejor versión', 'garantizado', 'mágico'],
    headline: 'Consulta sin prisa para tu perro y tu gato',
    cta: 'Agendar cita',
  },
  palettes: {
    default: [
      'pal-menta-tinta',
      'pal-salvia-tinta',
      'pal-rubor-salvia',
      'pal-lavanda-tinta',
      'pal-cielo-tinta',
      'pal-turquesa-agua',
    ],
  },
  fontPairs: {
    default: [
      'fredoka+nunito',
      'outfit+literata',
      'red-hat-display+red-hat-text',
      'league-spartan+mulish',
    ],
  },
  style: {
    shape: 'pill',
    surface: 'tinted',
    density: 'airy',
    divider: 'none',
    imageTreatment: 'arch',
    typeScale: 'normal',
    displayCase: 'none',
    tracking: 'normal',
  },
  primitives: {
    button: 'pill',
    card: 'tinted',
    tag: 'pill',
    frame: 'arch',
    number: 'plain',
    quote: 'marks',
    divider: 'hairline',
  },
  archetypes: ['soft', 'booking'],
  heroes: {
    pro: ['duo-arch', 'panel', 'offset-card'],
    basic: ['duo-arch', 'offset-card'],
  },
  motion: 'calm',
  dials: { variance: 5, motion: 5, density: 3 },
  giros: ['estetica', 'veterinaria', 'floreria', 'dental', 'clinica'],
  rules: ['scheme:light', 'no-gradients'],
} satisfies ArtDirection;
