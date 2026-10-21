import type { SectionMeta } from '../../../src/types';

// Stitch: clinica-cauce-etapas-menu-01
export default {
  slot: 'services',
  variant: 'treatment-rows',
  label: 'Tratamientos en filas',
  region: 'main',
  description:
    'Cabecera a dos extremos (título e intro a la izquierda, unidad a la derecha) y un solo panel tintado con borde fino: cada fila es nombre serif más descripción, precio alineado y un botón fantasma «Agendar» hacia WhatsApp. Sin números ni líderes punteados. Las promociones van como enlaces bajo el panel.',
  intent:
    'Una carta de tratamientos donde cada fila es una reserva, no una tarifa numerada ni un menú con puntos; para clínicas y consultorios que agendan por WhatsApp el servicio concreto.',
  numbered: false,
  tiers: ['basic', 'pro'],
  archetypes: ['booking', 'catalog'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'unit?',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'prices[].cta?',
    'prices[].href?',
    'promos[].title?',
    'promos[].text?',
    'promos[].cta?',
    'promos[].href?',
  ],
  sample: {
    kicker: 'Tratamientos',
    title: 'Tratamientos y <span class="lz-title__serif">servicios</span>',
    intro:
      'Sesiones de 50 minutos en consultorio. El precio es por cita; el plan se arma en la valoración.',
    unit: 'por sesión',
    prices: [
      {
        name: 'Fisioterapia ortopédica',
        price: '$900 MXN',
        description:
          'Columna, rodilla, hombro y postoperatorio: valoración y plan de ejercicios para casa.',
        cta: 'Agendar',
        href: '{{whatsappUrl:Hola, quiero agendar fisioterapia ortopédica}}',
      },
      {
        name: 'Rehabilitación deportiva',
        price: '$950 MXN',
        description:
          'Vuelta a la carga después de un esguince, rotura o sobrecarga, con control del movimiento.',
        cta: 'Agendar',
        href: '{{whatsappUrl:Hola, quiero agendar rehabilitación deportiva}}',
      },
      {
        name: 'Terapia manual',
        price: '$850 MXN',
        description:
          'Movilización y trabajo de tejidos para bajar la rigidez y recuperar rango.',
        cta: 'Agendar',
        href: '{{whatsappUrl:Hola, quiero agendar terapia manual}}',
      },
      {
        name: 'Punción seca',
        price: '$800 MXN',
        description:
          'Puntos gatillo y dolor muscular localizado, siempre con valoración previa.',
        cta: 'Agendar',
        href: '{{whatsappUrl:Hola, quiero agendar punción seca}}',
      },
      {
        name: 'Reeducación postural',
        price: '$800 MXN',
        description:
          'Hábitos de oficina y carga: cómo sentarte, levantarte y sostener el esfuerzo sin repetir la molestia.',
        cta: 'Agendar',
        href: '{{whatsappUrl:Hola, quiero agendar reeducación postural}}',
      },
    ],
  },
} satisfies SectionMeta;
