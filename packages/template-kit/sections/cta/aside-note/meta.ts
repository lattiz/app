import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-barra-pedidos-01 (hoy-en-barra), rebuilt by hand
export default {
  slot: 'cta',
  variant: 'aside-note',
  label: 'Nota de la barra',
  region: 'main',
  description:
    'Panel con filete sobre la superficie del tema: encabezado con antetítulo y título a la izquierda y una línea de disponibilidad a la derecha; debajo, dos bloques separados por un filete vertical (título, texto y notas en línea fina) y un enlace de WhatsApp subrayado. Cuenta como sección.',
  intent:
    'Una nota que cambia cada semana (el producto invitado, la horneada especial) con una llamada directa a apartarla; para cafeterías, panaderías y barras con producto de temporada.',
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'catalog'],
  contentKeys: [
    'kicker?',
    'title',
    'stockLabel?',
    'stock?',
    'blocks[].title',
    'blocks[].text',
    'blocks[].notes[]?',
    'primaryCta',
  ],
  sample: {
    kicker: 'Edición limitada · Semana 18',
    title: 'Hoy en barra: productor invitado',
    stockLabel: 'Disponibilidad:',
    stock: '14 bolsas de 250 g',
    blocks: [
      {
        title: 'Lote de la Sierra Sur de Oaxaca',
        text: 'Cultivado a 1,450 metros por una familia de productores. Fermentación de 24 horas y secado bajo sombra.',
        notes: [
          'Perfil de taza: mandarina madura y piloncillo claro.',
          'Molienda sugerida: grano entero o para prensa francesa.',
        ],
      },
      {
        title: 'Horneada especial de temporada',
        text: 'Tartaleta de higo pochado y requesón fresco, con masa de centeno integral molido en piedra.',
      },
    ],
    primaryCta: 'Apartar por WhatsApp',
  },
} satisfies SectionMeta;
