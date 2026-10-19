// GENERATED from specs/barberia-gabinete-pinar-v1.spec.json (spec af41d063bb47, file b23870179bb9). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'barberia-gabinete-pinar-v1',
  name: 'Gabinete Pinar',
  category: 'barberias',
  description:
    'Barbería con identidad propia: carta de servicios, galería, equipo, reseñas, preguntas y contacto',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'neo-brutal',
  theme: 'barberia-gabinete-pinar-v1',
  content: 'barberia.gabinete-pinar-v1.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'poster',
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
      variant: 'menu-columns',
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
    preset: 'editorial',
    progress: true,
  },
} satisfies Manifest;
