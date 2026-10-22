import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-la-nota-azul-captura-01
export default {
  slot: 'cta',
  variant: 'ticket-stub-bill',
  label: 'Cartelera de boletos',
  region: 'main',
  description:
    'Cartelera como programa de concierto: a la izquierda antetítulo, titular, texto y los CTA; a la derecha una pila de boletos en fila completa, cada uno con talón de fecha grande, perforación discontinua con muescas, hora, nombre del set, descripción y botón de reservar. En móvil el talón pasa a franja superior. Cuenta como sección.',
  intent:
    'La agenda de la semana (música en vivo, noches temáticas, clases o catas) como boletos reservables por WhatsApp; para restaurantes, bares y cualquier negocio con programación fija.',
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'showcase'],
  contentKeys: [
    'kicker?',
    'title',
    'text?',
    'primaryCta',
    'secondaryCta?',
    'secondaryHref?',
    'shows[].day',
    'shows[].date?',
    'shows[].time',
    'shows[].title',
    'shows[].text?',
    'shows[].badge?',
    'shows[].cta?',
    'shows[].href?',
  ],
  sample: {
    kicker: 'Programación en vivo',
    title: 'Cartelera de la <span class="lz-title__serif">semana</span>',
    text: 'Aparta tu mesa para el set que quieras escuchar: las noches de música se llenan temprano.',
    primaryCta: 'Reservar mesa',
    secondaryCta: 'Ver el menú',
    secondaryHref: '#servicios',
    shows: [
      {
        day: 'Jue',
        date: '22',
        time: '21:00',
        title: 'Trío de la casa',
        text: 'Estándares de jazz y clásicos con arreglos propios.',
        badge: 'Esta noche',
        cta: 'Reservar',
        href: '{{whatsappUrl:Hola, quiero reservar para el jueves de jazz}}',
      },
      {
        day: 'Vie',
        date: '23',
        time: '21:30',
        title: 'Noche de jazz manouche',
        text: 'Cuerdas gitanas y mucho swing, de principio a fin.',
        cta: 'Reservar',
        href: '{{whatsappUrl:Hola, quiero reservar para el viernes de jazz}}',
      },
      {
        day: 'Sáb',
        date: '24',
        time: '21:30',
        title: 'Bossa nova y vino',
        text: 'Ritmos brasileños para brindar con calma.',
        cta: 'Reservar',
        href: '{{whatsappUrl:Hola, quiero reservar para el sábado de bossa}}',
      },
    ],
  },
} satisfies SectionMeta;
