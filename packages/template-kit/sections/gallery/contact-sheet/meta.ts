import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-ceniza-contactos-mapa-01 (galería), rebuilt by hand
export default {
  slot: 'gallery',
  variant: 'contact-sheet',
  label: 'Tira de contactos',
  region: 'main',
  description:
    'Cabecera con título enorme y datos de la hoja a la derecha bajo un filete grueso, y una hoja enmarcada con una franja de rótulo (rollo y nota) y los fotogramas en tres columnas de encuadres distintos (vertical, cuadrado, horizontal), cada uno con número de fotograma y pie de foto.',
  intent:
    'Mostrar la cocina y el local como un rollo de negativos: encuadres variados con número y pie, sin cuadrícula uniforme; para parrillas, bares y cafeterías con buena fotografía.',
  numbered: true,
  tiers: ['pro'],
  archetypes: ['bold', 'editorial'],
  placeholder: { width: 1200, height: 1500 },
  contentKeys: [
    'kicker',
    'title',
    'meta[]?',
    'sheetLabel?',
    'sheetNote?',
    'items[].image',
    'items[].alt',
    'items[].caption',
  ],
  sample: {
    meta: ['Locación: Roma Norte', 'Horario: 19:00 – 02:30'],
    sheetLabel: 'Rollo 09 · Película de seguridad',
    sheetNote: 'Noche',
  },
} satisfies SectionMeta;
