// GENERATED from specs/tienda-lote-doce.spec.json (spec 3065d05f2254, file fa95b77d8704). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'tienda-lote-doce-v1',
  name: 'Lote Doce',
  category: 'tiendas',
  description:
    'Tienda con identidad propia: catálogo con fotos y precios, la tienda en fotos, reseñas, preguntas y pedidos por WhatsApp',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'tienda',
  archetype: 'editorial-atelier',
  theme: 'tienda-lote-doce-v1',
  content: 'tienda.lote-doce.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
    },
    {
      slot: 'hero',
      variant: 'image-bg',
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
      variant: 'product-grid',
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
      slot: 'locations',
      variant: 'with-contact',
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
    preset: 'editorial',
  },
} satisfies Manifest;
