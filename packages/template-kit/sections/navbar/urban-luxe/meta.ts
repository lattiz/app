import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'navbar',
  variant: 'urban-luxe',
  label: 'Barra de navegación',
  region: 'header',
  description:
    'Barra fija translúcida con desenfoque: wordmark + subtítulo, anclas centradas y CTA de WhatsApp. El menú se oculta bajo 992px.',
  contentKeys: ['cta', 'links[].label', 'links[].href'],
} satisfies SectionMeta;
