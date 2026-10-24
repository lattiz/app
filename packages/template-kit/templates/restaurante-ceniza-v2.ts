// GENERATED from specs/restaurante-ceniza-v2.spec.json (spec 38d821242b7c, file a253177f519a). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-ceniza-v2',
  name: 'Ceniza Grill & Bar',
  category: 'restaurantes',
  description:
    'Restaurante con identidad propia: menú, la cocina en fotos, equipo, reseñas, preguntas y reservas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'restaurante',
  archetype: 'street-luxe',
  theme: 'restaurante-ceniza-v2',
  content: 'restaurante.ceniza-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'index-strip',
    },
    {
      slot: 'hero',
      variant: 'vertical-slip',
    },
    {
      slot: 'about',
      variant: 'coal-log',
    },
    {
      slot: 'services',
      variant: 'chalk-board',
    },
    {
      slot: 'gallery',
      variant: 'contact-sheet',
    },
    {
      slot: 'testimonials',
      variant: 'order-slips',
    },
    {
      slot: 'faq',
      variant: 'rule-table',
    },
    {
      slot: 'locations',
      variant: 'table-map',
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'receipt',
    },
  ],
  motion: {
    preset: 'calm',
  },
  renews: 'restaurante-ceniza-v1',
} satisfies Manifest;
