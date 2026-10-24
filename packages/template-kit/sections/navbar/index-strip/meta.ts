import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-ceniza-brasa-pizarra-01 (navbar), rebuilt by hand
export default {
  slot: 'navbar',
  variant: 'index-strip',
  label: 'Barra de navegación con franja',
  region: 'header',
  description:
    'Barra fija en dos niveles: una franja delgada con horario, dirección y teléfono y, debajo, el wordmark a la izquierda, las anclas como índice numerado (01, 02…) y el CTA de WhatsApp. La franja se oculta bajo 992px y el menú móvil es el mismo de las demás barras.',
  intent:
    'Poner el horario y la dirección en el primer pixel de la página, como la cabecera de una ficha; para bares, parrillas y restaurantes que abren de noche y viven de saber cuándo y dónde.',
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'editorial'],
  contentKeys: ['cta', 'hours?', 'links[].label', 'links[].href'],
  sample: { hours: 'Mié a dom · 19:00 – 01:30' },
} satisfies SectionMeta;
