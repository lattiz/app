import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-barra-saludable-01 (menu), rebuilt by hand
export default {
  slot: 'services',
  variant: 'flavor-cards',
  label: 'Tarjetas de sabores',
  region: 'main',
  description:
    'Cabecera con antetítulo, título e introducción a un lado y, debajo, tarjetas de producto con una franja de color arriba, insignia de dato, precio, nombre, descripción, píldoras y botón de WhatsApp. Una tarjeta con etiqueta (flag) se destaca con borde de acento.',
  intent:
    'Un menú corto en tarjetas donde cada producto se distingue por su franja y su dato clave (gramos de proteína, calorías, tamaño); para barras de bebidas, nutrición, panaderías y tiendas con pocos productos.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['catalog'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'cta',
    'products[].name',
    'products[].price',
    'products[].description',
    'products[].href',
    'products[].badge?',
    'products[].tags[]?',
    'products[].flag?',
  ],
  sample: {
    intro: 'Precios de ejemplo en pesos mexicanos.',
    cta: 'Pedir',
    products: [
      {
        name: 'Verde matcha',
        price: '$115',
        description: 'Espinaca, matcha, plátano y leche de almendra.',
        href: '{{whatsappUrl:Hola, quiero el smoothie verde matcha}}',
        badge: '22 g proteína',
        tags: ['Verde', 'Energía'],
      },
      {
        name: 'Frutos rojos',
        price: '$120',
        description: 'Fresa, zarzamora, frambuesa y proteína de vainilla.',
        href: '{{whatsappUrl:Hola, quiero el smoothie de frutos rojos}}',
        badge: '25 g proteína',
        tags: ['Post-entreno'],
        flag: 'Favorito',
      },
      {
        name: 'Cacao power',
        price: '$125',
        description: 'Cacao, crema de cacahuate, plátano y avena.',
        href: '{{whatsappUrl:Hola, quiero el smoothie de cacao}}',
        badge: '24 g proteína',
      },
      {
        name: 'Azul espirulina',
        price: '$130',
        description: 'Espirulina azul, piña, agua de coco y coco rallado.',
        href: '{{whatsappUrl:Hola, quiero el smoothie azul}}',
        badge: '20 g proteína',
        tags: ['Hidratante'],
      },
    ],
  },
} satisfies SectionMeta;
