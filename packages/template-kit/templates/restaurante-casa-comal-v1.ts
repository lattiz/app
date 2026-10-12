// GENERATED from specs/restaurante-casa-comal.spec.json (spec 0325fbce6706, file df33c371024d). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-casa-comal-v1',
  name: 'Casa Comal',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'editorial-atelier',
  theme: 'restaurante-casa-comal-v1',
  content: 'restaurante.casa-comal.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
    },
    {
      slot: 'hero',
      variant: 'split',
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
      variant: 'editorial-table',
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
