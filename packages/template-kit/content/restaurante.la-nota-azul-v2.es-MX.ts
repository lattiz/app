// GENERATED from specs/restaurante-la-nota-azul-v2.spec.json (spec 6c6c43d83abc, file 62b20f3498b4). Do not edit: use the spec, or freeze.
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
      '{{name}} en {{city}}: pizza al horno de leña y un trío de jazz de jueves a sábado. Reserva con un mensaje.',
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
      image: 'hero.jpg',
      imageAlt: 'Saxofonista tocando bajo una luz roja de escenario',
      eyebrow: 'Jazz y horno de leña · Clavería',
      title: 'Pizza al horno, jazz en la mesa de al lado',
      text: 'Masa que reposa dos días, horno de leña a la vista y un trío en vivo de jueves a sábado. Escríbenos para guardar tu lugar.',
      primaryCta: 'Reservar mesa',
      secondaryCta: 'Ver la carta',
      secondaryHref: '#servicios',
      sticker: 'Jazz esta semana',
      details: [
        {
          label: 'Horario',
          value: 'Mar–Dom 13:00–23:00',
        },
        {
          label: 'Jazz',
          value: 'Jue–Sáb desde 21:00',
        },
        {
          label: 'Mesas',
          value: 'Reserva por WhatsApp',
        },
      ],
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
      kicker: '{{index}} — La casa',
      title: 'Una pizzería de barrio con escenario',
      summary:
        '{{shortName}} abre en Clavería: horno de leña, un salón azul y un trío que toca cada fin de semana.',
      statement:
        'Pizza de barrio, música de noche y mesa para quedarse al último set.',
      image: 'about.jpg',
      imageAlt: 'Llamas dentro del horno de leña donde se cuecen las pizzas',
      sticker: 'Clavería',
      paragraphs: [
        '{{shortName}} empezó con seis mesas y una receta de masa que reposa dos días.',
        'Hoy el horno de leña sigue a la vista y la sobremesa se alarga con el último set.',
        'Ven temprano por una pizza o quédate hasta que termine la música.',
      ],
      stats: [
        {
          value: '6 pizzas',
          label: 'De la casa en la carta',
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
      kicker: '{{index}} — La carta',
      title: 'Pizzas de la casa',
      intro:
        'Precios de ejemplo en pesos, IVA incluido. Hay pizza del día; pregunta en mesa.',
      prices: [
        {
          name: 'Margarita',
          price: '$185',
          description:
            'Salsa de tomate, mozzarella fresca y hojas de albahaca.',
        },
        {
          name: 'Pepperoni',
          price: '$210',
          description: 'Pepperoni curado, mozzarella y un toque de orégano.',
        },
        {
          name: 'La Nota',
          price: '$245',
          description:
            'Cebolla caramelizada, tocino ahumado y queso azul. Receta de la casa.',
        },
        {
          name: 'Vegetariana',
          price: '$195',
          description:
            'Calabacita, champiñón, pimiento asado y pesto de albahaca.',
        },
        {
          name: 'Pizza del día',
          price: '$220',
          description: 'Con el ingrediente de temporada que llegó al mercado.',
        },
        {
          name: 'Calzone dulce',
          price: '$90',
          description:
            'Relleno tibio con helado de vainilla, solo en noches de show.',
        },
      ],
      promos: [
        {
          tag: 'Jazz en vivo',
          title: 'Jueves, viernes y sábado',
          text: 'El trío toca desde las 21:00. Reserva tu mesa para el set.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar para el show de jazz}}',
        },
        {
          tag: 'Eventos',
          title: 'Reuniones y cumpleaños',
          text: 'El salón recibe grupos de hasta treinta personas, con menú acordado.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar un evento}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — La noche',
      title: 'Música, horno y <span class="lz-title__serif">barra</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Contrabajo',
          alt: 'Contrabajista cantando junto al micrófono mientras toca',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Voz de jazz',
          alt: 'Cantante de jazz con micrófono frente a la banda, en blanco y negro',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Barra con luz',
          alt: 'Tres botellas de colores iluminadas sobre una barra oscura',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Pizza al horno',
          alt: 'Pizza sobre la parrilla frente a las brasas del horno de leña',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Margarita',
          alt: 'Pizza con tomate y albahaca sobre tabla de madera',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Masa a mano',
          alt: 'Bolas de masa y rodillo sobre la mesa de trabajo',
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
      kicker: '{{index}} — Mesa de al lado',
      title:
        'Lo que cuentan quienes <span class="lz-title__serif">vienen</span>',
      intro: 'Opiniones de clientes que reservaron por WhatsApp.',
      reviews: [
        {
          text: 'Llegamos por la pizza y nos quedamos al segundo set. La mesa junto al escenario fue un acierto.',
          author: 'Daniela R.',
          place: 'Narvarte',
        },
        {
          text: 'Apartamos por WhatsApp un jueves y nos respondieron en minutos. Volvemos con amigos.',
          author: 'Miguel A.',
          place: 'Clavería',
        },
        {
          text: 'Celebramos un cumpleaños en el salón. La masa estaba increíble y la música no tapaba la plática.',
          author: 'Paola S.',
          place: 'Azcapotzalco',
        },
      ],
      score: '4.8',
      summary: '320 opiniones en Google',
      allReviewsCta: 'Ver reseñas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      cta: 'Reservar mesa',
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">llegar</span>',
      intro:
        'Lo que nos preguntan antes de venir. ¿Otra duda? Escríbenos por WhatsApp.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Conviene apartar mesa?',
          answer:
            'De jueves a sábado sí, sobre todo si quieres lugar cerca del escenario.',
        },
        {
          question: '¿Hay cover para el jazz?',
          answer:
            'Con reserva entre semana no se cobra. Para fin de semana, consúltalo por WhatsApp.',
        },
        {
          question: '¿Hay pizzas sin carne?',
          answer:
            'Sí: la vegetariana y la margarita están siempre disponibles.',
        },
        {
          question: '¿Venden pizza para llevar?',
          answer: 'Sí. Pide por chat y te avisamos en cuánto tiempo pasar.',
        },
        {
          question: '¿Sirven mezcal y cerveza?',
          answer:
            'Sí, con consumo responsable. En la barra te recomiendan la opción de la casa.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Reservar',
      title: 'Aparta tu <span class="lz-title__serif">mesa</span>',
      contactText:
        'Aparta mesa o pide para llevar por WhatsApp durante el horario. Para grupos grandes, escríbenos un correo.',
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
        'Pizzería con jazz en vivo en Clavería, {{city}}. Reservas por WhatsApp.',
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
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Mar–Dom 13:00–23:00 · Lun cerrado',
        },
      ],
    },
    cta: {
      kicker: 'Programación en vivo',
      title: 'Cartelera de la <span class="lz-title__serif">semana</span>',
      text: 'Las noches de música se llenan temprano. Aparta tu mesa para el set que quieras escuchar.',
      primaryCta: 'Reservar mesa',
      secondaryCta: 'Ver la carta',
      secondaryHref: '#servicios',
      shows: [
        {
          day: 'Cada',
          date: 'Jue',
          time: '21:00',
          title: 'Trío de la casa',
          text: 'Estándares de jazz y clásicos con arreglos propios.',
          badge: 'Entrada libre',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar mesa para el jueves de jazz}}',
        },
        {
          day: 'Cada',
          date: 'Vie',
          time: '21:30',
          title: 'Noche de jazz manouche',
          text: 'Cuerdas gitanas y swing de principio a fin.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar mesa para el viernes de jazz manouche}}',
        },
        {
          day: 'Cada',
          date: 'Sáb',
          time: '21:30',
          title: 'Bossa nova y vino',
          text: 'Ritmos brasileños para brindar sin prisa.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar mesa para el sábado de bossa nova}}',
        },
      ],
    },
  },
} satisfies ContentPack;
