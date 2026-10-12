// GENERATED from specs/clinica-alba.spec.json (spec e21639659c03, file 2cc794e4db0f). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'clinica-alba-v1',
  name: 'Clínica Alba',
  category: 'clinicas',
  description:
    'Clínica con identidad propia: servicios y consultas, instalaciones, equipo médico, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'clinica',
  archetype: 'editorial-atelier',
  theme: 'clinica-alba-v1',
  content: 'clinica.alba.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'split',
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
