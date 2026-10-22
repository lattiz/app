// GENERATED from specs/floreria-cardamina-v2.spec.json (spec 269653124ad6, file 3abe7670927c). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'floreria',
  locale: 'es-MX',
  business: {
    name: 'Cardamina Florería Botánica',
    shortName: 'Cardamina',
    tagline: 'Diseño floral y botánico',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero cotizar un arreglo floral',
    address: 'Calle Michoacán 87, Col. Condesa, Cuauhtémoc, 06140 CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@cardamina.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=cardamina+floreria+botanica+condesa',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=cardamina+floreria+botanica+condesa',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}}, taller floral en la Condesa, {{city}}: ramos de autor, centros de mesa y eventos con pedidos por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Cotizar',
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
          label: 'Galería',
          href: '#galeria',
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
      imageAlt:
        'Ramo de flores blancas y rosas en un florero alto sobre una mesa puesta',
      eyebrow: 'Taller floral · Condesa',
      title: 'Flores con <span class="lz-title__serif">carácter</span>.',
      text: 'Ramos, centros y piezas para eventos, armados a mano en la Condesa. Cuéntanos la ocasión por WhatsApp y te enviamos una propuesta.',
      primaryCta: 'Pedir propuesta',
      secondaryCta: 'Ver portafolio',
      secondaryHref: '#galeria',
      sticker: 'Pedidos con 48 h',
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
      kicker: '{{index}} — El estudio',
      title:
        'Un taller pequeño, <span class="lz-title__serif">pieza por pieza</span>.',
      summary:
        'Elegimos cada tallo por color y textura, y armamos pocos pedidos al día para cuidar el detalle.',
      statement:
        'Cada pieza parte de una idea: el espacio, la ocasión y la flor de temporada que mejor la cuente.',
      image: 'about.jpg',
      imageAlt: 'Manos sosteniendo un ramo de flores pequeñas',
      sticker: 'Flor de temporada',
      paragraphs: [
        '{{shortName}} es un estudio floral en la Condesa donde diseñamos ramos, centros de mesa e instalaciones botánicas.',
        'Compramos según la temporada y acondicionamos la flor antes de armar, para que dure más en tu casa.',
        'Para eventos revisamos fotos o visitamos el espacio y proponemos paleta, escala y presupuesto por escrito.',
      ],
      stats: [
        {
          value: '+9 años',
          label: 'De oficio floral',
        },
        {
          value: '48 h',
          label: 'Anticipación sugerida',
        },
        {
          value: '+120',
          label: 'Eventos diseñados',
        },
      ],
      steps: [
        {
          title: 'Elige el estilo',
          text: 'Cuéntanos la ocasión, los colores y el presupuesto; te mostramos ejemplos de piezas parecidas.',
        },
        {
          title: 'Cotiza por WhatsApp',
          text: 'Te enviamos la propuesta con precio y fecha. Un anticipo reserva tu pedido.',
        },
        {
          title: 'Recibe tu pedido',
          text: 'Lo entregamos en CDMX o lo recoges en el taller, con indicaciones para cuidar las flores.',
        },
      ],
      primaryCta: 'Escribir por WhatsApp',
    },
    services: {
      kicker: '{{index}} — Servicios',
      title:
        'Piezas y <span class="lz-title__serif">encargos</span> del taller',
      intro:
        'Los precios son de ejemplo, en pesos. Para eventos cotizamos según el espacio y la flor de la temporada.',
      prices: [
        {
          name: 'Ramo de autor',
          price: '$650',
          description:
            'Flores de temporada en una paleta corta, atadas y envueltas a mano.',
        },
        {
          name: 'Jarrón armado',
          price: '$980',
          description:
            'Composición asimétrica con follaje, lista para poner en la mesa.',
        },
        {
          name: 'Centro de mesa',
          price: 'Desde $720',
          description:
            'Para cenas y celebraciones; ajustamos la altura a tu mesa.',
        },
        {
          name: 'Arco o muro floral',
          price: 'Desde $4,500',
          description:
            'Instalación para bodas y eventos, con visita previa al espacio.',
        },
        {
          name: 'Planta con maceta',
          price: '$420',
          description:
            'Maceta de cerámica y una hoja con instrucciones de riego.',
        },
        {
          name: 'Flor semanal',
          price: '$1,800',
          description: 'Una composición nueva cada semana durante un mes.',
        },
      ],
      promos: [
        {
          tag: 'Eventos',
          title: 'Bodas y celebraciones privadas',
          text: 'Reserva una visita de diseño y recibe por escrito paleta, escala y presupuesto.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar flores para un evento}}',
        },
        {
          tag: 'Empresas',
          title: 'Flores para recepción y oficinas',
          text: 'Flor fresca para recepción y oficinas, con cambio programado y factura.',
          cta: 'Consultar',
          href: '{{whatsappUrl:Hola, quiero flores semanales para mi empresa}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Portafolio',
      title: 'Portafolio de <span class="lz-title__serif">temporada</span>',
      intro:
        'Piezas recientes del taller: ramos, centros de mesa, instalaciones y la mesa donde se arman.',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Lilas en jarra',
          alt: 'Jarra de porcelana con lilas blancas y moradas sobre fondo oscuro',
          tag: 'Edición limitada',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Rosas de jardín',
          alt: 'Rosas rosadas con tallo largo en una canasta de alambre al aire libre',
          tag: 'Ramo',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Limonium seco',
          alt: 'Ramillete de limonium seco en un florero de vidrio sobre una mesa de madera',
          tag: 'Colección',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Ramo con muro de ladrillo',
          alt: 'Ramo de flores oscuras y blancas con follaje sobre un muro de ladrillo',
          tag: 'Edición limitada',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Ramo envuelto',
          alt: 'Ramo de anémonas envuelto en papel gris, sostenido en las manos',
          tag: 'Ramo',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Invernadero',
          alt: 'Invernadero con plantas en macetas de barro',
          tag: 'Plantas',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Flor seca y pampas',
          alt: 'Dalia rosa y pampas sobre una mesa con tela de lino',
          tag: 'Colección',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Ramo de novia',
          alt: 'Ramo redondo de rosas y claveles rosas sobre fondo negro',
          tag: 'Bodas',
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
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '73 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Mandé fotos de la terraza y propusieron una paleta que respetó todo. Los centros llegaron a tiempo.',
          author: 'Regina A.',
        },
        {
          text: 'Pedí un ramo para un aniversario y la tarjeta quedó como la dicté. Se nota que lo arman con calma.',
          author: 'Luis M.',
        },
        {
          text: 'Tienen flor de temporada que no encuentro en otros lados, y explican cómo cuidarla.',
          author: 'Camila V.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Antes de encargar, esto es lo que más nos preguntan. Si falta algo, escríbenos.',
      cta: 'Escribir por WhatsApp',
      items: [
        {
          question: '¿Con cuánto tiempo encargo un ramo?',
          answer:
            'Con 24 horas basta para ramos y arreglos; para eventos conviene escribir dos semanas antes y reservar fecha.',
        },
        {
          question: '¿Entregan a domicilio?',
          answer:
            'Sí, en la Condesa, Roma y colonias cercanas. El costo se confirma según dirección y horario.',
        },
        {
          question: '¿Puedo elegir las flores?',
          answer:
            'Eliges colores y estilo; la variedad depende de la temporada y se confirma al armar el pedido.',
        },
        {
          question: '¿Cómo se cotiza un evento?',
          answer:
            'Vemos fotos o visitamos el espacio y enviamos una propuesta con paleta, escala y presupuesto.',
        },
        {
          question: '¿Cómo cuido mi arreglo?',
          answer:
            'Agua limpia cada dos días, un corte en diagonal y lejos del sol directo y de corrientes de aire.',
        },
        {
          question: '¿Cómo se paga?',
          answer:
            'Transferencia, tarjeta o efectivo. Los eventos llevan un anticipo para reservar la fecha.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Taller',
      title: 'Visita o <span class="lz-title__serif">encarga</span>',
      contactText:
        'Atendemos pedidos por WhatsApp y recibimos visitas con cita en el taller. Dinos fecha, lugar y estilo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Cotizar arreglo',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Pedir por WhatsApp',
      callCta: 'Llamar',
      whatsappNote: 'Cotizaciones y pedidos del día',
      callNote: 'Llamada directa al taller',
      emailNote: 'Bodas, eventos y empresas',
      branches: [
        {
          name: 'Condesa',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–19:00 · Dom 10:00–15:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Condesa',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Cotizar por WhatsApp',
    },
    footer: {
      about:
        'Estudio floral en la Condesa, {{city}}: ramos, eventos y plantas, con pedidos por WhatsApp.',
      branchesTitle: 'Taller',
      linksTitle: 'Secciones',
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
          label: 'Galería',
          href: '#galeria',
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
          name: 'Condesa',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–19:00 · Dom 10:00–15:00',
        },
      ],
    },
  },
} satisfies ContentPack;
