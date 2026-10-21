import type { SectionMeta } from '../../../src/types';

// Stitch: veterinaria-editorial-agenda-01
export default {
  slot: 'cta',
  variant: 'urgent-line',
  label: 'Urgencias',
  region: 'main',
  description:
    'Banda a todo el ancho sobre el acento del tema: cápsula con punto, titular, texto, horarios a la izquierda y a la derecha el teléfono grande como enlace tel: más un botón píldora de relleno claro. Cuenta como sección.',
  intent:
    'Una franja de urgencias para llamar antes de salir: sin promesas de 24/7, con el teléfono a la vista; para veterinarias, clínicas y consultorios que atienden por llamada.',
  tiers: ['basic', 'pro'],
  archetypes: ['booking', 'trust', 'soft'],
  contentKeys: [
    'title',
    'text?',
    'primaryCta',
    'secondaryCta?',
    'secondaryHref?',
    'badge?',
    'phoneLabel?',
    'hours[].label?',
    'hours[].value?',
  ],
  sample: {
    badge: 'Urgencias',
    title:
      'En una urgencia, llámanos <span class="lz-title__serif">antes de salir</span>',
    text: 'Así preparamos el consultorio y el material mientras vienes en camino. Si estamos cerrados, te decimos a dónde acudir.',
    phoneLabel: 'Teléfono directo',
    primaryCta: 'Llamar ahora',
    secondaryCta: 'Escribir por WhatsApp',
    secondaryHref: '{{whatsappUrl}}',
    hours: [
      { label: 'Lun–Sáb', value: '9:00–20:00' },
      { label: 'Dom', value: '10:00–14:00' },
    ],
  },
} satisfies SectionMeta;
