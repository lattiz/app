import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'panel',
  label: 'Portada',
  region: 'main',
  description:
    'Portada de reserva: foto cuadrada a la izquierda y, a la derecha, un panel teñido con antetítulo, titular, texto, CTAs y una nota corta opcional (horario de hoy, citas sin espera). Contiene el único <h1>.',
  intent:
    'Reservar: el panel concentra todo lo que hace falta para pedir la cita, con la nota de horario a la vista; para clínicas, dentistas, veterinarias y despachos.',
  tiers: ['basic', 'pro'],
  archetypes: ['booking', 'trust'],
  placeholder: { width: 1200, height: 1200 },
  contentKeys: [
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta',
    'secondaryHref',
    'note?',
  ],
  sample: {
    note: 'Hoy atendemos de 9:00 a 19:00',
  },
} satisfies SectionMeta;
