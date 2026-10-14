import type { ArtDirection } from './types';

export default {
  id: 'neon-nocturno',
  name: 'Neón nocturno',
  intent:
    'Cartel nocturno: fondo oscuro, condensada en mayúsculas, un acento eléctrico y fotos a duotono; para barberías, gimnasios y taquerías con actitud.',
  voice: {
    register: 'Tú directo, de barrio; frases cortas con ritmo.',
    rules: [
      'Titulares de 3 a 6 palabras, como un cartel.',
      'Verbos de acción al frente (Entrena, Pide, Aparta).',
      'Nada de signos de exclamación dobles ni mayúsculas fuera del display.',
      'Cifras y horarios a la vista: lo que se hace y a qué hora.',
    ],
    avoid: ['desata', 'al siguiente nivel', 'brutal', 'épico'],
    headline: 'Corte limpio, barba en orden',
    cta: 'Apartar turno',
  },
  palettes: {
    default: [
      'pal-carbon-lima',
      'pal-cobalto-noche',
      'pal-brasa-noche',
      'pal-jamaica-noche',
      'pal-medianoche-laton',
      'pal-neon-uva',
    ],
  },
  fontPairs: {
    default: [
      'bebas-neue+barlow',
      'oswald+source-sans-3',
      'anybody+be-vietnam-pro',
      'league-spartan+mulish',
    ],
  },
  style: {
    shape: 'sharp',
    surface: 'outlined',
    density: 'compact',
    divider: 'rule',
    imageTreatment: 'duotone-overlay',
    typeScale: 'expressive',
    displayCase: 'upper',
    tracking: 'wide',
  },
  primitives: {
    button: 'solid',
    card: 'outlined',
    tag: 'outlined',
    frame: 'duotone',
    number: 'ruled',
    quote: 'marks',
    divider: 'rule',
  },
  archetypes: ['bold', 'showcase'],
  heroes: {
    pro: ['poster', 'bento', 'image-bg'],
    basic: ['poster', 'image-bg'],
  },
  motion: 'editorial',
  dials: { variance: 8, motion: 7, density: 7 },
  giros: ['barberia', 'gimnasio', 'restaurante', 'tienda'],
  rules: ['scheme:dark', 'display:upper', 'no-gradients'],
} satisfies ArtDirection;
