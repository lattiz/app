// GENERATED from specs/restaurante-trigo-y-brasa.spec.json (spec bc3ab901f64d, file 6a7bfe687672). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'Trigo y Brasa',
    shortName: 'Trigo',
    tagline: 'Panadería',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero hacer un encargo de pan',
    address: 'Av. Cuitláhuac 000, Col. Clavería, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@trigoybrasa.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=trigo+y+brasa+claveria',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=trigo+y+brasa+claveria',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: pan de masa madre, bollería y café. Encargos por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Hacer encargo',
      notice: 'Hoy horneamos 07:00–16:00 · Sin cita',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Menú',
          href: '#servicios',
        },
        {
          label: 'Cocina',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Reservar',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      detailImage: 'gallery-07.jpg',
      detailAlt: 'Rosca decorada con frutas cristalizadas sobre una mesa',
      image: 'hero.jpg',
      imageAlt:
        'Hogazas de pan sobre una mesa de madera junto a una ventana con luz de mañana',
      eyebrow: 'Pan de hoy · Clavería',
      title: 'Pan de masa madre',
      text: 'Harina, agua, sal y tiempo. Aparta tu pan.',
      primaryCta: 'Haz tu encargo',
      secondaryCta: 'Ver la vitrina',
      secondaryHref: '#servicios',
      sticker: 'Mesa para hoy',
    },
    marquee: {
      label: 'Lo que sale del horno',
      items: [
        'Masa madre',
        'Pan dulce del día',
        'Café de la casa',
        'Encargos con anticipación',
        'Tandas por la mañana',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title: 'Masa con <span class="lz-title__serif">calma</span>',
      summary:
        'En {{shortName}} trabajamos la masa con calma: fermentación lenta, horneado en tandas y pan que se termina el mismo día.',
      statement:
        'Pan hecho a mano, con la masa en su tiempo. Sin prisas en la mesa ni en el horno.',
      image: 'about.jpg',
      imageAlt:
        'Panadero dando forma a una masa sobre una mesa de trabajo enharinada',
      sticker: 'Hecho a mano',
      paragraphs: [
        '{{shortName}} es una panadería de barrio con un horno, una mesa de trabajo y una barra de café.',
        'Cada masa madre se alimenta a diario. La fermentación toma el tiempo que necesita y no el que nos conviene.',
        'Ven temprano: lo que sale primero es lo que mejor se vende. El resto del día hay poco, y nunca de más.',
      ],
      stats: [
        {
          value: '48 h',
          label: 'Fermentación (muestra)',
        },
        {
          value: '7:00',
          label: 'Primera tanda del día',
        },
        {
          value: '3 tandas',
          label: 'Al horno cada mañana',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Vitrina',
      title: 'La <span class="lz-title__serif">vitrina</span>',
      intro:
        'Precios de ejemplo en pesos, IVA incluido. Pregunta por la tanda de hoy.',
      prices: [
        {
          name: 'Pan de masa madre',
          price: '$65',
          description: 'Hogaza de 800 g, corteza crujiente y miga abierta.',
        },
        {
          name: 'Pan de centeno',
          price: '$85',
          description: 'Hogaza de centeno con semillas, 900 g.',
        },
        {
          name: 'Pan dulce del día',
          price: '$25',
          description: 'Concha, cuerno o rol, según la tanda.',
        },
        {
          name: 'Bollería de mantequilla',
          price: '$45',
          description: 'Croissant de mantequilla, horneado al amanecer.',
        },
        {
          name: 'Rosca de temporada',
          price: '$290',
          description: 'Rosca para 8 personas, por encargo.',
        },
        {
          name: 'Café de la casa',
          price: '$40',
          description: 'Espresso o café de filtro, en taza.',
        },
      ],
      promos: [
        {
          tag: 'Encargos',
          title: 'Roscas y pasteles por encargo',
          text: 'Pídelos con 48 horas de anticipación.',
          cta: 'Haz tu encargo',
          href: '{{whatsappUrl:Hola, quiero hacer un encargo de pan}}',
        },
        {
          tag: 'Eventos',
          title: 'Mesas de pan para eventos',
          text: 'Armamos mesas de pan para reuniones de hasta 40 personas.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una mesa de pan}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Del horno',
      title:
        'De la mesa de trabajo a <span class="lz-title__serif">tu mesa</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Hogazas recién horneadas',
          alt: 'Hogazas de masa madre con corteza dorada sobre una tabla de madera',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Pan dulce',
          alt: 'Conchas y cuernos sobre una charola de metal',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Masa en reposo',
          alt: 'Masa de pan cubierta con un paño sobre la mesa de trabajo',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Café de la casa',
          alt: 'Taza de café con leche sobre una mesa de madera',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'La vitrina',
          alt: 'Vitrina con pan de la mañana',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'El horno',
          alt: 'Horno de panadería con pan en la pala',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Roscas por encargo',
          alt: 'Rosca de temporada con fruta cristalizada, lista para recoger',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Mesa de pan',
          alt: 'Mesa con variedad de panes para un evento',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quién <span class="lz-title__serif">amasa</span>',
      members: [
        {
          name: 'Carmen Ortiz',
          role: 'Maestra panadera',
          tags: ['Masa madre', 'Hogazas'],
          image: 'team-1.jpg',
          imageAlt:
            'Retrato de Carmen Ortiz con delantal en la mesa de trabajo',
        },
        {
          name: 'Luis Herrera',
          role: 'Horno y producción',
          tags: ['Tandas', 'Centeno'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Luis Herrera junto al horno',
        },
        {
          name: 'Ana Ruiz',
          role: 'Bollería y pan dulce',
          tags: ['Concha', 'Croissant'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Ana Ruiz con una charola de pan dulce',
        },
        {
          name: 'Jorge Méndez',
          role: 'Café y atención',
          tags: ['Espresso', 'Filtro'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Jorge Méndez detrás de la barra de café',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Clientes',
      score: '4.8',
      summary: '320 opiniones en Google',
      allReviewsCta: 'Ver reseñas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'La hogaza de centeno dura toda la semana. Vengo desde que abrieron.',
          author: 'Daniela R.',
        },
        {
          text: 'Hice mi encargo de rosca por WhatsApp y llegó puntual, con la fruta cristalizada que pedí.',
          author: 'Miguel A.',
        },
        {
          text: 'Desayunamos el pan dulce con café en la barra. Tranquilo y con buen pan.',
          author: 'Paola S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro:
        'Lo que más escriben nuestros clientes, en pocas líneas. Otra duda: escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿A qué hora se acaba el pan?',
          answer:
            'Las primeras tandas salen a las 7:00. Después de las 14:00 queda poco, sobre todo de pan dulce.',
        },
        {
          question: '¿Con cuánto tiempo debo hacer un encargo?',
          answer:
            'Roscas y pasteles con 48 horas de anticipación. Para mesas de pan, escríbenos con la fecha.',
        },
        {
          question: '¿Tienen opciones sin lácteo?',
          answer:
            'Algunas hogazas no llevan lácteo. Pregunta en el mostrador por la tanda del día.',
        },
        {
          question: '¿Hay lugar para sentarse?',
          answer:
            'Hay mesas junto a la barra. También puedes llevar tu café o pan.',
        },
        {
          question: '¿Hacen pedidos para llevar?',
          answer:
            'Sí. Mándanos tu pedido por WhatsApp y te avisamos a qué hora pasar.',
        },
        {
          question: '¿Hay estacionamiento?',
          answer:
            'No tenemos estacionamiento propio, pero hay uno público a una cuadra.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Encargos',
      title: 'Haz tu <span class="lz-title__serif">encargo</span>',
      contactText:
        'Encargos y pedidos por WhatsApp en el horario de la panadería. Para mesas de pan de eventos, escribe con la fecha.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Hacer encargo',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Encargo por WhatsApp',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Mar–Dom 07:00–16:00 · Lun cerrado',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Hacer encargo por WhatsApp',
    },
    footer: {
      about:
        'Panadería artesanal en Clavería, {{city}}. Encargos y pedidos por WhatsApp.',
      branchesTitle: 'Dónde estamos',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Menú',
          href: '#servicios',
        },
        {
          label: 'Cocina',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Reservar',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Mar–Dom 07:00–16:00 · Lun cerrado',
        },
      ],
    },
  },
} satisfies ContentPack;
