import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'footer',
  variant: 'ledger',
  label: 'Pie de página',
  region: 'footer',
  description:
    'Pie como libreta: el nombre y una frase arriba y, debajo, filas con filete (cada sucursal con su dirección y horario, el contacto, las secciones) con la etiqueta a la izquierda y el dato a la derecha; el aviso legal y las redes al final.',
  intent:
    'Discreto y útil: los datos que la gente copia en filas que se leen de un vistazo, sin columnas apretadas ni rótulo gigante; para despachos, clínicas y cualquier página minimalista.',
  tiers: ['basic', 'pro'],
  archetypes: ['minimal', 'trust', 'editorial'],
  contentKeys: [
    'about',
    'branches[].name',
    'branches[].address',
    'branches[].hours?',
    'contactTitle',
    'linksTitle',
    'links[].label',
    'links[].href',
  ],
} satisfies SectionMeta;
