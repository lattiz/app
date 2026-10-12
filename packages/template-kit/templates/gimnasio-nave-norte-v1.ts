// GENERATED from specs/gimnasio-nave-norte.spec.json (spec 2f28c4a23c7a, file 4ef25e82a8bc). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'gimnasio-nave-norte-v1',
  name: 'Nave Norte',
  category: 'gimnasios',
  description:
    'Gimnasio con identidad propia: membresías, clases, coaches, el espacio en fotos, reseñas y clase de prueba',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'gimnasio',
  archetype: 'neo-brutal',
  theme: 'gimnasio-nave-norte-v1',
  content: 'gimnasio.nave-norte.es-MX',
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
      variant: 'cards',
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
      variant: 'cards',
    },
    {
      slot: 'faq',
      variant: 'two-col',
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
    preset: 'editorial',
    progress: true,
  },
} satisfies Manifest;
