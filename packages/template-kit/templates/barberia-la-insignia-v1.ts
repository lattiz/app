// GENERATED from specs/barberia-la-insignia.spec.json (spec 53ae2d79110a, file 4ea7d9180896). Do not edit: use the spec, or freeze.
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
      variant: 'stats-strip',
    },
    {
      slot: 'services',
      variant: 'cards',
    },
    {
      slot: 'gallery',
      variant: 'bento',
    },
    {
      slot: 'locations',
      variant: 'with-contact',
    },
    {
      slot: 'team',
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
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'big-wordmark',
    },
  ],
  motion: {
    preset: 'calm',
    progress: true,
  },
} satisfies Manifest;
