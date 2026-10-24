// GENERATED from specs/gimnasio-pulso-deportivo-v2.spec.json (spec 67f3c7a6daf8, file 73ba6a19d56f). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'gimnasio-pulso-deportivo-v2',
  name: 'Pulso Deportivo',
  category: 'gimnasios',
  description:
    'Gimnasio con identidad propia: membresías, clases, coaches, el espacio en fotos, reseñas y clase de prueba',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'gimnasio',
  archetype: 'neo-brutal',
  theme: 'gimnasio-pulso-deportivo-v2',
  content: 'gimnasio.pulso-deportivo-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'stack',
    },
    {
      slot: 'about',
      variant: 'stats-strip',
    },
    {
      slot: 'services',
      variant: 'schedule-cards',
    },
    {
      slot: 'gallery',
      variant: 'strip',
    },
    {
      slot: 'testimonials',
      variant: 'rating-wall',
    },
    {
      slot: 'faq',
      variant: 'list',
    },
    {
      slot: 'locations',
      variant: 'booking-panel',
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'signature-bar',
    },
  ],
  motion: {
    preset: 'calm',
  },
  renews: 'gimnasio-pulso-deportivo-v1',
} satisfies Manifest;
