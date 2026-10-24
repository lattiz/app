import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-ceniza-contactos-mapa-01 (pie), rebuilt by hand
export default {
  slot: 'footer',
  variant: 'receipt',
  label: 'Pie tipo ticket',
  region: 'footer',
  description:
    'Pie centrado en un ticket enmarcado sobre la superficie del tema, en fuente de datos: sello, nombre grande, línea legal, un desglose de condiciones en filas (nombre, nota y valor), una línea de total con una frase de cierre, dos columnas (enlaces y contacto), un código de barras decorativo y la leyenda de corte. Sin redes.',
  intent:
    'Cerrar la página como se cierra una cuenta: lo útil (sede, horario, combustible) en filas y una frase final; para parrillas, bares y cafeterías con carácter.',
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'editorial'],
  contentKeys: [
    'stamp?',
    'about?',
    'linesTitle',
    'lines[].label',
    'lines[].note?',
    'lines[].value',
    'totalLabel',
    'total',
    'totalNote?',
    'linksTitle',
    'contactTitle',
    'cut?',
    'links[].label',
    'links[].href',
  ],
  sample: {
    stamp: '*** Comprobante simulado ***',
    about: 'Grill y bar al carbón en la colonia.',
    linesTitle: 'Condiciones del servicio',
    lines: [
      { label: '01 / Sede', note: 'Calle de ejemplo, CDMX', value: 'Válido' },
      { label: '02 / Horario', note: 'Mié a sáb · 19:00 – 02:30', value: 'Activo' },
      { label: '03 / Combustible', note: 'Carbón de encino', value: 'Origen' },
    ],
    totalLabel: 'Total',
    total: '$0.00',
    totalNote: 'Sin cover ni tiempo límite por mesa.',
    linksTitle: 'Secciones',
    contactTitle: 'Contacto',
    cut: '✂ Corte aquí al salir de la barra',
  },
} satisfies SectionMeta;
