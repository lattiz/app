// GENERATED from specs/academia-combate-dojo-ciruelo.spec.json (spec bacb84df9b64, file 69b346e0a372). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'academia-combate-dojo-ciruelo-v1',
  name: 'Dojo Ciruelo',
  category: 'academias-combate',
  description:
    'Academia de combate con identidad propia: disciplinas, horarios, coaches, el tatami en fotos, reseñas y clase de prueba',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'academia-combate',
  archetype: 'editorial-atelier',
  theme: 'academia-combate-dojo-ciruelo-v1',
  content: 'academia-combate.dojo-ciruelo.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'panel',
    },
    {
      slot: 'about',
      variant: 'text-image-offset',
    },
    {
      slot: 'services',
      variant: 'discipline-schedule',
    },
    {
      slot: 'team',
      variant: 'coach-ranks',
    },
    {
      slot: 'gallery',
      variant: 'grid',
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
      variant: 'map-link',
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'minimal-centered',
    },
  ],
  motion: {
    preset: 'calm',
    progress: true,
  },
} satisfies Manifest;
