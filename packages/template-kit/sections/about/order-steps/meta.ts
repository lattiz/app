import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-barra-pedidos-01 (como-pedir), rebuilt by hand
export default {
  slot: 'about',
  variant: 'order-steps',
  label: 'Cómo pedir',
  region: 'main',
  description:
    'Cabecera (antetítulo, título e introducción) y, debajo, de tres a cuatro pasos numerados en cajas cuadradas unidas por un filete horizontal que en móvil pasa a la vertical; un botón de WhatsApp opcional cierra la sección.',
  intent:
    'Una presentación que explica el proceso en lugar de contar la historia del local: elegir, escribir, recoger; para cafeterías, panaderías y cocinas que viven de pedidos por WhatsApp.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['editorial', 'catalog'],
  contentKeys: [
    'kicker?',
    'title',
    'summary',
    'features[].title',
    'features[].text',
    'cta?',
  ],
  sample: {
    kicker: 'Cómo pedir',
    title: 'Tres pasos y tu pedido te espera.',
    summary:
      'Atendemos en mostrador o coordinamos tu entrega para que llegue empacado en el momento en que cruces la puerta.',
    features: [
      {
        title: 'Elige de la carta',
        text: 'Revisa las bebidas, los lonches y lo que salió del horno esta mañana.',
      },
      {
        title: 'Escríbenos por WhatsApp',
        text: 'Dinos qué vas a tomar y a qué hora llegas, o a qué calle te lo llevamos.',
      },
      {
        title: 'Recoge en barra',
        text: 'Tu pedido sale recién hecho, con tu nombre en la bolsa.',
      },
    ],
    cta: 'Pedir por WhatsApp',
  },
} satisfies SectionMeta;
