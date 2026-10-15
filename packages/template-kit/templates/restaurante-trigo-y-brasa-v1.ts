// GENERATED from specs/restaurante-trigo-y-brasa.spec.json (spec bc3ab901f64d, file ce19eaf6a603). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-trigo-y-brasa-v1',
  name: 'Trigo y Brasa',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'editorial-atelier',
  theme: 'restaurante-trigo-y-brasa-v1',
  content: 'restaurante.trigo-y-brasa.es-MX',
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
      variant: 'grid',
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
      variant: 'columns',
    },
  ],
  motion: {
    preset: 'calm',
  },
} satisfies Manifest;
