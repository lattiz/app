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
  theme: 'bone-blue',
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
    { slot: 'navbar', variant: 'urban-luxe' },
    {
      slot: 'hero',
      variant: 'image-bg',
      props: { eyebrow: 'Barbería de autor · {{city}}', sticker: 'Citas hoy' },
    },
    { slot: 'about', variant: 'urban-luxe' },
    { slot: 'team', variant: 'urban-luxe' },
    { slot: 'services', variant: 'urban-luxe' },
    { slot: 'gallery', variant: 'strip' },
    { slot: 'testimonials', variant: 'urban-luxe' },
    { slot: 'faq', variant: 'two-col' },
    { slot: 'locations', variant: 'with-contact' },
    { slot: 'floating-whatsapp', variant: 'urban-luxe' },
    { slot: 'footer', variant: 'urban-luxe' },
  ],
} satisfies Manifest;
