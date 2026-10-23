import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-barra-pedidos-01 (cierre), rebuilt by hand
export default {
  slot: 'cta',
  variant: 'closing-band',
  label: 'Cierre del pedido',
  region: 'main',
  description:
    'Panel de color invertido (texto sobre fondo de página y al revés) con antetítulo de horario, titular grande, una línea de apoyo y un botón de WhatsApp con el teléfono directo al lado. Cuenta como sección.',
  intent:
    'Un último empujón con peso visual propio, después de las preguntas y antes del contacto; para cafeterías y cocinas que venden por pedido y quieren cerrar con la hora de servicio.',
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'catalog'],
  contentKeys: ['kicker?', 'title', 'text?', 'primaryCta', 'note?'],
  sample: {
    kicker: 'Servicio de martes a domingo · 7:30 a 19:00',
    title: 'Tu pedido listo al llegar a la barra.',
    text: 'Escríbenos unos minutos antes de salir de casa. Tendremos el café recién tirado y el pan empacado con tu nombre.',
    primaryCta: 'Pedir por WhatsApp',
    note: 'Teléfono directo: {{phone}}',
  },
} satisfies SectionMeta;
