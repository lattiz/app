// GENERATED from specs/clinica-cauce.spec.json (spec b8561714764d, file 297f82bda3bf). Do not edit: use the spec, or freeze.
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
      '{{name}} en {{city}}: fisioterapia y rehabilitación integral con valoración, plan por escrito y citas por WhatsApp.',
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
        'Fisioterapeuta guiando un ejercicio de movilidad en una sala luminosa',
      eyebrow: 'Fisioterapia · Clavería',
      title:
        'Rehabilitación con <span class="lz-title__serif">calma</span>, paso a paso.',
      text: 'Valoración detallada, plan por escrito y sesiones de 50 minutos con un solo especialista, en un consultorio tranquilo.',
      primaryCta: 'Agendar valoración',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Valoración con cita',
    },
    marquee: {
      label: 'Servicios del consultorio',
      items: [
        'Valoración inicial',
        'Terapia manual',
        'Rehabilitación posoperatoria',
        'Fisioterapia deportiva',
        'Equilibrio y movilidad',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Movimiento con <span class="lz-title__serif">técnica</span> y atención personal.',
      summary:
        'En {{shortName}} cada sesión es individual: medimos, explicamos qué encontramos y armamos un plan por etapas que puedas seguir en casa.',
      statement:
        'Rehabilitar es un trabajo en equipo: medimos, explicamos cada paso y ajustamos el plan contigo.',
      image: 'about.jpg',
      imageAlt: 'Recepción del consultorio con plantas y luz natural',
      sticker: 'Cédula profesional vigente',
      paragraphs: [
        '{{shortName}} reúne fisioterapeutas de ortopedia, deporte y adulto mayor que comparten expediente y criterios.',
        'Cada paciente tiene un solo especialista de referencia y un plan por escrito con ejercicios para casa.',
        'Trabajamos con cita, en grupos pequeños de sala, para que tu sesión no sea una fila.',
      ],
      stats: [
        {
          value: '50 min',
          label: 'Por sesión individual',
        },
        {
          value: '+12 años',
          label: 'De experiencia clínica',
        },
        {
          value: '1 a 1',
          label: 'Atención personalizada',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Servicios y <span class="lz-title__serif">terapias</span>',
      intro:
        'Precios de ejemplo en pesos mexicanos. Pregunta por paquetes de sesiones y factura.',
      prices: [
        {
          name: 'Valoración inicial',
          price: '$850',
          description:
            'Historia clínica, pruebas de movimiento y plan por escrito.',
        },
        {
          name: 'Sesión de fisioterapia',
          price: '$700',
          description: '50 minutos de terapia manual y ejercicio guiado.',
        },
        {
          name: 'Rehabilitación postquirúrgica',
          price: 'Desde $800',
          description:
            'Plan por etapas, coordinado con las indicaciones de tu cirujano.',
        },
        {
          name: 'Fisioterapia deportiva',
          price: '$750',
          description: 'Retorno gradual al entrenamiento con criterios claros.',
        },
        {
          name: 'Equilibrio y adulto mayor',
          price: '$700',
          description:
            'Fuerza, marcha y prevención de caídas con ejercicios seguros.',
        },
        {
          name: 'Electroterapia y ultrasonido',
          price: '$450',
          description:
            'Complemento a tu sesión, según la indicación del terapeuta.',
        },
      ],
      promos: [
        {
          tag: 'Paquete',
          title: 'Cinco sesiones con seguimiento',
          text: 'Agenda cinco sesiones y recibe un reporte de avance por escrito al terminar.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero el paquete de cinco sesiones}}',
        },
        {
          tag: 'Empresas',
          title: 'Pausas activas y ergonomía',
          text: 'Talleres en tus oficinas para cuidar espalda, cuello y muñecas de tu equipo.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar pausas activas para mi empresa}}',
        },
      ],
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
      kicker: '{{index}} — Especialistas',
      title: 'Quién te <span class="lz-title__serif">atiende</span>',
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
          text: 'Llegué con la rodilla inflamada tras una operación. Me explicaron cada etapa y los ejercicios para casa quedaron por escrito.',
          author: 'Laura G.',
        },
        {
          text: 'Corro los fines de semana y Diego armó un plan para volver a entrenar por etapas. Siempre empezaron a la hora.',
          author: 'Héctor V.',
        },
        {
          text: 'Llevé a mi mamá por problemas de equilibrio. La trataron con paciencia y nos mandaron recordatorios por WhatsApp.',
          author: 'Alejandra C.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Dudas habituales antes de la primera sesión. Si falta alguna, pregúntanos por WhatsApp.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cuánto cuestan la valoración y las sesiones?',
          answer:
            'La valoración inicial cuesta $850 y cada sesión de 50 minutos $700. El precio final se confirma al reservar.',
        },
        {
          question: '¿Necesito orden médica para venir?',
          answer:
            'No es indispensable para la valoración. Si tienes estudios o indicaciones de tu médico, tráelos para revisarlos juntos.',
        },
        {
          question: '¿Cuántas sesiones voy a necesitar?',
          answer:
            'Depende de cada caso. Después de la valoración te damos un plan con un estimado de sesiones y lo revisamos contigo cada semana.',
        },
        {
          question: '¿Aceptan seguros de gastos médicos?',
          answer:
            'Te damos factura y los documentos que pide tu aseguradora para que solicites el reembolso.',
        },
        {
          question: '¿Cómo cancelo o cambio mi cita?',
          answer:
            'Avísanos por WhatsApp con al menos 12 horas de anticipación y la cambiamos sin costo.',
        },
        {
          question: '¿Qué ropa llevo a mi primera sesión?',
          answer:
            'Ropa cómoda que te permita moverte, y tus estudios o resultados recientes si los tienes.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Agenda tu <span class="lz-title__serif">valoración</span>',
      contactText:
        'Contestamos de lunes a sábado dentro del horario del consultorio. Ante una urgencia, marca al 911.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Agendar valoración',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Agendar por WhatsApp',
      callCta: 'Llamar',
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
        'Fisioterapia y rehabilitación en {{city}}, colonia Clavería. Valoración, terapia y seguimiento con cita por WhatsApp.',
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
