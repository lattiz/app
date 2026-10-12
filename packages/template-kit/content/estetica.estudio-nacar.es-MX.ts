// GENERATED from specs/estetica-estudio-nacar.spec.json (spec 76f9b169c1da, file ad9a5b7a07ec). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'estetica',
  locale: 'es-MX',
  business: {
    name: 'Estudio Nácar',
    shortName: 'Estudio Nácar',
    tagline: 'Salón de belleza',
    city: 'Puebla',
    phone: '+52 222 000 0000',
    whatsapp: '5212220000000',
    whatsappMessage: 'Hola, quiero agendar una cita',
    address: 'Calle 25 Sur 1310, Col. La Paz, Puebla',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'citas@estudionacar.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=estudio+nacar+la+paz',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=estudio+nacar+la+paz',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: corte, color, uñas, pestañas y faciales con precios claros y citas por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Agendar cita',
      links: [
        {
          label: 'El salón',
          href: '#nosotros',
        },
        {
          label: 'Servicios',
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
          label: 'Citas',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Estilista peinando a una clienta frente al espejo del salón',
      eyebrow: 'Salón de belleza · La Paz',
      title: 'Tu rato para <span class="lz-title__serif">consentirte</span>.',
      text: 'Corte, color, uñas y pestañas con calma, en un salón tranquilo. Agenda por WhatsApp y llega a tu hora.',
      primaryCta: 'Agendar por WhatsApp',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Citas esta semana',
    },
    marquee: {
      label: 'Servicios del salón',
      items: [
        'Corte y peinado',
        'Color y mechas',
        'Uñas en gel',
        'Lifting de pestañas',
        'Faciales de limpieza',
      ],
    },
    about: {
      kicker: '{{index}} — El salón',
      title:
        'Un salón <span class="lz-title__serif">sin prisas</span>, a tu ritmo.',
      summary:
        'En {{shortName}} cada cita tiene su tiempo: primero platicamos qué quieres, te decimos qué te va y trabajamos con calma.',
      statement:
        'Una buena cita empieza por escuchar: qué quieres, cuánto tiempo tienes y cómo vas a peinarte en casa.',
      image: 'about.jpg',
      imageAlt: 'Interior del salón con sillas, espejos redondos y plantas',
      sticker: 'Productos veganos',
      paragraphs: [
        'Trabajamos con citas para que no esperes y cada servicio tenga el tiempo que necesita.',
        'Usamos productos sin amoniaco y te recomendamos cuidados para casa.',
        'Material desinfectado en cada cita y limas desechables en uñas.',
      ],
      stats: [
        {
          value: '+9 años',
          label: 'En el barrio',
        },
        {
          value: '6',
          label: 'Estilistas',
        },
        {
          value: '4.9 ★',
          label: 'En Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Servicios y <span class="lz-title__serif">precios</span>',
      intro:
        'Precios en pesos mexicanos. El color puede variar según el largo; te confirmamos al valorar.',
      prices: [
        {
          name: 'Corte y peinado',
          price: '$420',
          description: 'Lavado, corte y peinado con secadora.',
        },
        {
          name: 'Color completo',
          price: 'Desde $950',
          description: 'Tinte sin amoniaco con valoración previa.',
        },
        {
          name: 'Mechas o balayage',
          price: 'Desde $1,800',
          description: 'Aclarado a mano alzada, matiz y peinado.',
        },
        {
          name: 'Uñas en gel',
          price: '$380',
          description: 'Manicura, esmalte en gel y diseño sencillo.',
        },
        {
          name: 'Lifting de pestañas',
          price: '$550',
          description: 'Curvatura y tinte; dura de seis a ocho semanas.',
        },
        {
          name: 'Facial de limpieza',
          price: '$690',
          description: 'Limpieza, exfoliación suave e hidratación.',
        },
      ],
      promos: [
        {
          tag: 'Primera visita',
          title: 'Valoración de color sin costo',
          text: 'Antes de pintar platicamos el tono, el mantenimiento y el precio exacto.',
          cta: 'Valorar color',
          href: '{{whatsappUrl:Hola, quiero una valoración de color}}',
        },
        {
          tag: 'Eventos',
          title: 'Peinado y maquillaje para tu evento',
          text: 'Para bodas, graduaciones y XV años; también vamos a domicilio.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar peinado y maquillaje para un evento}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Fotos',
      title: 'Así se ve el <span class="lz-title__serif">salón</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción del salón con flores y luz cálida',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Tocadores',
          alt: 'Fila de tocadores con espejos redondos',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Color',
          alt: 'Estilista aplicando color con brocha',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Uñas',
          alt: 'Manos con esmalte en gel color nude',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Lavado',
          alt: 'Área de lavado con sillones reclinables',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Pestañas',
          alt: 'Cosmetóloga trabajando pestañas en cabina',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Peinado',
          alt: 'Peinado recogido para evento visto de espaldas',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Productos',
          alt: 'Repisa con frascos de productos para el cabello',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quién te <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'Renata Solís',
          role: 'Directora y colorista',
          tags: ['Balayage', 'Color'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Renata Solís en el salón',
        },
        {
          name: 'Paola Méndez',
          role: 'Estilista',
          tags: ['Corte', 'Peinado'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Paola Méndez sonriendo',
        },
        {
          name: 'Karla Ibarra',
          role: 'Uñas',
          tags: ['Gel', 'Diseño'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Karla Ibarra junto a su mesa de trabajo',
        },
        {
          name: 'Iván Robles',
          role: 'Cosmetología',
          tags: ['Faciales', 'Pestañas'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Iván Robles en la cabina',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.9',
      summary: '238 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Me explicaron el tono antes de empezar y quedó justo como lo pedí. El salón es muy tranquilo.',
          author: 'Lucía A.',
        },
        {
          text: 'Agendé por WhatsApp para el mismo día y me atendieron a la hora. Mis uñas duraron casi tres semanas.',
          author: 'Fernanda G.',
        },
        {
          text: 'Me peinaron y maquillaron para la boda de mi hermana y aguantó toda la noche.',
          author: 'Sofía R.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que suelen preguntarnos antes de la primera cita. Para lo demás, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Necesito cita?',
          answer:
            'Sí, trabajamos con cita para que no esperes. Escríbenos por WhatsApp y te damos horario.',
        },
        {
          question: '¿Cuánto tarda un color?',
          answer:
            'Un color completo, entre dos y tres horas; mechas o balayage, de tres a cuatro. Te lo confirmamos al valorar.',
        },
        {
          question: '¿Qué productos usan?',
          answer:
            'Tintes sin amoniaco y productos veganos. Si tienes alguna alergia, dínoslo antes de la cita.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer: 'Efectivo, tarjeta de débito y crédito, y transferencia.',
        },
        {
          question: '¿Cómo cancelo o cambio mi cita?',
          answer:
            'Avísanos por WhatsApp con 24 horas de anticipación y la movemos sin costo.',
        },
        {
          question: '¿Van a domicilio?',
          answer:
            'Para eventos sí: peinado y maquillaje a domicilio con cotización previa.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Agenda tu <span class="lz-title__serif">cita</span>',
      contactText:
        'Respondemos mensajes en horario del salón. Si vas tarde, avísanos y te acomodamos.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Agendar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Agendar por WhatsApp',
      callCta: 'Llamar',
      branches: [
        {
          name: 'La Paz',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–20:00 · Dom 10:00–15:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal La Paz',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Agendar cita por WhatsApp',
    },
    footer: {
      about:
        'Salón de belleza en {{city}}. Corte, color, uñas, pestañas y faciales con cita por WhatsApp.',
      branchesTitle: 'Salón',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'El salón',
          href: '#nosotros',
        },
        {
          label: 'Servicios',
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
          label: 'Citas',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'La Paz',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–20:00 · Dom 10:00–15:00',
        },
      ],
    },
  },
} satisfies ContentPack;
