// GENERATED from specs/barberia-la-insignia.spec.json (spec 023c9502fca0, file dcf0ee0125ee). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'barberia-la-insignia-v1',
  name: 'La Insignia',
  category: 'barberias',
  description:
    'Barbería con identidad propia: carta de servicios, galería, equipo, reseñas, preguntas y contacto',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'neo-brutal',
  theme: 'barberia-la-insignia-v1',
  content: 'barberia.la-insignia.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'photo-ribbon',
    },
    {
      slot: 'marquee',
      variant: 'ticker',
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
      variant: 'bento',
    },
    {
      slot: 'locations',
      variant: 'booking-panel',
    },
    {
      slot: 'team',
      variant: 'grid',
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
    preset: 'calm',
    progress: true,
  },
} satisfies Manifest;
