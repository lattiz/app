import type { ArtDirection } from './types';

export default {
  id: 'cantera-editorial',
  name: 'Cantera editorial',
  intent:
    'Revista impresa: serif grande alineada a la izquierda, mucho aire, una foto desplazada y filetes en vez de cajas; para despachos, restaurantes de autor y florerías con oficio.',
  voice: {
    register: 'Usted o tú sereno, de oficio; frases completas y concretas.',
    rules: [
      'Titulares con un sustantivo concreto (el plato, la materia, el oficio), sin adjetivos de relleno.',
      'Una idea por oración; el apoyo cabe en 18 palabras.',
      'Datos verificables (horario, colonia, años) en vez de promesas.',
      'CTA en infinitivo o imperativo breve y siempre el mismo en toda la página.',
    ],
    avoid: ['experiencia única', 'pasión', 'lo mejor', 'calidad premium'],
    headline: 'Cocina de temporada en la esquina de Roma Norte',
    cta: 'Reservar mesa',
  },
  palettes: {
    default: [
      'pal-cantera',
      'pal-papel-tinta',
      'pal-indigo-papel',
      'pal-arcilla',
      'pal-niebla-grafito',
    ],
  },
  fontPairs: {
    default: [
      'newsreader+public-sans',
      'libre-caslon-display+schibsted-grotesk',
      'eb-garamond+albert-sans',
      'gloock+onest',
    ],
  },
  style: {
    shape: 'sharp',
    surface: 'flat',
    density: 'airy',
    divider: 'hairline',
    imageTreatment: 'offset',
    typeScale: 'expressive',
    displayCase: 'none',
    tracking: 'tight',
  },
  primitives: {
    button: 'underline',
    card: 'flat',
    tag: 'plain',
    frame: 'offset',
    number: 'plain',
    quote: 'rule',
    divider: 'hairline',
  },
  archetypes: ['editorial', 'minimal'],
  heroes: {
    pro: ['columns', 'split', 'offset-card'],
    basic: ['columns', 'split'],
  },
  motion: 'calm',
  dials: { variance: 6, motion: 5, density: 3 },
  giros: ['despacho', 'restaurante', 'floreria', 'estetica'],
  rules: ['scheme:light', 'display:serif', 'no-gradients'],
} satisfies ArtDirection;
