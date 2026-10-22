// GENERATED from specs/floreria-casa-confeti-v2.spec.json (spec 361edbc44e43, file 961d15972d4a). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-casa-confeti-v2',
  name: 'Casa Confeti',
  category: 'florerias',
  description:
    'Florería con identidad propia: arreglos con precio, galería, equipo, reseñas, preguntas y pedidos',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'floreria',
  archetype: 'editorial-atelier',
  theme: 'floreria-casa-confeti-v2',
  content: 'floreria.casa-confeti-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'split',
    },
    {
      slot: 'about',
      variant: 'clock-rail',
    },
    {
      slot: 'services',
      variant: 'party-tiers',
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
      variant: 'list',
    },
    {
      slot: 'cta',
      variant: 'band',
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
    preset: 'calm',
  },
  renews: 'floreria-casa-confeti-v1',
} satisfies Manifest;
