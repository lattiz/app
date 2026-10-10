import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'footer',
  variant: 'big-wordmark',
  label: 'Pie de página',
  region: 'footer',
  description:
    'Wordmark gigante en contorno, columnas de marca/redes, sucursales y anclas, y barra legal.',
  contentKeys: [
    'about',
    'branchesTitle',
    'branches[].name',
    'branches[].address',
    'branches[].hours',
    'linksTitle',
    'links[].label',
    'links[].href',
  ],
} satisfies SectionMeta;
