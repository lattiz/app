import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-claveria-verde-stitch-01-01 (especialidades), rebuilt by hand
export default {
  slot: 'services',
  variant: 'dish-spotlight',
  label: 'Platillo estrella y carta corta',
  region: 'main',
  description:
    'Cabecera centrada y una tarjeta a todo el ancho: foto a sangre en la mitad izquierda y, a la derecha, insignia, nombre del platillo, descripción, chips de ingredientes y una fila con precio y botón de WhatsApp. Debajo, la carta corta en dos columnas (nombre y precio en una línea, descripción debajo, filetes finos) y las promos como píldoras-enlace.',
  intent:
    'Un producto estrella que vende por sí solo con foto grande, y el resto del menú como lista breve; para restaurantes, cafeterías, pastelerías y floristerías con una pieza que define la casa.',
  placeholder: { width: 1000, height: 780 },
  tiers: ['basic', 'pro'],
  archetypes: ['soft', 'catalog', 'editorial'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'image',
    'imageAlt',
    'badge?',
    'featuredName',
    'featuredText',
    'chipsLabel?',
    'chips[]?',
    'featuredPrice',
    'featuredCta',
    'featuredHref',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'promos[].tag?',
    'promos[].title',
    'promos[].text?',
    'promos[].cta',
    'promos[].href',
  ],
  sample: {
    kicker: 'Platillo estrella',
    title: 'Especialidad de la casa',
    intro: 'Cada semana elegimos lo mejor del mercado para un platillo.',
    image: 'dish-01.jpg',
    imageAlt: 'Platillo de barro con guiso, tortillas y un vaso de agua fresca',
    badge: 'Recomendación de la cocina',
    featuredName: 'Guiso de la casa',
    featuredText:
      'Receta de familia con chiles secos, especias tostadas y ajonjolí. Se sirve con arroz y tortillas hechas a mano.',
    chipsLabel: 'Ingredientes principales:',
    chips: ['Chiles secos', 'Ajonjolí', 'Plátano macho', 'Maíz azul'],
    featuredPrice: '$265',
    featuredCta: 'Pedir hoy',
    featuredHref: '{{whatsappUrl:Hola, quiero pedir el platillo estrella}}',
    prices: [
      {
        name: 'Guacamole de la esquina',
        price: '$115',
        description: 'Aguacate machacado con cilantro, cebolla y limón.',
      },
      {
        name: 'Sopa de lima',
        price: '$95',
        description: 'Caldo aromático con tiritas de tortilla y lima agria.',
      },
      {
        name: 'Enchiladas verdes',
        price: '$185',
        description: 'Tortillas rellenas, salsa verde, crema y queso fresco.',
      },
      {
        name: 'Bowl del huerto',
        price: '$160',
        description: 'Quinoa, aguacate, brotes tiernos y aderezo de cilantro.',
      },
    ],
    promos: [
      {
        tag: 'Entre semana',
        title: 'Menú del día',
        cta: 'Reservar',
        href: '{{whatsappUrl:Hola, quiero reservar el menú del día}}',
      },
    ],
  },
} satisfies SectionMeta;
