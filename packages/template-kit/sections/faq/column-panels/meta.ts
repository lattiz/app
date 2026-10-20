import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-caramelo-pop-bandas-01 (preguntas), rebuilt by hand
export default {
  slot: 'faq',
  variant: 'column-panels',
  label: 'Preguntas frecuentes',
  region: 'main',
  description:
    'Cabecera centrada (antetítulo en cápsula, título y una línea) y las preguntas en una sola columna angosta: cada una es un panel redondeado con su número en un círculo tintado, la pregunta en la fuente de titulares y la respuesta debajo. Cada panel es un <details open> nativo que se abre y se cierra solo; el editor lo ve siempre abierto.',
  intent:
    'Preguntas que se leen de corrido, una debajo de otra y sin retícula; para tiendas y negocios de regalo cuyas dudas (envíos, cajas, mayoreo) se responden en una frase.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['soft'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'cta?',
    'items[].question',
    'items[].answer',
  ],
} satisfies SectionMeta;
