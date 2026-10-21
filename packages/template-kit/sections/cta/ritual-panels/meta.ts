import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-abeto-v2-captura-01 (solo captura; reconstruido a mano)
export default {
  slot: 'cta',
  variant: 'ritual-panels',
  label: 'Ritual paso a paso',
  region: 'main',
  description:
    'Banda a todo el ancho sobre el tinte del tema: cabecera centrada (antetítulo en versalitas, título y una línea) y cuatro paneles con filete y esquinas del tema, cada uno con numeral grande, título, texto y duración opcional; debajo, el CTA de WhatsApp y uno secundario opcional. Cuenta como sección.',
  intent:
    'Contar el servicio como un ritual de cuatro pasos antes de pedir la cita: banda de cierre con paneles oscuros sobre un fondo más claro; para barberías, spas, estudios de tatuaje y talleres de oficio.',
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'showcase'],
  contentKeys: [
    'kicker?',
    'title',
    'summary?',
    'steps[].title',
    'steps[].text',
    'steps[].duration?',
    'primaryCta',
    'secondaryCta?',
    'secondaryHref?',
  ],
  sample: {
    kicker: 'Paso a paso',
    title: 'El ritual <span class="lz-title__serif">de la casa</span>',
    summary:
      'Cuatro pasos sin prisa, de la conversación inicial al último toque.',
    primaryCta: 'Reservar cita',
    secondaryCta: 'Ver servicios',
    secondaryHref: '#servicios',
    steps: [
      {
        title: 'Conversación',
        text: 'Platicamos qué buscas y cómo lo usas antes de empezar.',
        duration: '10 min',
      },
      {
        title: 'Preparación',
        text: 'Dejamos listo el espacio y el material para trabajar sin prisa.',
        duration: '10 min',
      },
      {
        title: 'El trabajo',
        text: 'La parte principal, hecha a mano y revisada en cada paso.',
        duration: '30 min',
      },
      {
        title: 'Últimos detalles',
        text: 'Ajustes finales y recomendaciones para que dure más.',
        duration: '10 min',
      },
    ],
  },
} satisfies SectionMeta;
