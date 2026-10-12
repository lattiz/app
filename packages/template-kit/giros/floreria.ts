import type { GiroDefinition } from '../src/spec/giro';
import { palette } from '../src/spec/presets';

/** Florería: arreglos con precio, pedidos y envíos por WhatsApp, fotos del taller. */

export default {
  id: 'floreria',
  label: 'Florería',
  category: 'florerias',
  businessCategory: 'store',
  schemaType: 'Florist',
  description: {
    pro: 'Florería con identidad propia: arreglos con precio, galería, equipo, reseñas, preguntas y pedidos',
    basico:
      'Florería de barrio: arreglos con precios, preguntas frecuentes y ubicación',
  },
  palettes: {
    'rosa-palo': palette({
      label: 'Rosa palo (claro, acento rosa)',
      scheme: 'light',
      bg: '#FBF4F3',
      surface: '#FFFFFF',
      surface2: '#F2E3E1',
      text: '#2B1B1E',
      muted: '#6A5559',
      accent: '#B0305A',
      onAccent: '#FFFFFF',
      accentText: '#C03C66',
      photoTreatment: 'warm',
      placeholder: 'blobs',
    }),
    eucalipto: palette({
      label: 'Eucalipto (claro, verde hoja)',
      scheme: 'light',
      bg: '#F1F4EF',
      surface: '#FAFCF8',
      surface2: '#E0E7DC',
      text: '#172116',
      muted: '#4F5D4C',
      accent: '#3B7346',
      onAccent: '#FFFFFF',
      accentText: '#3B7346',
      overlay: 'bg',
      photoTreatment: 'none',
      placeholder: 'arches',
    }),
    cempasuchil: palette({
      label: 'Cempasúchil (claro, naranja flor)',
      scheme: 'light',
      bg: '#FBF6EA',
      surface: '#FFFDF7',
      surface2: '#F1E6CC',
      text: '#2A2113',
      muted: '#655A44',
      accent: '#E0901F',
      onAccent: '#2A2113',
      accentText: '#A85F0A',
      overlay: 'bg',
      photoTreatment: 'warm',
      placeholder: 'dots',
    }),
    bugambilia: palette({
      label: 'Bugambilia (oscuro, acento magenta)',
      scheme: 'dark',
      bg: '#1C1220',
      surface: '#26182B',
      surface2: '#322037',
      text: '#F6ECF7',
      muted: '#C5B0C8',
      accent: '#C556D6',
      onAccent: '#1C1220',
      accentText: '#D271E0',
      photoTreatment: 'none',
      placeholder: 'grain',
    }),
    lavanda: palette({
      label: 'Lavanda seca (claro, violeta)',
      scheme: 'light',
      bg: '#F5F3F8',
      surface: '#FFFFFF',
      surface2: '#E6E1EE',
      text: '#1E1A2B',
      muted: '#575069',
      accent: '#6A4AA6',
      onAccent: '#FFFFFF',
      accentText: '#7656B4',
      photoTreatment: 'none',
      placeholder: 'rules',
    }),
  },
  fontPairs: [
    'cormorant-garamond+work-sans',
    'instrument-serif+instrument-sans',
    'bodoni-moda+karla',
    'fraunces+nunito-sans',
    'lora+figtree',
  ],
  shapes: ['organico', 'filete', 'suave', 'sutil', 'redondo'],
  sections: {
    pro: [
      { role: 'header', variant: 'centered-logo' },
      { role: 'hero', variant: 'offset-card' },
      { role: 'marquee', variant: 'ticker' },
      { role: 'about', variant: 'statement' },
      { role: 'catalog', variant: 'cards' },
      { role: 'proof', variant: 'mosaic' },
      { role: 'team', variant: 'grid' },
      { role: 'testimonials', variant: 'quote-feature' },
      { role: 'faq', variant: 'list' },
      { role: 'contact', variant: 'with-contact' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'minimal-centered' },
    ],
    basico: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'split' },
      { role: 'about', variant: 'brief' },
      { role: 'catalog', variant: 'price-list' },
      { role: 'faq', variant: 'two-col' },
      { role: 'contact', variant: 'single' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'columns' },
    ],
  },
  motion: { preset: 'editorial', progress: false },
  navLabels: {
    about: 'Nosotros',
    services: 'Arreglos',
    team: 'Floristas',
    gallery: 'Galería',
    testimonials: 'Reseñas',
    faq: 'Preguntas',
    locations: 'Pedidos',
  },
  business: {
    tagline: 'Flores y arreglos',
    whatsappMessage: 'Hola, quiero hacer un pedido de flores',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    city: 'CDMX',
    hours: 'Lun–Sáb 9:00–19:00 · Dom 9:00–14:00',
    address: 'Av. Ejemplo 123, Col. Centro, CDMX',
    branch: 'Centro',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: ramos y arreglos florales con envío el mismo día. Pedidos por WhatsApp.',
  },
  copy: {
    navbar: { cta: 'Hacer pedido' },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Ramo de flores de temporada envuelto en papel kraft',
      eyebrow: 'Florería · {{city}}',
      title:
        'Flores frescas para decir <span class="lz-title__serif">lo que sientes</span>.',
      text: 'Ramos y arreglos hechos a mano con flor de temporada. Pide por WhatsApp y lo entregamos el mismo día en {{city}}.',
      primaryCta: 'Pedir por WhatsApp',
      secondaryCta: 'Ver arreglos',
      secondaryHref: '#servicios',
      sticker: 'Envío hoy',
    },
    marquee: {
      label: 'Lo que hacemos',
      items: [
        'Ramos de temporada',
        'Arreglos para eventos',
        'Envío el mismo día',
        'Plantas de interior',
        'Pedidos por WhatsApp',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Un taller de flores <span class="lz-title__serif">de barrio</span>.',
      summary:
        'En {{shortName}} elegimos la flor cada mañana en el mercado y armamos cada ramo a mano, pensando en quién lo va a recibir.',
      statement:
        'Cada ramo empieza con una historia: para quién es, qué quieres decir y qué flor está en su mejor momento.',
      image: 'about.jpg',
      imageAlt: 'Florista armando un ramo sobre una mesa de trabajo',
      sticker: 'Hecho a mano',
      paragraphs: [
        '{{shortName}} empezó como un puesto en el mercado. Hoy tenemos taller propio y seguimos comprando la flor cada mañana.',
        'Trabajamos con flor de temporada y productores locales para que tus arreglos duren más.',
        'Cuéntanos la ocasión y te proponemos un ramo a tu medida.',
      ],
      stats: [
        { value: '+12 años', label: 'Entre flores' },
        { value: '+5,000', label: 'Ramos entregados' },
        { value: '4.9 ★', label: 'En Google' },
      ],
    },
    services: {
      kicker: '{{index}} — Arreglos',
      title: 'Ramos y <span class="lz-title__serif">arreglos</span>',
      intro:
        'Precios en pesos mexicanos. El envío en {{city}} se cotiza según la zona.',
      prices: [
        {
          name: 'Ramo de temporada',
          price: '$450',
          description: 'Flor de la semana envuelta en papel kraft.',
        },
        {
          name: 'Docena de rosas',
          price: '$690',
          description: 'Rosas de color a elegir con follaje.',
        },
        {
          name: 'Arreglo en caja',
          price: '$850',
          description: 'Caja redonda con flores frescas y tarjeta.',
        },
        {
          name: 'Centro de mesa',
          price: '$520',
          description: 'Para comidas, bodas o eventos de empresa.',
        },
        {
          name: 'Planta de interior',
          price: '$380',
          description: 'En maceta de barro, con indicaciones de cuidado.',
        },
        {
          name: 'Suscripción semanal',
          price: '$1,400',
          description: 'Un ramo cada semana durante un mes.',
        },
      ],
      promos: [
        {
          tag: 'Eventos',
          title: 'Bodas y XV años',
          text: 'Diseñamos la decoración floral completa de tu evento.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar flores para un evento}}',
        },
        {
          tag: 'Empresas',
          title: 'Flores para tu oficina',
          text: 'Arreglos semanales para recepción y salas de juntas.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero flores para mi oficina}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Galería',
      title: 'Hecho en el <span class="lz-title__serif">taller</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Ramo de temporada',
          alt: 'Ramo de flores mixtas en tonos cálidos',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Rosas',
          alt: 'Docena de rosas rojas con follaje verde',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Arreglo en caja',
          alt: 'Caja redonda con rosas y flores pequeñas',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Centro de mesa',
          alt: 'Centro de mesa bajo con flores blancas',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'El taller',
          alt: 'Mesa de trabajo con tijeras, listones y flores sueltas',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Plantas',
          alt: 'Plantas de interior en macetas de barro',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Para novias',
          alt: 'Ramo de novia con flores claras y listón',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Flor del mercado',
          alt: 'Cubetas con flores frescas en el mercado',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Floristas',
      title: 'Las manos del <span class="lz-title__serif">taller</span>',
      members: [
        {
          name: 'Lucía Fernández',
          role: 'Fundadora y florista',
          tags: ['Ramos', 'Bodas'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Lucía Fernández con un ramo en las manos',
        },
        {
          name: 'Tomás Aguilar',
          role: 'Eventos',
          tags: ['Centros de mesa', 'Montaje'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Tomás Aguilar en el taller',
        },
        {
          name: 'Valeria Cruz',
          role: 'Diseño floral',
          tags: ['Arreglos en caja', 'Color'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Valeria Cruz junto a flores sueltas',
        },
        {
          name: 'Emilio Rojas',
          role: 'Entregas',
          tags: ['Envíos', 'Puntualidad'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Emilio Rojas con una caja de flores',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.9',
      summary: '240 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Pedí un ramo a las once y a las tres ya lo tenía mi mamá en su oficina. Precioso y duró casi dos semanas.',
          author: 'Andrea V.',
        },
        {
          text: 'Hicieron las flores de nuestra boda. Entendieron perfecto lo que queríamos y todo llegó a tiempo.',
          author: 'Santiago y Ximena',
        },
        {
          text: 'Les pido flores para la recepción cada semana. Siempre frescas y diferentes.',
          author: 'Laura G.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">pedir</span>',
      intro:
        'Lo que más nos preguntan. Si tienes otra duda, escríbenos por WhatsApp.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Entregan el mismo día?',
          answer:
            'Sí, en pedidos confirmados antes de las 2 de la tarde. Para fechas como el 14 de febrero o el 10 de mayo, pide con anticipación.',
        },
        {
          question: '¿Cuánto cuesta el envío?',
          answer:
            'Depende de la zona. Mándanos la dirección por WhatsApp y te decimos el costo antes de confirmar.',
        },
        {
          question: '¿Puedo elegir las flores?',
          answer:
            'Claro. Dinos colores o flores favoritas y armamos el ramo con lo mejor de la temporada.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Transferencia, tarjeta con liga de pago o efectivo en tienda.',
        },
        {
          question: '¿Incluyen tarjeta con mensaje?',
          answer:
            'Sí, todos los arreglos incluyen una tarjeta escrita a mano con tu mensaje.',
        },
        {
          question: '¿Cómo cuido mi ramo?',
          answer:
            'Cambia el agua cada dos días, corta un poco los tallos y mantenlo lejos del sol directo.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Pedidos',
      title: 'Pide tus <span class="lz-title__serif">flores</span>',
      contactText:
        'Recibimos pedidos por WhatsApp en horario de tienda. Para bodas y eventos preferimos el correo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Hacer pedido',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Pedir por WhatsApp',
      callCta: 'Llamar',
    },
    'floating-whatsapp': { label: 'Pedir flores por WhatsApp' },
    footer: {
      about:
        'Florería en {{city}}. Ramos, arreglos y flores para eventos con envío el mismo día.',
      branchesTitle: 'Tienda',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
    },
  },
  heroAlternates: [
    'Ramos hechos a mano, <span class="lz-title__serif">el mismo día</span>.',
    'La flor de la semana, <span class="lz-title__serif">a tu puerta</span>.',
    'Flores para cada <span class="lz-title__serif">ocasión</span> en {{city}}.',
    'Regala flores <span class="lz-title__serif">frescas</span> hoy.',
  ],
  images: {
    hero: { query: 'flower bouquet kraft paper', orientation: 'landscape' },
    about: { query: 'florist arranging bouquet', orientation: 'portrait' },
    'team-1': { query: 'florist woman portrait', orientation: 'portrait' },
    'team-2': { query: 'florist man portrait', orientation: 'portrait' },
    'team-3': { query: 'flower designer portrait', orientation: 'portrait' },
    'team-4': { query: 'delivery man flowers', orientation: 'portrait' },
    'gallery-01': { query: 'seasonal flower bouquet', orientation: 'square' },
    'gallery-02': { query: 'red roses bouquet', orientation: 'square' },
    'gallery-03': { query: 'flower box arrangement', orientation: 'square' },
    'gallery-04': { query: 'white flowers centerpiece', orientation: 'square' },
    'gallery-05': { query: 'florist workshop table', orientation: 'square' },
    'gallery-06': { query: 'indoor plants clay pots', orientation: 'square' },
    'gallery-07': { query: 'bridal bouquet', orientation: 'square' },
    'gallery-08': { query: 'flower market buckets', orientation: 'square' },
  },
  demoHours: {
    mon: [{ open: '09:00', close: '19:00' }],
    tue: [{ open: '09:00', close: '19:00' }],
    wed: [{ open: '09:00', close: '19:00' }],
    thu: [{ open: '09:00', close: '19:00' }],
    fri: [{ open: '09:00', close: '19:00' }],
    sat: [{ open: '09:00', close: '19:00' }],
    sun: [{ open: '09:00', close: '14:00' }],
  },
  priceRange: '$$',
} satisfies GiroDefinition;
