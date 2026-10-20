// GENERATED from specs/restaurante-casa-rosa-mantequilla.spec.json (spec 29bd20df6baf, file 35c31b307b2f). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'Casa Rosa Mantequilla',
    shortName: 'Casa Rosa',
    tagline: 'Repostería artesanal',
    city: 'Puebla',
    phone: '+52 222 000 0000',
    whatsapp: '5212220000000',
    whatsappMessage: 'Hola, quiero hacer un pedido en Casa Rosa Mantequilla',
    address: 'Calle 5 Poniente 0000, La Paz, Puebla, Pue.',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@casarosamantequilla.example',
    googleReviewsUrl:
      'https://www.google.com/search?q=casa+rosa+mantequilla+la+paz',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=casa+rosa+mantequilla+la+paz',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}}, repostería artesanal en la colonia La Paz, Puebla. Pasteles, croissants y macarons por encargo, con pedido por WhatsApp.',
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
          label: 'Menú',
          href: '#servicios',
        },
        {
          label: 'Platillos',
          href: '#galeria',
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
      note: 'Anticipo del 50 % · Respuesta en minutos',
      image: 'hero.jpg',
      imageAlt:
        'Pastel de crema turquesa con volantes sobre un pedestal, junto a un ramo de gerberas rosas',
      eyebrow: 'Repostería artesanal · La Paz',
      title: 'Mantequilla, masa y <span class="lz-title__serif">tiempo</span>.',
      text: 'Pasteles, croissants y macarons hechos cada mañana en La Paz. Encarga por WhatsApp y recoge en tienda.',
      primaryCta: 'Hacer pedido',
      secondaryCta: 'Ver la carta',
      secondaryHref: '#servicios',
      sticker: 'Horneado hoy',
    },
    marquee: {
      label: 'Lo que nos piden siempre',
      items: [
        'Cocina de mercado',
        'Tortillas a mano',
        'Mezcal y vinos mexicanos',
        'Postres de la casa',
        'Reservas por WhatsApp',
      ],
    },
    about: {
      kicker: '{{index}} — El obrador',
      title:
        'Un oficio que huele a <span class="lz-title__serif">horno</span>.',
      summary:
        'En {{shortName}} laminamos la masa a mano, usamos mantequilla y horneamos cada mañana. Los pasteles se hacen por encargo, con el tiempo que pide cada capa.',
      body: 'Laminamos la masa a mano, horneamos por tandas y decoramos cada pastel a la medida del encargo.',
      imageAlt:
        'Manos de repostero espolvoreando harina sobre la masa, con unas varillas al fondo',
      plateLabel: 'Obrador de repostería',
      plateTitle: 'Hojaldre y mantequilla',
      plateAside: 'Desde 2018',
      features: [
        {
          title: 'Mantequilla en cada capa',
          text: 'Laminamos la masa a mano para que el croissant salga hojaldrado.',
        },
        {
          title: 'Masa madre reposada',
          text: 'Fermenta con calma antes de entrar al horno por la mañana.',
        },
        {
          title: 'Horneado del día',
          text: 'Cada tanda sale a su hora y se entrega el mismo día.',
        },
      ],
      statement:
        'Cada pieza lleva mantequilla, masa reposada y un acabado a mano: así se hornea en {{shortName}}.',
      image: 'about.jpg',
      sticker: 'Desde 2018',
      paragraphs: [
        '{{shortName}} abrió como un horno pequeño en La Paz, con una mesa de mármol y una receta de croissant.',
        'Hoy preparamos pasteles por encargo, pan de mantequilla y macarons, siempre en tandas del día.',
        'Pasa a recoger tu pedido y llévate la caja todavía tibia.',
      ],
      stats: [
        {
          value: 'Desde 2018',
          label: 'Horneando en {{city}}',
        },
        {
          value: '3 reposteras',
          label: 'En el obrador',
        },
        {
          value: 'Tandas diarias',
          label: 'Del horno a la caja',
        },
      ],
    },
    services: {
      kicker: '{{index}} — La carta',
      title: 'La <span class="lz-title__serif">carta</span>',
      intro:
        'Precios de muestra. Los pasteles se encargan con dos días de anticipación.',
      prices: [
        {
          name: 'Pastel de vainilla y fresa',
          price: '$680',
          description:
            'Para 10 porciones, con crema de mantequilla y fresas frescas.',
        },
        {
          name: 'Pastel rosa cuarzo',
          price: '$780',
          description:
            'Bizcocho de vainilla con glaseado rosa y flores de azúcar.',
        },
        {
          name: 'Croissant de mantequilla',
          price: '$48',
          description: 'Masa laminada a mano, horneado cada mañana.',
        },
        {
          name: 'Caja de 6 macarons',
          price: '$210',
          description:
            'Rosa, vainilla, lavanda y pistache, rellenos de ganache.',
        },
        {
          name: 'Galletas de vainilla',
          price: '$120',
          description: 'Media docena con glaseado real, decoradas a mano.',
        },
        {
          name: 'Tarta de frutos rojos',
          price: '$360',
          description:
            'Base de mantequilla, crema pastelera y fruta de temporada.',
        },
      ],
      promos: [
        {
          tag: 'Por encargo',
          title: 'Pastel para tu celebración',
          text: 'Cuéntanos fecha, porciones y sabor, y te enviamos una propuesta.',
          cta: 'Encargar',
          href: '{{whatsappUrl:Hola, quiero encargar un pastel}}',
        },
        {
          tag: 'Mesa dulce',
          title: 'Cajas para regalar',
          text: 'Macarons y galletas en caja, listos para recoger.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una caja de regalo}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Del horno',
      title: 'Hecho a <span class="lz-title__serif">mano</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Pastel de pétalos',
          alt: 'Pastel de frutos rojos con pétalos rosas, visto desde arriba, junto a una taza de café',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Croissants del día',
          alt: 'Croissants dorados de mantequilla apilados',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Macarons rosa',
          alt: 'Macarons rosas apilados sobre un fondo rosa',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Fresas con crema',
          alt: 'Postre de fresas con crema batida y mermelada en un plato',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Tarta de frambuesa',
          alt: 'Tarta con crema pastelera, frambuesas y crema batida',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Galletas decoradas',
          alt: 'Galletas en forma de corazón con glaseado real en rosa, verde y azul',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Cupcakes rosa',
          alt: 'Cupcakes con glaseado rosa y corazones de azúcar',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'El mostrador',
          alt: 'Vitrina de vidrio con pan y bollería',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Cocina',
      title: 'Quién <span class="lz-title__serif">cocina</span>',
      members: [
        {
          name: 'Carmen Ortiz',
          role: 'Chef y fundadora',
          tags: ['Cocina de mercado', 'Guisos'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Carmen Ortiz con filipina blanca en la cocina',
        },
        {
          name: 'Luis Herrera',
          role: 'Parrilla',
          tags: ['Carbón', 'Pescados'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Luis Herrera junto a la parrilla',
        },
        {
          name: 'Ana Ruiz',
          role: 'Repostería',
          tags: ['Postres', 'Pan'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Ana Ruiz decorando un pastel',
        },
        {
          name: 'Jorge Méndez',
          role: 'Sala y barra',
          tags: ['Mezcal', 'Servicio'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Jorge Méndez detrás de la barra',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.8',
      summary: 'Opiniones de ejemplo',
      allReviewsCta: 'Leer todas',
      writeReviewCta: 'Escribir una opinión',
      reviews: [
        {
          text: 'Encargué el pastel de cumpleaños de mi mamá y llegó justo como lo imaginé. La crema no era empalagosa.',
          author: 'Daniela R.',
        },
        {
          text: 'Los croissants todavía estaban tibios cuando pasé por ellos. Ya es mi parada de los sábados.',
          author: 'Miguel A.',
        },
        {
          text: 'Pedí una caja de macarons para un regalo y la presentación fue preciosa. Reservé por WhatsApp en minutos.',
          author: 'Paola S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">encargar</span>',
      intro:
        'Lo que más nos preguntan sobre pedidos. Si falta algo, escríbenos.',
      cta: 'Escribir por WhatsApp',
      items: [
        {
          question: '¿Con cuánta anticipación encargo?',
          answer:
            'Los pasteles se piden con dos días de anticipación; en fechas especiales, con una semana. Croissants y macarons, con un día.',
        },
        {
          question: '¿Piden anticipo?',
          answer:
            'Sí, pedimos la mitad al confirmar el encargo y el resto al recogerlo. Aceptamos efectivo y transferencia.',
        },
        {
          question: '¿Qué hago si tengo una alergia?',
          answer:
            'Avísanos al hacer el pedido. Trabajamos con harina, huevo, lácteos y frutos secos en el mismo obrador.',
        },
        {
          question: '¿Hacen entregas?',
          answer:
            'Por ahora recoges en tienda, en La Paz. Si necesitas envío, escríbenos y vemos opciones.',
        },
        {
          question: '¿Puedo cambiar el sabor o la fecha?',
          answer:
            'Sí, avísanos con 24 horas de anticipación y lo ajustamos según la agenda del obrador.',
        },
        {
          question: '¿Cuánto dura un pastel?',
          answer:
            'Se disfruta mejor el mismo día; guardado en refrigerador, aguanta hasta tres días.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Pedidos',
      title: 'Pasa por <span class="lz-title__serif">La Paz</span>',
      contactText:
        'Pedidos y recogida por WhatsApp en horario de tienda. Sin formularios.',
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
          name: 'La Paz',
          address: '{{address}}',
          hours: 'Mar–Sáb 9:00–19:00 · Dom 9:00–15:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal La Paz',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Hacer pedido por WhatsApp',
    },
    footer: {
      about:
        'Repostería artesanal en Puebla. Pasteles por encargo, croissants y macarons, con pedido por WhatsApp.',
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
          label: 'Platillos',
          href: '#galeria',
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
          name: 'La Paz',
          address: '{{address}}',
          hours: 'Mar–Sáb 9:00–19:00 · Dom 9:00–15:00',
        },
      ],
    },
  },
} satisfies ContentPack;
