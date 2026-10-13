// GENERATED from specs/restaurante-fresca-nube.spec.json (spec ca4b32eadb34, file c43a14e3573f). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-fresca-nube-v1',
  name: 'Fresca Nube',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'editorial-atelier',
  theme: 'restaurante-fresca-nube-v1',
  content: 'restaurante.fresca-nube.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'notice-bar',
    },
    {
      slot: 'hero',
      variant: 'duo-arch',
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
      variant: 'menu-columns',
    },
    {
      slot: 'gallery',
      variant: 'bento',
    },
    {
      slot: 'testimonials',
      variant: 'rating-wall',
    },
    {
      slot: 'faq',
      variant: 'grid',
    },
    {
      slot: 'locations',
      variant: 'with-contact',
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
  },
} satisfies Manifest;
