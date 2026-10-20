// GENERATED from specs/restaurante-casa-rosa-mantequilla.spec.json (spec 812e459d198f, file c94baebdce7c). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-casa-rosa-mantequilla-v1',
  name: 'Casa Rosa Mantequilla',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'editorial-atelier',
  theme: 'restaurante-casa-rosa-mantequilla-v1',
  content: 'restaurante.casa-rosa-mantequilla.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'rail',
    },
    {
      slot: 'about',
      variant: 'framed-craft',
    },
    {
      slot: 'services',
      variant: 'price-list',
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
      variant: 'numbered-cards',
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
