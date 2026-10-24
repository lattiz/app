// GENERATED from specs/floreria-casa-confeti-v2.spec.json (spec 361edbc44e43, file 427be2fbc4bf). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'floreria',
  locale: 'es-MX',
  business: {
    name: 'Casa Confeti',
    shortName: 'Casa Confeti',
    tagline: 'Salón de fiestas infantiles',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero cotizar una fiesta infantil',
    address: 'Calle Pilares 123, Col. Narvarte Poniente, Benito Juárez, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@casaconfeti.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=casa+confeti+narvarte',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=casa+confeti+narvarte',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: salón para fiestas infantiles con paquetes, animación y mesa de dulces para cumpleaños.',
  },
  sections: {
    navbar: {
      cta: 'Cotizar fiesta',
      links: [
        {
          label: 'La fiesta',
          href: '#nosotros',
        },
        {
          label: 'Paquetes',
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
          label: 'Reservas',
          href: '#sucursales',
        },
      ],
      notice: 'Reservas: martes a domingo, 10:00–20:00',
    },
    hero: {
      image: 'hero.jpg',
      imageAlt:
        'Pastel de fresas con merengues entre globos y banderines, visto desde arriba',
      eyebrow: 'Salón de fiestas · Narvarte',
      title:
        'Tu fiesta, lista <span class="lz-title__serif">para disfrutarla.</span>',
      text: 'Montamos el salón, animamos los juegos y recogemos al final. Tú solo cuéntanos la fecha en {{city}}.',
      primaryCta: 'Cotizar mi fecha',
      secondaryCta: 'Ver paquetes',
      secondaryHref: '#servicios',
      sticker: 'Fechas disponibles',
      facts: [
        {
          value: '50',
          label: 'Niños por fiesta como máximo',
        },
        {
          value: '3 h',
          label: 'De salón, juegos y mesa de dulces',
        },
        {
          value: '2–10',
          label: 'Años, con juegos para cada edad',
        },
      ],
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
      kicker: '{{index}} — El día',
      title: 'Así transcurre <span class="lz-title__serif">tu fiesta</span>',
      summary:
        'Tres horas con cada momento a su hora, para que sepas qué viene sin preguntar.',
      statement:
        'Los papás conviven; el equipo se ocupa del montaje, los juegos y la limpieza.',
      primaryCta: 'Cotizar mi fecha',
      moments: [
        {
          time: '11:00',
          title: 'Llegada',
          text: 'Recibimos a los invitados con el salón ya montado.',
        },
        {
          time: '11:30',
          title: 'Juegos',
          text: 'Animación y juegos guiados para varias edades.',
        },
        {
          time: '13:00',
          title: 'Mesa de dulces',
          text: 'Se sirve la comida y los dulces en la mesa.',
        },
        {
          time: '13:45',
          title: 'Pastel y piñata',
          text: 'Velas, canción y piñata para todos.',
        },
        {
          time: '14:00',
          title: 'Despedida',
          text: 'Cada niño se lleva su recuerdo y recogemos el salón.',
        },
      ],
      image: 'about.jpg',
      imageAlt: 'Florista armando un ramo sobre una mesa de trabajo',
      sticker: 'Hecho a mano',
      paragraphs: [],
      stats: [],
    },
    services: {
      kicker: '{{index}} — Paquetes',
      title:
        'Elige el <span class="lz-title__serif">paquete</span> de tu fiesta',
      intro:
        'Precios de referencia en MXN; sábados, domingos y temporada alta se confirman según la fecha.',
      cta: 'Cotizar',
      prices: [
        {
          name: 'Fiesta Chispa',
          price: '$6,500',
          description: 'Para 20 niños, en una tarde sencilla.',
          includes: [
            '3 horas de salón',
            'Mesa de dulces',
            'Anfitrión durante la fiesta',
          ],
        },
        {
          name: 'Fiesta Globo',
          price: '$9,800',
          description: 'Para 30 niños, con animación.',
          badge: 'Más pedido',
          includes: [
            'Animación y juegos guiados',
            'Pastel y piñata',
            'Montaje y limpieza',
          ],
        },
        {
          name: 'Fiesta Confeti',
          price: '$13,500',
          description: 'Para 50 niños, con show.',
          includes: [
            'Show en el salón',
            'Pizza y dulces',
            'Decoración temática',
          ],
        },
      ],
      extrasLabel: 'Extras',
      extras: [
        {
          name: 'Bautizo o comunión',
          price: '$8,200',
        },
        {
          name: 'Hora extra',
          price: '$1,200',
        },
        {
          name: 'Piñata y bolos',
          price: '$850',
        },
      ],
      promos: [
        {
          tag: 'Entre semana',
          title: 'Martes a viernes con tarifa más baja',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una fiesta entre semana}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Galería',
      title: 'Fiestas <span class="lz-title__serif">en el salón</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Mesa rosa',
          alt: 'Mesa rosa con pastel, peluches y globos; una invitada con gorro de fiesta',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Globos',
          alt: 'Racimo de globos morados',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Pastel',
          alt: 'Pastel rosa decorado con macarons y merengues',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Alberca de pelotas',
          alt: 'Niño sonriendo dentro de una alberca de pelotas de colores',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Piñata',
          alt: 'Piñata de colores sobre confeti en el piso',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'En familia',
          alt: 'Familia celebrando un cumpleaños frente a letras rosas',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Serpentinas',
          alt: 'Serpentinas de colores en primer plano',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Festejados',
          alt: 'Dos niños pequeños posando junto a globos de cumpleaños',
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
      summary: '240 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Celebramos los cinco años de mi hija y los niños no querían irse. Yo no cargué ni una bolsa.',
          author: 'Mariana P.',
          place: 'Cumpleaños de 5 años',
        },
        {
          text: 'El salón estaba limpio y el equipo cuidó mucho a los más chiquitos. Ya apartamos fecha para el próximo año.',
          author: 'Jorge y Alicia',
          place: 'Fiesta de 4 años',
        },
        {
          text: 'Cotizamos por WhatsApp en minutos y respetaron el horario completo de la fiesta.',
          author: 'Daniela R.',
          place: 'Cumpleaños de 7 años',
        },
      ],
      title: 'Lo que cuentan <span class="lz-title__serif">las familias</span>',
      intro: 'Mensajes de papás y mamás que festejaron en la Narvarte.',
      cta: 'Dejar una reseña',
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">apartar tu fecha</span>',
      intro: 'Lo que más preguntan los papás. Si falta algo, escríbenos.',
      cta: 'Escribir por WhatsApp',
      items: [
        {
          question: '¿Cómo aparto la fecha?',
          answer:
            'Pagas un anticipo y te confirmamos la fecha por WhatsApp; el resto se liquida antes de la fiesta.',
        },
        {
          question: '¿Cuántos niños caben?',
          answer:
            'Hasta 50 niños, más los adultos que los acompañan. Para más invitados armamos otra propuesta.',
        },
        {
          question: '¿Puedo traer mi pastel?',
          answer: 'Sí. Para la comida, revisa qué incluye cada paquete.',
        },
        {
          question: '¿Cuánto dura?',
          answer:
            'Tres horas de salón; si hace falta más tiempo se suma una hora extra.',
        },
        {
          question: '¿Y si cambio la fecha?',
          answer:
            'Avísanos 15 días antes y la reprogramamos según disponibilidad, sin costo.',
        },
        {
          question: '¿Pueden quedarse los adultos?',
          answer: 'Sí, hay mesas y sillas para ellos durante toda la fiesta.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Reservas',
      title: 'Aparta tu <span class="lz-title__serif">fecha</span>',
      contactText:
        'Escríbenos con la fecha, la edad y cuántos niños vendrán. Si son muchos, mejor por correo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Cotizar fiesta',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Cotizar por WhatsApp',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Narvarte',
          address: '{{address}}',
          hours: 'Mar–Vie 10:00–18:00 · Sáb–Dom 9:00–20:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Narvarte',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Cotizar fiesta por WhatsApp',
    },
    footer: {
      about:
        'Salón de fiestas infantiles en {{city}}, con paquetes, juegos y mesa de dulces.',
      branchesTitle: 'Salón',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'La fiesta',
          href: '#nosotros',
        },
        {
          label: 'Paquetes',
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
          label: 'Reservas',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'Narvarte',
          address: '{{address}}',
          hours: 'Mar–Vie 10:00–18:00 · Sáb–Dom 9:00–20:00',
        },
      ],
    },
    cta: {
      title: 'Cuéntanos la fecha y la edad',
      text: 'Te respondemos por WhatsApp con paquete y disponibilidad.',
      primaryCta: 'Cotizar por WhatsApp',
      secondaryCta: 'Ver preguntas',
      secondaryHref: '#preguntas',
    },
  },
} satisfies ContentPack;
