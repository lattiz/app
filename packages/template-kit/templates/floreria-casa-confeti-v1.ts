// GENERATED from specs/floreria-casa-confeti.spec.json (spec e112920bb92f, file 459fc4a20ad0). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-casa-confeti-v1',
  name: 'Casa Confeti',
  category: 'florerias',
  description:
    'Florería con identidad propia: arreglos con precio, galería, equipo, reseñas, preguntas y pedidos',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'floreria',
  archetype: 'editorial-atelier',
  theme: 'floreria-casa-confeti-v1',
  content: 'floreria.casa-confeti.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'notice-bar',
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
      variant: 'cards',
    },
    {
      slot: 'gallery',
      variant: 'strip',
    },
    {
      slot: 'team',
      variant: 'grid',
    },
    {
      slot: 'testimonials',
      variant: 'rating-wall',
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
