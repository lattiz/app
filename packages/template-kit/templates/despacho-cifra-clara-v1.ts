// GENERATED from specs/despacho-cifra-clara.spec.json (spec 5019d2696c43, file dd0dff2ed1b8). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'despacho-cifra-clara-v1',
  name: 'Cifra Clara',
  category: 'despachos',
  description:
    'Despacho con identidad propia: servicios, socios, el despacho en fotos, reseñas, preguntas y citas',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'despacho',
  archetype: 'editorial-atelier',
  theme: 'despacho-cifra-clara-v1',
  content: 'despacho.cifra-clara.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
    },
    {
      slot: 'hero',
      variant: 'image-bg',
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
      slot: 'team',
      variant: 'list',
    },
    {
      slot: 'gallery',
      variant: 'strip',
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
      variant: 'columns',
    },
  ],
  motion: {
    preset: 'editorial',
  },
} satisfies Manifest;
