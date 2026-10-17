// GENERATED from specs/restaurante-claveria-verde.spec.json (spec 9d5c34066125, file f6be694ac215). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-claveria-verde-v1',
  name: 'Clavería Verde',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'editorial-atelier',
  theme: 'restaurante-claveria-verde-v1',
  content: 'restaurante.claveria-verde.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
    },
    {
      slot: 'hero',
      variant: 'centered-arch',
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
      variant: 'cards',
    },
    {
      slot: 'gallery',
      variant: 'mosaic',
    },
    {
      slot: 'team',
      variant: 'grid',
    },
    {
      slot: 'testimonials',
      variant: 'quote-feature',
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
} satisfies Manifest;
