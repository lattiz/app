// GENERATED from specs/floreria-flores-lupita.spec.json (spec 2ccbfca28d27, file 7bad28574ec8). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'floreria',
  locale: 'es-MX',
  business: {
    name: 'Flores Lupita',
    shortName: 'Lupita',
    tagline: 'Flores y arreglos',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero hacer un pedido de flores',
    address: 'Francisco Sosa 214, Coyoacán, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'pedidos@floreslupita.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=flores+lupita+coyoacan',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=flores+lupita+coyoacan',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: ramos y arreglos florales con envío el mismo día. Pedidos por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Hacer pedido',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Arreglos',
          href: '#servicios',
        },
        {
          label: 'Floristas',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Pedidos',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Ramo de flores de temporada envuelto en papel kraft',
      eyebrow: 'Florería · Coyoacán',
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
        {
          value: '+12 años',
          label: 'Entre flores',
        },
        {
          value: '+5,000',
          label: 'Ramos entregados',
        },
        {
          value: '4.9 ★',
          label: 'En Google',
        },
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
      branches: [
        {
          name: 'Coyoacán',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–19:00 · Dom 9:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Coyoacán',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Pedir flores por WhatsApp',
    },
    footer: {
      about:
        'Florería en {{city}}. Ramos, arreglos y flores para eventos con envío el mismo día.',
      branchesTitle: 'Tienda',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Arreglos',
          href: '#servicios',
        },
        {
          label: 'Floristas',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Pedidos',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'Coyoacán',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–19:00 · Dom 9:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
