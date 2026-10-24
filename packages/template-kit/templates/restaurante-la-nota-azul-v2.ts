// GENERATED from specs/restaurante-la-nota-azul-v2.spec.json (spec 6c6c43d83abc, file 9e3c7b1081fc). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-la-nota-azul-v2',
  name: 'La Nota Azul',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'neo-brutal',
  theme: 'restaurante-la-nota-azul-v2',
  content: 'restaurante.la-nota-azul-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'stack',
    },
    {
      slot: 'about',
      variant: 'text-image-offset',
    },
    {
      slot: 'cta',
      variant: 'ticket-stub-bill',
    },
    {
      slot: 'services',
      variant: 'price-list',
    },
    {
      slot: 'gallery',
      variant: 'strip',
    },
    {
      slot: 'testimonials',
      variant: 'paper-trio',
    },
    {
      slot: 'faq',
      variant: 'list',
    },
    {
      slot: 'locations',
      variant: 'map-link',
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
  renews: 'restaurante-la-nota-azul-v1',
} satisfies Manifest;
