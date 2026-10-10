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
  theme: 'urban-dark',
  content: 'barberia.es-MX',
  sections: [
    { slot: 'navbar', variant: 'urban-luxe' },
    { slot: 'hero', variant: 'image-bg' },
    { slot: 'marquee', variant: 'urban-luxe' },
    { slot: 'about', variant: 'urban-luxe' },
    { slot: 'services', variant: 'urban-luxe' },
    { slot: 'gallery', variant: 'grid' },
    { slot: 'locations', variant: 'with-contact' },
    { slot: 'team', variant: 'urban-luxe' },
    { slot: 'testimonials', variant: 'urban-luxe' },
    { slot: 'faq', variant: 'list' },
    { slot: 'floating-whatsapp', variant: 'urban-luxe' },
    { slot: 'footer', variant: 'urban-luxe' },
  ],
} satisfies Manifest;
