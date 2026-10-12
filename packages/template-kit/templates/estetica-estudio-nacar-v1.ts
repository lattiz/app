// GENERATED from specs/estetica-estudio-nacar.spec.json (spec b88261b2b3eb, file 91a215655d22). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'estetica-estudio-nacar-v1',
  name: 'Estudio Nácar',
  category: 'esteticas',
  description:
    'Salón con identidad propia: servicios y precios, el salón en fotos, equipo, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'estetica',
  archetype: 'editorial-atelier',
  theme: 'estetica-estudio-nacar-v1',
  content: 'estetica.estudio-nacar.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
    },
    {
      slot: 'hero',
      variant: 'split',
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
      slot: 'team',
      variant: 'grid',
    },
    {
      slot: 'gallery',
      variant: 'mosaic',
    },
    {
      slot: 'testimonials',
      variant: 'quote-feature',
    },
    {
      slot: 'faq',
      variant: 'list',
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
