// GENERATED from specs/tienda-pulpa-v1.spec.json (spec 53a17b9d18d0, file 7c84dbe4cba7). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'tienda-pulpa-v1',
  name: 'Pulpa',
  category: 'tiendas',
  description:
    'Tienda con identidad propia: catálogo con fotos y precios, la tienda en fotos, reseñas, preguntas y pedidos por WhatsApp',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'tienda',
  archetype: 'editorial-atelier',
  theme: 'tienda-pulpa-v1',
  content: 'tienda.pulpa-v1.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'notice-bar',
    },
    {
      slot: 'hero',
      variant: 'spotlight-card',
    },
    {
      slot: 'marquee',
      variant: 'ticker',
    },
    {
      slot: 'about',
      variant: 'build-panel',
    },
    {
      slot: 'services',
      variant: 'flavor-cards',
    },
    {
      slot: 'gallery',
      variant: 'priced-rows',
    },
    {
      slot: 'testimonials',
      variant: 'avatar-cards',
    },
    {
      slot: 'faq',
      variant: 'grid',
    },
    {
      slot: 'cta',
      variant: 'closing-band',
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
