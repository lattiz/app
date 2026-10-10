import type { Manifest } from '../src/types';

/** Basic on trazo-papel: warm paper, cobalt, Fraunces, arch hero. Same blueprint as the other Basic templates. */
export default {
  id: 'barberia-base-claro-v1',
  name: 'TRAZO Barbería',
  category: 'barberias',
  description:
    'Barbería de barrio en tono papel: precios claros, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'barberia',
  archetype: 'essential',
  theme: 'trazo-papel',
  content: 'barberia.trazo.es-MX',
  sections: [
    { slot: 'navbar', variant: 'inline' },
    { slot: 'hero', variant: 'centered-arch' },
    { slot: 'about', variant: 'brief' },
    { slot: 'services', variant: 'price-list' },
    { slot: 'faq', variant: 'list' },
    { slot: 'locations', variant: 'single' },
    { slot: 'floating-whatsapp', variant: 'bubble' },
    { slot: 'footer', variant: 'columns' },
  ],
} satisfies Manifest;
