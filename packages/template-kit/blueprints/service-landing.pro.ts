import type { Blueprint } from '../src/types';
import { family, guidance, roles, verticals } from './service-landing.shared';

/** Pro: distinctive archetypes per vertical with proof, reviews and full contact. Pro subscribers only. */
export default {
  family,
  tier: 'pro',
  description:
    'Landing completa con identidad propia: portada, nosotros, servicios, galería, reseñas, preguntas frecuentes y contacto con sucursales. 8–10 secciones.',
  roles: {
    header: roles.header,
    hero: roles.hero,
    marquee: roles.marquee,
    about: {
      ...roles.about,
      variants: ['text-image-offset', 'statement', 'stats-strip'],
    },
    catalog: roles.catalog,
    proof: roles.proof,
    team: roles.team,
    testimonials: roles.testimonials,
    faq: roles.faq,
    contact: { ...roles.contact, variants: ['with-contact'] },
    whatsapp: roles.whatsapp,
    footer: roles.footer,
  },
  verticals,
  archetypes: {
    'street-luxe':
      'Oscuro, tipografía condensada en mayúsculas, acento saturado, fotos en escala de grises. Energía urbana.',
    'editorial-atelier':
      'Papel y tinta, serif en caja baja, filetes de 1px en lugar de tarjetas, mucho aire y retícula asimétrica. Oficio y calma.',
    'neo-brutal':
      'Blanco roto y tinta, acento lima como relleno, bordes de 3px, sombras desplazadas duras, etiquetas mono. Directo e irreverente.',
  },
  guidance: [
    ...guidance,
    'Cada Pro del mismo rubro debe sentirse distinto (similitud ≤ 0.5): cambia orden, variantes, tema y par tipográfico.',
  ],
} satisfies Blueprint;
