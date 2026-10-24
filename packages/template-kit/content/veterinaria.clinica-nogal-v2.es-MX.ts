// GENERATED from specs/veterinaria-clinica-nogal-v2.spec.json (spec 898b377e41b4, file 836ca8306e72). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'veterinaria',
  locale: 'es-MX',
  business: {
    name: 'Clínica Nogal',
    shortName: 'Clínica Nogal',
    tagline: 'Veterinaria y estética',
    city: 'Toluca',
    phone: '+52 722 000 0000',
    whatsapp: '5217220000000',
    whatsappMessage: 'Hola, quiero agendar una cita para mi mascota',
    address: 'Av. Morelos 812, Col. Colón, Toluca',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'citas@clinicanogal.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=clinica+nogal+colon',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=clinica+nogal+colon',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: veterinaria con consulta sin prisa, vacunas, baño y corte, hospedaje y urgencias por teléfono.',
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
          label: 'Instalaciones',
          href: '#galeria',
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
      sticker: 'Abierto hoy',
      note: '4.9 en Google · 205 reseñas',
      image: 'hero.jpg',
      imageAlt: 'Perrito contento con arnés rojo en la sala de la clínica',
      eyebrow: 'Veterinaria · Colón',
      title:
        'Consulta sin prisa para tu <span class="lz-title__serif">perro y tu gato</span>.',
      text: 'Medicina preventiva, vacunas y estética canina con trato paciente y explicaciones claras. Agenda por WhatsApp y te recordamos la cita.',
      primaryCta: 'Agendar cita',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
    },
    marquee: {
      label: 'Servicios de la veterinaria',
      items: [
        'Consulta general',
        'Vacunas',
        'Desparasitación',
        'Baño y corte',
        'Hospedaje',
      ],
    },
    about: {
      kicker: '{{index}} — Cómo agendar',
      title:
        'Agenda tu <span class="lz-title__serif">visita</span> en tres pasos',
      summary:
        'Sencillo y directo: nos escribes, elegimos horario y llegas con calma.',
      primaryCta: 'Agendar por WhatsApp',
      steps: [
        {
          title: 'Escríbenos por WhatsApp',
          text: 'Cuéntanos de tu mascota y qué necesita; te respondemos en horario de la clínica.',
        },
        {
          title: 'Elegimos día y hora',
          text: 'Te proponemos un espacio sin prisas y te mandamos un recordatorio el día antes.',
        },
        {
          title: 'Ven con calma',
          text: 'Llega con su carnet si lo tienes; hay estacionamiento al frente.',
        },
      ],
      statement:
        'Una mascota tranquila se deja revisar mejor, y por eso cuidamos el ritmo de cada visita.',
      image: 'about.jpg',
      imageAlt: 'Gato sobre una manta en la sala de consulta',
      sticker: 'Cédula profesional 0000000',
      paragraphs: [
        'Perros y gatos de todas las edades, con citas espaciadas para que la sala nunca se llene.',
        'Guardamos su historial y te avisamos por WhatsApp cuando toca la siguiente vacuna.',
        'En estética usamos champú suave y secado a baja temperatura.',
      ],
      stats: [
        {
          value: '+10 años',
          label: 'Cuidando al barrio',
        },
        {
          value: '+5,000',
          label: 'Pacientes atendidos',
        },
        {
          value: '4.9 ★',
          label: 'Calificación en Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Servicios y <span class="lz-title__serif">tarifas</span>',
      intro:
        'Tarifas de ejemplo en pesos para perros y gatos. El precio final depende del tamaño y te lo confirmamos antes.',
      prices: [
        {
          name: 'Consulta general',
          price: '$450',
          description: 'Revisión completa, peso y plan de cuidado.',
        },
        {
          name: 'Vacuna integral',
          price: 'Desde $350',
          description:
            'Esquema para perros o gatos y anotación en su cartilla.',
        },
        {
          name: 'Desparasitación',
          price: 'Desde $180',
          description: 'Tratamiento interno o externo según peso y edad.',
        },
        {
          name: 'Baño y corte',
          price: 'Desde $380',
          description: 'Champú suave, corte, uñas y limpieza de oídos.',
        },
        {
          name: 'Esterilización',
          price: 'Cotiza',
          description: 'Valoración previa y seguimiento después de la cirugía.',
        },
        {
          name: 'Hospedaje',
          price: '$350/noche',
          description: 'Paseos, comida y fotos de tu mascota cada día.',
        },
      ],
      promos: [
        {
          tag: 'Cachorros',
          title: 'Primeras vacunas en un paquete',
          text: 'Esquema completo con consulta y cartilla; consulta cómo dividir el pago.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero el paquete de primeras vacunas}}',
        },
        {
          tag: 'Estética',
          title: 'Baño cada mes con aviso',
          text: 'Reserva el baño mensual y te escribimos un día antes para confirmar.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar el baño mensual}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — La clínica',
      title: 'Un espacio <span class="lz-title__serif">tranquilo</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Pasillo y sala de espera de la clínica',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Consultorio',
          alt: 'Sala de exploración con camilla',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Baño',
          alt: 'Persona bañando a un perro en la tina',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Gatos',
          alt: 'Gatito recostado sobre una cobija',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Uñas',
          alt: 'Persona cortando las uñas a un perro',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Descanso',
          alt: 'Perro cocker bajo una cobija',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Médicos',
      title: 'Quién los <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'MVZ Laura Zamora',
          role: 'Médica veterinaria',
          tags: ['Cédula 0000000', 'Perros'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de la MVZ Laura Zamora con un perro',
        },
        {
          name: 'MVZ Andrés Peña',
          role: 'Medicina felina',
          tags: ['Cédula 0000000', 'Gatos'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato del MVZ Andrés Peña cargando un gato',
        },
        {
          name: 'Ximena Duarte',
          role: 'Estética canina',
          tags: ['Baño', 'Corte'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Ximena Duarte en el área de estética',
        },
        {
          name: 'Rubén Olvera',
          role: 'Recepción y hospedaje',
          tags: ['Citas', 'Paseos'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Rubén Olvera en la recepción',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '205 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Mi gata odia el transportador y aun así salió tranquila. La doctora se tomó su tiempo y me escribió el plan por WhatsApp.',
          author: 'Carolina H.',
          place: 'Col. Colón',
        },
        {
          text: 'Cada mes llevamos a Bruno al baño: vuelve relajado y con el pelo suave.',
          author: 'Eduardo M.',
          place: 'Toluca',
        },
        {
          text: 'Dejamos a Luna un fin de semana y recibimos fotos suyas en la mañana y en la tarde.',
          author: 'Natalia B.',
          place: 'Metepec',
        },
      ],
      title: 'Familias que nos recomiendan',
      cta: 'Ver todas en Google',
    },
    faq: {
      kicker: '{{index}} — Dudas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que más nos preguntan antes de la primera visita. Si falta algo, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Hay que pedir cita?',
          answer:
            'Para consulta, vacunas y estética, sí; así cada mascota tiene su tiempo. Si es una urgencia, marca antes de venir.',
        },
        {
          question: '¿Reciben gatos?',
          answer:
            'Claro. Tenemos horarios para felinos y un rincón de espera aparte, lejos de los perros.',
        },
        {
          question: '¿Cuánto cuesta el baño?',
          answer:
            'Parte de $380 y cambia con el tamaño y el largo del pelo. Te damos el precio exacto al agendar.',
        },
        {
          question: '¿Qué llevo a la primera consulta?',
          answer:
            'Su cartilla de vacunas, si la tienes, y una muestra reciente de heces si te es posible.',
        },
        {
          question: '¿Cómo puedo pagar?',
          answer:
            'Aceptamos efectivo, tarjeta de débito o crédito y transferencia.',
        },
        {
          question: '¿Qué incluye el hospedaje?',
          answer:
            'Pedimos vacunas vigentes. Incluye alimento, paseos y fotos diarias que te mandamos por WhatsApp.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Agenda su <span class="lz-title__serif">cita</span>',
      contactText:
        'Escríbenos para agendar; contestamos dentro del horario de la clínica. Si es urgente, mejor llama.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Agendar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Agendar por WhatsApp',
      callCta: 'Llamar',
      whatsappNote: 'Citas y dudas',
      callNote: 'Para urgencias, llama',
      emailNote: 'Recordatorios y recetas',
      branches: [
        {
          name: 'Colón',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–20:00 · Dom 10:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Colón',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Agendar cita por WhatsApp',
    },
    footer: {
      about:
        'Veterinaria y estética canina en {{city}}, con citas y recordatorios por WhatsApp.',
      branchesTitle: 'Clínica',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
      monogram: 'CN',
      motto: 'Consulta sin prisa',
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
          label: 'Instalaciones',
          href: '#galeria',
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
          name: 'Colón',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–20:00 · Dom 10:00–14:00',
        },
      ],
    },
    cta: {
      badge: 'Urgencias',
      title: 'En una urgencia, llámanos antes de salir',
      text: 'Así preparamos el consultorio y el material mientras vienes en camino. Si estamos cerrados, te decimos a dónde acudir.',
      phoneLabel: 'Teléfono directo',
      primaryCta: 'Llamar ahora',
      secondaryCta: 'Escribir WhatsApp',
      secondaryHref: '{{whatsappUrl:Hola, tengo una urgencia con mi mascota}}',
      hours: [
        {
          label: 'Lun–Sáb',
          value: '9:00–20:00',
        },
        {
          label: 'Dom',
          value: '10:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
