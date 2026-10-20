// GENERATED from specs/tienda-caramelo-pop-v2.spec.json (spec 8e0f9df6d256, file 8d8efc1f501c). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'tienda-caramelo-pop-v2',
  name: 'Caramelo Pop',
  category: 'tiendas',
  description:
    'Tienda con identidad propia: catálogo con fotos y precios, la tienda en fotos, reseñas, preguntas y pedidos por WhatsApp',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'tienda',
  archetype: 'editorial-atelier',
  theme: 'tienda-caramelo-pop-v2',
  content: 'tienda.caramelo-pop-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'arch-sticker',
    },
    {
      slot: 'about',
      variant: 'statement',
    },
    {
      slot: 'services',
      variant: 'alternating-bands',
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
      variant: 'column-panels',
    },
    {
      slot: 'locations',
      variant: 'arch-visit',
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'minimal-centered',
    },
  ],
  motion: {
    preset: 'calm',
  },
  renews: 'tienda-caramelo-pop-v1',
} satisfies Manifest;
