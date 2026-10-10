import { basicLinks, singleBranchFooter } from '../content/barberia.es-MX';
import type { Manifest } from '../src/types';

/** Basic: the shared barbería structure in bone-blue; barberia-base-oscuro-v1 is the same page in urban-dark. */
export default {
  id: 'barberia-base-claro-v1',
  name: 'TRAZO Barbería',
  category: 'barberias',
  description:
    'Barbería esencial en tono claro: servicios con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'barberia',
  archetype: 'essential',
  theme: 'trazo-papel',
  content: 'barberia.es-MX',
  business: {
    name: 'TRAZO Barbería',
    shortName: 'TRAZO',
    tagline: 'Barbería',
    email: 'hola@trazobarberia.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=trazo+barberia+cdmx',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=trazo+barberia+cdmx',
  },
  head: {
    description:
      '{{name}}, barbería en {{city}}. Cortes clásicos y modernos, barba y citas por WhatsApp desde $270 MXN.',
  },
  sections: [
    { slot: 'navbar', variant: 'urban-luxe', props: { links: basicLinks } },
    {
      slot: 'hero',
      variant: 'image-bg',
      props: {
        eyebrow: 'Barbería · {{city}}',
        title: 'Tu corte, <span class="lz-title__serif">a tiempo</span>.',
        text: 'Cortes clásicos y modernos, barba y diseños con cita por WhatsApp. Sin filas y sin prisas. Desde $270 MXN.',
        sticker: 'Agenda abierta',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
      props: {
        title:
          'Atención con <span class="lz-title__serif">calma</span>, corte con precisión.',
      },
    },
    { slot: 'services', variant: 'urban-luxe' },
    { slot: 'faq', variant: 'list' },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        kicker: '{{index}} — Ubicación',
        title: 'Ven a <span class="lz-title__serif">vernos</span>',
      },
    },
    { slot: 'floating-whatsapp', variant: 'urban-luxe' },
    {
      slot: 'footer',
      variant: 'urban-luxe',
      props: {
        about:
          'Barbería de colonia con atención sin prisa en Ciudad de México. Reserva por WhatsApp y te esperamos con la silla lista.',
        branchesTitle: 'Ubicación',
        branches: singleBranchFooter,
        links: basicLinks,
      },
    },
  ],
} satisfies Manifest;
