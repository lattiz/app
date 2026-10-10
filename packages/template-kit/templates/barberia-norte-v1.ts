import type { Manifest } from '../src/types';

export default {
  id: 'barberia-norte-v1',
  name: 'Norte Barber Studio',
  category: 'barberias',
  description:
    'Barbería clara y editorial: equipo, precios, galería, reseñas, preguntas y contacto',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'clean-editorial',
  theme: 'norte-atelier',
  content: 'barberia.es-MX',
  business: {
    name: 'Norte Barber Studio',
    shortName: 'NORTE',
    tagline: 'Barber Studio',
    email: 'hola@nortebarberstudio.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=norte+barber+studio',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=norte+barber+studio+cdmx',
  },
  sections: [
    { slot: 'navbar', variant: 'inline' },
    {
      slot: 'hero',
      variant: 'image-bg',
      props: { eyebrow: 'Barbería de autor · {{city}}', sticker: 'Citas hoy' },
    },
    { slot: 'about', variant: 'text-image-offset' },
    { slot: 'team', variant: 'grid' },
    { slot: 'services', variant: 'price-list' },
    { slot: 'gallery', variant: 'strip' },
    { slot: 'testimonials', variant: 'cards' },
    { slot: 'faq', variant: 'two-col' },
    { slot: 'locations', variant: 'with-contact' },
    { slot: 'floating-whatsapp', variant: 'bubble' },
    { slot: 'footer', variant: 'big-wordmark' },
  ],
} satisfies Manifest;
