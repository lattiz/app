import type { SectionMeta } from '../../../src/types';

// Stitch: floreria-botanical-editorial-system-01
export default {
  slot: 'gallery',
  variant: 'staggered-frames',
  label: 'Galería',
  region: 'main',
  description:
    'Cabecera centrada (antetítulo en versalitas, título serif y una línea) y ocho fotos 4:5 en dos columnas: cada una en un marco con filete y relleno interno, pie con el nombre a la izquierda y una etiqueta en versalitas a la derecha. La columna derecha baja para escalonar. En móvil cae a una columna y el pie se apila.',
  intent:
    'Un portafolio editorial de marcos alineados, no una tira ni un mosaico: dos columnas escalonadas con pie de nombre y etiqueta; para florerías, estéticas y talleres con fotos de pieza.',
  numbered: true,
  placeholder: { width: 800, height: 1000 },
  tiers: ['pro'],
  archetypes: ['editorial', 'minimal', 'showcase'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'items[].image',
    'items[].alt',
    'items[].caption',
    'items[].tag?',
  ],
  sample: {
    kicker: 'Portafolio editorial',
    title: 'Portafolio <span class="lz-title__serif">editorial</span>',
    intro:
      'Una mirada a las piezas recientes del taller: ramos, instalaciones y lo que sale de la mesa de trabajo.',
    items: [
      {
        image: 'gallery-01.jpg',
        caption: 'Ramo de temporada',
        alt: 'Ramo de flores mixtas en tonos cálidos',
        tag: 'Edición limitada',
      },
      {
        image: 'gallery-02.jpg',
        caption: 'Rosas',
        alt: 'Docena de rosas con follaje verde',
        tag: 'Taller',
      },
      {
        image: 'gallery-03.jpg',
        caption: 'Arreglo en caja',
        alt: 'Caja redonda con rosas y flores pequeñas',
        tag: 'Instalación',
      },
      {
        image: 'gallery-04.jpg',
        caption: 'Centro de mesa',
        alt: 'Centro de mesa bajo con flores blancas',
        tag: 'Edición limitada',
      },
      {
        image: 'gallery-05.jpg',
        caption: 'El taller',
        alt: 'Mesa de trabajo con tijeras, listones y flores sueltas',
        tag: 'Taller',
      },
      {
        image: 'gallery-06.jpg',
        caption: 'Plantas',
        alt: 'Plantas de interior en macetas de barro',
        tag: 'Colección',
      },
      {
        image: 'gallery-07.jpg',
        caption: 'Para novias',
        alt: 'Ramo de novia con flores claras y listón',
        tag: 'Instalación',
      },
      {
        image: 'gallery-08.jpg',
        caption: 'Flor del mercado',
        alt: 'Cubetas con flores frescas en el mercado',
        tag: 'Taller',
      },
    ],
  },
} satisfies SectionMeta;
