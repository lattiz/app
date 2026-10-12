// GENERATED from specs/barberia-abeto.spec.json (spec 041b68319ddd, file 588250332092). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'barberia-abeto-v1',
  name: 'Abeto Barbería',
  category: 'barberias',
  description:
    'Barbería con identidad propia: carta de servicios, galería, equipo, reseñas, preguntas y contacto',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'street-luxe',
  theme: 'barberia-abeto-v1',
  content: 'barberia.abeto.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'centered-arch',
    },
    {
      slot: 'marquee',
      variant: 'ticker',
    },
    {
      slot: 'about',
      variant: 'text-image-offset',
    },
    {
      slot: 'services',
      variant: 'price-list',
    },
    {
      slot: 'gallery',
      variant: 'grid',
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
