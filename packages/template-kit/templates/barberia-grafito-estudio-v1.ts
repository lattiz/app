// GENERATED from specs/barberia-grafito-estudio.spec.json (spec e41ae60c038f, file 47b8f015e3fb). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'barberia-grafito-estudio-v1',
  name: 'Grafito Estudio',
  category: 'barberias',
  description:
    'Barbería con identidad propia: carta de servicios, galería, equipo, reseñas, preguntas y contacto',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'editorial-atelier',
  theme: 'barberia-grafito-estudio-v1',
  content: 'barberia.grafito-estudio.es-MX',
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
      variant: 'framed-craft',
    },
    {
      slot: 'services',
      variant: 'ritual-cards',
    },
    {
      slot: 'gallery',
      variant: 'mosaic',
    },
    {
      slot: 'locations',
      variant: 'booking-panel',
    },
    {
      slot: 'testimonials',
      variant: 'paper-trio',
    },
    {
      slot: 'faq',
      variant: 'numbered-cards',
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'signature-bar',
    },
  ],
  motion: {
    preset: 'editorial',
    progress: true,
  },
} satisfies Manifest;
