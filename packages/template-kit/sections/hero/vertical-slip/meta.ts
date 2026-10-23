import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-ceniza-brasa-pizarra-01 (portada), rebuilt by hand
export default {
  slot: 'hero',
  variant: 'vertical-slip',
  label: 'Portada con columna vertical',
  region: 'main',
  description:
    'Portada asimétrica a todo el alto: a la izquierda antetítulo enmarcado, un titular enorme en tres líneas, texto, dos botones y una nota con filete; a la derecha, pegada a un filete, una columna con foto vertical y una etiqueta girada, y debajo una ficha de turno con número y líneas de datos. Contiene el único <h1>.',
  intent:
    'Una portada de cartel nocturno donde el titular manda y la ficha de turno da los datos útiles (turno, acceso, cocina); para parrillas y bares que abren de noche.',
  placeholder: { width: 900, height: 1200 },
  tiers: ['pro'],
  archetypes: ['bold', 'editorial'],
  contentKeys: [
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta?',
    'secondaryHref?',
    'note?',
    'tag?',
    'slipTitle?',
    'slipNo?',
    'slip[].label',
    'slip[].value',
  ],
  sample: {
    note: 'Cortes al carbón · Mezcales · Vinilos',
    tag: 'Abierto hasta la 1:30',
    slipTitle: 'Ficha de turno',
    slipNo: 'No. 042',
    slip: [
      { label: 'Estado', value: 'Brasa activa' },
      { label: 'Acceso', value: 'Directo a la barra' },
    ],
  },
} satisfies SectionMeta;
