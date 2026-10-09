import type { Manifest } from '../src/types';

export default {
  id: 'barberia-norte-v1',
  name: 'Norte Barber Studio',
  category: 'barberias',
  description:
    'Barbería clara y editorial: equipo, precios, reseñas y sucursales',
  family: 'service-landing',
  vertical: 'barberia',
  archetype: 'clean-editorial',
  theme: 'bone-blue',
  content: 'barberia.es-MX',
  business: {
    name: 'Norte Barber Studio',
    shortName: 'NORTE',
    tagline: 'Barber Studio',
    googleReviewsUrl: 'https://www.google.com/search?q=norte+barber+studio',
  },
  sections: [
    { slot: 'navbar', variant: 'urban-luxe' },
    {
      slot: 'hero',
      variant: 'image-bg',
      props: { eyebrow: 'Barbería de autor · {{city}}', sticker: 'Citas hoy' },
    },
    { slot: 'about', variant: 'urban-luxe' },
    { slot: 'team', variant: 'urban-luxe' },
    { slot: 'services', variant: 'urban-luxe' },
    { slot: 'testimonials', variant: 'urban-luxe' },
    { slot: 'locations', variant: 'urban-luxe' },
    { slot: 'floating-whatsapp', variant: 'urban-luxe' },
    { slot: 'footer', variant: 'urban-luxe' },
  ],
} satisfies Manifest;
