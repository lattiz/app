// GENERATED from specs/clinica-alba.spec.json (spec e21639659c03, file e32a1ae2d7fb). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'clinica',
  locale: 'es-MX',
  business: {
    name: 'Clínica Alba',
    shortName: 'Alba',
    tagline: 'Consultorio médico',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero agendar una cita',
    address: 'Av. Universidad 1020, Narvarte Poniente, Benito Juárez, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'citas@clinicaalba.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=clinica+alba+narvarte',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=clinica+alba+narvarte',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: consultas, estudios y seguimiento con citas por WhatsApp y precios claros.',
  },
  sections: {
    navbar: {
      cta: 'Agendar cita',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Servicios',
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
      imageAlt: 'Médica conversando con un paciente en un consultorio luminoso',
      eyebrow: 'Atención médica · Narvarte',
      title:
        'Atención médica <span class="lz-title__serif">cercana</span>, sin esperas largas.',
      text: 'Consultas con tiempo para escucharte, estudios en el mismo lugar y seguimiento por WhatsApp. Agenda tu cita en un mensaje.',
      primaryCta: 'Agendar cita',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Citas esta semana',
    },
    marquee: {
      label: 'Servicios del consultorio',
      items: [
        'Consulta general',
        'Chequeos preventivos',
        'Estudios en el lugar',
        'Seguimiento por WhatsApp',
        'Factura disponible',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Medicina con <span class="lz-title__serif">tiempo</span> para ti.',
      summary:
        'En {{shortName}} cada consulta dura lo necesario: te escuchamos, explicamos el diagnóstico con claridad y te damos un plan que puedas seguir.',
      statement:
        'Una buena consulta empieza por escuchar: sin prisa, con explicaciones claras y un plan que puedas seguir.',
      image: 'about.jpg',
      imageAlt: 'Recepción del consultorio con sillas y plantas',
      sticker: 'Cédula profesional vigente',
      paragraphs: [
        '{{shortName}} reúne a especialistas que trabajan en equipo para que no tengas que ir de un lado a otro.',
        'Tenemos estudios básicos en el mismo consultorio y te mandamos los resultados por WhatsApp o correo.',
        'Atendemos con cita para respetar tu tiempo y el de cada paciente.',
      ],
      stats: [
        {
          value: '+15 años',
          label: 'De experiencia',
        },
        {
          value: '+8,000',
          label: 'Pacientes atendidos',
        },
        {
          value: '4.9 ★',
          label: 'En Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Servicios y <span class="lz-title__serif">consultas</span>',
      intro:
        'Precios en pesos mexicanos. Pregunta por paquetes de seguimiento y factura.',
      prices: [
        {
          name: 'Consulta general',
          price: '$600',
          description: 'Valoración completa, diagnóstico y receta.',
        },
        {
          name: 'Consulta de especialidad',
          price: '$900',
          description: 'Con el especialista que necesites, previa cita.',
        },
        {
          name: 'Chequeo preventivo',
          price: '$1,450',
          description:
            'Consulta, estudios de laboratorio básicos y plan de cuidado.',
        },
        {
          name: 'Electrocardiograma',
          price: '$550',
          description: 'Estudio en el consultorio con interpretación.',
        },
        {
          name: 'Certificado médico',
          price: '$350',
          description: 'Para escuela, trabajo o deporte, el mismo día.',
        },
        {
          name: 'Consulta de seguimiento',
          price: '$450',
          description: 'Revisión de resultados y ajuste del tratamiento.',
        },
      ],
      promos: [
        {
          tag: 'Paquete',
          title: 'Chequeo anual para dos',
          text: 'Agenda tu chequeo preventivo con tu pareja y obtén 15 % de descuento.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero el chequeo anual para dos}}',
        },
        {
          tag: 'Empresas',
          title: 'Exámenes médicos para tu equipo',
          text: 'Certificados y chequeos para empresas, en el consultorio o en tus oficinas.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar exámenes para mi empresa}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Instalaciones',
      title: 'Un lugar <span class="lz-title__serif">tranquilo</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción luminosa con sillas de espera',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Consultorio 1',
          alt: 'Consultorio con escritorio y camilla de exploración',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Toma de muestras',
          alt: 'Área de toma de muestras con material desechable',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Electrocardiograma',
          alt: 'Equipo de electrocardiograma junto a una camilla',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Sala de espera',
          alt: 'Sala de espera con plantas y luz natural',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Exploración',
          alt: 'Médico tomando la presión arterial a una paciente',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Material estéril',
          alt: 'Instrumental médico ordenado sobre una charola',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Fachada del consultorio con la puerta de acceso',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Especialistas',
      title: 'Quién te <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'Dra. Mariana López',
          role: 'Medicina general',
          tags: ['Prevención', 'Adultos'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de la Dra. Mariana López con bata blanca',
        },
        {
          name: 'Dr. Andrés Salinas',
          role: 'Medicina interna',
          tags: ['Diabetes', 'Hipertensión'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato del Dr. Andrés Salinas en su consultorio',
        },
        {
          name: 'Dra. Sofía Ramírez',
          role: 'Pediatría',
          tags: ['Niños', 'Vacunas'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de la Dra. Sofía Ramírez sonriendo',
        },
        {
          name: 'Lic. Daniel Torres',
          role: 'Nutrición',
          tags: ['Planes de alimentación', 'Seguimiento'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato del Lic. Daniel Torres junto a una ventana',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '186 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'La doctora se tomó el tiempo de explicarme todo y me escribió al día siguiente para saber cómo seguía.',
          author: 'Gabriela M.',
        },
        {
          text: 'Agendé por WhatsApp y me atendieron a la hora exacta. Los estudios salieron el mismo día.',
          author: 'Ricardo P.',
        },
        {
          text: 'Llevo a mis hijos con la pediatra desde hace años. Paciente, clara y muy humana.',
          author: 'Fernanda L.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que suelen preguntarnos antes de la primera cita. Para cualquier otra duda, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cuánto cuesta la consulta?',
          answer:
            'La consulta general cuesta $600 y la de especialidad $900. Te confirmamos el precio al agendar.',
        },
        {
          question: '¿Cómo agendo una cita?',
          answer:
            'Escríbenos por WhatsApp con el servicio que necesitas y te proponemos horarios disponibles.',
        },
        {
          question: '¿Aceptan seguros de gastos médicos?',
          answer:
            'Te damos factura y los documentos para que solicites el reembolso a tu aseguradora.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer: 'Efectivo, tarjetas de débito y crédito, y transferencia.',
        },
        {
          question: '¿Cómo cancelo o cambio mi cita?',
          answer:
            'Avísanos por WhatsApp con al menos 24 horas de anticipación y la cambiamos sin costo.',
        },
        {
          question: '¿Qué llevo a mi primera consulta?',
          answer:
            'Una identificación, tus estudios recientes y la lista de medicamentos que tomas.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Agenda tu <span class="lz-title__serif">cita</span>',
      contactText:
        'Respondemos mensajes de lunes a sábado en horario del consultorio. En una urgencia, llama al 911.',
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
          name: 'Narvarte',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–19:00 · Sáb 9:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Narvarte',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Agendar cita por WhatsApp',
    },
    footer: {
      about:
        'Consultorio médico en {{city}}. Consultas, estudios y seguimiento con cita por WhatsApp.',
      branchesTitle: 'Consultorio',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Servicios',
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
          name: 'Narvarte',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–19:00 · Sáb 9:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
