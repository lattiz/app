import { basicLinks, singleBranchFooter } from '../content/barberia.es-MX';
import type { Manifest } from '../src/types';

/** Basic: the shared barbería structure in urban-dark; barberia-base-claro-v1 is the same page in bone-blue. */
export default {
  id: 'barberia-base-oscuro-v1',
  name: 'FILO Barbería',
  category: 'barberias',
  description:
    'Barbería esencial en tono oscuro: servicios con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'barberia',
  archetype: 'essential',
  theme: 'trazo-noche',
  content: 'barberia.es-MX',
  business: {
    name: 'FILO Barbería',
    shortName: 'FILO',
    tagline: 'Barbería',
    email: 'citas@filobarberia.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=filo+barberia+cdmx',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=filo+barberia+cdmx',
  },
  head: {
    description:
      '{{name}}, barbería en {{city}}. Fades, barba a navaja y cortes infantiles con cita por WhatsApp desde $270 MXN.',
  },
  sections: [
    { slot: 'navbar', variant: 'inline', props: { links: basicLinks } },
    {
      slot: 'hero',
      variant: 'image-bg',
      props: {
        eyebrow: 'Barbería · {{city}}',
        title:
          'Corte <span class="lz-title__serif">limpio</span>.<br>Cero filas.',
        text: 'Fades, barba a navaja y cortes infantiles con cita por WhatsApp. Llegas, te sientas y sales fresco. Desde $270 MXN.',
        sticker: 'Citas hoy',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
      props: {
        title:
          'Oficio de barbero, <span class="lz-title__serif">sin rodeos</span>.',
      },
    },
    { slot: 'services', variant: 'price-list' },
    { slot: 'faq', variant: 'list' },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        kicker: '{{index}} — Ubicación',
        title: 'Ven a <span class="lz-title__serif">vernos</span>',
      },
    },
    { slot: 'floating-whatsapp', variant: 'bubble' },
    {
      slot: 'footer',
      variant: 'big-wordmark',
      props: {
        about:
          'Barbería de barrio con técnica de estudio en Ciudad de México. Agenda por WhatsApp y llega directo a la silla.',
        branchesTitle: 'Ubicación',
        branches: singleBranchFooter,
        links: basicLinks,
      },
    },
  ],
} satisfies Manifest;
