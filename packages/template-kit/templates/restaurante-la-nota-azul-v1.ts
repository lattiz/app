// GENERATED from specs/restaurante-la-nota-azul.spec.json (spec c02e8c9d8f8c, file 6a4e09871d37). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-la-nota-azul-v1',
  name: 'La Nota Azul',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'neo-brutal',
  theme: 'restaurante-la-nota-azul-v1',
  content: 'restaurante.la-nota-azul.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'bento',
    },
    {
      slot: 'marquee',
      variant: 'ticker',
    },
    {
      slot: 'about',
      variant: 'stats-strip',
    },
    {
      slot: 'services',
      variant: 'menu-columns',
    },
    {
      slot: 'gallery',
      variant: 'bento',
    },
    {
      slot: 'team',
      variant: 'list',
    },
    {
      slot: 'testimonials',
      variant: 'cards',
    },
    {
      slot: 'faq',
      variant: 'list',
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
    preset: 'editorial',
  },
} satisfies Manifest;
