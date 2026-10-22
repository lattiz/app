import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-trigo-brasa-tandas-01
export default {
  slot: 'cta',
  variant: 'included-panel',
  label: 'Encargos con panel',
  region: 'main',
  description:
    'Banda oscura a todo el ancho (tinta del tema): antetítulo, titular, texto y botón de WhatsApp a la izquierda y, a la derecha, un panel con borde fino y una lista de lo que incluye con paloma. Sin panel, queda centrada. Cuenta como sección.',
  intent:
    'Un cierre de contraste para pedidos especiales: dice qué incluye el servicio antes de escribir; para panaderías, florerías, veterinarias y tiendas con encargos.',
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'catalog'],
  contentKeys: [
    'kicker?',
    'title',
    'text?',
    'primaryCta',
    'secondaryCta?',
    'secondaryHref?',
    'panelTitle?',
    'items[]?',
  ],
  sample: {
    kicker: 'Encargos',
    title: 'Roscas y pasteles por <span class="lz-title__serif">encargo</span>',
    text: 'Para reuniones, festejos y mesas de pan. Pídelos con 48 horas de anticipación.',
    primaryCta: 'Hacer encargo',
    panelTitle: 'Qué incluye',
    items: [
      'Masa madre de fermentación lenta',
      'Recoges en la panadería',
      'Mesas de pan para hasta 40 personas',
    ],
  },
} satisfies SectionMeta;
