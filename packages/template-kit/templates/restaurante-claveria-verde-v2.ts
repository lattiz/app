// GENERATED from specs/restaurante-claveria-verde-v2.spec.json (spec 0ee305495571, file 33f9f6b31135). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-claveria-verde-v2',
  name: 'Clavería Verde',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'editorial-atelier',
  theme: 'restaurante-claveria-verde-v2',
  content: 'restaurante.claveria-verde-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'framed',
    },
    {
      slot: 'about',
      variant: 'stats-strip',
    },
    {
      slot: 'services',
      variant: 'dish-spotlight',
    },
    {
      slot: 'gallery',
      variant: 'collage',
    },
    {
      slot: 'testimonials',
      variant: 'quote-feature',
    },
    {
      slot: 'cta',
      variant: 'band',
    },
    {
      slot: 'faq',
      variant: 'column-panels',
    },
    {
      slot: 'locations',
      variant: 'arch-visit',
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
  renews: 'restaurante-claveria-verde-v1',
} satisfies Manifest;
