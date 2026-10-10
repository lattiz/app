import type { Manifest } from '../src/types';

/** Concreto, Pro neo-brutal: lime fills, 3px ink borders, hard offset shadows, mono labels. */
export default {
  id: 'barberia-concreto-v1',
  name: 'CONCRETO Barbería',
  category: 'barberias',
  description:
    'Barbería neo-brutalista: precios en tarjetas, cifras, fotos, barberos, reseñas y dos sucursales',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'neo-brutal',
  theme: 'concreto-brutal',
  content: 'barberia.concreto.es-MX',
  sections: [
    { slot: 'navbar', variant: 'inline' },
    { slot: 'hero', variant: 'offset-card' },
    { slot: 'marquee', variant: 'ticker' },
    { slot: 'services', variant: 'cards' },
    { slot: 'about', variant: 'stats-strip' },
    { slot: 'gallery', variant: 'mosaic' },
    { slot: 'team', variant: 'grid' },
    { slot: 'testimonials', variant: 'cards' },
    { slot: 'locations', variant: 'with-contact' },
    { slot: 'faq', variant: 'list' },
    { slot: 'floating-whatsapp', variant: 'bubble' },
    { slot: 'footer', variant: 'big-wordmark' },
  ],
} satisfies Manifest;
