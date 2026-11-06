// GENERATED from specs/tienda-base-pulpa-v1.spec.json (spec 24604ee80ca9, file a6b729ba64cb). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'tienda-base-pulpa-v1',
  name: 'Pulpa (Básico)',
  category: 'tiendas',
  description:
    'Tienda de barrio: catálogo con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'tienda',
  archetype: 'essential',
  theme: 'tienda-base-pulpa-v1',
  content: 'tienda.base-pulpa-v1.es-MX',
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
      slot: 'about',
      variant: 'build-panel',
    },
    {
      slot: 'services',
      variant: 'flavor-cards',
    },
    {
      slot: 'faq',
      variant: 'grid',
    },
    {
      slot: 'locations',
      variant: 'single',
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'hours-blocks',
    },
  ],
} satisfies Manifest;
