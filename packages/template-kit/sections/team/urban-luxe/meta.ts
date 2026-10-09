import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'team',
  variant: 'urban-luxe',
  label: 'Equipo',
  region: 'main',
  description:
    'Retícula de 4 tarjetas con retrato 4:5 en escala de grises (color al pasar el cursor), nombre, rol y etiquetas.',
  numbered: true,
  placeholder: { width: 800, height: 1000 },
  contentKeys: [
    'kicker',
    'title',
    'members[].name',
    'members[].role',
    'members[].tags[]',
    'members[].image',
    'members[].imageAlt',
  ],
} satisfies SectionMeta;
