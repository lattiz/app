import type { SectionMeta } from '../../../src/types';

// Stitch: clinica-cauce-etapas-menu-01
export default {
  slot: 'about',
  variant: 'care-pathway',
  label: 'Ruta de recuperación',
  region: 'main',
  description:
    'Cabecera izquierda fija (antetítulo, título con acento serif, resumen y CTA fantasma) y, a la derecha, cuatro etapas en una lista vertical unidas por una línea con nodo: número serif, título, texto y etiqueta de fase al pie. La última etapa lleva el nodo relleno. Sin foto ni sombra.',
  intent:
    'Explicar un proceso clínico por etapas enlazadas, no una fila de tarjetas iguales; para clínicas, fisioterapia y consultorios que venden un plan de recuperación con cita por WhatsApp.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['booking', 'trust'],
  contentKeys: [
    'kicker?',
    'title',
    'summary?',
    'steps[].title',
    'steps[].text',
    'steps[].tag?',
    'primaryCta?',
  ],
  sample: {
    kicker: '{{index}} — Etapas',
    title:
      'Tu recuperación, <span class="lz-title__serif">etapa</span> por etapa',
    summary:
      'Valoración, plan por fases y alta con ejercicios para casa. Cada etapa tiene un objetivo claro y un tiempo pactado contigo.',
    primaryCta: 'Agendar valoración',
    steps: [
      {
        title: 'Valoración',
        text: 'Revisamos movilidad, fuerza y el motivo de la consulta para armar el plan de las siguientes semanas.',
        tag: 'Primera sesión',
      },
      {
        title: 'Recuperación',
        text: 'Trabajo manual y ejercicios guiados para bajar la molestia y recuperar el rango que puedas hacer sin forzar.',
        tag: 'Fase inicial',
      },
      {
        title: 'Fortalecimiento',
        text: 'Cargas progresivas y control del movimiento para que el trabajo de consultorio se sostenga en tu día a día.',
        tag: 'Fase activa',
      },
      {
        title: 'Alta',
        text: 'Cerramos con una rutina para casa y las señales de alarma: si algo cambia, nos escribes y reabrimos el plan.',
        tag: 'Alta con plan',
      },
    ],
  },
} satisfies SectionMeta;
