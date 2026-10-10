import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'team',
  variant: 'list',
  label: 'Equipo',
  region: 'main',
  description:
    'Lista a todo el ancho: retrato pequeño al lado, nombre en tipografía display grande, rol y especialidades a la derecha.',
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
