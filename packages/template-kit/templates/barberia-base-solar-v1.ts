import { singleBranch, trazoBranches } from '../content/barberia.trazo.es-MX';
import type { Manifest } from '../src/types';

const branch = singleBranch(trazoBranches.lindavista);

/** Basic on trazo-solar: cool grey, violet, Unbounded, split hero. */
export default {
  id: 'barberia-base-solar-v1',
  name: 'LUMEN Barbería',
  category: 'barberias',
  description:
    'Barbería luminosa en gris y violeta: precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'barberia',
  archetype: 'essential',
  theme: 'trazo-solar',
  content: 'barberia.trazo.es-MX',
  business: {
    name: 'LUMEN Barbería',
    shortName: 'Lumen',
    tagline: 'Barbería de mañana',
    address: 'Av. Montevideo 360, Lindavista, Gustavo A. Madero, CDMX',
    email: 'hola@lumenbarberia.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=lumen+barberia+lindavista',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=lumen+barberia+lindavista',
  },
  head: {
    description:
      '{{name}} en Lindavista: abrimos a las 9 de la mañana. Cortes y barba con cita por WhatsApp desde $230 MXN.',
  },
  sections: [
    { slot: 'navbar', variant: 'inline' },
    {
      slot: 'hero',
      variant: 'split',
      props: {
        eyebrow: 'Desde las 9:00 · Lindavista',
        title:
          'Agenda en un mensaje, <span class="lz-title__serif">sal en 40 minutos</span>.',
        text: 'Abrimos temprano para que llegues al trabajo recién cortado. Escríbenos por WhatsApp, elige hora y listo.',
        sticker: 'Abrimos 9:00',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
      props: {
        title:
          'Temprano, rápido y <span class="lz-title__serif">bien hecho</span>.',
      },
    },
    { slot: 'services', variant: 'price-list' },
    { slot: 'faq', variant: 'list' },
    { slot: 'locations', variant: 'single', props: branch.locations },
    { slot: 'floating-whatsapp', variant: 'bubble' },
    { slot: 'footer', variant: 'big-wordmark', props: branch.footer },
  ],
} satisfies Manifest;
