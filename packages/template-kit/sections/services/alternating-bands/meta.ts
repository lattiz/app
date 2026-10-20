import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-caramelo-pop-bandas-01 (catalogo), rebuilt by hand
export default {
  slot: 'services',
  variant: 'alternating-bands',
  label: 'Catálogo de productos',
  region: 'main',
  description:
    'Cabecera centrada (antetítulo en cápsula, título y una línea) y una banda a todo el ancho por producto: foto en arco a un lado y, al otro, número, etiqueta, nombre, descripción, chips opcionales, precio en cápsula y «Pedir» hacia WhatsApp. Las bandas alternan el lado de la foto y el tinte de fondo.',
  intent:
    'Un catálogo corto que se recorre como una historia, una categoría por banda y sin retícula de tarjetas; para tiendas de dulces, regalos y productos de temporada con cuatro o cinco categorías fuertes.',
  numbered: true,
  placeholder: { width: 800, height: 800 },
  tiers: ['basic', 'pro'],
  archetypes: ['soft'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'cta',
    'products[].name',
    'products[].price',
    'products[].description',
    'products[].image',
    'products[].imageAlt',
    'products[].href',
    'products[].tag?',
    'products[].chips?',
  ],
  sample: {
    products: [
      {
        name: 'Chocolates y barras',
        price: 'Desde $45',
        description:
          'Barras de crema de cacahuate, tabletas rellenas y obleas crujientes.',
        image: 'product-01.jpg',
        imageAlt: 'Barras de chocolate con maní y caramelo sobre una mesa rosa',
        href: '{{whatsappUrl:Hola, quiero chocolates}}',
        tag: 'Favoritos de siempre',
        chips: ['Crema de maní', 'Caramelo salado', 'Chocolate blanco'],
      },
      {
        name: 'Gomitas aciditas',
        price: 'Desde $38',
        description:
          'Tiras confitadas, ositos suaves y aros frutales con toque cítrico.',
        image: 'product-02.jpg',
        imageAlt: 'Gomitas de colores en un frasco de vidrio',
        href: '{{whatsappUrl:Hola, quiero gomitas}}',
        tag: 'Sensación extrema',
        chips: ['Frutos rojos', 'Cítricos', 'Malvaviscos'],
      },
      {
        name: 'Sodas retro',
        price: 'Desde $55',
        description:
          'Latas y botellas importadas de sabores que no se ven en el súper.',
        image: 'product-03.jpg',
        imageAlt: 'Latas de refresco de colores sobre hielo',
        href: '{{whatsappUrl:Hola, quiero sodas}}',
        tag: 'Burbujas retro',
      },
      {
        name: 'Snacks y botanas',
        price: 'Desde $40',
        description: 'Salados y crujientes para compartir en la maratón.',
        image: 'product-04.jpg',
        imageAlt: 'Bolsas de botanas surtidas en una canasta',
        href: '{{whatsappUrl:Hola, quiero snacks}}',
        tag: 'Para maratonear',
        chips: ['Queso', 'Palomitas', 'Pretzels'],
      },
    ],
  },
} satisfies SectionMeta;
