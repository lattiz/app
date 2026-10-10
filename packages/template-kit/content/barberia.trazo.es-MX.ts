import type { ContentObject, ContentPack } from '../src/types';
import { branchCards, footerBranches, type Branch } from './barberia.shared';

/**
 * Trazo voice (Basic): friendly and clear, "tú", plain words. Shared by every Basic barbería
 * template; each manifest overrides the brand, the hero and its single branch.
 */

const HOURS = 'Lun–Sáb 10:00–20:00 · Dom 10:00–15:00';

export const trazoBranches = {
  delValle: {
    name: 'Del Valle',
    address: '{{address}}',
    shortAddress: 'Av. Coyoacán 1210, Del Valle, CDMX',
    hours: HOURS,
    query: 'Avenida Coyoacán 1210 Del Valle CDMX',
  },
  escandon: {
    name: 'Escandón',
    address: '{{address}}',
    shortAddress: 'Agrarismo 214, Escandón, CDMX',
    hours: 'Mar–Dom 12:00–21:00',
    query: 'Agrarismo 214 Escandón CDMX',
  },
  lindavista: {
    name: 'Lindavista',
    address: '{{address}}',
    shortAddress: 'Av. Montevideo 360, Lindavista, CDMX',
    hours: 'Lun–Sáb 9:00–19:00',
    query: 'Avenida Montevideo 360 Lindavista CDMX',
  },
} satisfies Record<string, Branch>;

/** Section props that point a Basic template at its one branch. */
export function singleBranch(branch: Branch): {
  locations: ContentObject;
  footer: ContentObject;
} {
  return {
    locations: { branch: branchCards([branch])[0] },
    footer: { branches: footerBranches([branch]) },
  };
}

export const basicLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Preguntas', href: '#preguntas' },
  { label: 'Ubicación', href: '#ubicacion' },
];

export default {
  vertical: 'barberia',
  locale: 'es-MX',
  business: {
    name: 'TRAZO Barbería',
    shortName: 'Trazo',
    tagline: 'Barbería de barrio',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero agendar un corte',
    address: 'Av. Coyoacán 1210, Del Valle, Benito Juárez, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@trazobarberia.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=trazo+barberia+del+valle',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=trazo+barberia+del+valle',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: cortes, barba y cortes para niños con cita por WhatsApp desde $230 MXN.',
  },
  sections: {
    navbar: { cta: 'Agendar', links: basicLinks },
    hero: {
      image: 'hero.jpg',
      imageAlt:
        'Barbero sonriendo mientras termina un corte en una barbería luminosa',
      eyebrow: 'Barbería de barrio · Del Valle',
      title:
        'Tu corte de siempre, <span class="lz-title__serif">mejor hecho</span>.',
      text: 'Cortes, barba y cortes para niños con cita por WhatsApp. Te atendemos a la hora que quedamos. Desde $230 MXN.',
      primaryCta: 'Agendar por WhatsApp',
      secondaryCta: 'Ver precios',
      secondaryHref: '#servicios',
      sticker: 'Agenda abierta',
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Una barbería <span class="lz-title__serif">tranquila</span>, a la vuelta de tu casa.',
      summary:
        'En {{shortName}} te escuchamos antes de cortar, te decimos qué te queda y respetamos tu hora. Somos tres barberos que viven en la colonia y llevan más de diez años con la máquina en la mano.',
      stats: [
        { value: '+10 años', label: 'De oficio' },
        { value: '3 sillas', label: 'Sin filas' },
        { value: '4.9 ★', label: 'En Google' },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Precios <span class="lz-title__serif">claros</span>',
      prices: [
        {
          name: 'Corte de cabello',
          price: '$230',
          description: 'Máquina, tijera o las dos. Incluye lavado y peinado.',
        },
        {
          name: 'Corte + barba',
          price: '$330',
          description: 'El corte con perfilado de barba y toalla caliente.',
        },
        {
          name: 'Barba',
          price: '$160',
          description: 'Arreglo y contornos a navaja, con bálsamo al final.',
        },
        {
          name: 'Corte para niños',
          price: '$190',
          description: 'Hasta 12 años, con calma y sin sustos.',
        },
        {
          name: 'Diseño',
          price: '+$50',
          description: 'Líneas o detalles sencillos sobre cualquier corte.',
        },
        {
          name: 'Lavado y peinado',
          price: '$90',
          description: 'Para un evento o simplemente para salir fresco.',
        },
      ],
      promos: [
        {
          tag: 'Promo',
          title: 'Martes de papá e hijo: los dos por $380',
          text: 'Vengan juntos un martes y pagan menos. Agenda las dos citas seguidas.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero la promo de papá e hijo}}',
        },
        {
          tag: 'Promo',
          title: 'Tu quinto corte es gratis',
          text: 'Te damos una tarjeta de sellos en tu primera visita.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar mi primer corte}}',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Si tu duda no está aquí, mándanos un WhatsApp y te contestamos rápido.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cuánto cuesta un corte?',
          answer:
            'El corte cuesta $230 y el corte con barba $330. El precio incluye lavado y peinado.',
        },
        {
          question: '¿Necesito cita?',
          answer:
            'Te recomendamos agendar por WhatsApp para no esperar. Si hay una silla libre, también te atendemos sin cita.',
        },
        {
          question: '¿Puedo pagar con tarjeta?',
          answer: 'Sí: tarjeta, efectivo o transferencia, como te acomode.',
        },
        {
          question: '¿Cómo cambio mi cita?',
          answer:
            'Mándanos un mensaje con al menos 2 horas de anticipación y la cambiamos sin costo.',
        },
        {
          question: '¿Cortan a niños?',
          answer:
            'Claro. El corte para niños (hasta 12 años) cuesta $190 y los atendemos con calma.',
        },
        {
          question: '¿Cuánto tiempo tarda?',
          answer:
            'Un corte tarda unos 40 minutos y el corte con barba alrededor de una hora.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Ubicación',
      title: 'Aquí <span class="lz-title__serif">estamos</span>',
      hoursLabel: 'Horario',
      whatsappCta: 'Agendar por WhatsApp',
      callCta: 'Llamar',
      directionsLabel: 'Cómo llegar',
      branch: branchCards([trazoBranches.delValle])[0],
    },
    'floating-whatsapp': { label: 'Agendar por WhatsApp' },
    footer: {
      about:
        'Barbería de barrio en la Ciudad de México. Cortes, barba y cortes para niños con cita por WhatsApp.',
      branchesTitle: 'Ubicación',
      branches: footerBranches([trazoBranches.delValle]),
      linksTitle: 'Explorar',
      links: basicLinks,
      contactTitle: 'Contacto',
    },
  },
} satisfies ContentPack;
