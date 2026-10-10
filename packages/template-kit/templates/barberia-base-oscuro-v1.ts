import { singleBranch, trazoBranches } from '../content/barberia.trazo.es-MX';
import type { Manifest } from '../src/types';

const branch = singleBranch(trazoBranches.escandon);

/** Basic on trazo-noche: plum-black, rose accent, DM Serif, photo hero. */
export default {
  id: 'barberia-base-oscuro-v1',
  name: 'FILO Barbería',
  category: 'barberias',
  description:
    'Barbería nocturna en tono ciruela: servicios en tarjetas, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'barberia',
  archetype: 'essential',
  theme: 'trazo-noche',
  content: 'barberia.trazo.es-MX',
  business: {
    name: 'FILO Barbería',
    shortName: 'Filo',
    tagline: 'Barbería nocturna',
    address: 'Agrarismo 214, Escandón, Miguel Hidalgo, CDMX',
    email: 'citas@filobarberia.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=filo+barberia+escandon',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=filo+barberia+escandon',
  },
  head: {
    description:
      '{{name}} en Escandón: cortes y barba hasta las 9 de la noche, con cita por WhatsApp desde $230 MXN.',
  },
  sections: [
    { slot: 'navbar', variant: 'centered-logo' },
    {
      slot: 'hero',
      variant: 'image-bg',
      props: {
        eyebrow: 'Abierto hasta las 21:00 · Escandón',
        title:
          'Sal de la oficina, <span class="lz-title__serif">entra al corte</span>.',
        text: 'Cortes y barba de martes a domingo hasta las nueve de la noche. Agenda por WhatsApp de camino y te esperamos con la silla lista.',
        sticker: 'Hasta las 21:00',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
      props: {
        title:
          'Cortes de noche, <span class="lz-title__serif">sin prisa</span>.',
      },
    },
    { slot: 'services', variant: 'cards' },
    { slot: 'faq', variant: 'two-col' },
    { slot: 'locations', variant: 'single', props: branch.locations },
    { slot: 'floating-whatsapp', variant: 'bubble' },
    {
      slot: 'footer',
      variant: 'minimal-centered',
      props: {
        ...branch.footer,
        about:
          'Barbería nocturna en Escandón. Cortes y barba hasta las 21:00, con cita por WhatsApp.',
      },
    },
  ],
} satisfies Manifest;
