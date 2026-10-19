import type { ArtDirection } from './types';

// Stitch: barberia-don-porfirio-01 (rebuilt: hero/photo-ribbon, pal-musgo-y-plata)
export default {
  id: 'insignia-musgo',
  name: 'Insignia y musgo',
  intent:
    'Barbería de oficio: fondo verde musgo oscuro, plata en vez de dorado, serif en mayúsculas con espaciado amplio y una portada fotográfica con insignia; para barberías, cantinas y talleres con historia.',
  voice: {
    register: 'Tú sereno y de oficio; frases firmes, sin prisa.',
    rules: [
      'Titulares con un oficio o un gesto concreto (el afeitado, la navaja, la toalla caliente).',
      'Una idea por frase; el apoyo cabe en 20 palabras.',
      'Horario, precio y duración a la vista; nada de superlativos.',
      'El mismo CTA en toda la página.',
    ],
    avoid: ['lujo exclusivo', 'el mejor', 'premium', 'experiencia única'],
    headline: 'El arte del afeitado y el corte clásico',
    cta: 'Reservar cita',
  },
  palettes: {
    default: ['pal-musgo-y-plata', 'pal-pizarra-plata', 'pal-bosque-hueso'],
  },
  fontPairs: {
    default: [
      'libre-caslon-display+schibsted-grotesk',
      'gilda-display+hanken-grotesk',
    ],
  },
  style: {
    shape: 'sharp',
    surface: 'outlined',
    density: 'airy',
    divider: 'hairline',
    imageTreatment: 'plain',
    typeScale: 'expressive',
    displayCase: 'upper',
    tracking: 'wide',
  },
  primitives: {
    button: 'outline',
    card: 'outlined',
    tag: 'outlined',
    frame: 'framed',
    number: 'ruled',
    quote: 'marks',
    divider: 'ornament',
  },
  archetypes: ['bold', 'showcase'],
  heroes: {
    pro: ['photo-ribbon', 'image-bg'],
    basic: ['photo-ribbon', 'image-bg'],
  },
  motion: 'calm',
  dials: { variance: 5, motion: 4, density: 3 },
  giros: ['barberia', 'restaurante', 'despacho'],
  rules: ['scheme:dark', 'display:upper'],
} satisfies ArtDirection;
