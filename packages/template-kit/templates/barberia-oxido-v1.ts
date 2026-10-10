import type { Manifest } from '../src/types';

/** ÓXIDO, Pro: the Studio original (fixtures/oxido) plus gallery, FAQ and the contact block. */
export default {
  id: 'barberia-oxido-v1',
  name: 'ÓXIDO Barber Club',
  category: 'barberias',
  description:
    'Barbería urbana oscura: precios, galería, equipo, reseñas, preguntas y contacto',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'street-luxe',
  theme: 'oxido',
  content: 'barberia.es-MX',
  sections: [
    { slot: 'navbar', variant: 'inline' },
    { slot: 'hero', variant: 'image-bg' },
    { slot: 'marquee', variant: 'ticker' },
    { slot: 'about', variant: 'text-image-offset' },
    { slot: 'services', variant: 'price-list' },
    { slot: 'gallery', variant: 'grid' },
    { slot: 'locations', variant: 'with-contact' },
    { slot: 'team', variant: 'grid' },
    { slot: 'testimonials', variant: 'cards' },
    { slot: 'faq', variant: 'list' },
    { slot: 'floating-whatsapp', variant: 'bubble' },
    { slot: 'footer', variant: 'big-wordmark' },
  ],
} satisfies Manifest;
