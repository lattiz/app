import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-barra-pedidos-01 (portada), rebuilt by hand
export default {
  slot: 'hero',
  variant: 'ticket-board',
  label: 'Portada',
  region: 'main',
  description:
    'Portada asimétrica: a la izquierda antetítulo, titular grande, texto, CTA de WhatsApp con enlace secundario y una nota con filete; a la derecha una foto ancha y, debajo, una comanda de barra (encabezado con número, líneas con precio, total y un enlace para pedirla igual). Contiene el único <h1>.',
  intent:
    'Una portada que enseña cómo se pide: la comanda de ejemplo vale como carta corta y como llamada a WhatsApp; para cafeterías, taquerías y barras que venden por pedido o para llevar.',
  placeholder: { width: 1200, height: 525 },
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'catalog'],
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
    'ticketTitle?',
    'ticketNo?',
    'order[].name',
    'order[].note?',
    'order[].price',
    'totalLabel?',
    'total?',
    'ticketCta?',
  ],
  sample: {
    note: 'Horno encendido desde las 7:30',
    ticketTitle: 'Comanda de barra',
    ticketNo: '#0482',
    order: [
      { name: 'Flat white', note: 'Leche entera, doble espresso', price: '$70' },
      { name: 'Lonche de roast beef', note: 'Hogaza, mostaza y provolone', price: '$175' },
      { name: 'Galleta de tahini', note: 'Sal en grano', price: '$55' },
    ],
    totalLabel: 'Total',
    total: '$300 MXN',
    ticketCta: 'Pedir lo mismo por WhatsApp',
  },
} satisfies SectionMeta;
