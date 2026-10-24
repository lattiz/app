// GENERATED from specs/restaurante-trigo-y-brasa-v2.spec.json (spec c4c8c2d94ae1, file 267f5b6439a1). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-trigo-y-brasa-v2',
  name: 'Trigo y Brasa',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'editorial-atelier',
  theme: 'restaurante-trigo-y-brasa-v2',
  content: 'restaurante.trigo-y-brasa-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'overlap',
    },
    {
      slot: 'about',
      variant: 'booking-steps',
    },
    {
      slot: 'services',
      variant: 'photo-rows',
    },
    {
      slot: 'cta',
      variant: 'included-panel',
    },
    {
      slot: 'gallery',
      variant: 'grid',
    },
    {
      slot: 'testimonials',
      variant: 'cards',
    },
    {
      slot: 'faq',
      variant: 'grid',
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
      variant: 'minimal-centered',
    },
  ],
  motion: {
    preset: 'calm',
  },
  renews: 'restaurante-trigo-y-brasa-v1',
} satisfies Manifest;
