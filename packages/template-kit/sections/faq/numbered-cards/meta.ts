import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-don-porfirio-01 (preguntas), rebuilt by hand
export default {
  slot: 'faq',
  variant: 'numbered-cards',
  label: 'Preguntas frecuentes',
  region: 'main',
  description:
    'Cabecera centrada (antetítulo, título y una línea) y las preguntas en una retícula de dos columnas: cada una es una tarjeta con su número, la pregunta en la fuente de titulares y la respuesta debajo. Cada tarjeta es un <details open> nativo que se abre y se cierra sola; el editor la ve siempre abierta.',
  intent:
    'Preguntas que se leen como fichas numeradas de un catálogo, con voz de titular y una cabecera con carácter; para barberías, restaurantes de autor y despachos que quieren un FAQ editorial en vez de una lista.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'showcase', 'editorial'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'cta?',
    'items[].question',
    'items[].answer',
  ],
} satisfies SectionMeta;
