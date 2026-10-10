import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'navbar',
  variant: 'centered-logo',
  label: 'Barra de navegación',
  region: 'header',
  description:
    'Logo centrado entre el teléfono (izquierda) y el CTA de WhatsApp (derecha), con las anclas en una segunda fila centrada. La fila de anclas se oculta bajo 992px.',
  contentKeys: ['cta', 'links[].label', 'links[].href'],
} satisfies SectionMeta;
