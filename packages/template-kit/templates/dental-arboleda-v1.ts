// GENERATED from specs/dental-arboleda.spec.json (spec 0757763d1134, file eac25819ccd7). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'dental-arboleda-v1',
  name: 'Dental Arboleda',
  category: 'dentales',
  description:
    'Consultorio dental con identidad propia: tratamientos, especialistas, instalaciones, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'dental',
  archetype: 'editorial-atelier',
  theme: 'dental-arboleda-v1',
  content: 'dental.arboleda.es-MX',
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
      variant: 'grid',
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
