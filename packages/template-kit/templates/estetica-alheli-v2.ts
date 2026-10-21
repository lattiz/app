// GENERATED from specs/estetica-alheli-v2.spec.json (spec 7eb4508f9aa2, file f2b1ac724fd8). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'estetica-alheli-v2',
  name: 'Alhelí Nail Atelier',
  category: 'esteticas',
  description:
    'Salón con identidad propia: servicios y precios, el salón en fotos, equipo, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'estetica',
  archetype: 'editorial-atelier',
  theme: 'estetica-alheli-v2',
  content: 'estetica.alheli-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
    },
    {
      slot: 'hero',
      variant: 'framed',
    },
    {
      slot: 'about',
      variant: 'text-image-offset',
    },
    {
      slot: 'services',
      variant: 'collection-cards',
    },
    {
      slot: 'gallery',
      variant: 'collage',
    },
    {
      slot: 'testimonials',
      variant: 'feature-stack',
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
      variant: 'ledger',
    },
  ],
  motion: {
    preset: 'calm',
  },
  renews: 'estetica-alheli-v1',
} satisfies Manifest;
