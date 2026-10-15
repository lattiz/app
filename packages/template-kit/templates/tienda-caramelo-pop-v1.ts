// GENERATED from specs/tienda-caramelo-pop.spec.json (spec abb4a47547e7, file b5f868dc037c). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'tienda-caramelo-pop-v1',
  name: 'Caramelo Pop',
  category: 'tiendas',
  description:
    'Tienda con identidad propia: catálogo con fotos y precios, la tienda en fotos, reseñas, preguntas y pedidos por WhatsApp',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'tienda',
  archetype: 'editorial-atelier',
  theme: 'tienda-caramelo-pop-v1',
  content: 'tienda.caramelo-pop.es-MX',
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
      variant: 'cards',
    },
    {
      slot: 'gallery',
      variant: 'grid',
    },
    {
      slot: 'testimonials',
      variant: 'quote-feature',
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
      variant: 'minimal-centered',
    },
  ],
  motion: {
    preset: 'calm',
  },
} satisfies Manifest;
