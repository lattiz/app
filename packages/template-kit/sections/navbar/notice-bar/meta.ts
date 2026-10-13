import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'navbar',
  variant: 'notice-bar',
  label: 'Barra de navegación',
  region: 'header',
  description:
    'Barra fija en dos pisos: arriba una franja del color de acento con un aviso corto (horario de hoy, promoción) y el teléfono; abajo el nombre, las anclas y el CTA de WhatsApp. El menú se oculta bajo 992px.',
  intent:
    'Aviso siempre a la vista sin gastar una sección: horario, promo o «abierto hoy» encima del menú; para restaurantes, tiendas y gimnasios con horario que cambia.',
  tiers: ['basic', 'pro'],
  archetypes: ['catalog', 'booking', 'bold'],
  contentKeys: ['notice', 'cta', 'links[].label', 'links[].href'],
  sample: {
    notice: 'Hoy abrimos de 10:00 a 20:00 · Sin cita',
  },
} satisfies SectionMeta;
