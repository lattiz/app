import type { ArtDirection } from './types';

export default {
  id: 'terracota-calida',
  name: 'Terracota cálida',
  intent:
    'Táctil y terrosa: fondos teñidos cálidos, fotos con paspartú, tarjetas con sombra suave y serif robusta; para cocinas de barrio, florerías y tiendas de producto hecho a mano.',
  voice: {
    register: 'Tú cercano, de mostrador; cuenta de dónde viene lo que vendes.',
    rules: [
      'Nombra el ingrediente, la flor o el material y su origen (ficticio).',
      'Mezcla una frase corta con una larga; nunca tres iguales seguidas.',
      'Precios «desde» y porciones claras, sin «el mejor».',
      'El CTA invita a pedir o pasar: «Hacer pedido», «Pasar por la tienda».',
    ],
    avoid: [
      'artesanal de verdad',
      'hecho con amor',
      'auténtico sabor',
      'inigualable',
    ],
    headline: 'Tortillas de maíz criollo, recién salidas del comal',
    cta: 'Hacer pedido',
  },
  palettes: {
    default: [
      'pal-coral-tinta',
      'pal-azul-maya',
      'pal-cempasuchil',
      'pal-granada',
      'pal-arcilla',
    ],
  },
  fontPairs: {
    default: [
      'petrona+rubik',
      'zilla-slab+ibm-plex-sans',
      'gloock+onest',
      'outfit+literata',
    ],
  },
  style: {
    shape: 'soft',
    surface: 'elevated',
    density: 'cozy',
    divider: 'none',
    imageTreatment: 'framed',
    typeScale: 'normal',
    displayCase: 'none',
    tracking: 'normal',
  },
  primitives: {
    button: 'solid',
    card: 'elevated',
    tag: 'pill',
    frame: 'framed',
    number: 'plain',
    quote: 'marks',
    divider: 'ornament',
  },
  archetypes: ['catalog', 'showcase'],
  heroes: { pro: ['stack', 'framed', 'overlap'], basic: ['stack', 'framed'] },
  motion: 'calm',
  dials: { variance: 6, motion: 4, density: 5 },
  giros: ['restaurante', 'floreria', 'tienda', 'estetica'],
  rules: ['scheme:light', 'no-gradients'],
} satisfies ArtDirection;
