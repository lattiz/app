// GENERATED from specs/veterinaria-clinica-nogal-v2.spec.json (spec 898b377e41b4, file 330990db05a2). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'veterinaria-clinica-nogal-v2',
  name: 'Clínica Nogal',
  category: 'veterinarias',
  description:
    'Veterinaria con identidad propia: consultas y estética, médicos, instalaciones, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'veterinaria',
  archetype: 'editorial-atelier',
  theme: 'veterinaria-clinica-nogal-v2',
  content: 'veterinaria.clinica-nogal-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'arch-sticker',
    },
    {
      slot: 'about',
      variant: 'booking-steps',
    },
    {
      slot: 'services',
      variant: 'price-list',
    },
    {
      slot: 'cta',
      variant: 'urgent-line',
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
      variant: 'column-panels',
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
  renews: 'veterinaria-clinica-nogal-v1',
} satisfies Manifest;
