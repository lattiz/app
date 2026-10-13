// GENERATED from specs/clinica-cauce.spec.json (spec b8561714764d, file 1f708dec5b6d). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'clinica-cauce-v1',
  name: 'Cauce Fisioterapia',
  category: 'clinicas',
  description:
    'Clínica con identidad propia: servicios y consultas, instalaciones, equipo médico, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'clinica',
  archetype: 'editorial-atelier',
  theme: 'clinica-cauce-v1',
  content: 'clinica.cauce.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'image-bg',
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
