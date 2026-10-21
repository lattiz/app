// GENERATED from specs/floreria-cardamina-v2.spec.json (spec 60bd7505a0df, file 6acf3f399239). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-cardamina-v2',
  name: 'Cardamina Florería Botánica',
  category: 'florerias',
  description:
    'Florería con identidad propia: arreglos con precio, galería, equipo, reseñas, preguntas y pedidos',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'floreria',
  archetype: 'editorial-atelier',
  theme: 'floreria-cardamina-v2',
  content: 'floreria.cardamina-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'poster',
    },
    {
      slot: 'about',
      variant: 'text-image-offset',
    },
    {
      slot: 'services',
      variant: 'cards',
    },
    {
      slot: 'gallery',
      variant: 'staggered-frames',
    },
    {
      slot: 'testimonials',
      variant: 'cards',
    },
    {
      slot: 'faq',
      variant: 'grid',
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
      variant: 'ledger',
    },
  ],
  motion: {
    preset: 'editorial',
  },
  renews: 'floreria-cardamina-v1',
} satisfies Manifest;
