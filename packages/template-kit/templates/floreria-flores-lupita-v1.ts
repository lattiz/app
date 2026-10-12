// GENERATED from specs/floreria-flores-lupita.spec.json (spec 2ccbfca28d27, file 0c9cae7c9857). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-flores-lupita-v1',
  name: 'Flores Lupita',
  category: 'florerias',
  description:
    'Florería con identidad propia: arreglos con precio, galería, equipo, reseñas, preguntas y pedidos',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'floreria',
  archetype: 'editorial-atelier',
  theme: 'floreria-flores-lupita-v1',
  content: 'floreria.flores-lupita.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
    },
    {
      slot: 'hero',
      variant: 'offset-card',
    },
    {
      slot: 'marquee',
      variant: 'ticker',
    },
    {
      slot: 'about',
      variant: 'statement',
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
      variant: 'minimal-centered',
    },
  ],
  motion: {
    preset: 'editorial',
  },
} satisfies Manifest;
