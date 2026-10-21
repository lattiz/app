import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-abeto-indice-01 (maestros), rebuilt by hand
export default {
  slot: 'team',
  variant: 'index-portraits',
  label: 'Equipo',
  region: 'main',
  description:
    'Cabecera con regla (número de sección y rótulo), título e introducción, y una fila de retratos verticales 3:4 en marcos con filete (escala de grises, color al pasar el cursor): especialidad en versalitas, nombre en serif y las etiquetas separadas por puntos bajo un filete.',
  intent:
    'Quién te atiende, con retratos altos y sobrios en lugar de tarjetas de equipo genéricas; para barberías y estudios de oficio donde la mano del maestro es parte de lo que se compra.',
  numbered: true,
  placeholder: { width: 900, height: 1200 },
  tiers: ['pro'],
  archetypes: ['editorial', 'bold'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'members[].name',
    'members[].role',
    'members[].tags[]?',
    'members[].image',
    'members[].imageAlt',
  ],
  sample: {
    intro: 'Manos de oficio, atención sin prisa.',
  },
} satisfies SectionMeta;
