// GENERATED from specs/gimnasio-pulso-deportivo-v2.spec.json (spec dd718c117141, file 06356417df2e). Do not edit: use the spec, or freeze.
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
      variant: 'framed',
    },
    {
      slot: 'about',
      variant: 'booking-steps',
    },
    {
      slot: 'services',
      variant: 'schedule-cards',
    },
    {
      slot: 'gallery',
      variant: 'collage',
    },
    {
      slot: 'testimonials',
      variant: 'feature-stack',
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
