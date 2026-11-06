import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-barra-saludable-01 (snacks), rebuilt by hand
export default {
  slot: 'gallery',
  variant: 'priced-rows',
  label: 'Fotos con precio',
  region: 'main',
  description:
    'Cabecera alineada a la izquierda y una retícula de dos columnas de filas: foto cuadrada a la izquierda y, a la derecha, nombre con precio, descripción corta y un enlace opcional a WhatsApp. En móvil pasa a una columna.',
  intent:
    'Una galería de producto que también sirve de carta: cada foto trae nombre y precio; para bowls, snacks, panadería, platillos y tiendas con producto fotografiable.',
  numbered: true,
  placeholder: { width: 400, height: 400 },
  tiers: ['pro'],
  archetypes: ['catalog'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'linkLabel?',
    'items[].image',
    'items[].alt',
    'items[].caption',
    'items[].price?',
    'items[].text?',
    'items[].href?',
  ],
  sample: {
    intro: 'Opciones sólidas para después de entrenar o para la colación.',
    linkLabel: 'Pedir por WhatsApp',
    items: [
      {
        image: 'gallery-01.jpg',
        alt: 'Bowl de yogurt con avena y frutos rojos',
        caption: 'Bowl de yogurt y frutos',
        price: '$110',
        text: 'Yogurt griego, avena, frutos rojos y nuez.',
        href: '{{whatsappUrl:Hola, quiero el bowl de yogurt}}',
      },
      {
        image: 'gallery-02.jpg',
        alt: 'Bagel integral con espinaca y hummus',
        caption: 'Bagel de espinaca',
        price: '$95',
        text: 'Pan integral, hummus, espinaca y aguacate.',
        href: '{{whatsappUrl:Hola, quiero el bagel de espinaca}}',
      },
      {
        image: 'gallery-03.jpg',
        alt: 'Chips de betabel en un vaso de papel',
        caption: 'Chips de betabel',
        price: '$65',
        text: 'Horneadas, con sal de mar y limón.',
        href: '{{whatsappUrl:Hola, quiero chips de betabel}}',
      },
      {
        image: 'gallery-04.jpg',
        alt: 'Sándwich de pollo con espinaca',
        caption: 'Sándwich de pollo',
        price: '$105',
        text: 'Pechuga a la plancha, espinaca y jitomate.',
        href: '{{whatsappUrl:Hola, quiero el sándwich de pollo}}',
      },
    ],
  },
} satisfies SectionMeta;
