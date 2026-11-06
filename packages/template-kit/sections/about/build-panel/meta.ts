import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-barra-saludable-01 (proceso), rebuilt by hand
export default {
  slot: 'about',
  variant: 'build-panel',
  label: 'Arma tu pedido',
  region: 'main',
  description:
    'Cabecera centrada y, en dos columnas, tres pasos numerados en tarjetas (cada uno con su rejilla de opciones) junto a un panel de resumen con filas de etiqueta y valor, una nota y un botón de WhatsApp. Sin JS: el panel es un ejemplo fijo de pedido.',
  intent:
    'Una sección que explica cómo se personaliza el pedido y enseña un ejemplo ya armado; para barras de bebidas, bowls, nutrición y cualquier negocio con opciones elegibles.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['catalog'],
  contentKeys: [
    'kicker?',
    'title',
    'summary',
    'features[].title',
    'features[].text?',
    'features[].options[].name',
    'features[].options[].note?',
    'panelTitle?',
    'panelTag?',
    'stats[].label',
    'stats[].value',
    'panelNote?',
    'cta?',
  ],
  sample: {
    kicker: 'Personalización',
    title: 'Arma tu vaso en tres pasos',
    summary:
      'Elige base, proteína y topping; lo mezclamos al momento en barra.',
    features: [
      {
        title: 'Elige tu base',
        text: 'Líquidos naturales, sin azúcar añadida en la receta base.',
        options: [
          { name: 'Almendra', note: 'Casera' },
          { name: 'Avena', note: 'Cremosa' },
          { name: 'Agua de coco', note: 'Ligera' },
        ],
      },
      {
        title: 'Elige tu proteína',
        text: 'Cada opción indica los gramos por porción.',
        options: [
          { name: 'Whey', note: 'Vainilla · 24 g' },
          { name: 'Vegetal', note: 'Chícharo · 22 g' },
        ],
      },
      {
        title: 'Elige tu topping',
        text: 'Crujiente, tostado o cremoso.',
        options: [
          { name: 'Chía' },
          { name: 'Cacao nibs' },
          { name: 'Coco tostado' },
        ],
      },
    ],
    panelTitle: 'Tu combinación',
    panelTag: 'Ejemplo',
    stats: [
      { label: 'Base', value: 'Leche de almendra' },
      { label: 'Proteína', value: 'Whey vainilla' },
      { label: 'Topping', value: 'Cacao nibs' },
    ],
    panelNote: 'Escríbenos tu mezcla y la dejamos lista cuando llegues.',
    cta: 'Pedir mi combinación',
  },
} satisfies SectionMeta;
