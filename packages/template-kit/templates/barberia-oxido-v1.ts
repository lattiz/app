import type { Manifest } from '../src/types';

/** ÓXIDO rebuilt from the section library; must stay equivalent to fixtures/oxido (kit:compare). */
export default {
  id: 'barberia-oxido-v1',
  name: 'ÓXIDO Barber Club',
  category: 'barberias',
  description:
    'Barbería urbana oscura: precios, promos, equipo, reseñas y sucursales',
  family: 'service-landing',
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
    { slot: 'locations', variant: 'urban-luxe' },
    { slot: 'team', variant: 'urban-luxe' },
    { slot: 'testimonials', variant: 'urban-luxe' },
    { slot: 'floating-whatsapp', variant: 'urban-luxe' },
    { slot: 'footer', variant: 'urban-luxe' },
  ],
} satisfies Manifest;
