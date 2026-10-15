// GENERATED from specs/restaurante-la-nota-azul.spec.json (spec c02e8c9d8f8c, file a93bc9be6fff). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'La Nota Azul',
    shortName: 'La Nota',
    tagline: 'Pizzería y jazz en Clavería',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero reservar una mesa',
    address: 'Calle Cobalto 45, Col. Clavería, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@lanotaazul.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=la+nota+azul+claveria',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=la+nota+azul+claveria',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: pizzas de masa lenta y jazz en vivo. Apartado por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Reservar',
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
      facts: [
        {
          value: 'Jue–Sáb',
          label: 'Esta semana en vivo: jazz desde 21:00',
        },
        {
          value: 'Sin cover',
          label: 'Entre semana, con reserva',
        },
        {
          value: 'Horno',
          label: 'De leña, a la vista del salón',
        },
      ],
      image: 'hero.jpg',
      imageAlt:
        'Salón de noche con paredes azules, luz neón roja y azul y una mesa servida',
      eyebrow: 'Pizzería y jazz · Clavería',
      title: 'Pizza de horno. Jazz en vivo.',
      text: 'Masa de fermentación lenta, ingredientes de temporada y música cada noche de jueves a sábado. Aparta tu mesa por WhatsApp.',
      primaryCta: 'Reservar mesa',
      secondaryCta: 'Ver el menú',
      secondaryHref: '#servicios',
      sticker: 'Jazz esta noche',
    },
    marquee: {
      label: 'Cada noche en La Nota',
      items: [
        'Pizza de masa lenta',
        'Jazz en vivo',
        'Horno de leña',
        'Cervezas y mezcal',
        'Reservas por WhatsApp',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title: 'Una pizzería de barrio con escenario',
      summary:
        '{{shortName}} abre en Clavería con horno de leña, un salón azul y un piano que suena los fines de semana.',
      statement:
        'Pizza de barrio, música de noche. Sin prisas y con mesa para todos.',
      image: 'about.jpg',
      imageAlt:
        'Pizzero sacando una pizza del horno de leña en una cocina abierta',
      sticker: 'Clavería',
      paragraphs: [
        '{{shortName}} empezó como una pizzería de seis mesas. Hoy el horno sigue a la vista y el salón se llena con la música.',
        'Amasamos con fermentación lenta, usamos mozzarella fresca y cambiamos la pizza del día según el mercado.',
        'Ven a cenar temprano o quédate hasta el último set: la sobremesa también es parte de la noche.',
      ],
      stats: [
        {
          value: '12 pizzas',
          label: 'En la carta de la casa',
        },
        {
          value: '3 noches',
          label: 'De jazz en vivo',
        },
        {
          value: 'Clavería',
          label: 'Colonia de {{city}}',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Menú',
      title: 'La carta de pizzas',
      intro:
        'Precios de ejemplo en pesos mexicanos, IVA incluido. Pregunta por la pizza del día.',
      prices: [
        {
          name: 'Margarita',
          price: '$185',
          description: 'Tomate, mozzarella fresca y albahaca. Clásica.',
        },
        {
          name: 'Pepperoni',
          price: '$210',
          description: 'Pepperoni, mozzarella y orégano. Clásica.',
        },
        {
          name: 'La Nota',
          price: '$245',
          description: 'Cebolla caramelizada, tocino, queso azul. De la casa.',
        },
        {
          name: 'Vegetariana',
          price: '$195',
          description: 'Calabacita, champiñón, pimiento asado y pesto.',
        },
        {
          name: 'Pizza del día',
          price: '$220',
          description: 'Ingrediente de temporada. Pregunta en mesa.',
        },
        {
          name: 'Postre de la casa',
          price: '$90',
          description: 'Calzone dulce con helado, según el día.',
        },
      ],
      promos: [
        {
          tag: 'Jazz en vivo',
          title: 'Jueves, viernes y sábado',
          text: 'El trío de la casa toca desde las 21:00. Aparta tu mesa para el show.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar para el show de jazz}}',
        },
        {
          tag: 'Eventos',
          title: 'Cumpleaños y reuniones privadas',
          text: 'El salón recibe grupos de hasta 30 personas.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar un evento}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — El ambiente',
      title: 'Del horno a la <span class="lz-title__serif">barra</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Pizza de la casa',
          alt: 'Pizza recién salida del horno de leña con cebolla caramelizada',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Margarita',
          alt: 'Pizza margarita con mozzarella fresca y albahaca sobre tabla de madera',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Masa a mano',
          alt: 'Manos estirando masa de pizza sobre harina',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'El escenario',
          alt: 'Pianista tocando en un salón con luz azul y roja',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'El salón',
          alt: 'Salón con paredes azules, mesas de madera y luz neón',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'La barra',
          alt: 'Barra con botellas y copas bajo luces de neón',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Postre de la casa',
          alt: 'Calzone dulce con helado en plato blanco',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Saxofón',
          alt: 'Saxofón sobre un atril con luz cálida de un escenario',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quién <span class="lz-title__serif">hace</span> la noche',
      members: [
        {
          name: 'Carmen Ortiz',
          role: 'Chef y fundadora',
          tags: ['Masa lenta', 'Recetas'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Carmen Ortiz con delantal en la cocina',
        },
        {
          name: 'Luis Herrera',
          role: 'Horno de leña',
          tags: ['Pizza', 'Carbón'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Luis Herrera junto al horno',
        },
        {
          name: 'Ana Ruiz',
          role: 'Postres',
          tags: ['Calzone', 'Helado'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Ana Ruiz decorando un postre',
        },
        {
          name: 'Jorge Méndez',
          role: 'Barra y música',
          tags: ['Mezcal', 'Cervezas'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Jorge Méndez detrás de la barra',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Lo que dicen',
      score: '4.8',
      summary: '320 opiniones en Google',
      allReviewsCta: 'Ver reseñas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Fuimos a escuchar el trío un jueves y la pizza de la casa nos sorprendió. Volvemos.',
          author: 'Daniela R.',
        },
        {
          text: 'Reservé por WhatsApp en dos minutos. La mesa estaba lista y el show empezó a tiempo.',
          author: 'Miguel A.',
        },
        {
          text: 'Hicimos el cumpleaños de mi mamá en el salón. Todo llegó a tiempo y la música fue perfecta.',
          author: 'Paola S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">llegar</span>',
      intro:
        'Respuestas cortas a lo que más nos escriben. ¿Otra duda? Pregúntanos en el chat.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Necesito reservar?',
          answer:
            'Los jueves, viernes y sábados sí te recomendamos reservar, sobre todo para el show de jazz.',
        },
        {
          question: '¿Cobran cover para el jazz?',
          answer:
            'Entre semana no hay cover con reserva. Los fines de semana, pregunta por WhatsApp.',
        },
        {
          question: '¿Tienen opciones vegetarianas?',
          answer:
            'Sí. La pizza vegetariana y dos entradas sin carne están siempre en la carta.',
        },
        {
          question: '¿Hacen pedidos para llevar?',
          answer:
            'Sí. Mándanos tu pedido por chat y te avisamos a qué hora pasar por él.',
        },
        {
          question: '¿Tienen mezcal y cerveza?',
          answer:
            'Sí, con consumo responsable. Pregunta a nuestro equipo de barra por la opción de la casa.',
        },
        {
          question: '¿Hay estacionamiento?',
          answer:
            'Sin estacionamiento propio. Hay uno público a una cuadra del local.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Reservar',
      title: 'Aparta tu <span class="lz-title__serif">mesa</span>',
      contactText:
        'Mesas y pedidos para llevar se gestionan por WhatsApp durante el horario. Eventos, por correo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar mesa',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Reservar por WhatsApp',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Mar–Dom 13:00–23:00 · Lun cerrado',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Reservar por WhatsApp',
    },
    footer: {
      about:
        'Pizzería y jazz en vivo en Clavería, {{city}}. Mesas y pedidos por chat de WhatsApp.',
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
          hours: 'Mar–Dom 13:00–23:00 · Lun cerrado',
        },
      ],
    },
  },
} satisfies ContentPack;
