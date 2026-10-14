// GENERATED from specs/floreria-cardamina.spec.json (spec d93a7fdbf48a, file b6f73d2a1dc8). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-cardamina-v1',
  name: 'Cardamina Florería Botánica',
  category: 'florerias',
  description:
    'Florería con identidad propia: arreglos con precio, galería, equipo, reseñas, preguntas y pedidos',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'floreria',
  archetype: 'street-luxe',
  theme: 'floreria-cardamina-v1',
  content: 'floreria.cardamina.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'image-bg',
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
      variant: 'strip',
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
    preset: 'editorial',
  },
} satisfies Manifest;
