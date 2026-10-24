import type { SectionMeta } from '../../../src/types';

// Stitch: floreria-casa-confeti-salon-de-fiestas-infantiles-01
export default {
  slot: 'about',
  variant: 'clock-rail',
  label: 'Horario del día',
  region: 'main',
  description:
    'Cabecera centrada (antetítulo, título y una línea) y, debajo, un riel horizontal con una parada por momento: la hora grande sobre un punto en la línea, el título y una frase debajo. Sin tarjetas ni números; en móvil el riel pasa a vertical con la hora a la izquierda. Una nota y el CTA de WhatsApp al cierre son opcionales.',
  intent:
    'Contar cómo transcurre un día o una visita por horas, como un riel de reloj; para salones de fiestas, clínicas, estéticas y negocios con una jornada que el cliente quiere imaginar.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['booking', 'soft'],
  contentKeys: [
    'kicker?',
    'title',
    'summary?',
    'moments[].time',
    'moments[].title',
    'moments[].text?',
    'statement?',
    'primaryCta?',
  ],
  sample: {
    kicker: '{{index}} — Tu día',
    title: 'Así corre <span class="lz-title__serif">la fiesta</span>',
    summary: 'Tres horas de salón, pensadas para que solo disfrutes.',
    statement: 'Tú disfrutas a los invitados; nosotros montamos y recogemos.',
    primaryCta: 'Cotizar mi fecha',
    moments: [
      {
        time: '11:00',
        title: 'Llegada',
        text: 'Recibimos a los invitados con el salón listo.',
      },
      {
        time: '11:30',
        title: 'Juegos',
        text: 'Animación y juegos para varias edades.',
      },
      {
        time: '13:00',
        title: 'Mesa de dulces',
        text: 'Pizza, dulces y aguas frescas.',
      },
      {
        time: '13:45',
        title: 'Pastel y piñata',
        text: 'El momento de las velas y los dulces.',
      },
      {
        time: '14:00',
        title: 'Despedida',
        text: 'Recuerdos para cada niño y salón recogido.',
      },
    ],
  },
} satisfies SectionMeta;
