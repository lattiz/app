// GENERATED from specs/gimnasio-pulso-deportivo-v2.spec.json (spec 9fbf17764e1c, file d3125f924021). Do not edit: use the spec, or freeze.
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
    whatsappMessage: 'Hola, quiero reservar mi clase de prueba',
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
      '{{name}} en {{city}}: gimnasio de barrio en Clavería con sala de pesas, clases en grupo, membresías y primera clase de prueba.',
  },
  sections: {
    navbar: {
      cta: 'Clase de prueba',
      notice: 'Lun a sáb · Clase de prueba',
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
          label: 'Fotos',
          href: '#galeria',
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
      imageAlt: 'Fila de mancuernas en un rack del gimnasio con luz natural',
      eyebrow: 'Gimnasio de barrio · Clavería',
      title: 'Tu gym de barrio en Clavería',
      text: 'Sala de pesas, clases en grupo y coaches que te corrigen la técnica. Pasa a conocernos y haz tu primera clase de prueba.',
      primaryCta: 'Reserva tu clase',
      secondaryCta: 'Horarios y planes',
      secondaryHref: '#servicios',
      sticker: 'Clase de prueba',
      note: 'Abierto de lunes a sábado',
    },
    marquee: {
      label: 'En {{shortName}}',
      items: [
        'Pesas libres',
        'Funcional',
        'Spinning',
        'Yoga y movilidad',
        'Box',
        'Valoración inicial',
      ],
    },
    about: {
      kicker: '{{index}} — Cómo empezar',
      title: 'De la puerta a tu primera clase en tres pasos',
      summary:
        'Sin contratos largos ni letra chica: vienes, entrenas y decides si te quedas.',
      primaryCta: 'Reservar clase de prueba',
      steps: [
        {
          title: 'Escríbenos',
          text: 'Cuéntanos tu horario y qué buscas por WhatsApp. Te respondemos el mismo día.',
        },
        {
          title: 'Haz tu clase de prueba',
          text: 'Un coach te recibe, te enseña la sala y te acompaña en una clase.',
        },
        {
          title: 'Elige tu plan',
          text: 'Pase del día, mensual o trimestral. Pagas solo lo que vas a usar.',
        },
      ],
      statement: 'Aquí entrenas cerca de casa y con alguien que te corrige.',
      image: 'about.jpg',
      imageAlt:
        'Coach explicando un ejercicio a una persona en la sala de pesas',
      sticker: 'Clase de prueba',
      paragraphs: [
        '{{shortName}} es un gimnasio de barrio en Clavería: sala de pesas, clases en grupo y planes sencillos.',
        'Empiezas con una clase de prueba y una valoración inicial antes de elegir tu plan.',
      ],
      stats: [
        {
          value: '4 zonas',
          label: 'Entrenamiento',
        },
        {
          value: 'Lun–Sáb',
          label: 'Abierto casi todo el día',
        },
        {
          value: 'Sin cuota',
          label: 'De inscripción',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Clases y planes',
      title: 'Horarios y membresías',
      intro:
        'Reserva tu lugar por WhatsApp. El cupo por clase es limitado para que el coach pueda corregir a todos.',
      schedule: {
        title: 'Clases de la semana',
        intro:
          'Cuatro zonas de entrenamiento. Los horarios pueden cambiar en días festivos.',
      },
      plans: {
        kicker: 'Planes y tarifas',
        title: 'Elige cómo entrenar',
        intro:
          'Sin cuota de inscripción. Precios de referencia en pesos; se confirman por WhatsApp.',
      },
      promos: [
        {
          tag: 'Zona 01',
          title: 'Fuerza',
          text: 'Pesas libres y racks con un coach que te corrige la técnica.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar una clase de fuerza}}',
          slots: [
            {
              label: 'Lun a vie',
              value: '07:00 – 21:00',
            },
            {
              label: 'Sábados',
              value: '08:00 – 14:00',
            },
          ],
        },
        {
          tag: 'Zona 02',
          title: 'Funcional',
          text: 'Circuitos en grupo con barras, cuerdas y kettlebells.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar una clase de funcional}}',
          slots: [
            {
              label: 'Lun / mié / vie',
              value: '07:00 / 19:00',
            },
            {
              label: 'Mar / jue',
              value: '08:00 / 20:00',
            },
          ],
        },
        {
          tag: 'Zona 03',
          title: 'Spinning',
          text: 'Cardio sobre bici con música, en grupos pequeños.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar una clase de spinning}}',
          slots: [
            {
              label: 'Lun a vie',
              value: '07:00 / 18:00',
            },
            {
              label: 'Sábados',
              value: '09:00',
            },
          ],
        },
        {
          tag: 'Zona 04',
          title: 'Movilidad',
          text: 'Yoga suave y estiramientos para soltar la semana.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar una clase de movilidad}}',
          slots: [
            {
              label: 'Mar y jue',
              value: '09:00 / 20:30',
            },
            {
              label: 'Sábados',
              value: '10:30',
            },
          ],
        },
      ],
      prices: [
        {
          name: 'Pase del día',
          price: '$90',
          description: 'Entras cuando quieras',
          features: ['Acceso a sala de pesas', 'Lockers y regaderas'],
          cta: 'Comprar pase',
          href: '{{whatsappUrl:Hola, quiero un pase del día}}',
        },
        {
          name: 'Mensual',
          price: '$590',
          description: 'Mes corrido',
          badge: 'Más elegida',
          features: [
            'Acceso en horario abierto',
            'Clases en grupo incluidas',
            'Valoración inicial',
          ],
          cta: 'Elegir mensual',
          href: '{{whatsappUrl:Hola, quiero la mensualidad}}',
        },
        {
          name: 'Trimestral',
          price: '$1,490',
          description: 'Tres meses seguidos',
          features: ['Todo lo del plan mensual', 'Un invitado al mes'],
          cta: 'Elegir trimestral',
          href: '{{whatsappUrl:Hola, quiero el plan trimestral}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — El gym',
      title: 'Así se <span class="lz-title__serif">entrena</span> aquí',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Pesas libres',
          alt: 'Mancuernas y barras en un rack de pesas libres',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Clase en grupo',
          alt: 'Grupo entrenando una clase funcional',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Spinning',
          alt: 'Clase de spinning con bicicletas',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Yoga y movilidad',
          alt: 'Persona estirándose sobre un tapete',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Box',
          alt: 'Guantes de box y costal de entrenamiento',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Kettlebells',
          alt: 'Kettlebells alineadas en el piso',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Cuerdas',
          alt: 'Persona sosteniendo cuerdas de batalla para entrenamiento funcional',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Zona de pesas',
          alt: 'Mancuernas ordenadas en el estante',
        },
      ],
      intro: 'La sala, las clases y el equipo que usarás.',
    },
    team: {
      kicker: '{{index}} — Coaches',
      title: 'Tus <span class="lz-title__serif">coaches</span>',
      members: [
        {
          name: 'Diego Morales',
          role: 'Coach de fuerza',
          tags: ['Fuerza', 'Técnica'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Diego Morales en la sala de pesas',
        },
        {
          name: 'Sofía Mendoza',
          role: 'Coach de funcional y movilidad',
          tags: ['Funcional', 'Yoga'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Sofía Mendoza en el estudio',
        },
        {
          name: 'Andrés Vega',
          role: 'Coach de spinning',
          tags: ['Spinning'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Andrés Vega',
        },
        {
          name: 'Paola Ruiz',
          role: 'Recepción y planes',
          tags: ['Atención'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Paola Ruiz en recepción',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Vecinos',
      title: 'Lo que dicen quienes entrenan aquí',
      intro: 'Reseñas de ejemplo; reemplázalas con las de tus clientes.',
      reviews: [
        {
          text: 'Llegué sin saber usar las máquinas y el coach me acompañó las primeras semanas. Sin presiones.',
          author: 'Daniela R.',
          place: 'Vecina de Clavería',
          initials: 'DR',
        },
        {
          text: 'Las clases de funcional son en grupos chicos y siempre hay quien te corrija.',
          author: 'Miguel A.',
          place: 'Clase de funcional',
          initials: 'MA',
        },
        {
          text: 'El plan mensual me conviene y los horarios de la mañana me dejan llegar a la oficina a tiempo.',
          author: 'Paola S.',
          place: 'Plan mensual',
          initials: 'PS',
        },
      ],
      score: '4.9',
      summary: '183 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro: 'Lo que más nos preguntan antes de venir.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cómo es la clase de prueba?',
          answer:
            'Un coach te recibe, te muestra la sala y entrenas una clase. Se agenda por WhatsApp.',
        },
        {
          question: '¿Necesito experiencia?',
          answer:
            'No. Los coaches ajustan los ejercicios a tu nivel. Si tienes una lesión o condición de salud, consulta a tu médico antes de empezar.',
        },
        {
          question: '¿Hay cuota de inscripción?',
          answer:
            'No. Pagas el pase del día, la mensualidad o el plan trimestral.',
        },
        {
          question: '¿Puedo congelar mi membresía?',
          answer:
            'El plan trimestral permite congelarla una vez. Pregunta por las condiciones en recepción.',
        },
        {
          question: '¿Las clases tienen cupo?',
          answer:
            'Sí, para que cada coach pueda corregir a todos. Apartas tu lugar con un mensaje.',
        },
        {
          question: '¿Venden suplementos?',
          answer:
            'Tenemos una tienda pequeña con proteínas, creatina y accesorios. Un suplemento complementa; no sustituye una buena alimentación.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      hoursLabel: 'Horario',
      whatsappNote: 'Atención rápida para apartar tu turno',
      callNote: 'Llamada directa al mostrador',
      emailNote: 'Para eventos privados y grupos',
      whatsappCta: 'Reservar por WhatsApp',
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
      title: 'Pasa a <span class="lz-title__serif">conocernos</span>',
      contactText:
        'Reserva tu clase de prueba, pregunta por los planes o resuelve dudas por el canal que prefieras.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar clase',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      callCta: 'Llamar',
    },
    'floating-whatsapp': {
      label: 'Agendar por WhatsApp',
    },
    footer: {
      monogram: 'P',
      motto: 'Entrena cerca de casa',
      about:
        'Gimnasio de barrio en Clavería, {{city}}: pesas, clases en grupo y membresías.',
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
          label: 'Fotos',
          href: '#galeria',
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
    cta: {
      title: 'Tu primera clase de prueba te espera',
      text: 'Escríbenos, elige un horario y pasa a conocer la sala. Sin compromiso.',
      primaryCta: 'Reservar clase de prueba',
      secondaryCta: 'Ver cómo llegar',
      secondaryHref: '#ubicacion',
    },
  },
} satisfies ContentPack;
