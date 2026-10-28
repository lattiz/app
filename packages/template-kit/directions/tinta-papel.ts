import type { ArtDirection } from './types';

export default {
  id: 'tinta-papel',
  name: 'Tinta y papel',
  intent:
    'Monocromo suizo: tinta sobre papel, retícula estricta, filetes finos y una sola foto enmarcada; para despachos, tiendas de diseño y consultorios que quieren verse precisos.',
  voice: {
    register: 'Usted claro y preciso; vocabulario del oficio sin jerga.',
    rules: [
      'Titulares que dicen qué se hace y para quién, en una línea.',
      'Números exactos (plazos, horarios, precios desde) en lugar de adjetivos.',
      'Nada de exclamaciones; el punto final cierra.',
      'Etiquetas llanas: «Servicios», «Horario», «Preguntas».',
    ],
    avoid: [
      'soluciones integrales',
      'de vanguardia',
      'sin complicaciones',
      'expertos',
    ],
    headline: 'Contabilidad mensual para negocios de Monterrey',
    cta: 'Agendar llamada',
  },
  palettes: {
    default: [
      'pal-papel-tinta',
      'pal-niebla-grafito',
      'pal-tinta-hueso',
      'pal-pizarra-plata',
    ],
  },
  fontPairs: {
    default: [
      'schibsted-grotesk+source-serif-4',
      'zilla-slab+ibm-plex-sans',
      'newsreader+public-sans',
      'red-hat-display+red-hat-text',
    ],
  },
  style: {
    shape: 'sharp',
    surface: 'flat',
    density: 'cozy',
    divider: 'rule',
    imageTreatment: 'framed',
    typeScale: 'tight',
    displayCase: 'none',
    tracking: 'tight',
  },
  primitives: {
    button: 'outline',
    card: 'flat',
    tag: 'numbered',
    frame: 'framed',
    number: 'ruled',
    quote: 'rule',
    divider: 'rule',
  },
  archetypes: ['minimal', 'trust'],
  heroes: { pro: ['split', 'panel', 'columns'], basic: ['split', 'columns'] },
  motion: 'calm',
  dials: { variance: 4, motion: 4, density: 5 },
  giros: ['despacho', 'tienda', 'clinica', 'barberia', 'academia-combate'],
  rules: ['accent:neutral', 'no-gradients'],
} satisfies ArtDirection;
