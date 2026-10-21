import type { SectionMeta } from '../../../src/types';

// Stitch: veterinaria-editorial-agenda-01
export default {
  slot: 'about',
  variant: 'booking-steps',
  label: 'Cómo agendar',
  region: 'main',
  description:
    'Cabecera centrada (antetítulo en versalitas, título y una línea) y tres tarjetas del mismo alto en una fila: cada una con un círculo numerado, el título del paso y dos líneas de texto. Sin foto ni conectores. El CTA de WhatsApp debajo es opcional.',
  intent:
    'Explicar cómo reservar en tres pasos iguales, sin flechas ni línea de tiempo; para veterinarias, clínicas y negocios de cita por WhatsApp.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['booking', 'soft'],
  contentKeys: [
    'kicker?',
    'title',
    'summary?',
    'steps[].title',
    'steps[].text',
    'primaryCta?',
  ],
  sample: {
    kicker: '{{index}} — Cómo agendar',
    title:
      'Agenda tu <span class="lz-title__serif">visita</span> en tres pasos',
    summary: 'Sencillo y directo: nos escribes, elegimos horario y llegas.',
    primaryCta: 'Agendar por WhatsApp',
    steps: [
      {
        title: 'Escríbenos por WhatsApp',
        text: 'Cuéntanos de tu mascota y qué necesita; te respondemos en horario de la clínica.',
      },
      {
        title: 'Elegimos día y hora',
        text: 'Te proponemos un espacio sin prisas y te mandamos el recordatorio un día antes.',
      },
      {
        title: 'Ven con calma',
        text: 'Llega con su carnet si lo tienes; estacionamiento al frente.',
      },
    ],
  },
} satisfies SectionMeta;
