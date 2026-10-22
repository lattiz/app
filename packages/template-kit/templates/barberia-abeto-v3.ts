// GENERATED from specs/barberia-abeto-v3.spec.json (spec 69ee2eeee689, file 1d3eeab5746b). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'barberia-abeto-v3',
  name: 'Abeto Barbería',
  category: 'barberias',
  description:
    'Barbería con identidad propia: carta de servicios, galería, equipo, reseñas, preguntas y contacto',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'neo-brutal',
  theme: 'barberia-abeto-v3',
  content: 'barberia.abeto-v3.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'panel',
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
      slot: 'cta',
      variant: 'ritual-panels',
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
    preset: 'editorial',
    progress: true,
  },
  renews: 'barberia-abeto-v1',
} satisfies Manifest;
