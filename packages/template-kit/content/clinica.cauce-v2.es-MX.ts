// GENERATED from specs/clinica-cauce-v2.spec.json (spec 1e2802e0cefe, file 062e121c172b). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'clinica',
  locale: 'es-MX',
  business: {
    name: 'Cauce Fisioterapia',
    shortName: 'Cauce',
    tagline: 'Fisioterapia y rehabilitación',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero agendar una valoración de fisioterapia',
    address: 'Calle Encino 128, Col. Clavería, Azcapotzalco, 02080 CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@caucefisio.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=cauce+fisioterapia+claveria',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=cauce+fisioterapia+claveria',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: fisioterapia con valoración, plan por etapas y ejercicios por escrito. Reserva tu cita por WhatsApp.',
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
      imageAlt:
        'Fisioterapeuta acompañando un ejercicio de hombro en el consultorio',
      eyebrow: 'Fisioterapia · Clavería',
      title:
        'Fisioterapia con <span class="lz-title__serif">calma</span> y un plan claro.',
      text: 'Valoración con tiempo, sesiones de 50 minutos con tu terapeuta y ejercicios por escrito para casa. Agenda por WhatsApp.',
      primaryCta: 'Agendar valoración',
      secondaryCta: 'Ver tratamientos',
      secondaryHref: '#servicios',
      sticker: 'Citas esta semana',
      note: 'Hoy atendemos hasta las 20:00',
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
      kicker: '{{index}} — Etapas',
      title:
        'Tu recuperación, <span class="lz-title__serif">etapa</span> por etapa',
      summary:
        'Cada fase tiene un objetivo y un tiempo que acordamos contigo, para que sepas qué sigue y qué puedes hacer en casa.',
      statement:
        'Una buena consulta empieza por escuchar: sin prisa, con explicaciones claras y un plan que puedas seguir.',
      image: 'about.jpg',
      imageAlt: 'Sala de espera del consultorio con plantas y luz natural',
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
      primaryCta: 'Agendar valoración',
      steps: [
        {
          title: 'Valoración',
          text: 'Revisamos movilidad, fuerza y el motivo de tu visita para armar el plan de las siguientes semanas.',
          tag: 'Primera sesión',
        },
        {
          title: 'Recuperación',
          text: 'Terapia manual y ejercicios guiados para bajar la molestia y recuperar rango sin forzar.',
          tag: 'Fase inicial',
        },
        {
          title: 'Fortalecimiento',
          text: 'Cargas progresivas y control del movimiento para sostener lo trabajado en tu día a día.',
          tag: 'Fase activa',
        },
        {
          title: 'Alta',
          text: 'Cerramos con una rutina para casa y las señales de alerta. Si algo cambia, nos escribes y retomamos el plan.',
          tag: 'Alta con plan',
        },
      ],
    },
    services: {
      kicker: 'Tratamientos',
      title: 'Tratamientos y <span class="lz-title__serif">terapias</span>',
      intro:
        'Montos de ejemplo en pesos. Cuántas sesiones necesitas lo decidimos juntos en la valoración.',
      prices: [
        {
          name: 'Valoración inicial',
          price: '$850',
          description:
            'Entrevista, pruebas de movimiento y un plan escrito con objetivos.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar una valoración inicial}}',
        },
        {
          name: 'Terapia manual',
          price: '$700',
          description:
            'Movilización y trabajo de tejidos con ejercicio guiado, 50 minutos.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar terapia manual}}',
        },
        {
          name: 'Rehabilitación posoperatoria',
          price: 'Desde $800',
          description:
            'Plan por fases que respeta las indicaciones de tu cirujano.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar rehabilitación posoperatoria}}',
        },
        {
          name: 'Fisioterapia deportiva',
          price: '$750',
          description:
            'Regreso gradual al entrenamiento con criterios claros de avance.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar fisioterapia deportiva}}',
        },
        {
          name: 'Equilibrio y adulto mayor',
          price: '$700',
          description:
            'Ejercicios de fuerza y marcha, seguros y progresivos, para prevenir caídas.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar equilibrio y movilidad}}',
        },
      ],
      promos: [
        {
          tag: 'Paquete',
          title: 'Paquete de cinco sesiones',
          text: 'Cinco citas seguidas con un reporte de avance al cerrar el paquete.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero el paquete de cinco sesiones}}',
        },
      ],
      unit: 'por sesión',
    },
    gallery: {
      kicker: '{{index}} — Instalaciones',
      title: 'Un lugar <span class="lz-title__serif">sereno</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción luminosa con plantas y sillones',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Sala de terapia',
          alt: 'Sala de terapia con camilla y ventana grande',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Ejercicio guiado',
          alt: 'Paciente haciendo ejercicio con banda elástica',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Terapia manual',
          alt: 'Fisioterapeuta trabajando la espalda de un paciente',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Espacio de movilidad',
          alt: 'Espacio de rehabilitación con barras paralelas',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Equilibrio',
          alt: 'Paciente practicando equilibrio sobre una plataforma',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Electroterapia',
          alt: 'Equipo de electroterapia junto a una camilla',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Entrada del consultorio con puerta de cristal',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quien <span class="lz-title__serif">te atiende</span>',
      members: [
        {
          name: 'Lic. Ximena Barrera',
          role: 'Fisioterapia ortopédica',
          tags: ['Cédula 0000000', 'Columna y rodilla'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de la Lic. Ximena Barrera con uniforme blanco',
        },
        {
          name: 'Lic. Diego Arteaga',
          role: 'Rehabilitación deportiva',
          tags: ['Cédula 0000000', 'Retorno al deporte'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato del Lic. Diego Arteaga en la sala de terapia',
        },
        {
          name: 'Lic. Paula Cisneros',
          role: 'Fisioterapia geriátrica',
          tags: ['Cédula 0000000', 'Equilibrio'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de la Lic. Paula Cisneros sonriendo',
        },
        {
          name: 'Mtro. Emilio Ortega',
          role: 'Neurorrehabilitación',
          tags: ['Cédula 0000000', 'Movilidad funcional'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato del Mtro. Emilio Ortega junto a una ventana',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '42 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Después de mi cirugía de rodilla me dijeron qué esperar cada semana. Los ejercicios impresos me ayudaron mucho en casa.',
          author: 'Laura G.',
        },
        {
          text: 'Entreno los sábados y armamos un regreso por etapas tras un esguince. Las citas siempre empezaron puntuales.',
          author: 'Héctor V.',
        },
        {
          text: 'Acompañé a mi mamá por problemas de equilibrio. Fueron pacientes con ella y nos avisaron cada cita por mensaje.',
          author: 'Alejandra C.',
        },
      ],
      title:
        'Lo que cuentan <span class="lz-title__serif">nuestros pacientes</span>',
      intro:
        'Opiniones de ejemplo; en tu sitio se conectan con tus reseñas de Google.',
      cta: 'Ver reseñas en Google',
      scoreNote: 'Calificación de ejemplo',
    },
    faq: {
      kicker: '{{index}} — Dudas',
      title: 'Antes de tu <span class="lz-title__serif">primera cita</span>',
      intro:
        'Lo que más nos preguntan antes de reservar. Si falta algo, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cuánto dura la primera cita?',
          answer:
            'Alrededor de una hora: conversamos, revisamos tu movimiento y te explicamos el plan antes de empezar.',
        },
        {
          question: '¿Necesito orden de mi médico?',
          answer:
            'No para la valoración. Si tienes estudios o indicaciones, llévalos para revisarlos juntos.',
        },
        {
          question: '¿Cuántas sesiones voy a necesitar?',
          answer:
            'Varía según el caso. Tras la valoración te damos un estimado y lo revisamos contigo en cada etapa.',
        },
        {
          question: '¿Dan factura o recibo para el seguro?',
          answer:
            'Sí, emitimos factura y el comprobante que pida tu aseguradora para solicitar reembolso.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Cita',
      title: 'Reserva tu <span class="lz-title__serif">valoración</span>',
      contactText:
        'Elige cómo prefieres escribirnos. Respondemos en horario del consultorio; si es una urgencia, llama al 911.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Agendar por mensaje',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Escribir por WhatsApp',
      callCta: 'Llamar ahora',
      whatsappNote: 'Respuesta el mismo día',
      callNote: 'En horario de consultorio',
      emailNote: 'Para facturas y estudios',
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Vie 8:00–20:00 · Sáb 9:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Agendar valoración por WhatsApp',
    },
    footer: {
      about:
        'Consultorio de fisioterapia en Clavería, {{city}}: cada paciente con su plan por escrito y su cita por WhatsApp.',
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
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Vie 8:00–20:00 · Sáb 9:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
