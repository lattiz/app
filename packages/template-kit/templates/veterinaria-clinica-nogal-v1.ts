// GENERATED from specs/veterinaria-clinica-nogal.spec.json (spec 62220a7fac35, file b68e1552ef9f). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'veterinaria-clinica-nogal-v1',
  name: 'Clínica Nogal',
  category: 'veterinarias',
  description:
    'Veterinaria con identidad propia: consultas y estética, médicos, instalaciones, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'veterinaria',
  archetype: 'editorial-atelier',
  theme: 'veterinaria-clinica-nogal-v1',
  content: 'veterinaria.clinica-nogal.es-MX',
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
      variant: 'text-image-offset',
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
      variant: 'grid',
    },
    {
      slot: 'testimonials',
      variant: 'cards',
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
      variant: 'columns',
    },
  ],
  motion: {
    preset: 'calm',
  },
} satisfies Manifest;
