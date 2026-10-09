import type { Blueprint } from '../src/types';

/** Single-page landing for a local service business (barbería, salón, consultorio, estudio). */
export default {
  family: 'service-landing',
  description:
    'Una página con scroll largo: navegación fija, portada con CTA a WhatsApp, prueba social, servicios con precios, ubicación y pie. Pensada para que el visitante reserve por WhatsApp en menos de un minuto.',
  slots: {
    navbar: {
      region: 'header',
      required: true,
      purpose:
        'Marca, anclas a las secciones y CTA de reserva siempre visible.',
    },
    hero: {
      region: 'main',
      required: true,
      position: 'first',
      purpose: 'Propuesta de valor + CTA principal. Único <h1> de la página.',
    },
    marquee: {
      region: 'main',
      required: false,
      purpose:
        'Cinta animada de especialidades; acento de marca entre portada y contenido.',
    },
    about: {
      region: 'main',
      required: false,
      purpose: 'Historia, diferenciadores y cifras.',
    },
    services: {
      region: 'main',
      required: true,
      purpose: 'Lista de precios y promociones con CTA a WhatsApp.',
    },
    team: {
      region: 'main',
      required: false,
      purpose: 'Personas que atienden; humaniza el negocio.',
    },
    testimonials: {
      region: 'main',
      required: false,
      purpose: 'Calificación y reseñas reales (Google).',
    },
    locations: {
      region: 'main',
      required: false,
      purpose: 'Sucursales con dirección, horario, mapa y cómo llegar.',
    },
    'floating-whatsapp': {
      region: 'main',
      required: false,
      position: 'last',
      purpose: 'Botón fijo de WhatsApp en todas las pantallas.',
    },
    footer: {
      region: 'footer',
      required: true,
      purpose: 'Datos de contacto, sucursales, anclas y redes.',
    },
  },
  archetypes: {
    'street-luxe':
      'Oscuro, tipografía condensada en mayúsculas, acento saturado, fotos en escala de grises. Energía urbana.',
    'clean-editorial':
      'Claro, mucho aire, acento frío, botones en píldora y tarjetas casi cuadradas. Calma y confianza.',
  },
  guidance: [
    'Cada enlace #ancla del menú y del pie debe apuntar a una sección presente en el manifiesto.',
    'Si quitas una sección, quita también su enlace de navbar.links y footer.links con `props`.',
    'Las secciones numeradas (01 — …) se renumeran solas según el orden del manifiesto.',
    'No repitas la combinación slot+variante, tema y par tipográfico de otra plantilla del mismo rubro (similitud ≤ 0.6).',
  ],
} satisfies Blueprint;
