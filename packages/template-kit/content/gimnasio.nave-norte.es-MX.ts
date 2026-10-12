// GENERATED from specs/gimnasio-nave-norte.spec.json (spec 2f28c4a23c7a, file 2227fddb4162). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'gimnasio',
  locale: 'es-MX',
  business: {
    name: 'Nave Norte',
    shortName: 'Nave Norte',
    tagline: 'Gimnasio y clases',
    city: 'León',
    phone: '+52 477 000 0000',
    whatsapp: '5214770000000',
    whatsappMessage: 'Hola, quiero una clase de prueba',
    address: 'Blvd. Campestre 1520, Jardines del Moral, León',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@navenorte.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=nave+norte+jardines+del+moral',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=nave+norte+jardines+del+moral',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: membresías, clases de funcional, yoga y fuerza con coaches. Pide tu clase de prueba.',
  },
  sections: {
    navbar: {
      cta: 'Clase de prueba',
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
      image: 'hero.jpg',
      imageAlt: 'Personas entrenando con pesas en un gimnasio iluminado',
      eyebrow: 'Gimnasio y clases · Jardines del Moral',
      title:
        'Entrena con <span class="lz-title__serif">constancia</span>, no con prisa.',
      text: 'Clases en grupo pequeño, coaches que te corrigen y horarios desde las 6 de la mañana. Tu primera clase es de prueba.',
      primaryCta: 'Pedir clase de prueba',
      secondaryCta: 'Ver membresías',
      secondaryHref: '#servicios',
      sticker: 'Grupos de 12',
    },
    marquee: {
      label: 'Clases del gimnasio',
      items: ['Funcional', 'Fuerza', 'Yoga', 'Movilidad', 'Cardio en grupo'],
    },
    about: {
      kicker: '{{index}} — El gym',
      title:
        'Un lugar para <span class="lz-title__serif">volver</span> cada semana.',
      summary:
        'En {{shortName}} entrenas en grupos pequeños con un coach que conoce tu nombre, tu nivel y cómo vas avanzando.',
      statement:
        'Lo importante no es la primera semana, sino la décima: por eso cuidamos la técnica y el ritmo de cada quien.',
      image: 'about.jpg',
      imageAlt: 'Zona de pesas del gimnasio con racks y discos',
      sticker: 'Clase de prueba',
      paragraphs: [
        'Clases de 50 minutos de lunes a sábado, temprano y en la noche.',
        'Cada clase se adapta a tu nivel: empiezas con técnica y subes la carga con el coach.',
        'Si tienes alguna lesión, consulta a tu médico antes de empezar y avísanos.',
      ],
      stats: [
        {
          value: '6:00',
          label: 'Primera clase',
        },
        {
          value: '12',
          label: 'Personas por grupo',
        },
        {
          value: '4.9 ★',
          label: 'En Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Membresías',
      title: 'Membresías y <span class="lz-title__serif">clases</span>',
      intro:
        'Precios en pesos mexicanos. Sin inscripción el primer mes; pregunta por pagos trimestrales.',
      prices: [
        {
          name: 'Clase suelta',
          price: '$150',
          description: 'Cualquier clase del horario, sin membresía.',
        },
        {
          name: '8 clases al mes',
          price: '$890',
          description: 'Dos clases por semana, en el horario que elijas.',
        },
        {
          name: 'Ilimitado',
          price: '$1,290',
          description: 'Todas las clases y el área de pesas libre.',
        },
        {
          name: 'Estudiante',
          price: '$990',
          description: 'Ilimitado con credencial vigente.',
        },
        {
          name: 'Entrenamiento personal',
          price: '$450',
          description: 'Sesión uno a uno con plan de trabajo.',
        },
        {
          name: 'Yoga y movilidad',
          price: '$690',
          description: 'Ocho clases al mes, para estirar y respirar.',
        },
      ],
      promos: [
        {
          tag: 'Primera vez',
          title: 'Clase de prueba sin costo',
          text: 'Ven a una clase, conoce al coach y decide después.',
          cta: 'Pedir clase',
          href: '{{whatsappUrl:Hola, quiero una clase de prueba}}',
        },
        {
          tag: 'En pareja',
          title: 'Inscríbanse juntos',
          text: 'Dos membresías ilimitadas con 10 % de descuento el primer mes.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, queremos inscribirnos en pareja}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Fotos',
      title: 'Así se <span class="lz-title__serif">entrena</span> aquí',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Zona de pesas',
          alt: 'Racks y discos de pesas en fila',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Funcional',
          alt: 'Grupo haciendo sentadillas con balón',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Yoga',
          alt: 'Clase de yoga sobre tapetes con luz de mañana',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Técnica',
          alt: 'Coach corrigiendo la postura de una alumna',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Cardio',
          alt: 'Bicicletas fijas en una sala',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Kettlebells',
          alt: 'Kettlebells de colores en el piso',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Vestidores',
          alt: 'Vestidores con lockers y bancas',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Fachada del gimnasio con letrero iluminado',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Coaches',
      title: 'Quién te <span class="lz-title__serif">entrena</span>',
      members: [
        {
          name: 'Diego Salazar',
          role: 'Head coach',
          tags: ['Fuerza', 'Técnica'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Diego Salazar en la zona de pesas',
        },
        {
          name: 'Mónica Villa',
          role: 'Coach de funcional',
          tags: ['Funcional', 'Cardio'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Mónica Villa con una cuerda de saltar',
        },
        {
          name: 'Sergio Lara',
          role: 'Entrenador personal',
          tags: ['Uno a uno', 'Principiantes'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Sergio Lara sonriendo',
        },
        {
          name: 'Elena Campos',
          role: 'Yoga y movilidad',
          tags: ['Yoga', 'Respiración'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Elena Campos sobre un tapete de yoga',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.9',
      summary: '183 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Llegué sin saber nada y el coach me enseñó la técnica desde cero. Los grupos son pequeños y se nota.',
          author: 'Mauricio E.',
        },
        {
          text: 'El horario de las 6 de la mañana me salvó. Ya llevo un año viniendo tres veces por semana.',
          author: 'Karen D.',
        },
        {
          text: 'Ambiente buena onda, nadie te presiona. Las clases de yoga de los sábados son mis favoritas.',
          author: 'Luis F.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Horarios',
      title: 'Horarios y <span class="lz-title__serif">dudas</span>',
      intro:
        'Lo que suelen preguntarnos antes de inscribirse. Si tienes otra duda, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Qué horarios tienen?',
          answer:
            'Clases de lunes a viernes a las 6:00, 7:00, 8:00, 18:00, 19:00 y 20:00; sábados a las 9:00 y 10:00.',
        },
        {
          question: '¿Necesito experiencia?',
          answer:
            'No. Cada clase tiene opciones para principiantes y el coach ajusta la carga contigo.',
        },
        {
          question: '¿Cómo es la clase de prueba?',
          answer:
            'Escríbenos para apartar lugar, llega 10 minutos antes y trae agua y toalla.',
        },
        {
          question: '¿Hay inscripción?',
          answer:
            'El primer mes no pagas inscripción. Después, una cuota anual que te confirmamos al inscribirte.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Efectivo, tarjeta y transferencia; también pagos trimestrales.',
        },
        {
          question: '¿Tienen regaderas y lockers?',
          answer: 'Sí, vestidores con regaderas y lockers con candado propio.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Ven a tu <span class="lz-title__serif">primera clase</span>',
      contactText:
        'Respondemos mensajes en horario del gimnasio. Aparta tu clase de prueba con un día de anticipación.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Clase de prueba',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Pedir clase de prueba',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Jardines del Moral',
          address: '{{address}}',
          hours: 'Lun–Vie 6:00–22:00 · Sáb 8:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Jardines del Moral',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Pedir clase de prueba por WhatsApp',
    },
    footer: {
      about:
        'Gimnasio en {{city}}. Clases de funcional, fuerza y yoga en grupos pequeños, con coaches.',
      branchesTitle: 'Gimnasio',
      linksTitle: 'Secciones',
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
          name: 'Jardines del Moral',
          address: '{{address}}',
          hours: 'Lun–Vie 6:00–22:00 · Sáb 8:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
