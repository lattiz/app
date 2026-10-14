import type { ArtDirection } from './types';

export default {
  id: 'marmol-sobrio',
  name: 'Mármol sobrio',
  intent:
    'Confianza premium: colores fríos, serif fina, contornos en vez de rellenos y mucho orden; para clínicas, dentistas, despachos y veterinarias de especialidad.',
  voice: {
    register: 'Usted cordial y profesional; explica el proceso paso a paso.',
    rules: [
      'Primero el problema que atiende, luego cómo; sin diagnósticos ni curas prometidas.',
      'Credenciales concretas y verificables (cédula, años, institución ficticia).',
      'Oraciones medianas, tono calmado, sin superlativos.',
      'CTA único y formal: «Agendar consulta».',
    ],
    avoid: [
      'revolucionario',
      'el mejor especialista',
      '100 %',
      'sin dolor garantizado',
    ],
    headline: 'Ortodoncia con citas puntuales en Polanco',
    cta: 'Agendar consulta',
  },
  palettes: {
    default: [
      'pal-cielo-marino',
      'pal-niebla-grafito',
      'pal-marino-hueso',
      'pal-pizarra-plata',
      'pal-cielo-tinta',
      'pal-navy-laton',
    ],
  },
  fontPairs: {
    default: [
      'gilda-display+hanken-grotesk',
      'eb-garamond+albert-sans',
      'libre-caslon-display+schibsted-grotesk',
      'red-hat-display+red-hat-text',
    ],
  },
  style: {
    shape: 'soft',
    surface: 'outlined',
    density: 'cozy',
    divider: 'hairline',
    imageTreatment: 'plain',
    typeScale: 'tight',
    displayCase: 'none',
    tracking: 'normal',
  },
  primitives: {
    button: 'solid',
    card: 'outlined',
    tag: 'outlined',
    frame: 'cut',
    number: 'ruled',
    quote: 'rule',
    divider: 'hairline',
  },
  archetypes: ['trust', 'booking'],
  heroes: { pro: ['panel', 'bento', 'split'], basic: ['panel', 'split'] },
  motion: 'calm',
  dials: { variance: 3, motion: 4, density: 5 },
  giros: ['clinica', 'dental', 'despacho', 'veterinaria'],
  rules: ['no-gradients'],
} satisfies ArtDirection;
