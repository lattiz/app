// GENERATED from specs/barberia-abeto-v2.spec.json (spec 6e61ec7e3369, file c9aa9935fe40). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'barberia-abeto-v2',
  name: 'Abeto Barbería',
  category: 'barberias',
  description:
    'Barbería con identidad propia: carta de servicios, galería, equipo, reseñas, preguntas y contacto',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'street-luxe',
  theme: 'barberia-abeto-v2',
  content: 'barberia.abeto-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'index-panel',
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
      variant: 'index-table',
    },
    {
      slot: 'gallery',
      variant: 'strip',
    },
    {
      slot: 'team',
      variant: 'index-portraits',
    },
    {
      slot: 'testimonials',
      variant: 'hairline-trio',
    },
    {
      slot: 'faq',
      variant: 'index-answers',
    },
    {
      slot: 'locations',
      variant: 'split-panel',
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
    preset: 'editorial',
    progress: true,
  },
  renews: 'barberia-abeto-v1',
} satisfies Manifest;
