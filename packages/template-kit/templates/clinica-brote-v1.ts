// GENERATED from specs/clinica-brote.spec.json (spec a6eaa7d33f37, file 76e0742711b5). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'clinica-brote-v1',
  name: 'Brote Nutrición',
  category: 'clinicas',
  description:
    'Clínica con identidad propia: servicios y consultas, instalaciones, equipo médico, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'clinica',
  archetype: 'editorial-atelier',
  theme: 'clinica-brote-v1',
  content: 'clinica.brote.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'duo-arch',
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
      slot: 'team',
      variant: 'grid',
    },
    {
      slot: 'gallery',
      variant: 'strip',
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
      variant: 'columns',
    },
  ],
  motion: {
    preset: 'calm',
  },
} satisfies Manifest;
