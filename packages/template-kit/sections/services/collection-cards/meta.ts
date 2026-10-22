import type { SectionMeta } from '../../../src/types';

// Stitch: estetica-alheli-colecciones-01
export default {
  slot: 'services',
  variant: 'collection-cards',
  label: 'Colecciones con foto',
  region: 'main',
  description:
    'Cabecera centrada (antetítulo en versalitas, título, filete corto) y retícula de tarjetas altas con foto, chapa numerada, nombre, descripción, duración y precio. Toda la tarjeta puede ser un enlace a WhatsApp.',
  intent:
    'Un catálogo de colecciones que se vende con la foto del trabajo, no con una lista de tarifas: para estudios de uñas, spas y salones que agrupan el servicio por estilo.',
  numbered: true,
  placeholder: { width: 800, height: 640 },
  tiers: ['basic', 'pro'],
  archetypes: ['showcase', 'soft', 'catalog'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'prices[].duration?',
    'prices[].image',
    'prices[].imageAlt',
    'prices[].href?',
  ],
  sample: {
    kicker: '{{index}} — Colecciones',
    title: 'Colecciones de <span class="lz-title__serif">autor</span>',
    intro:
      'Pedicura, parafina y retiro se confirman al agendar. Cada colección incluye limado, cutícula y esmaltado.',
    prices: [
      {
        name: 'Minimal',
        price: 'Desde $850',
        description:
          'Acabado mate aterciopelado, con líneas geométricas finas sobre una base nude.',
        duration: '90 min',
        image: 'product-01.jpg',
        imageAlt: 'Manicura mate nude de largo natural sobre una mesa clara',
        href: '{{whatsappUrl:Hola, quiero la colección Minimal}}',
      },
      {
        name: 'Francesa Alhelí',
        price: 'Desde $950',
        description:
          'Francesa clásica con líneas ultrafinas y una base nude a tu tono de piel.',
        duration: '120 min',
        image: 'product-02.jpg',
        imageAlt: 'Manicura francesa con punta blanca fina y base nude',
        href: '{{whatsappUrl:Hola, quiero la colección Francesa Alhelí}}',
      },
      {
        name: 'Nude brillante',
        price: 'Desde $700',
        description:
          'Brillo espejo sobre tonos carne elegidos para cada tono de piel.',
        duration: '75 min',
        image: 'product-03.jpg',
        imageAlt: 'Uñas nude con brillo espejo y cutícula limpia',
        href: '{{whatsappUrl:Hola, quiero la colección Nude brillante}}',
      },
      {
        name: 'Cromo de autor',
        price: 'Desde $1100',
        description:
          'Efecto metálico perlado, para un diseño de autor que se nota de lejos.',
        duration: '100 min',
        image: 'product-04.jpg',
        imageAlt: 'Uñas cromadas perladas junto a un ramo pequeño',
        href: '{{whatsappUrl:Hola, quiero la colección Cromo de autor}}',
      },
    ],
  },
} satisfies SectionMeta;
