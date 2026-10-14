import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'rail',
  label: 'Portada',
  region: 'main',
  description:
    'Portada de texto primero: un riel angosto a la izquierda con el antetítulo y 2 a 4 datos (etiqueta y valor) separados por filetes; a la derecha el titular a todo el ancho y, debajo, la foto en franja panorámica junto al texto de apoyo y los CTAs. Sin datos, el riel muestra solo el antetítulo. Contiene el único <h1>.',
  intent:
    'Editorial y precisa: el titular manda y los datos prácticos (horario, colonia, cita) quedan en un riel de ficha técnica; para despachos, consultorios y restaurantes de autor.',
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'minimal', 'trust'],
  placeholder: { width: 1600, height: 900 },
  contentKeys: [
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta',
    'secondaryHref',
    'details[].label?',
    'details[].value?',
  ],
  sample: {
    details: [
      { label: 'Horario', value: 'Lun a sáb, 9:00 a 19:00' },
      { label: 'Dónde', value: 'A dos calles del metro' },
      { label: 'Citas', value: 'Por WhatsApp, el mismo día' },
    ],
  },
} satisfies SectionMeta;
