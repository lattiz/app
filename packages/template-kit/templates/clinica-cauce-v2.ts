// GENERATED from specs/clinica-cauce-v2.spec.json (spec 22a6ba4f9bc5, file f8d4536a11c9). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'clinica-cauce-v2',
  name: 'Cauce Fisioterapia',
  category: 'clinicas',
  description:
    'Clínica con identidad propia: servicios y consultas, instalaciones, equipo médico, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'clinica',
  archetype: 'editorial-atelier',
  theme: 'clinica-cauce-v2',
  content: 'clinica.cauce-v2.es-MX',
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
      variant: 'care-pathway',
    },
    {
      slot: 'services',
      variant: 'treatment-rows',
    },
    {
      slot: 'team',
      variant: 'list',
    },
    {
      slot: 'gallery',
      variant: 'mosaic',
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
      variant: 'booking-panel',
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
  renews: 'clinica-cauce-v1',
} satisfies Manifest;
