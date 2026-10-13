import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'cta',
  variant: 'band',
  label: 'Llamada a la acción',
  region: 'main',
  description:
    'Franja de cierre a todo el ancho sobre el tinte del tema (surface-2, no invierte el tema): titular grande a la izquierda y, a la derecha, una línea de texto con el CTA de WhatsApp y uno secundario opcional. Cuenta como sección.',
  intent:
    'Una última invitación antes de las preguntas o el contacto, con un solo texto de CTA; para cualquier giro que vive de citas o pedidos por WhatsApp.',
  tiers: ['basic', 'pro'],
  archetypes: ['booking', 'catalog', 'bold', 'soft'],
  contentKeys: [
    'title',
    'text?',
    'primaryCta',
    'secondaryCta?',
    'secondaryHref?',
  ],
  sample: {
    title: 'Tu lugar, <span class="lz-title__serif">esta semana</span>',
    text: 'Escríbenos y te decimos qué horarios quedan libres. Respondemos en minutos, de lunes a sábado.',
    primaryCta: 'Escribir por WhatsApp',
    secondaryCta: 'Ver preguntas',
    secondaryHref: '#preguntas',
  },
} satisfies SectionMeta;
