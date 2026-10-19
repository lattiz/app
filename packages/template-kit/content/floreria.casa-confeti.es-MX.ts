// GENERATED from specs/floreria-casa-confeti.spec.json (spec e112920bb92f, file ecd816d3f660). Do not edit: use the spec, or freeze.
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
      '{{name}} en {{city}}: salón de fiestas infantiles con paquetes, juegos y mesa de dulces para cumpleaños y bautizos.',
  },
  sections: {
    navbar: {
      notice: 'Reservas: martes a domingo, 10:00–20:00',
      cta: 'Cotizar fiesta',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Paquetes',
          href: '#servicios',
        },
        {
          label: 'Equipo',
          href: '#equipo',
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
    },
    hero: {
      detailImage: 'gallery-02.jpg',
      detailAlt: 'Detalle de cerca del trabajo terminado',
      image: 'hero.jpg',
      imageAlt: 'Mesa de fiesta infantil con globos de colores y pastel',
      eyebrow: 'Fiestas infantiles · Narvarte',
      title:
        'Una fiesta para <span class="lz-title__serif">que ellos recuerden.</span>',
      text: 'Salón con juegos, mesa de dulces y animación. Tú eliges la fecha en {{city}}; nosotros armamos todo.',
      primaryCta: 'Cotizar mi fecha',
      secondaryCta: 'Ver paquetes',
      secondaryHref: '#servicios',
      sticker: 'Fechas abiertas',
    },
    marquee: {
      label: 'Lo que incluye tu fiesta',
      items: [
        'Salón con juegos',
        'Mesa de dulces',
        'Animación',
        'Pastel y piñata',
        'Invitaciones digitales',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Un salón pensado <span class="lz-title__serif">para los chiquitos.</span>',
      summary:
        'En {{shortName}} cuidamos cada detalle: espacios seguros, juegos para varias edades y un equipo que se encarga de todo.',
      statement:
        'Tú disfrutas a los invitados; nosotros montamos, animamos y recogemos.',
      image: 'about.jpg',
      imageAlt:
        'Salón de fiestas con alberca de pelotas y decoración de globos',
      sticker: 'Todo incluido',
      paragraphs: [
        '{{shortName}} nació como una sala de juegos en la Narvarte. Hoy hacemos fiestas de cumpleaños y bautizos.',
        'Cada paquete incluye montaje, anfitrión y limpieza, para que los papás solo se ocupen de convivir.',
        'Cuéntanos la edad y el tema; te proponemos una fecha y un paquete.',
      ],
      stats: [
        {
          value: 'Hasta 50',
          label: 'Invitados por fiesta',
        },
        {
          value: '3 horas',
          label: 'De salón y juegos',
        },
        {
          value: '2 a 10',
          label: 'Años, varias edades',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Paquetes',
      title: 'Paquetes de <span class="lz-title__serif">fiesta</span>',
      intro:
        'Montos de referencia en MXN. Fines de semana y temporada alta se cotizan según la fecha.',
      prices: [
        {
          name: 'Fiesta Chispa',
          price: '$6,500',
          description:
            '20 niños, 3 horas de salón, mesa de dulces y anfitrión.',
        },
        {
          name: 'Fiesta Globo',
          price: '$9,800',
          description: '30 niños, animación, pastel y piñata incluidos.',
        },
        {
          name: 'Fiesta Confeti',
          price: '$13,500',
          description: '50 niños, show, pizza, dulces y decoración temática.',
        },
        {
          name: 'Bautizo y primera comunión',
          price: '$8,200',
          description: 'Salón decorado en tonos suaves para 30 invitados.',
        },
        {
          name: 'Hora extra',
          price: '$1,200',
          description: 'Se suma al paquete si la fiesta se alarga.',
        },
        {
          name: 'Piñata y bolos',
          price: '$850',
          description: 'Piñata temática con bolos para los invitados.',
        },
      ],
      promos: [
        {
          tag: 'Entre semana',
          title: 'Fechas de martes a viernes',
          text: 'Salón más tranquilo y una tarifa más baja para tu fiesta.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una fiesta entre semana}}',
        },
        {
          tag: 'Escuelas',
          title: 'Festejos de grupo',
          text: 'Cierres de ciclo y cumpleaños de salón con horario flexible.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero información de festejos para un grupo escolar}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Galería',
      title: 'Así se vive <span class="lz-title__serif">una fiesta</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Mesa de dulces',
          alt: 'Mesa con dulces de colores y pastel de cumpleaños',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Globos',
          alt: 'Arco de globos de colores en un salón',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Pastel',
          alt: 'Pastel de cumpleaños con velas encendidas',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Alberca de pelotas',
          alt: 'Niños jugando en una alberca de pelotas',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Piñata',
          alt: 'Piñata de colores colgada en un salón',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Juegos',
          alt: 'Área de juegos infantil con resbaladilla',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Decoración',
          alt: 'Salón decorado con banderines y globos',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Brindis',
          alt: 'Niños sentados a una mesa de fiesta',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quienes <span class="lz-title__serif">hacen la fiesta</span>',
      members: [
        {
          name: 'Lucía Fernández',
          role: 'Dirección y eventos',
          tags: ['Cotizaciones', 'Coordinación'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Lucía Fernández sonriendo',
        },
        {
          name: 'Tomás Aguilar',
          role: 'Animación',
          tags: ['Juegos', 'Shows'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Tomás Aguilar en el salón',
        },
        {
          name: 'Valeria Cruz',
          role: 'Decoración',
          tags: ['Globos', 'Temas'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Valeria Cruz con globos',
        },
        {
          name: 'Emilio Rojas',
          role: 'Montaje y seguridad',
          tags: ['Montaje', 'Cuidado'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Emilio Rojas en el salón',
        },
      ],
    },
    testimonials: {
      scoreNote: 'Calificación de ejemplo',
      kicker: '{{index}} — Reseñas',
      score: '4.8',
      summary: '180 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Hicimos el cumpleaños de mi hija de 5 años. Los niños no querían irse y yo no cargué nada.',
          author: 'Mariana P.',
        },
        {
          text: 'El salón estaba limpio y el equipo muy atento con los más chiquitos. Volveremos el año que viene.',
          author: 'Jorge y Alicia',
        },
        {
          text: 'Cotizar por WhatsApp fue rápido y nos respetaron el horario completo.',
          author: 'Daniela R.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">reservar</span>',
      intro:
        'Dudas frecuentes de papás y mamás. Para lo demás, mándanos un mensaje.',
      cta: 'Escribir por WhatsApp',
      items: [
        {
          question: '¿Cómo aparto mi fecha?',
          answer:
            'Con un anticipo por transferencia. Te confirmamos la fecha por WhatsApp y el resto se paga antes de la fiesta.',
        },
        {
          question: '¿Cuántos invitados caben?',
          answer:
            'Hasta 50 niños y los adultos que los acompañan. Si son más, te proponemos otro paquete.',
        },
        {
          question: '¿Puedo llevar mi pastel y comida?',
          answer:
            'Sí, el pastel puede ser el tuyo. Para la comida, consulta qué paquetes la incluyen.',
        },
        {
          question: '¿Cuánto dura la fiesta?',
          answer:
            'Tres horas de salón. Si necesitas más tiempo, puedes sumar horas extra.',
        },
        {
          question: '¿Qué pasa si hay que cambiar la fecha?',
          answer:
            'Avísanos con 15 días de anticipación y reprogramamos sin costo, según disponibilidad.',
        },
        {
          question: '¿Los adultos pueden quedarse?',
          answer:
            'Claro. Hay mesas y sillas para los papás durante toda la fiesta.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Reservas',
      title: 'Cotiza tu <span class="lz-title__serif">fecha</span>',
      contactText:
        'Escríbenos por WhatsApp con la fecha, la edad y el número de invitados. Para grupos grandes, por correo.',
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
        'Salón de fiestas infantiles en {{city}}. Paquetes, juegos y mesa de dulces para cumpleaños.',
      branchesTitle: 'Salón',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Paquetes',
          href: '#servicios',
        },
        {
          label: 'Equipo',
          href: '#equipo',
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
  },
} satisfies ContentPack;
