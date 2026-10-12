// GENERATED from specs/restaurante-hoja-y-barro.spec.json (spec 06adb9f20372, file ae829febc80d). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-hoja-y-barro-v1',
  name: 'Hoja y Barro',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'editorial-atelier',
  theme: 'restaurante-hoja-y-barro-v1',
  content: 'restaurante.hoja-y-barro.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
    },
    {
      slot: 'hero',
      variant: 'offset-card',
    },
    {
      slot: 'marquee',
      variant: 'ticker',
    },
    {
      slot: 'about',
      variant: 'text-image-offset',
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
      slot: 'team',
      variant: 'list',
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
      slot: 'locations',
      variant: 'with-contact',
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'big-wordmark',
    },
  ],
  motion: {
    preset: 'calm',
  },
} satisfies Manifest;
