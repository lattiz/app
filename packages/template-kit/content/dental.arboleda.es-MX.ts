// GENERATED from specs/dental-arboleda.spec.json (spec 0757763d1134, file d171eb39ced3). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'dental',
  locale: 'es-MX',
  business: {
    name: 'Dental Arboleda',
    shortName: 'Dental Arboleda',
    tagline: 'Consultorio dental',
    city: 'Mérida',
    phone: '+52 999 000 0000',
    whatsapp: '5219990000000',
    whatsappMessage: 'Hola, quiero agendar una valoración',
    address: 'Calle 27 #502, Col. García Ginerés, Mérida',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'citas@dentalarboleda.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=dental+arboleda+garcia+gineres',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=dental+arboleda+garcia+gineres',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: limpieza, resinas, ortodoncia y más, con valoración previa y citas por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Agendar cita',
      links: [
        {
          label: 'Consultorio',
          href: '#nosotros',
        },
        {
          label: 'Tratamientos',
          href: '#servicios',
        },
        {
          label: 'Especialistas',
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
      imageAlt:
        'Dentista explicando un tratamiento a una paciente en el consultorio',
      eyebrow: 'Consultorio dental · García Ginerés',
      title: 'Cuidamos tu boca <span class="lz-title__serif">con calma</span>.',
      text: 'Valoración con tiempo para tus dudas, un plan por escrito con precios y recordatorios por WhatsApp. Agenda en un mensaje.',
      primaryCta: 'Agendar valoración',
      secondaryCta: 'Ver tratamientos',
      secondaryHref: '#servicios',
      sticker: 'Citas esta semana',
    },
    marquee: {
      label: 'Tratamientos del consultorio',
      items: [
        'Limpieza dental',
        'Resinas',
        'Ortodoncia',
        'Odontopediatría',
        'Blanqueamiento',
      ],
    },
    about: {
      kicker: '{{index}} — Consultorio',
      title:
        'Explicamos todo <span class="lz-title__serif">antes</span> de empezar.',
      summary:
        'En {{shortName}} cada tratamiento empieza con una valoración: revisamos, te mostramos lo que vemos y te damos un plan por escrito con precios.',
      statement:
        'Antes de tocar un diente, te explicamos qué vemos, qué opciones hay y cuánto cuesta cada una.',
      image: 'about.jpg',
      imageAlt: 'Sala de espera del consultorio dental con luz natural',
      sticker: 'Cédula profesional 0000000',
      paragraphs: [
        'Trabajamos con cita para respetar tu tiempo; las consultas no se empalman.',
        'Esterilizamos el instrumental en cada cita y usamos material desechable.',
        'Te mandamos recordatorios y el plan de tratamiento por WhatsApp o correo.',
      ],
      stats: [
        {
          value: '+12 años',
          label: 'De consulta',
        },
        {
          value: '4',
          label: 'Especialistas',
        },
        {
          value: '4.9 ★',
          label: 'En Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Tratamientos',
      title: 'Tratamientos y <span class="lz-title__serif">precios</span>',
      intro:
        'Precios de referencia en pesos mexicanos; el plan exacto se define en la valoración.',
      prices: [
        {
          name: 'Valoración',
          price: '$350',
          description: 'Revisión, fotos intraorales y plan por escrito.',
        },
        {
          name: 'Limpieza dental',
          price: '$750',
          description: 'Profilaxis con ultrasonido y pulido.',
        },
        {
          name: 'Resina',
          price: 'Desde $900',
          description: 'Restauración del color de tu diente, por pieza.',
        },
        {
          name: 'Ortodoncia',
          price: '$1,200/mes',
          description: 'Brackets o alineadores, según valoración.',
        },
        {
          name: 'Blanqueamiento',
          price: 'Desde $3,500',
          description: 'En consultorio, después de una limpieza.',
        },
        {
          name: 'Consulta de niños',
          price: '$450',
          description: 'Revisión, flúor y consejos para casa.',
        },
      ],
      promos: [
        {
          tag: 'Primera visita',
          title: 'Valoración y limpieza el mismo día',
          text: 'Agenda las dos en una cita y te damos 10 % en la limpieza.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero valoración y limpieza el mismo día}}',
        },
        {
          tag: 'Familias',
          title: 'Revisión para toda la familia',
          text: 'Agenda a dos o más integrantes en el mismo horario.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar una revisión familiar}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Instalaciones',
      title: 'Un consultorio <span class="lz-title__serif">tranquilo</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción del consultorio con mostrador blanco',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Sillón dental',
          alt: 'Sillón dental junto a una ventana',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Esterilización',
          alt: 'Área de esterilización con instrumental empaquetado',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Radiografía',
          alt: 'Equipo de radiografía dental en una pared',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Sala de espera',
          alt: 'Sala de espera con sillas y plantas',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Para niños',
          alt: 'Rincón infantil con libros y juguetes',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Instrumental',
          alt: 'Charola con instrumental dental ordenado',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Puerta de entrada del consultorio',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Especialistas',
      title: 'Quién te <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'Dra. Adriana Fuentes',
          role: 'Cirujana dentista',
          tags: ['Cédula 0000000', 'Prevención'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de la Dra. Adriana Fuentes con filipina',
        },
        {
          name: 'Dr. Raúl Medina',
          role: 'Ortodoncia',
          tags: ['Cédula 0000000', 'Brackets'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato del Dr. Raúl Medina en el consultorio',
        },
        {
          name: 'Dra. Itzel Navarro',
          role: 'Odontopediatría',
          tags: ['Cédula 0000000', 'Niños'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de la Dra. Itzel Navarro sonriendo',
        },
        {
          name: 'Dr. Javier Ponce',
          role: 'Endodoncia',
          tags: ['Cédula 0000000', 'Conductos'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato del Dr. Javier Ponce junto a una ventana',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '164 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Me explicaron el plan con fotos y precios antes de empezar. Nada de sorpresas en la cuenta.',
          author: 'Alejandra V.',
        },
        {
          text: 'Mi hijo tenía miedo y la doctora tuvo toda la paciencia. Ahora pregunta cuándo vuelve.',
          author: 'Héctor M.',
        },
        {
          text: 'Agendé por WhatsApp, me recordaron la cita un día antes y me atendieron puntual.',
          author: 'Brenda S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que suelen preguntarnos antes de la primera cita. Si tienes otra duda, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cuánto cuesta la valoración?',
          answer:
            'La valoración cuesta $350 e incluye revisión, fotos y un plan por escrito con precios.',
        },
        {
          question: '¿Atienden urgencias?',
          answer:
            'Llámanos o escríbenos: en horario de consulta buscamos un espacio el mismo día.',
        },
        {
          question: '¿Atienden a niños?',
          answer:
            'Sí, con una odontopediatra y citas pensadas para que los niños vayan tranquilos.',
        },
        {
          question: '¿Puedo pagar la ortodoncia por mes?',
          answer:
            'Sí: un pago inicial y mensualidades durante el tratamiento. Te lo detallamos en la valoración.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Efectivo, tarjetas de débito y crédito, y transferencia. Damos factura.',
        },
        {
          question: '¿Cómo cambio mi cita?',
          answer:
            'Avísanos por WhatsApp con 24 horas de anticipación y te damos otro horario.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Agenda tu <span class="lz-title__serif">cita</span>',
      contactText:
        'Respondemos mensajes en horario de consulta. Si tienes dolor o una urgencia, mejor llámanos.',
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
          name: 'García Ginerés',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–19:00 · Sáb 9:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal García Ginerés',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Agendar cita dental por WhatsApp',
    },
    footer: {
      about:
        'Consultorio dental en {{city}}. Valoración, limpieza, resinas y ortodoncia con cita por WhatsApp.',
      branchesTitle: 'Consultorio',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'Consultorio',
          href: '#nosotros',
        },
        {
          label: 'Tratamientos',
          href: '#servicios',
        },
        {
          label: 'Especialistas',
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
          name: 'García Ginerés',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–19:00 · Sáb 9:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
