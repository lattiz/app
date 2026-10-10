import type { ContentPack } from '../src/types';
import {
  branchCards,
  footerBranches,
  galleryItems,
  type Branch,
} from './barberia.shared';

/** Norte voice: editorial, sober, about craft. Sentence case, no slang, no exclamation marks. */

const HOURS = 'Mar–Sáb 10:00–20:00 · Dom 11:00–16:00';

const branches: Branch[] = [
  {
    name: 'Roma Norte',
    address: '{{address}}',
    shortAddress: 'Colima 145, Roma Norte, CDMX',
    hours: HOURS,
    query: 'Colima 145 Roma Norte CDMX',
  },
  {
    name: 'Polanco',
    address: 'Emilio Castelar 121, Polanco, Miguel Hidalgo, CDMX',
    shortAddress: 'Emilio Castelar 121, Polanco, CDMX',
    hours: HOURS,
    query: 'Emilio Castelar 121 Polanco CDMX',
  },
];

const links = [
  { label: 'Estudio', href: '#nosotros' },
  { label: 'Carta', href: '#servicios' },
  { label: 'Barberos', href: '#equipo' },
  { label: 'Preguntas', href: '#preguntas' },
  { label: 'Visítanos', href: '#sucursales' },
];

export default {
  vertical: 'barberia',
  locale: 'es-MX',
  business: {
    name: 'Norte Barber Studio',
    shortName: 'Norte',
    tagline: 'Barbería de autor',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, me gustaría reservar una cita',
    address: 'Colima 145, Roma Norte, Cuauhtémoc, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'estudio@nortebarber.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=norte+barber+studio',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=norte+barber+studio+cdmx',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}}, barbería de autor en Roma Norte y Polanco. Cortes a tijera, afeitado clásico con navaja y citas por WhatsApp.',
  },
  sections: {
    navbar: { cta: 'Reservar', links },
    hero: {
      image: 'hero.jpg',
      imageAlt:
        'Barbero de perfil terminando un corte a tijera junto a una ventana con luz natural',
      eyebrow: 'Barbería de autor · Roma Norte',
      title:
        'El oficio de cortar <span class="lz-title__serif">bien</span>, sin prisa.',
      text: 'Cortes a tijera y máquina, afeitado clásico y una conversación antes de empezar. Una silla, una cita y el tiempo que haga falta.',
      primaryCta: 'Reservar una cita',
      secondaryCta: 'Ver la carta',
      secondaryHref: '#servicios',
      sticker: 'Desde 2016',
    },
    about: {
      kicker: '{{index}} — El estudio',
      statement:
        'Un corte se diseña antes de hacerse: escuchamos, observamos la forma de la cabeza y sólo entonces tomamos la tijera.',
      image: 'about.jpg',
      imageAlt:
        'Mesa de trabajo con tijeras, peine de carey y brocha de afeitar sobre madera',
      paragraphs: [
        '{{shortName}} nació en 2016 como un estudio de una sola silla en la colonia Roma. Hoy somos cuatro barberos con la misma regla: cada cita empieza con diez minutos de conversación.',
        'Trabajamos con tijera siempre que el corte lo permite, afeitamos con navaja recta y toalla caliente, y usamos productos mexicanos de pequeña producción.',
        'No hay pantallas ni prisa. Sólo el corte que viniste a buscar, bien hecho.',
      ],
    },
    team: {
      kicker: '{{index}} — Barberos',
      title: 'Las manos <span class="lz-title__serif">detrás</span>',
      members: [
        {
          name: 'Iñaki Ruiz',
          role: 'Fundador · tijera',
          tags: ['Corte clásico', 'Texturas'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Iñaki Ruiz con camisa de lino en el estudio',
        },
        {
          name: 'Tomás Ibarra',
          role: 'Afeitado y barba',
          tags: ['Navaja recta', 'Perfilado'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Tomás Ibarra afilando una navaja recta',
        },
        {
          name: 'Lucía Ferrer',
          role: 'Cortes largos',
          tags: ['Tijera', 'Melenas'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Lucía Ferrer peinando un corte largo',
        },
        {
          name: 'Gabriel Soto',
          role: 'Máquina y degradados',
          tags: ['Taper', 'Crop'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Gabriel Soto junto a su estación de trabajo',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Carta',
      title: 'La <span class="lz-title__serif">carta</span>',
      intro:
        'Precios en pesos mexicanos. Cada servicio incluye lavado, consulta y acabado con producto.',
      prices: [
        {
          name: 'Corte a tijera',
          price: '$350',
          description:
            'Corte completo a tijera, pensado para crecer bien durante cuatro o cinco semanas.',
        },
        {
          name: 'Corte y barba',
          price: '$480',
          description:
            'El corte con perfilado de barba a navaja y aceite para terminar.',
        },
        {
          name: 'Afeitado clásico',
          price: '$260',
          description:
            'Navaja recta, dos pasadas de toalla caliente y bálsamo frío.',
        },
        {
          name: 'Arreglo de barba',
          price: '$220',
          description: 'Forma, volumen y contornos sin afeitar las mejillas.',
        },
        {
          name: 'Corte para niños',
          price: '$250',
          description:
            'Hasta los 12 años, con la misma calma que cualquier cita.',
        },
        {
          name: 'Tratamiento capilar',
          price: '$300',
          description:
            'Exfoliación del cuero cabelludo y masaje de quince minutos.',
        },
      ],
      promos: [
        {
          tag: 'Nota',
          title: 'Primera cita',
          text: 'La consulta de la primera visita dura veinte minutos y no tiene costo.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, es mi primera visita a Norte}}',
        },
        {
          tag: 'Nota',
          title: 'Suscripción mensual',
          text: 'Dos cortes y un afeitado al mes por $950, con prioridad de agenda.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero información de la suscripción mensual}}',
        },
        {
          tag: 'Nota',
          title: 'Bodas y eventos',
          text: 'Atendemos al novio y a su grupo en el estudio o a domicilio.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar un servicio para boda}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Trabajo',
      title: 'Cuaderno de <span class="lz-title__serif">cortes</span>',
      items: galleryItems([
        {
          caption: 'Corte clásico con raya lateral',
          alt: 'Corte clásico a tijera peinado con raya lateral marcada',
        },
        {
          caption: 'Afeitado con navaja recta',
          alt: 'Barbero afeitando a un cliente con navaja recta y espuma',
        },
        {
          caption: 'Textura natural',
          alt: 'Corte medio con textura natural secado al aire',
        },
        {
          caption: 'Barba perfilada',
          alt: 'Barba completa perfilada con contornos limpios',
        },
        {
          caption: 'El estudio por la mañana',
          alt: 'Interior del estudio con sillón de barbero clásico y luz de ventana',
        },
        {
          caption: 'Melena a tijera',
          alt: 'Corte largo a tijera con capas suaves',
        },
        {
          caption: 'Herramientas',
          alt: 'Tijeras, peines y navaja ordenados sobre una toalla blanca',
        },
        {
          caption: 'Taper bajo',
          alt: 'Degradado bajo en la nuca con transición suave',
        },
      ]),
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '212 opiniones en Google',
      allReviewsCta: 'Leer todas',
      writeReviewCta: 'Escribir una opinión',
      reviews: [
        {
          text: 'Iñaki me preguntó cómo me peino por la mañana antes de tocar la tijera. Es el primer corte en años que sigue viéndose bien un mes después.',
          author: 'Andrés M. · cliente desde 2019',
        },
        {
          text: 'El afeitado clásico es un ritual. Sin música alta, sin prisa, con la toalla a la temperatura justa.',
          author: 'Rodrigo P.',
        },
        {
          text: 'Llevé a mi hijo de ocho años y lo trataron con la misma atención que a cualquier cliente. Volveremos.',
          author: 'Mariana L.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro:
        'Lo que suelen preguntarnos antes de la primera cita. Para cualquier otra duda, escríbenos.',
      cta: 'Escribir por WhatsApp',
      items: [
        {
          question: '¿Cuál es el precio de un corte?',
          answer:
            'El corte a tijera cuesta $350 y el corte con barba $480. Todos los servicios incluyen lavado, consulta y acabado con producto.',
        },
        {
          question: '¿Es necesario reservar?',
          answer:
            'Sí. Trabajamos sólo con cita para dedicarle a cada persona el tiempo completo. Puedes reservar por WhatsApp con un día de anticipación.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Efectivo, tarjetas de débito y crédito, y transferencia. Las propinas se reparten entre todo el equipo.',
        },
        {
          question: '¿Cómo cancelo o cambio una cita?',
          answer:
            'Escríbenos con al menos 12 horas de anticipación. Las cancelaciones con menos aviso se cobran al 50%.',
        },
        {
          question: '¿Atienden a niños?',
          answer:
            'Sí, a partir de los 4 años. El corte para niños cuesta $250 y recomendamos las citas de la mañana.',
        },
        {
          question: '¿Cuánto dura cada servicio?',
          answer:
            'El corte a tijera dura cerca de una hora; el corte con barba, hora y cuarto; el afeitado clásico, cuarenta minutos.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Dos estudios, <span class="lz-title__serif">un oficio</span>',
      contactText:
        'Respondemos mensajes de martes a domingo en horario del estudio. Para eventos y bodas preferimos el correo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      branches: branchCards(branches),
    },
    'floating-whatsapp': { label: 'Escribir a Norte por WhatsApp' },
    footer: {
      about:
        'Barbería de autor en la Ciudad de México. Cortes a tijera, afeitado clásico y citas sin prisa.',
      branchesTitle: 'Estudios',
      branches: footerBranches(branches),
      linksTitle: 'Secciones',
      links,
      contactTitle: 'Contacto',
    },
  },
} satisfies ContentPack;
