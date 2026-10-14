// GENERATED from specs/clinica-brote.spec.json (spec a6eaa7d33f37, file ac8ab7962b5d). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'clinica',
  locale: 'es-MX',
  business: {
    name: 'Brote Nutrición',
    shortName: 'Brote',
    tagline: 'Nutrición clínica y deportiva',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero agendar una consulta de nutrición',
    address:
      'Calle Aristóteles 220, Col. Polanco V Sección, Miguel Hidalgo, 11560 CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@brotenutricion.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=brote+nutricion+polanco',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=brote+nutricion+polanco',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en Polanco, {{city}}: nutrición clínica, deportiva y hábitos saludables con plan por escrito y citas por WhatsApp.',
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
        'Nutrióloga explicando un plan de alimentación en un consultorio luminoso',
      eyebrow: 'Nutrición · Polanco',
      title: 'Comer bien, <span class="lz-title__serif">a tu medida</span>.',
      text: 'Nutrición clínica, deportiva y de estilo de vida con un plan por escrito, hecho a tu rutina y a tus gustos. Agenda por WhatsApp.',
      primaryCta: 'Agendar consulta',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Primera consulta 60 min',
    },
    marquee: {
      label: 'Servicios del consultorio',
      items: [
        'Nutrición clínica',
        'Nutrición deportiva',
        'Composición corporal',
        'Plan por escrito',
        'Seguimiento semanal',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Hábitos que <span class="lz-title__serif">sí puedes sostener</span>.',
      summary:
        'En {{shortName}} partimos de tu rutina, tus gustos y tus estudios. Armamos un plan flexible por escrito y lo ajustamos contigo cada semana.',
      statement:
        'Un buen plan cabe en tu semana: sin listas rígidas, con opciones reales y seguimiento cercano.',
      image: 'about.jpg',
      imageAlt:
        'Mesa de consultorio con frutas, verduras y un plan de alimentación',
      sticker: 'Cédula profesional vigente',
      paragraphs: [
        '{{shortName}} reúne nutriólogas clínicas y deportivas que trabajan juntas con tus estudios y tu médico.',
        'Medimos composición corporal, revisamos tu rutina y acordamos metas realistas por etapas.',
        'Cada consulta termina con un plan escrito y un recordatorio por WhatsApp para la siguiente semana.',
      ],
      stats: [
        {
          value: '+8 años',
          label: 'De experiencia clínica',
        },
        {
          value: '60 min',
          label: 'Primera consulta',
        },
        {
          value: 'Semanal',
          label: 'Seguimiento por WhatsApp',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Consultas y <span class="lz-title__serif">planes</span>',
      intro:
        'Valores de referencia en MXN. Pregunta por paquetes mensuales y facturación.',
      prices: [
        {
          name: 'Primera consulta',
          price: '$900',
          description:
            'Historia clínica, medición y plan de alimentación por escrito.',
        },
        {
          name: 'Consulta de seguimiento',
          price: '$600',
          description:
            'Revisión de avances y ajustes a tu plan, con duración de 40 minutos.',
        },
        {
          name: 'Nutrición deportiva',
          price: '$1,100',
          description:
            'Plan según tu disciplina, horarios de entrenamiento y competencias.',
        },
        {
          name: 'Composición corporal',
          price: '$450',
          description:
            'Medición con bioimpedancia e interpretación en la misma cita.',
        },
        {
          name: 'Plan para el embarazo',
          price: '$950',
          description:
            'Alimentación por trimestre, coordinada con tu ginecólogo.',
        },
        {
          name: 'Taller de hábitos',
          price: '$350',
          description:
            'Sesión grupal para organizar compras, menús y colaciones.',
        },
      ],
      promos: [
        {
          tag: 'Paquete',
          title: 'Primera consulta y 3 seguimientos',
          text: 'Agenda el paquete de un mes y recibe un resumen de avances por escrito.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero el paquete de nutrición de un mes}}',
        },
        {
          tag: 'Empresas',
          title: 'Pláticas y menús para tu equipo',
          text: 'Talleres de alimentación en tus oficinas de Polanco, a la medida de tu horario.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar un taller de nutrición para mi empresa}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Consultorio',
      title: 'Un espacio <span class="lz-title__serif">luminoso</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción luminosa con plantas y sillones',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Consultorio',
          alt: 'Consultorio con escritorio de madera y ventana grande',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Medición',
          alt: 'Báscula y cinta métrica sobre una mesa de consultorio',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Plan por escrito',
          alt: 'Plan de alimentación impreso junto a una libreta',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Alimentos de temporada',
          alt: 'Frutas y verduras frescas sobre una mesa de madera',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Hidratación',
          alt: 'Vaso de agua con rodajas de fruta sobre una mesa',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Sala de espera',
          alt: 'Sala de espera con plantas y luz natural',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Entrada del consultorio con puerta de cristal y plantas',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Especialistas',
      title: 'Quién te <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'Lic. Mariana Escobedo',
          role: 'Nutrición clínica',
          tags: ['Cédula 0000000', 'Metabolismo'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de la Lic. Mariana Escobedo con bata blanca',
        },
        {
          name: 'Lic. Rodrigo Valdés',
          role: 'Nutrición deportiva',
          tags: ['Cédula 0000000', 'Rendimiento'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato del Lic. Rodrigo Valdés en el consultorio',
        },
        {
          name: 'Mtra. Camila Ferrer',
          role: 'Nutrición materno infantil',
          tags: ['Cédula 0000000', 'Embarazo'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de la Mtra. Camila Ferrer sonriendo',
        },
        {
          name: 'Lic. Santiago Beltrán',
          role: 'Hábitos y conducta',
          tags: ['Cédula 0000000', 'Alimentación consciente'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato del Lic. Santiago Beltrán junto a una ventana',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '64 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Me dieron un plan que sí cabe con mis horarios de oficina. Cada semana me escribían para ajustar lo que no funcionó.',
          author: 'Sofía L.',
        },
        {
          text: 'Entreno para un medio maratón y Rodrigo organizó mis comidas alrededor de mis salidas largas.',
          author: 'Andrés T.',
        },
        {
          text: 'Llegué con muchas dudas sobre mi alimentación en el embarazo y me explicaron todo con calma y por escrito.',
          author: 'Mariana C.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que suelen preguntar antes de la primera consulta. Si falta algo, escríbenos por WhatsApp.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cuánto cuesta la primera consulta?',
          answer:
            '$900 e incluye historia clínica, medición y tu plan por escrito. El precio se confirma al agendar.',
        },
        {
          question: '¿Hay que llevar estudios de laboratorio?',
          answer:
            'Si los tienes de los últimos seis meses, tráelos. Si no, te decimos cuáles conviene hacerte.',
        },
        {
          question: '¿Los planes son estrictos?',
          answer:
            'No. Tu plan incluye opciones y equivalencias para que puedas comer fuera, viajar y ajustar sin culpa.',
        },
        {
          question: '¿Atienden a deportistas?',
          answer:
            'Sí, con planes según tu disciplina, horarios de entrenamiento y etapas de competencia.',
        },
        {
          question: '¿Hacen consultas en línea?',
          answer:
            'Sí, por videollamada. Te enviamos el plan y el seguimiento por WhatsApp o correo.',
        },
        {
          question: '¿Dan factura?',
          answer:
            'Sí, con tus datos fiscales al momento de agendar. También te damos los documentos para tu aseguradora.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Agenda tu <span class="lz-title__serif">consulta</span>',
      contactText:
        'Atendemos con cita de lunes a sábado. Escríbenos y te proponemos horario; ante una urgencia médica, marca al 911.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Agendar consulta',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Agendar por WhatsApp',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Polanco',
          address: '{{address}}',
          hours: 'Lun–Vie 8:00–20:00 · Sáb 9:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Polanco',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Agendar consulta por WhatsApp',
    },
    footer: {
      about:
        'Nutrición clínica y deportiva en Polanco, {{city}}. Consulta, plan por escrito y seguimiento con cita por WhatsApp.',
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
          name: 'Polanco',
          address: '{{address}}',
          hours: 'Lun–Vie 8:00–20:00 · Sáb 9:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
