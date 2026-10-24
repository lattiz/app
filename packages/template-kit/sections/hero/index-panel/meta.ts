import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-abeto-indice-01 (hero), rebuilt by hand
export default {
  slot: 'hero',
  variant: 'index-panel',
  label: 'Portada',
  region: 'main',
  description:
    'Portada de revista: una regla con el número de sección a la izquierda y el lugar a la derecha, una foto ancha con un panel del color de la página montado en su esquina inferior izquierda (antetítulo, titular, texto, CTA de WhatsApp y un enlace secundario) y, debajo, una franja de tres datos entre filetes. Contiene el único <h1>.',
  intent:
    'Una portada sobria y arquitectónica donde la foto del local manda y los datos útiles (horario, colonia, cómo reservar) se ven sin hacer scroll; para barberías, despachos y talleres de oficio que reservan por WhatsApp.',
  placeholder: { width: 1600, height: 800 },
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'bold'],
  contentKeys: [
    'kicker?',
    'tag?',
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta?',
    'secondaryHref?',
    'info[].label',
    'info[].value',
  ],
  sample: {
    kicker: '01 / Apertura',
    tag: 'Barbería de oficio',
    info: [
      { label: 'Horario', value: 'Mar–Sáb 10:00–20:00' },
      { label: 'Colonia', value: 'Centro histórico' },
      { label: 'Cita', value: 'En un mensaje de WhatsApp' },
    ],
  },
} satisfies SectionMeta;
