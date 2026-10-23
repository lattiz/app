import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-ceniza-brasa-pizarra-01 (brasa), rebuilt by hand
export default {
  slot: 'about',
  variant: 'coal-log',
  label: 'Bitácora de la brasa',
  region: 'main',
  description:
    'Cabecera con antetítulo y título grande a la izquierda y una línea de apoyo a la derecha bajo un filete, y una bitácora de cuatro etapas en celdas contiguas: hora enorme en la fuente de titulares, nombre de la etapa, texto y una nota técnica con filete.',
  intent:
    'Contar cómo trabaja la cocina a lo largo del día en lugar de contar la historia del local; para parrillas, panaderías y bares con un ritual que se puede poner en horas.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'editorial'],
  contentKeys: [
    'kicker?',
    'title',
    'summary',
    'stages[].time',
    'stages[].title',
    'stages[].text',
    'stages[].note?',
  ],
  sample: {
    kicker: 'Ritual diario',
    title: 'Bitácora de la brasa',
    summary: 'El carbón no admite prisas. Todo empieza horas antes de recibir a la primera persona.',
    stages: [
      { time: '12:00', title: 'Enciende el carbón', text: 'Encino seco hasta lograr brasa pareja, sin llama viva.', note: 'Brasa: 450 °C' },
      { time: '15:00', title: 'Reposo de las carnes', text: 'Los cortes toman temperatura ambiente antes de tocar el fuego.', note: 'Corte: 2.5 pulgadas' },
      { time: '19:00', title: 'Abre la barra', text: 'Primeros cocteles, primeras brasas para las mesas.', note: 'Música: vinilo' },
      { time: '23:00', title: 'Última ronda', text: 'Sellados directos al rescoldo antes del cierre.', note: 'Cierre: 00:45' },
    ],
  },
} satisfies SectionMeta;
