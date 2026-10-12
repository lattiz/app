// GENERATED from specs/veterinaria-clinica-nogal.spec.json (spec 62220a7fac35, file cabf5649431f). Do not edit: use the spec, or freeze.
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
      '{{name}} en {{city}}: consultas, vacunas, estética canina y hospedaje con citas por WhatsApp.',
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
          label: 'Médicos',
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
      imageAlt: 'Veterinaria revisando a un perro sobre la mesa de consulta',
      eyebrow: 'Veterinaria · Colón',
      title:
        'Cuidamos a tu mascota <span class="lz-title__serif">como familia</span>.',
      text: 'Consultas con tiempo, vacunas al día, baño y corte. Agenda por WhatsApp y te recordamos la próxima cita.',
      primaryCta: 'Agendar cita',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Perros y gatos',
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
      kicker: '{{index}} — Nosotros',
      title:
        'Consultas <span class="lz-title__serif">tranquilas</span>, para ellos y para ti.',
      summary:
        'En {{shortName}} revisamos a cada mascota sin prisa, te explicamos lo que encontramos y te mandamos el carnet y los recordatorios por WhatsApp.',
      statement:
        'Una mascota tranquila se revisa mejor: por eso damos tiempo, premios y una mesa sin prisas.',
      image: 'about.jpg',
      imageAlt: 'Gato sobre una manta en la sala de consulta',
      sticker: 'Cédula profesional 0000000',
      paragraphs: [
        'Atendemos perros y gatos de todas las edades, con cita para no amontonar la sala.',
        'Llevamos su carnet de vacunas y te avisamos por WhatsApp cuando toca la siguiente.',
        'En estética usamos productos suaves y secado a temperatura baja.',
      ],
      stats: [
        {
          value: '+10 años',
          label: 'En el barrio',
        },
        {
          value: '+5,000',
          label: 'Mascotas atendidas',
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
        'Precios en pesos mexicanos para perros y gatos; varían según tamaño. Te confirmamos al agendar.',
      prices: [
        {
          name: 'Consulta general',
          price: '$450',
          description: 'Revisión completa y plan de cuidado.',
        },
        {
          name: 'Vacuna',
          price: 'Desde $350',
          description: 'Aplicación y registro en el carnet.',
        },
        {
          name: 'Desparasitación',
          price: 'Desde $180',
          description: 'Interna o externa, según peso.',
        },
        {
          name: 'Baño y corte',
          price: 'Desde $380',
          description: 'Baño, corte, uñas y limpieza de oídos.',
        },
        {
          name: 'Esterilización',
          price: 'Cotiza',
          description: 'Valoración previa y cuidados posteriores.',
        },
        {
          name: 'Hospedaje',
          price: '$350/noche',
          description: 'Con paseos, comida y fotos diarias.',
        },
      ],
      promos: [
        {
          tag: 'Cachorros',
          title: 'Paquete de primeras vacunas',
          text: 'Esquema completo con consulta y carnet; pregunta por pagos en partes.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero el paquete de vacunas para cachorro}}',
        },
        {
          tag: 'Estética',
          title: 'Baño mensual con recordatorio',
          text: 'Agenda el baño cada mes y te avisamos por WhatsApp un día antes.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar baño mensual}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Instalaciones',
      title: 'Un lugar <span class="lz-title__serif">limpio</span> y tranquilo',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción de la veterinaria con un perro esperando',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Consultorio',
          alt: 'Mesa de consulta veterinaria limpia',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Estética',
          alt: 'Perro en la tina de baño con espuma',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Gatos',
          alt: 'Gato descansando en una cama de consultorio',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Corte',
          alt: 'Estilista canina cortando el pelo a un perro pequeño',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Hospedaje',
          alt: 'Área de hospedaje con camas y juguetes',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Vacunas',
          alt: 'Carnet de vacunación junto a una correa',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Fachada de la veterinaria con un perro en la puerta',
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
      kicker: '{{index}} — Reseñas',
      score: '4.9',
      summary: '205 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'La doctora fue muy paciente con mi gata, que odia salir de casa. Me explicó todo y me mandó el carnet por WhatsApp.',
          author: 'Carolina H.',
        },
        {
          text: 'Llevo a mi perro al baño cada mes y siempre regresa tranquilo y oliendo rico.',
          author: 'Eduardo M.',
        },
        {
          text: 'Lo dejamos en hospedaje un fin de semana y nos mandaron fotos todos los días.',
          author: 'Natalia B.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que suelen preguntarnos antes de la primera visita. Para lo demás, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Necesito cita?',
          answer:
            'Para consulta y estética, sí. Si tu mascota tiene una urgencia, llámanos antes de venir.',
        },
        {
          question: '¿Atienden gatos?',
          answer:
            'Sí, con horarios y una sala de espera separada para que estén más tranquilos.',
        },
        {
          question: '¿Cuánto cuesta el baño?',
          answer:
            'Desde $380 según tamaño y largo de pelo; te confirmamos el precio al agendar.',
        },
        {
          question: '¿Qué llevo a la primera consulta?',
          answer:
            'Su carnet de vacunas si lo tienes, y si es posible, una muestra de heces reciente.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer: 'Efectivo, tarjetas de débito y crédito, y transferencia.',
        },
        {
          question: '¿Cómo funciona el hospedaje?',
          answer:
            'Pedimos vacunas al día; incluye comida, paseos y fotos diarias por WhatsApp.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Agenda su <span class="lz-title__serif">cita</span>',
      contactText:
        'Respondemos mensajes en horario de la clínica. En una urgencia, llámanos antes de salir.',
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
        'Veterinaria en {{city}}. Consultas, vacunas, estética canina y hospedaje con cita por WhatsApp.',
      branchesTitle: 'Clínica',
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
          label: 'Médicos',
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
          name: 'Colón',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–20:00 · Dom 10:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
