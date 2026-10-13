import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'team',
  variant: 'spotlight',
  label: 'Equipo',
  region: 'main',
  description:
    'Equipo con una persona al frente: la primera aparece en grande (retrato 4:5, nombre, cargo y especialidades) y el resto como una lista con avatar redondo, nombre y cargo.',
  intent:
    'Quién te atiende: la dueña, el médico o el chef al frente y su equipo detrás, sin cuatro tarjetas iguales; para clínicas, dentistas, veterinarias y despachos.',
  tiers: ['pro'],
  archetypes: ['trust', 'booking', 'editorial'],
  placeholder: { width: 800, height: 1000 },
  contentKeys: [
    'title',
    'members[].name',
    'members[].role',
    'members[].tags[]?',
    'members[].image',
    'members[].imageAlt',
  ],
} satisfies SectionMeta;
