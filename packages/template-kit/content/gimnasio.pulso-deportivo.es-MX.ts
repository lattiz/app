// GENERATED from specs/gimnasio-pulso-deportivo.spec.json (spec a4484a2898ea, file 85e462dc841e). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'gimnasio',
  locale: 'es-MX',
  business: {
    name: 'Pulso Deportivo',
    shortName: 'Pulso',
    tagline: 'Movimiento y nutrición',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero agendar una consulta',
    address: 'Calle Hilo 88, Col. Clavería, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@pulsodeportivo.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=pulso+deportivo+claveria',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=pulso+deportivo+claveria',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: suplementos seleccionados y consultas de coaching, nutrición y fisioterapia.',
  },
  sections: {
    navbar: {
      cta: 'Agendar',
      notice: 'Consultas de lun a sáb · Tienda',
      links: [
        {
          label: 'El gym',
          href: '#nosotros',
        },
        {
          label: 'Membresías',
          href: '#servicios',
        },
        {
          label: 'Coaches',
          href: '#equipo',
        },
        {
          label: 'Horarios',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      facts: [
        {
          value: 'Tienda',
          label: 'Proteínas, creatina y vitaminas',
        },
        {
          value: 'Consultas',
          label: 'Coaching, nutrición y fisioterapia',
        },
      ],
      image: 'hero.jpg',
      imageAlt:
        'Persona entrenando con pesas en un gimnasio luminoso y ordenado',
      eyebrow: 'Tienda y consultorio · Clavería',
      title: 'Entrena con método, come con criterio',
      text: 'Suplementos seleccionados y consultas de coaching, nutrición y fisioterapia en un mismo lugar.',
      primaryCta: 'Agenda una consulta',
      secondaryCta: 'Ver suplementos',
      secondaryHref: '#servicios',
      sticker: 'Valoración inicial',
    },
    marquee: {
      label: 'Lo que hacemos',
      items: [
        'Coaching deportivo',
        'Nutrición deportiva',
        'Fisioterapia',
        'Proteínas y creatina',
        'Valoración inicial',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title: 'Entrenar y comer bien se aprende',
      summary:
        'En {{shortName}} vendemos suplementos y damos consultas. Lo que compras y lo que haces en el gimnasio va en el mismo plan.',
      statement:
        'Un suplemento complementa; no sustituye una dieta ni un tratamiento.',
      image: 'about.jpg',
      imageAlt:
        'Coach revisando una tabla de ejercicios con una persona en la sala de valoración',
      sticker: 'Clase de prueba',
      paragraphs: [
        '{{shortName}} nace como tienda de suplementos y se convirtió en consultorio de coaching, nutrición y fisioterapia.',
        'Empezamos con una valoración: revisamos tu historial, tus metas y tus molestias antes de proponer nada.',
        'Si necesitas un suplemento, te explicamos para qué sirve, cómo se toma y cuándo no conviene.',
      ],
      stats: [
        {
          value: '1 valoración',
          label: 'Antes del primer plan',
        },
        {
          value: '3 áreas',
          label: 'Entrenamiento y salud',
        },
        {
          value: 'Lun–Sáb',
          label: 'Con cita y en tienda',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Tienda',
      title: 'Suplementos y <span class="lz-title__serif">accesorios</span>',
      intro:
        'Categorías con precio de referencia, en pesos. Existencias y envíos se confirman por WhatsApp.',
      prices: [
        {
          name: 'Proteínas',
          price: 'Desde $650',
          description: 'Whey y vegetal, en presentaciones de 1 a 2 kg.',
        },
        {
          name: 'Creatina',
          price: 'Desde $480',
          description: 'Monohidrato en polvo, 300 g.',
        },
        {
          name: 'Vitaminas',
          price: 'Desde $320',
          description: 'Multivitamínicos y minerales para la rutina diaria.',
        },
        {
          name: 'Pre-entreno',
          price: 'Desde $540',
          description:
            'Fórmulas con cafeína. Revisa la etiqueta y tu tolerancia.',
        },
        {
          name: 'Accesorios',
          price: 'Desde $250',
          description: 'Bandas, shaker y guantes para entrenar.',
        },
        {
          name: 'Hidratación',
          price: 'Desde $180',
          description: 'Electrolitos y bebidas isotónicas.',
        },
      ],
      promos: [
        {
          tag: 'Coaching',
          title: 'Coaching deportivo',
          text: 'Plan de entrenamiento con seguimiento semanal.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar coaching deportivo}}',
        },
        {
          tag: 'Nutrición',
          title: 'Nutrición deportiva',
          text: 'Plan de alimentación según tu rutina y tus metas.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar una consulta de nutrición}}',
        },
        {
          tag: 'Fisioterapia',
          title: 'Valoración y fisioterapia',
          text: 'Valoramos la molestia y te proponemos un plan de trabajo.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar una valoración de fisioterapia}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Espacios',
      title: 'Dentro del <span class="lz-title__serif">consultorio</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Área de pesas',
          alt: 'Área de pesas con racks y luz natural',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Estante de suplementos',
          alt: 'Estante con frascos de suplementos ordenados por categoría',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Sala de valoración',
          alt: 'Sala de valoración con camilla y mesa de trabajo',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Accesorios',
          alt: 'Bandas elásticas y mancuernas sobre un tapete',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Sesión de coaching',
          alt: 'Coach corrigiendo la postura de una persona en sentadilla',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Mesa de nutrición',
          alt: 'Mesa de consulta con un plato balanceado y una libreta',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Camilla de fisioterapia',
          alt: 'Camilla de fisioterapia con banda de resistencia',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Recepción',
          alt: 'Recepción con mostrador de madera y estantes de tienda',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quién <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'Diego Morales',
          role: 'Coach deportivo',
          tags: ['Fuerza', 'Movilidad'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Diego Morales en el área de pesas',
        },
        {
          name: 'Sofía Mendoza',
          role: 'Nutrióloga deportiva',
          tags: ['Cédula: pendiente', 'Plan de alimentación'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Sofía Mendoza en su consultorio',
        },
        {
          name: 'Andrés Vega',
          role: 'Fisioterapeuta',
          tags: ['Cédula: pendiente', 'Valoración'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Andrés Vega en la sala de fisioterapia',
        },
        {
          name: 'Paola Ruiz',
          role: 'Tienda y atención',
          tags: ['Pedidos', 'Asesoría'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Paola Ruiz detrás del mostrador',
        },
      ],
    },
    testimonials: {
      scoreNote: 'Calificación de ejemplo',
      kicker: '{{index}} — Clientes',
      score: '4.9',
      summary: '183 reseñas en Google',
      allReviewsCta: 'Ver reseñas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Me explicaron qué iba a hacer en cada sesión y por qué. Sin prisas.',
          author: 'Daniela R.',
        },
        {
          text: 'Pedí mi proteína por WhatsApp y me dijeron la existencia y el tiempo de envío antes de pagar.',
          author: 'Miguel A.',
        },
        {
          text: 'La valoración de fisioterapia fue clara: me dijeron qué podía hacer y qué no todavía.',
          author: 'Paola S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">agendar</span>',
      intro: 'Respuestas cortas a lo que más nos preguntan.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Un suplemento sustituye una dieta?',
          answer:
            'No. Es un complemento. Una dieta balanceada y el entrenamiento van primero.',
        },
        {
          question: '¿Necesito receta para comprar?',
          answer:
            'No vendemos medicamentos. Si tomas medicamentos o tienes una condición de salud, consulta a tu médico antes.',
        },
        {
          question: '¿Cuánto cuesta la primera consulta?',
          answer:
            'La valoración inicial tiene un precio de referencia que confirmamos por WhatsApp según el servicio.',
        },
        {
          question: '¿Atienden lesiones?',
          answer:
            'Fisioterapia valora la molestia y propone un plan. Si hay dolor intenso o síntomas urgentes, acude a urgencias o marca 911.',
        },
        {
          question: '¿Hacen envíos?',
          answer:
            'Sí. Los envíos y las existencias se confirman por WhatsApp antes de pagar.',
        },
        {
          question: '¿Puedo comprar y agendar en la misma visita?',
          answer: 'Sí. Pregunta en recepción y te ayudamos con las dos cosas.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Agendar',
      title: 'Agenda tu <span class="lz-title__serif">consulta</span>',
      contactText:
        'Consultas y pedidos por WhatsApp en el horario del lugar. Facturación y compras al mayoreo, por correo.',
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
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Vie 07:00–21:00 · Sáb 08:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Agendar por WhatsApp',
    },
    footer: {
      about:
        'Tienda y consultorio de coaching, nutrición y fisioterapia en Clavería, {{city}}.',
      branchesTitle: 'Dónde estamos',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'El gym',
          href: '#nosotros',
        },
        {
          label: 'Membresías',
          href: '#servicios',
        },
        {
          label: 'Coaches',
          href: '#equipo',
        },
        {
          label: 'Horarios',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Vie 07:00–21:00 · Sáb 08:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
