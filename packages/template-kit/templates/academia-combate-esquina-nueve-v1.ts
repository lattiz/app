// GENERATED from specs/academia-combate-esquina-nueve.spec.json (spec f701fe3a0c0c, file 95a46330aff1). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'academia-combate-esquina-nueve-v1',
  name: 'Esquina Nueve',
  category: 'academias-combate',
  description:
    'Academia de combate con identidad propia: disciplinas, horarios, coaches, el tatami en fotos, reseñas y clase de prueba',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'academia-combate',
  archetype: 'neo-brutal',
  theme: 'academia-combate-esquina-nueve-v1',
  content: 'academia-combate.esquina-nueve.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'image-bg',
    },
    {
      slot: 'marquee',
      variant: 'ticker',
    },
    {
      slot: 'about',
      variant: 'stats-strip',
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
      variant: 'cards',
    },
    {
      slot: 'faq',
      variant: 'two-col',
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
      variant: 'big-wordmark',
    },
  ],
  motion: {
    preset: 'editorial',
    progress: true,
  },
} satisfies Manifest;
