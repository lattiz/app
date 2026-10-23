// GENERATED from specs/restaurante-hoja-y-barro-v2.spec.json (spec fee1819bac98, file 794cc0abdf72). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-hoja-y-barro-v2',
  name: 'Hoja y Barro',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'editorial-atelier',
  theme: 'restaurante-hoja-y-barro-v2',
  content: 'restaurante.hoja-y-barro-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
    },
    {
      slot: 'hero',
      variant: 'ticket-board',
    },
    {
      slot: 'marquee',
      variant: 'ticker',
    },
    {
      slot: 'about',
      variant: 'order-steps',
    },
    {
      slot: 'services',
      variant: 'product-grid',
    },
    {
      slot: 'gallery',
      variant: 'mosaic',
    },
    {
      slot: 'testimonials',
      variant: 'quote-feature',
    },
    {
      slot: 'faq',
      variant: 'two-col',
    },
    {
      slot: 'cta',
      variant: 'closing-band',
    },
    {
      slot: 'locations',
      variant: 'with-contact',
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'hours-blocks',
    },
  ],
  motion: {
    preset: 'calm',
  },
  renews: 'restaurante-hoja-y-barro-v1',
} satisfies Manifest;
