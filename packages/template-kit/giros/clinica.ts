import type { GiroDefinition } from '../src/spec/giro';
import { palette } from '../src/spec/presets';

/** Clínica / consultorio: confianza, servicios con precio de consulta, equipo médico y citas. */

export default {
  id: 'clinica',
  label: 'Clínica / consultorio',
  category: 'clinicas',
  businessCategory: 'medical',
  schemaType: 'MedicalClinic',
  description: {
    pro: 'Clínica con identidad propia: servicios y consultas, instalaciones, equipo médico, reseñas, preguntas y citas',
    basico:
      'Consultorio: servicios con precios, preguntas frecuentes y ubicación',
  },
  palettes: {
    salvia: palette({
      label: 'Salvia (claro, verde azulado)',
      scheme: 'light',
      bg: '#F4F7F5',
      surface: '#FFFFFF',
      surface2: '#E3ECE8',
      text: '#12201B',
      muted: '#4A5B55',
      accent: '#1E6E5C',
      onAccent: '#FFFFFF',
      accentText: '#1E6E5C',
      overlay: 'bg',
      photoTreatment: 'none',
      placeholder: 'rules',
    }),
    cielo: palette({
      label: 'Cielo (claro, azul)',
      scheme: 'light',
      bg: '#F3F6FA',
      surface: '#FFFFFF',
      surface2: '#E1E8F2',
      text: '#0F1B2C',
      muted: '#475569',
      accent: '#1D5D9E',
      onAccent: '#FFFFFF',
      accentText: '#2F6FB0',
      photoTreatment: 'none',
      placeholder: 'dots',
    }),
    lavanda: palette({
      label: 'Lavanda (claro, violeta suave)',
      scheme: 'light',
      bg: '#F6F4FA',
      surface: '#FFFFFF',
      surface2: '#E8E3F3',
      text: '#1A1530',
      muted: '#544D6B',
      accent: '#5A45B0',
      onAccent: '#FFFFFF',
      accentText: '#6A55C0',
      photoTreatment: 'none',
      placeholder: 'blobs',
    }),
    arena: palette({
      label: 'Arena (claro, coral)',
      scheme: 'light',
      bg: '#FAF6F1',
      surface: '#FFFFFF',
      surface2: '#F0E6DA',
      text: '#2A1D16',
      muted: '#62544A',
      accent: '#B44C33',
      onAccent: '#FFFFFF',
      accentText: '#C0583E',
      photoTreatment: 'warm',
      placeholder: 'arches',
    }),
    medianoche: palette({
      label: 'Medianoche (oscuro, acento ámbar)',
      scheme: 'dark',
      bg: '#0E1621',
      surface: '#152030',
      surface2: '#1C2A3D',
      text: '#EAF1F8',
      muted: '#A3B2C4',
      accent: '#EACD62',
      onAccent: '#0E1621',
      accentText: '#EFD57D',
      photoTreatment: 'none',
      placeholder: 'grain',
    }),
  },
  fontPairs: [
    'libre-baskerville+source-sans-3',
    'sora+inter',
    'lora+figtree',
    'fraunces+nunito-sans',
    'instrument-serif+instrument-sans',
  ],
  shapes: ['suave', 'redondo', 'organico', 'sutil', 'filete'],
  sections: {
    pro: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'split' },
      { role: 'about', variant: 'stats-strip' },
      { role: 'catalog', variant: 'cards' },
      { role: 'team', variant: 'grid' },
      { role: 'proof', variant: 'strip' },
      { role: 'testimonials', variant: 'cards' },
      { role: 'faq', variant: 'two-col' },
      { role: 'contact', variant: 'with-contact' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'columns' },
    ],
    basico: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'centered-arch' },
      { role: 'about', variant: 'brief' },
      { role: 'catalog', variant: 'cards' },
      { role: 'faq', variant: 'list' },
      { role: 'contact', variant: 'single' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'minimal-centered' },
    ],
  },
  motion: { preset: 'calm', progress: false },
  navLabels: {
    about: 'Nosotros',
    services: 'Servicios',
    team: 'Especialistas',
    gallery: 'Instalaciones',
    testimonials: 'Opiniones',
    faq: 'Preguntas',
    locations: 'Citas',
  },
  business: {
    tagline: 'Consultorio médico',
    whatsappMessage: 'Hola, quiero agendar una cita',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    city: 'CDMX',
    hours: 'Lun–Vie 9:00–19:00 · Sáb 9:00–14:00',
    address: 'Av. Ejemplo 123, Col. Centro, CDMX',
    branch: 'Centro',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: consultas, estudios y seguimiento con citas por WhatsApp y precios claros.',
  },
  copy: {
    navbar: { cta: 'Agendar cita' },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Médica conversando con un paciente en un consultorio luminoso',
      eyebrow: 'Atención médica · {{city}}',
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
        { value: '+15 años', label: 'De experiencia' },
        { value: '+8,000', label: 'Pacientes atendidos' },
        { value: '4.9 ★', label: 'En Google' },
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
    },
    'floating-whatsapp': { label: 'Agendar cita por WhatsApp' },
    footer: {
      about:
        'Consultorio médico en {{city}}. Consultas, estudios y seguimiento con cita por WhatsApp.',
      branchesTitle: 'Consultorio',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
    },
  },
  heroAlternates: [
    'Tu salud en <span class="lz-title__serif">buenas manos</span>, cerca de casa.',
    'Consultas <span class="lz-title__serif">sin prisa</span> y con seguimiento.',
    'Cuidamos tu salud con <span class="lz-title__serif">claridad</span>.',
    'Agenda hoy, <span class="lz-title__serif">te atendemos</span> esta semana.',
  ],
  images: {
    hero: {
      query: 'doctor talking with patient clinic',
      orientation: 'landscape',
    },
    about: { query: 'clinic reception waiting room', orientation: 'portrait' },
    'team-1': { query: 'female doctor portrait', orientation: 'portrait' },
    'team-2': { query: 'male doctor portrait', orientation: 'portrait' },
    'team-3': { query: 'pediatrician portrait', orientation: 'portrait' },
    'team-4': { query: 'nutritionist portrait', orientation: 'portrait' },
    'gallery-01': { query: 'clinic reception', orientation: 'square' },
    'gallery-02': {
      query: 'doctor office examination room',
      orientation: 'square',
    },
    'gallery-03': { query: 'blood test lab', orientation: 'square' },
    'gallery-04': { query: 'electrocardiogram machine', orientation: 'square' },
    'gallery-05': { query: 'waiting room plants', orientation: 'square' },
    'gallery-06': {
      query: 'doctor measuring blood pressure',
      orientation: 'square',
    },
    'gallery-07': { query: 'medical instruments tray', orientation: 'square' },
    'gallery-08': { query: 'clinic entrance', orientation: 'square' },
  },
  demoHours: {
    mon: [{ open: '09:00', close: '19:00' }],
    tue: [{ open: '09:00', close: '19:00' }],
    wed: [{ open: '09:00', close: '19:00' }],
    thu: [{ open: '09:00', close: '19:00' }],
    fri: [{ open: '09:00', close: '19:00' }],
    sat: [{ open: '09:00', close: '14:00' }],
  },
  priceRange: '$$',
} satisfies GiroDefinition;
