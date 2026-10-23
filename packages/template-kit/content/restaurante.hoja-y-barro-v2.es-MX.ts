// GENERATED from specs/restaurante-hoja-y-barro-v2.spec.json (spec fee1819bac98, file 4f728da4a49c). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'Hoja y Barro',
    shortName: 'Hoja y Barro',
    tagline: 'Café y barra de snacks',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero hacer un pedido',
    address: 'Calle Orizaba 148, Col. Roma Norte, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@hojaybarro.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=hoja+y+barro+roma+norte',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=hoja+y+barro+roma+norte',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: café de especialidad, matcha y snacks de barra con opción sin azúcar. Menú con precios y pedidos por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Pedir',
      links: [
        {
          label: 'Menú',
          href: '#servicios',
        },
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'La barra',
          href: '#galeria',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Taza de matcha latte con espuma sobre una mesa',
      eyebrow: 'Café y barra de snacks · Roma Norte',
      title: 'Matcha <span class="lz-title__serif">a tu gusto</span>.',
      text: 'Café de especialidad, matcha batido a mano y snacks hechos aquí. Tú eliges: sin azúcar, con piloncillo o con todo.',
      primaryCta: 'Pedir por WhatsApp',
      secondaryCta: 'Ver el menú',
      secondaryHref: '#servicios',
      sticker: 'Recién batido',
      note: 'Barra abierta desde las 7:30',
      ticketTitle: 'Comanda de barra',
      ticketNo: '#0127',
      order: [
        {
          name: 'Matcha latte',
          note: 'Sin azúcar o con agave',
          price: '$78',
        },
        {
          name: 'Bowl de yogur y granola',
          note: 'Fruta de temporada',
          price: '$95',
        },
        {
          name: 'Galleta de avena',
          note: 'Con dátil, sin azúcar',
          price: '$38',
        },
      ],
      totalLabel: 'Total',
      total: '$211 MXN',
      ticketCta: 'Pedir lo mismo por WhatsApp',
    },
    marquee: {
      label: 'Lo que más sale de la barra',
      items: [
        'Matcha batido al momento',
        'Sin azúcar o con piloncillo',
        'Leches vegetales de la casa',
        'Granola tostada aquí',
        'Pan de masa madre',
        'Pedidos por WhatsApp',
      ],
    },
    about: {
      kicker: '{{index}} — Cómo pedir',
      title: 'Tu pedido en <span class="lz-title__serif">tres pasos</span>.',
      summary:
        'Pide para llevar o pasa a la barra. Elige tu bebida y tu endulzante, escríbenos por WhatsApp y recógela cuando te avisemos.',
      statement:
        'Sin sermones: aquí cada quien pide su matcha como le gusta, sin azúcar o con un toque de piloncillo.',
      image: 'about.jpg',
      imageAlt:
        'Barista sirviendo leche de avena sobre un matcha en una barra con plantas',
      sticker: 'Desde 2021',
      paragraphs: [
        '{{shortName}} empezó como una barra de cuatro bancos en la Roma Norte. Hoy hay mesas al sol, enchufes para trabajar y la misma regla: tú decides cuánto dulce lleva lo tuyo.',
        'Usamos café de Veracruz y Chiapas, matcha japonés y fruta de temporada del mercado de la colonia. La leche de avena la hacemos aquí.',
        'Los endulzantes van aparte: piloncillo, miel de agave, mascabado o nada. Si no sabes cuál, te damos a probar.',
      ],
      stats: [
        {
          value: '3',
          label: 'Endulzantes a elegir',
        },
        {
          value: '7:30',
          label: 'Abrimos entre semana',
        },
        {
          value: '4.8',
          label: 'Estrellas en Google',
        },
      ],
      features: [
        {
          title: 'Elige tu bebida',
          text: 'Mira el menú y decide: sin azúcar, o con piloncillo, agave o mascabado.',
        },
        {
          title: 'Escríbenos por WhatsApp',
          text: 'Cuéntanos qué quieres y a qué hora pasas. Te confirmamos en minutos.',
        },
        {
          title: 'Recoge en la barra',
          text: 'Tu pedido sale recién hecho, con tu nombre en el vaso o la bolsa.',
        },
      ],
      cta: 'Pedir por WhatsApp',
    },
    services: {
      kicker: '{{index}} — Menú',
      title: 'La <span class="lz-title__serif">barra</span>',
      intro:
        'Precios en pesos. Cada bebida va sin azúcar o con piloncillo, agave o mascabado, sin costo extra.',
      prices: [
        {
          name: 'Matcha latte',
          price: '$78',
          description:
            'Batido a mano con leche entera o de avena; sin azúcar o con agave.',
        },
        {
          name: 'Cold brew de olla',
          price: '$62',
          description:
            'Café frío con canela y naranja; piloncillo solo si lo pides.',
        },
        {
          name: 'Americano o espresso',
          price: '$45',
          description: 'Café de Chiapas en grano, tostado medio.',
        },
        {
          name: 'Bowl de yogur y granola',
          price: '$95',
          description:
            'Yogur griego, granola de la casa y fruta de temporada; miel aparte.',
        },
        {
          name: 'Toast de aguacate',
          price: '$110',
          description:
            'Pan de masa madre, aguacate, rábano y semillas tostadas.',
        },
        {
          name: 'Galleta de avena',
          price: '$38',
          description:
            'Sin azúcar con dátil o clásica con chispas de chocolate.',
        },
      ],
      promos: [
        {
          tag: 'Sin azúcar',
          title: 'Combo matcha y bowl por $155',
          text: 'Matcha latte y bowl de yogur, los dos sin azúcar añadida.',
          cta: 'Pedir',
          href: '{{whatsappUrl:Hola, quiero el combo matcha y bowl}}',
        },
        {
          tag: 'Para la oficina',
          title: 'Cajas de café y snacks para juntas',
          text: 'Desde 8 personas, con un día de anticipación.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una caja para oficina}}',
        },
      ],
      cta: 'Pedir',
      products: [
        {
          name: 'Matcha latte',
          price: '$78',
          description: 'Batido a mano; sin azúcar o con miel de agave.',
          image: 'product-01.jpg',
          imageAlt:
            'Matcha latte con hielo en vaso de vidrio sobre una barra de madera clara',
          href: '{{whatsappUrl:Hola, quiero pedir un matcha latte}}',
        },
        {
          name: 'Cold brew de olla',
          price: '$62',
          description: 'Con canela y naranja; piloncillo solo si lo pides.',
          image: 'product-02.jpg',
          imageAlt:
            'Café frío en vaso alto con una rodaja de naranja y una raja de canela',
          href: '{{whatsappUrl:Hola, quiero pedir un cold brew de olla}}',
        },
        {
          name: 'Bowl de yogur',
          price: '$95',
          description: 'Granola de la casa, fruta de temporada y miel aparte.',
          image: 'product-03.jpg',
          imageAlt:
            'Bowl de yogur con granola, fresas y plátano visto desde arriba',
          href: '{{whatsappUrl:Hola, quiero pedir un bowl de yogur}}',
        },
        {
          name: 'Toast de aguacate',
          price: '$110',
          description: 'Masa madre, aguacate, rábano y semillas tostadas.',
          image: 'product-04.jpg',
          imageAlt:
            'Rebanada de pan de masa madre con aguacate, rábano y semillas',
          href: '{{whatsappUrl:Hola, quiero pedir un toast de aguacate}}',
        },
        {
          name: 'Galleta de avena',
          price: '$38',
          description: 'Sin azúcar con dátil o clásica con chocolate.',
          image: 'product-05.jpg',
          imageAlt: 'Galletas de avena apiladas sobre papel encerado',
          href: '{{whatsappUrl:Hola, quiero pedir galletas de avena}}',
        },
        {
          name: 'Smoothie verde',
          price: '$85',
          description: 'Espinaca, piña y pepino; con o sin agave.',
          image: 'product-06.jpg',
          imageAlt:
            'Smoothie verde en vaso con popote de papel sobre una mesa terracota',
          href: '{{whatsappUrl:Hola, quiero pedir un smoothie verde}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — La barra',
      title: 'Hecho aquí, <span class="lz-title__serif">al momento</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Matcha batido',
          alt: 'Batidor de bambú mezclando matcha en un tazón de cerámica',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Bowl de la mañana',
          alt: 'Bowl de yogur con granola y fruta sobre una mesa de terracota',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Toast de aguacate',
          alt: 'Pan tostado con aguacate y semillas en un plato de cerámica',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Cold brew',
          alt: 'Vaso de café frío con hielo junto a una jarra de vidrio',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Las mesas al sol',
          alt: 'Café luminoso con plantas, mesas de madera y ventanales',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Galletas del día',
          alt: 'Charola con galletas de avena recién horneadas',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Smoothie verde',
          alt: 'Smoothie verde en vaso de vidrio con popote de papel',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'La barra',
          alt: 'Barra de café con máquina de espresso y frascos de granola',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quién te <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'Renata Solís',
          role: 'Fundadora y barista',
          tags: ['Matcha', 'Café de filtro'],
          image: 'team-1.jpg',
          imageAlt:
            'Retrato de Renata Solís con mandil verde detrás de la barra',
        },
        {
          name: 'Iván Cortés',
          role: 'Repostería',
          tags: ['Galletas', 'Masa madre'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Iván Cortés sonriendo junto al horno',
        },
        {
          name: 'Majo Treviño',
          role: 'Bebidas frías',
          tags: ['Cold brew', 'Smoothies'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Majo Treviño preparando una bebida con hielo',
        },
        {
          name: 'Toño Garza',
          role: 'Cocina de barra',
          tags: ['Bowls', 'Toasts'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Toño Garza con mandil en la cocina de la barra',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.8',
      summary: '210 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Pido el matcha sin azúcar y no sabe a pasto, sabe a matcha. Las galletas de dátil ya son mi antojo de la tarde.',
          author: 'Fernanda L.',
        },
        {
          text: 'Vengo a trabajar dos veces por semana: hay enchufes, buena señal y el cold brew de olla me rescata la tarde.',
          author: 'Rodrigo M.',
        },
        {
          text: 'Pedimos una caja de snacks para la junta del lunes. Llegó a tiempo y había opciones con y sin azúcar para todos.',
          author: 'Karla V.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">pedir</span>',
      intro:
        'Lo que más nos preguntan en la barra. ¿Algo más? Mándanos un mensaje.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Todas las bebidas tienen versión sin azúcar?',
          answer:
            'Sí. Cada bebida va sin azúcar añadida o endulzada con piloncillo, miel de agave o mascabado. Tú eliges al pedir.',
        },
        {
          question: '¿Qué leches vegetales tienen?',
          answer:
            'Avena, almendra y coco, sin costo extra. La de avena la preparamos aquí cada mañana.',
        },
        {
          question: '¿Puedo pedir para llevar?',
          answer:
            'Sí. Mándanos tu pedido por WhatsApp y te avisamos cuando esté listo en la barra.',
        },
        {
          question: '¿Hay opciones veganas o sin trigo?',
          answer:
            'Hay bowls, smoothies y galletas sin trigo, y varias opciones veganas. La cocina es compartida: si tienes una alergia, avísanos antes.',
        },
        {
          question: '¿Se puede trabajar en el café?',
          answer:
            'Sí, hay enchufes en la barra y en las mesas largas. Entre semana, antes de las 10:00, suele haber lugar.',
        },
        {
          question: '¿Hacen pedidos para oficinas?',
          answer:
            'Armamos cajas de café y snacks desde 8 personas. Escríbenos con un día de anticipación.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Pasa por tu <span class="lz-title__serif">matcha</span>',
      contactText:
        'Pedidos para llevar y cajas para oficina por WhatsApp en horario de barra. Para eventos, escríbenos al correo.',
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
          name: 'Roma Norte',
          address: '{{address}}',
          hours: 'Lun–Vie 7:30–20:00 · Sáb–Dom 8:30–18:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Roma Norte',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Pedir por WhatsApp',
    },
    footer: {
      about:
        'Café, matcha y snacks de barra en {{city}}, con o sin azúcar. Pedidos para llevar por WhatsApp.',
      branchesTitle: 'Dónde estamos',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      placeTitle: 'Dónde estamos',
      placeNote: 'En la Roma Norte, a pasos del parque.',
      scheduleTitle: 'Horario',
      schedule: [
        {
          label: 'Lunes a viernes',
          value: '7:30–20:00',
        },
        {
          label: 'Sábado y domingo',
          value: '8:30–18:00',
        },
      ],
      links: [
        {
          label: 'Menú',
          href: '#servicios',
        },
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'La barra',
          href: '#galeria',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'Roma Norte',
          address: '{{address}}',
          hours: 'Lun–Vie 7:30–20:00 · Sáb–Dom 8:30–18:00',
        },
      ],
    },
    cta: {
      kicker: 'Lun–Vie 7:30–20:00 · Sáb–Dom 8:30–18:00',
      title: 'Tu matcha listo cuando llegues.',
      text: 'Escríbenos antes de salir. Lo batimos al momento y lo dejamos en la barra con tu nombre.',
      primaryCta: 'Pedir por WhatsApp',
      note: 'Teléfono directo: {{phone}}',
    },
  },
} satisfies ContentPack;
