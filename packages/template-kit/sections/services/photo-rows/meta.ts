import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-trigo-brasa-tandas-01
export default {
  slot: 'services',
  variant: 'photo-rows',
  label: 'Productos con foto',
  region: 'main',
  description:
    'Cabecera centrada y una retícula de dos columnas de tarjetas horizontales: foto cuadrada a la izquierda y, a la derecha, nombre y precio en una línea, descripción y etiquetas. Las promociones van debajo como filas con filete superior y enlace a WhatsApp.',
  intent:
    'Una carta que se vende con la foto del producto: para panaderías, cafeterías, florerías y tiendas que quieren que se vea lo que hay en el mostrador.',
  numbered: true,
  placeholder: { width: 400, height: 400 },
  tiers: ['basic', 'pro'],
  archetypes: ['catalog', 'soft'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'prices[].image?',
    'prices[].imageAlt?',
    'prices[].tags[]?',
    'promos[].tag?',
    'promos[].title',
    'promos[].text?',
    'promos[].cta',
    'promos[].href',
  ],
  sample: {
    kicker: '{{index}} — Vitrina',
    title: 'Nuestros <span class="lz-title__serif">panes</span>',
    intro:
      'Precios de ejemplo en pesos, IVA incluido. Pregunta por la tanda de hoy.',
    prices: [
      {
        name: 'Hogaza de masa madre',
        price: '$95',
        description: 'Corteza crujiente y miga abierta, de 800 g.',
        image: 'product-01.jpg',
        imageAlt: 'Hogaza de masa madre cortada sobre una tabla de madera',
        tags: ['Masa madre', 'Del día'],
      },
      {
        name: 'Baguette',
        price: '$65',
        description: 'Barra larga de corteza fina; sola o con aceite de oliva.',
        image: 'product-02.jpg',
        imageAlt: 'Baguette sobre una tabla de madera con un paño',
        tags: ['Crujiente'],
      },
      {
        name: 'Rosca de temporada',
        price: '$290',
        description: 'Para 8 personas, con fruta cristalizada. Por encargo.',
        image: 'product-03.jpg',
        imageAlt: 'Rosca decorada con fruta cristalizada',
        tags: ['Por encargo'],
      },
      {
        name: 'Pan de semillas',
        price: '$110',
        description: 'Girasol, ajonjolí y linaza; dura toda la semana.',
        image: 'product-04.jpg',
        imageAlt: 'Pan redondo cubierto de semillas',
        tags: ['Semillas', 'Del día'],
      },
    ],
    promos: [
      {
        tag: 'Encargos',
        title: 'Roscas y pasteles por encargo',
        text: 'Pídelos con 48 horas de anticipación.',
        cta: 'Haz tu encargo',
        href: '{{whatsappUrl:Hola, quiero hacer un encargo de pan}}',
      },
    ],
  },
} satisfies SectionMeta;
