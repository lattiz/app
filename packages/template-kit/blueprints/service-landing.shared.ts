import type { Role } from '../src/tiers';
import type { BlueprintRole, BlueprintVertical } from '../src/types';

/** Roles, vertical maps and guidance shared by the Basic and Pro service-landing blueprints. */

export const family = 'service-landing';

export const roles = {
  header: {
    region: 'header',
    purpose: 'Marca, anclas a las secciones y CTA de reserva siempre visible.',
  },
  hero: {
    region: 'main',
    position: 'first',
    purpose: 'Propuesta de valor + CTA principal. Único <h1> de la página.',
  },
  marquee: {
    region: 'main',
    purpose:
      'Cinta animada de especialidades; acento de marca entre portada y contenido. No cuenta como sección.',
  },
  about: {
    region: 'main',
    purpose: 'Historia, diferenciadores y cifras.',
  },
  catalog: {
    region: 'main',
    purpose: 'Servicios con precios y promociones, con CTA a WhatsApp.',
  },
  proof: {
    region: 'main',
    purpose:
      'Fotos del trabajo real (cortes, local, detalle) con pie de foto; prueba antes de reservar.',
  },
  team: {
    region: 'main',
    purpose: 'Personas que atienden; humaniza el negocio.',
  },
  testimonials: {
    region: 'main',
    purpose:
      'Calificación y reseñas de Google + botón "Dejar reseña en Google" ({{googleReviewUrl}}).',
  },
  faq: {
    region: 'main',
    purpose:
      'Dudas que frenan la reserva (precios, citas, pagos, cancelación, niños, duración) en <details open> nativos.',
  },
  contact: {
    region: 'main',
    purpose:
      'Dónde y cómo contactar: mapa, horario y botones de WhatsApp, teléfono, correo y cómo llegar. Nunca un <form>.',
  },
  cta: {
    region: 'main',
    purpose:
      'Franja de cierre con una invitación y el CTA principal (cta/band); cuenta como sección.',
  },
  whatsapp: {
    region: 'main',
    position: 'last',
    purpose:
      'Botón fijo de WhatsApp en todas las pantallas; obligatorio, cuenta como parte del pie.',
  },
  footer: {
    region: 'footer',
    purpose: 'Datos de contacto, sucursales, anclas y redes.',
  },
} satisfies Record<Role, BlueprintRole>;

const commonSlots = {
  header: 'navbar',
  hero: 'hero',
  marquee: 'marquee',
  about: 'about',
  team: 'team',
  testimonials: 'testimonials',
  faq: 'faq',
  cta: 'cta',
  whatsapp: 'floating-whatsapp',
  footer: 'footer',
} satisfies Partial<Record<Role, string>>;

const serviceSlots = {
  ...commonSlots,
  catalog: 'services',
  proof: 'gallery',
  contact: 'locations',
} satisfies Partial<Record<Role, string>>;

// Spec giros (giros/<id>.ts) reuse the service slots: the menu, consultations and arrangements are all `services`.
export const verticals: Record<string, BlueprintVertical> = {
  barberia: { schemaType: 'BarberShop', slots: serviceSlots },
  restaurante: { schemaType: 'Restaurant', slots: serviceSlots },
  clinica: { schemaType: 'MedicalClinic', slots: serviceSlots },
  floreria: { schemaType: 'Florist', slots: serviceSlots },
  estetica: { schemaType: 'BeautySalon', slots: serviceSlots },
  dental: { schemaType: 'Dentist', slots: serviceSlots },
  despacho: { schemaType: 'AccountingService', slots: serviceSlots },
  tienda: { schemaType: 'Store', slots: serviceSlots },
  gimnasio: { schemaType: 'ExerciseGym', slots: serviceSlots },
  'academia-combate': {
    schemaType: 'SportsActivityLocation',
    slots: serviceSlots,
  },
  veterinaria: { schemaType: 'VeterinaryCare', slots: serviceSlots },
};

export const guidance = [
  'Cada enlace #ancla del menú y del pie debe apuntar a una sección presente en el manifiesto.',
  'Si quitas una sección, quita también su enlace de navbar.links y footer.links con `props`.',
  'Las secciones numeradas (01 — …) se renumeran solas según el orden del manifiesto.',
  'Secciones contadas = todos los slots menos floating-whatsapp y marquee; el rango lo fija el tier (src/tiers.ts).',
  'Contacto sin formularios: solo botones (WhatsApp, tel:, mailto:, mapa).',
];
