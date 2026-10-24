import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-ceniza-brasa-pizarra-01 (preguntas), rebuilt by hand
export default {
  slot: 'faq',
  variant: 'rule-table',
  label: 'Preguntas en tabla',
  region: 'main',
  description:
    'Cabecera con título grande y una línea de apoyo bajo un filete y una tabla enmarcada de tres columnas (tema, pregunta, respuesta) con encabezado en tinte y una fila por pregunta, todas abiertas. Bajo 992px cada fila se apila. Un botón de WhatsApp opcional cierra la sección.',
  intent:
    'Responder lo de siempre (acceso, horario, ubicación, dieta, pago) como una tabla de reglas de la casa; para bares y parrillas con preguntas cortas y concretas.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'editorial'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'cta?',
    'topicLabel',
    'questionLabel',
    'answerLabel',
    'items[].topic',
    'items[].question',
    'items[].answer',
  ],
  sample: {
    kicker: 'Reglas del lugar',
    intro: 'Directo y sin letras chiquitas.',
    topicLabel: 'Tema',
    questionLabel: 'Pregunta',
    answerLabel: 'Respuesta',
    items: [
      { topic: 'Acceso', question: '¿Se requiere reservación?', answer: 'La mitad del salón se aparta por WhatsApp; la barra y las mesas de la periferia son por orden de llegada.' },
      { topic: 'Horarios', question: '¿A qué hora apagan la parrilla?', answer: 'La cocina toma la última orden una hora antes del cierre; la barra sigue hasta el final.' },
      { topic: 'Pago', question: '¿Qué formas de pago aceptan?', answer: 'Tarjetas de crédito y débito, transferencia y efectivo. No cobramos comisión.' },
    ],
  },
} satisfies SectionMeta;
