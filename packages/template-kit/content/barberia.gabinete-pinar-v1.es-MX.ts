// GENERATED from specs/barberia-gabinete-pinar-v1.spec.json (spec af41d063bb47, file a2100b6cecdc). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'barberia',
  locale: 'es-MX',
  business: {
    name: 'Gabinete Pinar',
    shortName: 'Pinar',
    tagline: 'Barbería clásica',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, me gustaría reservar una cita en Gabinete Pinar',
    address: 'Calle Pinar 24, Condesa, Cuauhtémoc, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@gabinetepinar.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=gabinete+pinar+condesa',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=gabinete+pinar+condesa',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}}, barbería clásica en la Condesa. Corte a tijera, afeitado a navaja con toalla caliente y perfilado de barba, con cita por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Reservar cita',
      links: [
        {
          label: 'Estudio',
          href: '#nosotros',
        },
        {
          label: 'Carta',
          href: '#servicios',
        },
        {
          label: 'Barberos',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
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
      imageAlt:
        'Silla de barbero de cuero en penumbra, con vapor de toalla caliente y herramientas sobre madera de nogal',
      eyebrow: 'Barbería clásica · Condesa',
      title: 'El arte del afeitado y el corte clásico',
      text: 'Donde la tradición artesanal se encuentra con la distinción y el estilo contemporáneo, en una sola silla y sin prisa.',
      primaryCta: 'Reservar cita',
      secondaryCta: 'Ver rituales',
      secondaryHref: '#servicios',
      sticker: 'Desde 2016',
    },
    about: {
      kicker: '{{index}} — El gabinete',
      title:
        'Un oficio de <span class="lz-title__serif">navaja</span> y paciencia.',
      summary:
        'En {{shortName}} cortamos y afeitamos como se hacía antes: toalla caliente, navaja recta y una conversación antes de empezar. Un espacio tranquilo para cuidarte sin prisa.',
      stats: [
        {
          value: '+8 años',
          label: 'Con la navaja en mano',
        },
        {
          value: '3 barberos',
          label: 'Cada uno con su oficio',
        },
        {
          value: '+9,000 citas',
          label: 'Atendidas en {{city}}',
        },
      ],
      statement:
        'Un buen afeitado no se apura: se prepara con vapor, aceite y una mano firme.',
      image: 'about.jpg',
      imageAlt:
        'Mesa de nogal con navaja recta, brocha de afeitar y toalla doblada',
      paragraphs: [
        '{{shortName}} abrió en 2016 con una sola silla de cuero en la Condesa. Hoy somos tres barberos con la misma regla: cada cita empieza con diez minutos de consulta.',
        'Trabajamos con tijera cuando el corte lo pide, afeitamos a navaja con toalla caliente y usamos productos de pequeña producción.',
        'Sin pantallas ni prisa. Solo el corte o el afeitado que viniste a buscar, bien hecho.',
      ],
    },
    services: {
      kicker: '{{index}} — Rituales',
      title: 'Servicios y <span class="lz-title__serif">rituales</span>',
      intro:
        'Precios en pesos mexicanos. Cada ritual incluye consulta, toalla caliente y acabado con producto.',
      prices: [
        {
          name: 'Corte ejecutivo y estilizado',
          price: '$520',
          description:
            'Consulta de visajismo, lavado relajante y peinado con pomada mate.',
        },
        {
          name: 'Afeitado tradicional a navaja',
          price: '$420',
          description:
            'Toalla caliente, aceites pre-afeitado, navaja libre y bálsamo frío.',
        },
        {
          name: 'Arreglo y perfilado de barba',
          price: '$320',
          description:
            'Modelado preciso, exfoliación de piel y tónico estimulante.',
        },
        {
          name: 'Experiencia VIP',
          price: '$980',
          description:
            'Corte, barba, mascarilla limpiadora y una bebida de cortesía.',
        },
      ],
      promos: [
        {
          tag: 'Nota',
          title: 'Primera visita',
          text: 'La consulta inicial dura veinte minutos y no tiene costo.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, es mi primera visita a Gabinete Pinar}}',
        },
        {
          tag: 'Nota',
          title: 'Membresía mensual',
          text: 'Dos cortes y un afeitado al mes por $1,400, con prioridad de agenda.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero información de la membresía mensual}}',
        },
        {
          tag: 'Nota',
          title: 'Bodas y eventos',
          text: 'Atendemos al novio y a su grupo en el gabinete o a domicilio.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar un servicio para un evento}}',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro:
        'Antes de sentarte en la silla, esto es lo que conviene saber. Si algo falta, pregúntanos.',
      cta: 'Escribir por WhatsApp',
      items: [
        {
          question: '¿Cómo reservo mi lugar?',
          answer:
            'Por WhatsApp, con un día de anticipación. Cada persona tiene su hora completa y su silla, por eso no atendemos sin cita.',
        },
        {
          question: '¿Cuánto cuesta cada ritual?',
          answer:
            'El corte ejecutivo es de $520, el afeitado a navaja de $420 y el arreglo de barba de $320. La experiencia VIP cuesta $980.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Efectivo, tarjeta de débito o crédito y transferencia. La propina se reparte entre los tres barberos.',
        },
        {
          question: '¿Puedo cambiar mi cita?',
          answer:
            'Claro: avísanos con 12 horas de anticipación y la movemos sin costo. Con menos aviso, se cobra la mitad del servicio.',
        },
        {
          question: '¿Cuánto tiempo toma cada ritual?',
          answer:
            'El corte toma cerca de una hora, el afeitado a navaja unos cuarenta minutos y la experiencia VIP, hora y media.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Ven a la <span class="lz-title__serif">Condesa</span>',
      hoursLabel: 'Horario',
      whatsappCta: 'Agendar por WhatsApp',
      callCta: 'Llamar',
      directionsLabel: 'Cómo llegar',
      contactText:
        'Contestamos mensajes de lunes a sábado dentro del horario. Para bodas y grupos, escríbenos al correo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      branches: [
        {
          name: 'Condesa',
          address: '{{address}}',
          hours: 'Lun–Sáb 09:00–20:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Condesa',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Escribir a Gabinete Pinar',
    },
    footer: {
      about:
        'Barbería clásica en la Ciudad de México. Corte, afeitado a navaja y perfilado de barba, con cita y sin prisa.',
      branchesTitle: 'Gabinete',
      branches: [
        {
          name: 'Condesa',
          address: '{{address}}',
          hours: 'Lun–Sáb 09:00–20:00',
        },
      ],
      linksTitle: 'Secciones',
      links: [
        {
          label: 'Estudio',
          href: '#nosotros',
        },
        {
          label: 'Carta',
          href: '#servicios',
        },
        {
          label: 'Barberos',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#sucursales',
        },
      ],
      contactTitle: 'Contacto',
    },
    team: {
      kicker: '{{index}} — Maestros barberos',
      title: 'Las manos <span class="lz-title__serif">detrás</span>',
      members: [
        {
          name: 'Mateo Ibarra',
          role: 'Fundador · afeitado a navaja',
          tags: ['Navaja recta', 'Toalla caliente'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Mateo Ibarra afilando una navaja recta',
        },
        {
          name: 'Joaquín Serrano',
          role: 'Corte clásico',
          tags: ['Fade clásico', 'Tijera'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Joaquín Serrano con peine y tijera',
        },
        {
          name: 'Leandro Vela',
          role: 'Barba y perfilado',
          tags: ['Perfilado', 'Tónicos'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Leandro Vela perfilando una barba',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Experiencia',
      title: 'Galería del <span class="lz-title__serif">gabinete</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Sillón de cuero y cromo',
          alt: 'Sillón de barbero de cuero con estructura cromada junto a un espejo',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Navaja recta',
          alt: 'Navaja recta de acero pulido sobre una toalla doblada',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Corte en curso',
          alt: 'Barbero trabajando un corte de precisión con tijera',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Toalla caliente',
          alt: 'Toalla caliente humeante lista para un afeitado',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Instrumental',
          alt: 'Tijeras, peine y brocha ordenados sobre madera de nogal',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Perfilado',
          alt: 'Barba perfilada con navaja en el contorno',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Pomada mate',
          alt: 'Frascos de pomada y tónico sobre la repisa',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'El gabinete',
          alt: 'Vista del gabinete con dos sillones y luz tenue',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: 'Opiniones de ejemplo',
      allReviewsCta: 'Leer todas',
      writeReviewCta: 'Escribir una opinión',
      reviews: [
        {
          text: 'Mateo me preguntó cómo me peino por la mañana antes de tocar la tijera. El corte sigue viéndose bien un mes después.',
          author: 'Andrés M. · cliente desde 2019',
        },
        {
          text: 'El afeitado a navaja es un ritual. Sin música alta, sin prisa y con la toalla a la temperatura justa.',
          author: 'Rodrigo P.',
        },
        {
          text: 'Fui con mi hermano a la experiencia VIP y salimos como nuevos. La bebida de cortesía fue un buen detalle.',
          author: 'Fernando L.',
        },
      ],
    },
    marquee: {
      label: 'Especialidades de la barbería',
      items: [
        'Navaja recta',
        'Toalla caliente',
        'Fade clásico',
        'Perfilado de barba',
        'Solo con cita',
      ],
    },
  },
} satisfies ContentPack;
