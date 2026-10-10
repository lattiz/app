import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'footer',
  variant: 'minimal-centered',
  label: 'Pie de página',
  region: 'footer',
  description:
    'Pie centrado y sobrio: nombre, una línea sobre el negocio, anclas en fila, redes, sucursales en una línea y leyenda legal con teléfono.',
  contentKeys: [
    'about',
    'branches[].name',
    'branches[].address',
    'links[].label',
    'links[].href',
  ],
} satisfies SectionMeta;
