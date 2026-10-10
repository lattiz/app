import type { Manifest } from '../src/types';

/** Norte, Pro editorial-atelier: sentence-case serif, forest accent, rules instead of boxes. */
export default {
  id: 'barberia-norte-v1',
  name: 'Norte Barber Studio',
  category: 'barberias',
  description:
    'Barbería editorial de autor: carta de servicios, barberos, cuaderno de cortes, opiniones y estudios',
  family: 'service-landing',
  tier: 'pro',
  vertical: 'barberia',
  archetype: 'editorial-atelier',
  theme: 'norte-atelier',
  content: 'barberia.norte.es-MX',
  sections: [
    { slot: 'navbar', variant: 'centered-logo' },
    { slot: 'hero', variant: 'split' },
    { slot: 'about', variant: 'statement' },
    { slot: 'services', variant: 'editorial-table' },
    { slot: 'team', variant: 'list' },
    { slot: 'gallery', variant: 'strip' },
    { slot: 'testimonials', variant: 'quote-feature' },
    { slot: 'faq', variant: 'two-col' },
    { slot: 'locations', variant: 'with-contact' },
    { slot: 'floating-whatsapp', variant: 'bubble' },
    { slot: 'footer', variant: 'minimal-centered' },
  ],
} satisfies Manifest;
