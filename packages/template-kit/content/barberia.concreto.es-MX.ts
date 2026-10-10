import type { ContentPack } from '../src/types';
import {
  branchCards,
  footerBranches,
  galleryItems,
  type Branch,
} from './barberia.shared';

/** Concreto voice: irreverent and direct. Short sentences, prices up front, a joke where it fits. */

const HOURS = 'Lun–Sáb 10:00–21:00 · Dom cerrado (dormimos)';

const branches: Branch[] = [
  {
    name: 'Narvarte',
    address: '{{address}}',
    shortAddress: 'Av. Universidad 820, Narvarte, CDMX',
    hours: HOURS,
    query: 'Avenida Universidad 820 Narvarte CDMX',
  },
  {
    name: 'Portales',
    address: 'Calz. de Tlalpan 1520, Portales, Benito Juárez, CDMX',
    shortAddress: 'Calz. de Tlalpan 1520, Portales, CDMX',
    hours: HOURS,
    query: 'Calzada de Tlalpan 1520 Portales CDMX',
  },
];

const links = [
  { label: 'Precios', href: '#servicios' },
  { label: 'Fotos', href: '#galeria' },
  { label: 'Dónde', href: '#sucursales' },
  { label: 'Dudas', href: '#preguntas' },
];

export default {
  vertical: 'barberia',
  locale: 'es-MX',
  business: {
    name: 'CONCRETO Barbería',
    shortName: 'CONCRETO',
    tagline: 'Cortes sin filtro',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Quiero silla en CONCRETO',
    address: 'Av. Universidad 820, Narvarte, Benito Juárez, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'silla@concretobarberia.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=concreto+barberia+narvarte',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=concreto+barberia+narvarte',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en Narvarte y Portales. Fade desde $250, barba y diseño. Apartas por WhatsApp, llegas y te sientas.',
  },
  sections: {
    navbar: { cta: 'Apartar silla', links },
    hero: {
      image: 'hero.jpg',
      imageAlt:
        'Barbero con gorra rapando una nuca con máquina bajo luz blanca de taller',
      eyebrow: 'Narvarte · Portales · CDMX',
      title:
        'Te cortamos el pelo, <span class="lz-title__serif">no el rollo</span>.',
      text: 'Fade, barba y diseño. Sin música de spa, sin café de cortesía y sin tarifas raras. Apartas por WhatsApp, llegas y te sientas.',
      primaryCta: 'Apartar mi silla',
      secondaryCta: 'Ver precios',
      secondaryHref: '#servicios',
      sticker: 'Fade $250',
    },
    marquee: {
      label: 'Lo que hacemos',
      items: ['Fade', 'Barba', 'Diseño', 'Cero filas', '$250 y ya'],
    },
    about: {
      kicker: '{{index}} — Quiénes',
      title: 'Números, <span class="lz-title__serif">no promesas</span>',
      summary:
        'Tres sillas, cero pretextos. Abrimos en 2021 en una bodega de Narvarte y desde entonces la regla es la misma: si apartas, te sientas a tiempo.',
      stats: [
        { value: '9,400', label: 'Cortes el año pasado' },
        { value: '3', label: 'Sillas. Nunca más' },
        { value: '11 min', label: 'Espera promedio' },
      ],
    },
    services: {
      kicker: '{{index}} — Precios',
      title: 'Lo que <span class="lz-title__serif">cuesta</span>',
      prices: [
        {
          name: 'Fade',
          price: '$250',
          description:
            'Bajo, medio o alto. Tú dices, nosotros lo dejamos parejo.',
        },
        {
          name: 'Fade + barba',
          price: '$360',
          description: 'El combo que pide casi todo el mundo. Por algo será.',
        },
        {
          name: 'Barba',
          price: '$170',
          description: 'Perfilado a navaja. Sale cuadrada o sale como quieras.',
        },
        {
          name: 'Diseño',
          price: '+$50',
          description:
            'Líneas, rayos o tu inicial. No hacemos logos de equipos rivales.',
        },
        {
          name: 'Rapado',
          price: '$150',
          description: 'Máquina parejita. Quince minutos y te vas.',
        },
        {
          name: 'Morros',
          price: '$200',
          description: 'Hasta 12 años. Paciencia incluida, paleta no.',
        },
      ],
      promos: [
        {
          tag: 'Lunes',
          title: 'Lunes flojo: 20% en todo',
          cta: 'Apartar lunes',
          href: '{{whatsappUrl:Quiero silla el lunes con 20%}}',
        },
        {
          tag: 'Crew',
          title: 'Trae a un compa y a los dos les bajamos $40',
          cta: 'Apartar dos',
          href: '{{whatsappUrl:Vamos dos, queremos el descuento crew}}',
        },
        {
          tag: 'Estudiantes',
          title: 'Credencial vigente: fade en $210',
          cta: 'Apartar',
          href: '{{whatsappUrl:Soy estudiante, quiero el fade en $210}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Fotos',
      title: 'Hechos <span class="lz-title__serif">aquí</span>',
      items: galleryItems([
        {
          caption: 'Mid fade',
          alt: 'Corte mid fade con la parte superior peinada hacia atrás',
        },
        {
          caption: 'Rayo a navaja',
          alt: 'Diseño de rayo rapado a un costado de la cabeza',
        },
        {
          caption: 'Barba cuadrada',
          alt: 'Barba corta con contorno cuadrado marcado a navaja',
        },
        {
          caption: 'Buzz cut',
          alt: 'Cabeza rapada parejo al número dos vista de perfil',
        },
        {
          caption: 'La bodega',
          alt: 'Interior de la barbería con muros de concreto y tres sillas negras',
        },
        {
          caption: 'Burst fade',
          alt: 'Burst fade alrededor de la oreja con rizos arriba',
        },
        {
          caption: 'Primer corte',
          alt: 'Niño de seis años en la silla con capa de barbero',
        },
        {
          caption: 'Fin de jornada',
          alt: 'Máquinas de cortar cargándose sobre una repisa de metal',
        },
      ]),
    },
    team: {
      kicker: '{{index}} — Sillas',
      title: 'Quién te <span class="lz-title__serif">corta</span>',
      members: [
        {
          name: 'Chato',
          role: 'Fades y paciencia',
          tags: ['Fade', 'Morros'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato del barbero Chato con delantal de mezclilla',
        },
        {
          name: 'Vero',
          role: 'Diseño y navaja',
          tags: ['Diseño', 'Barba'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de la barbera Vero sosteniendo una navaja',
        },
        {
          name: 'Memo',
          role: 'Rapados exprés',
          tags: ['Rapado', 'Buzz'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato del barbero Memo con máquina en mano',
        },
        {
          name: 'Toño',
          role: 'El que abre temprano',
          tags: ['Fade', 'Clásico'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato del barbero Toño en la entrada de la barbería',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Dicen',
      score: '4.8',
      summary: '540 reseñas en Google, ninguna comprada',
      allReviewsCta: 'Ver reseñas',
      writeReviewCta: 'Dejar la tuya',
      reviews: [
        {
          text: 'Aparté a las 6, me senté a las 6:02. No sabía que eso era legal en esta ciudad.',
          author: 'Diego R.',
        },
        {
          text: 'Pedí un fade bajo y salí con un fade bajo. Parece obvio pero no lo es.',
          author: 'Luis Ángel G.',
        },
        {
          text: 'Vero me hizo un rayo a navaja que todavía me están preguntando dónde me lo hice.',
          author: 'Kevin S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Dudas',
      title: 'Preguntas <span class="lz-title__serif">directas</span>',
      items: [
        {
          question: '¿Cuánto cuesta?',
          answer:
            'Fade $250, fade + barba $360, barba $170. Diseño +$50. Lo que ves es lo que pagas.',
        },
        {
          question: '¿Tengo que apartar?',
          answer:
            'Si quieres sentarte a tu hora, sí. Mandas WhatsApp, te damos hora y listo. Sin apartar, te toca esperar a que se libere una silla.',
        },
        {
          question: '¿Aceptan tarjeta?',
          answer: 'Tarjeta, efectivo y transferencia. Vales de despensa no.',
        },
        {
          question: '¿Y si no llego?',
          answer:
            'Avísanos aunque sea una hora antes y la movemos. Si nos dejas plantados dos veces, la tercera pagas por adelantado.',
        },
        {
          question: '¿Cortan a niños?',
          answer:
            'Sí, hasta 12 años por $200. Si tu morro llora, nos ha pasado peor.',
        },
        {
          question: '¿Cuánto tardan?',
          answer:
            'Fade 35 minutos, fade + barba 50, rapado 15. Si tardamos más, es porque nos pediste diseño.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Dónde',
      title: 'Dos <span class="lz-title__serif">bodegas</span>',
      contactText:
        'WhatsApp es lo más rápido. Si llamas y no contestamos, es que estamos cortando: deja mensaje.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Apartar silla',
      callLabel: 'Llamar',
      emailLabel: 'Correo',
      directionsLabel: 'Llegar',
      branches: branchCards(branches),
    },
    'floating-whatsapp': { label: 'Apartar silla por WhatsApp' },
    footer: {
      about:
        'Barbería sin filtro en Narvarte y Portales. Apartas, llegas, te sientas.',
      branchesTitle: 'Bodegas',
      branches: footerBranches(branches),
      linksTitle: 'Brincar a',
      links,
      contactTitle: 'Contacto',
    },
  },
} satisfies ContentPack;
