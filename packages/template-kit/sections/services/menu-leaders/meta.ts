import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-barra-pedidos-01 (carta), rebuilt by hand
export default {
  slot: 'services',
  variant: 'menu-leaders',
  label: 'Carta con puntos guía',
  region: 'main',
  description:
    'Cabecera con título y una nota de precios a la derecha; debajo, un bloque por categoría separado por filetes: a la izquierda una miniatura redonda, el nombre de la categoría y una línea; a la derecha los platillos con nombre, puntos guía, precio alineado y descripción.',
  intent:
    'Una carta que se lee como la de una barra: categorías con su propia viñeta y precios alineados con puntos guía; para cafeterías, panaderías y restaurantes con menú corto por secciones.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'catalog'],
  placeholder: { width: 400, height: 400 },
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'note?',
    'cta?',
    'groups[].title',
    'groups[].text?',
    'groups[].image?',
    'groups[].imageAlt?',
    'groups[].items[].name',
    'groups[].items[].price',
    'groups[].items[].description?',
  ],
  sample: {
    note: 'Precios con impuestos incluidos',
    cta: 'Pedir por WhatsApp',
    groups: [
      {
        title: 'Café y bebidas',
        text: 'Granos de lote pequeño, molidos al momento.',
        items: [
          { name: 'Espresso sencillo / doble', price: '$45 / $55', description: 'Lote del mes, notas a chocolate amargo.' },
          { name: 'Flat white', price: '$70', description: 'Doble carga con leche entera texturizada.' },
          { name: 'Filtrado en V60', price: '$80', description: 'Una taza de origen único.' },
        ],
      },
      {
        title: 'Cocina fría',
        text: 'Pan de masa madre y rellenos del día.',
        items: [
          { name: 'Lonche de roast beef', price: '$175', description: 'Provolone, mostaza en grano y arúgula.' },
          { name: 'Toast de trucha ahumada', price: '$180' },
        ],
      },
    ],
  },
} satisfies SectionMeta;
