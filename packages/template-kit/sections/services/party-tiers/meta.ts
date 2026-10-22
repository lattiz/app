import type { SectionMeta } from '../../../src/types';

// Stitch: floreria-casa-confeti-salon-de-fiestas-infantiles-01
export default {
  slot: 'services',
  variant: 'party-tiers',
  label: 'Paquetes con checklist',
  region: 'main',
  description:
    'Cabecera centrada (antetítulo, título y una línea) y los paquetes como columnas del mismo ancho: nombre, descripción, precio grande, filete y una lista con marca de check. Con tres, el central sale elevado, en el color de texto del tema, y puede llevar una insignia. Debajo, una fila de extras en cápsulas y una tira de promociones.',
  intent:
    'Comparar dos a cuatro paquetes cerrados por lo que incluye cada uno, con uno recomendado; para salones de fiestas, estéticas, gimnasios, clínicas y servicios con planes.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['booking', 'soft'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'cta?',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'prices[].includes?',
    'prices[].badge?',
    'extrasLabel?',
    'extras[].name',
    'extras[].price',
    'promos[].tag?',
    'promos[].title',
    'promos[].cta',
    'promos[].href',
  ],
  sample: {
    kicker: '{{index}} — Paquetes',
    title: 'Paquetes de <span class="lz-title__serif">fiesta</span>',
    intro: 'Montos de referencia en MXN; fines de semana se cotizan por fecha.',
    cta: 'Cotizar este paquete',
    prices: [
      {
        name: 'Fiesta Chispa',
        price: '$6,500',
        description: 'Para 20 niños y una tarde tranquila.',
        includes: ['3 horas de salón', 'Mesa de dulces', 'Anfitrión'],
      },
      {
        name: 'Fiesta Globo',
        price: '$9,800',
        description: 'Para 30 niños, con animación.',
        badge: 'Más pedido',
        includes: [
          'Animación y juegos',
          'Pastel y piñata',
          'Montaje y limpieza',
        ],
      },
      {
        name: 'Fiesta Confeti',
        price: '$13,500',
        description: 'Para 50 niños, con show.',
        includes: ['Show', 'Pizza y dulces', 'Decoración temática'],
      },
    ],
    extrasLabel: 'Extras',
    extras: [
      { name: 'Hora extra', price: '$1,200' },
      { name: 'Piñata y bolos', price: '$850' },
    ],
    promos: [
      {
        tag: 'Entre semana',
        title: 'Martes a viernes, tarifa más baja',
        cta: 'Cotizar',
        href: '{{whatsappUrl:Hola, quiero cotizar una fiesta entre semana}}',
      },
    ],
  },
} satisfies SectionMeta;
