import type { Blueprint } from '../src/types';
import { family, guidance, roles, verticals } from './service-landing.shared';

/** Basic: one shared structure per vertical; the theme is the only identity. Any tenant can pick it. */
export default {
  family,
  tier: 'basic',
  description:
    'Landing esencial de un negocio de servicios: portada con CTA a WhatsApp, servicios con precios, preguntas frecuentes y una sucursal con mapa. 6–7 secciones.',
  roles: {
    header: roles.header,
    hero: roles.hero,
    about: { ...roles.about, variants: ['brief'] },
    catalog: roles.catalog,
    faq: roles.faq,
    contact: { ...roles.contact, variants: ['single'] },
    whatsapp: roles.whatsapp,
    footer: roles.footer,
  },
  verticals,
  archetypes: {
    essential:
      'Estructura común del rubro; cambia solo el tema (colores, tipografías, radios). Se curan pocos temas.',
  },
  guidance: [
    ...guidance,
    'Las plantillas Basic del mismo rubro comparten estructura a propósito (similitud ≤ 0.85); no inventes órdenes nuevos.',
    'Una sola sucursal (locations/single): pasa `branch` y deja una sola en footer.branches.',
  ],
} satisfies Blueprint;
