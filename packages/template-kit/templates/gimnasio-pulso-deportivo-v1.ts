// GENERATED from specs/gimnasio-pulso-deportivo.spec.json (spec a4484a2898ea, file eba80cf0f78c). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'gimnasio-pulso-deportivo-v1',
  name: 'Pulso Deportivo',
  category: 'gimnasios',
  description:
    'Gimnasio con identidad propia: membresías, clases, coaches, el espacio en fotos, reseñas y clase de prueba',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'gimnasio',
  archetype: 'editorial-atelier',
  theme: 'gimnasio-pulso-deportivo-v1',
  content: 'gimnasio.pulso-deportivo.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'bento',
    },
    {
      slot: 'about',
      variant: 'statement',
    },
    {
      slot: 'services',
      variant: 'editorial-table',
    },
    {
      slot: 'gallery',
      variant: 'strip',
    },
    {
      slot: 'team',
      variant: 'grid',
    },
    {
      slot: 'testimonials',
      variant: 'rating-wall',
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
      variant: 'columns',
    },
  ],
  motion: {
    preset: 'calm',
  },
} satisfies Manifest;
