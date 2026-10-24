import type { SectionMeta } from '../../../src/types';

// Stitch: gimnasio-pulso-parrilla-01
export default {
  slot: 'services',
  variant: 'schedule-cards',
  label: 'Horarios y planes',
  region: 'main',
  description:
    'Dos bloques: parrilla de 4 fichas de clase (etiqueta, nombre, texto y filas días/horario) con cabecera partida, y 3 tarjetas de plan del mismo alto (etiqueta, precio, viñetas y botón); la del medio se destaca con pestaña y relleno de acento.',
  intent:
    'Mostrar la parrilla de clases y las membresías en la misma sección, con horarios por zona y un plan destacado; para gimnasios, estudios y negocios que venden por horario y tarifa mensual.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['catalog', 'showcase', 'bold'],
  contentKeys: [
    'kicker',
    'title',
    'intro?',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'prices[].features[]?',
    'prices[].badge?',
    'prices[].cta?',
    'prices[].href?',
    'promos[].tag',
    'promos[].title',
    'promos[].text',
    'promos[].cta',
    'promos[].href',
    'promos[].slots[].label?',
    'promos[].slots[].value?',
    'schedule.title?',
    'schedule.intro?',
    'plans.kicker?',
    'plans.title?',
    'plans.intro?',
  ],
  sample: {
    kicker: 'Parrilla de horarios',
    title: 'Clases disponibles',
    intro:
      'Reserva tu lugar con anticipación. Cupo limitado por zona para cuidar la técnica de cada quien.',
    schedule: {
      title: 'Clases disponibles',
      intro:
        'Reserva tu lugar con anticipación. Cupo limitado por zona para cuidar la técnica de cada quien.',
    },
    plans: {
      kicker: 'Planes y tarifas',
      title: 'Inversión sin rodeos',
      intro:
        'Sin inscripción ni plazos forzosos. Pagas tu pase o tu mensualidad y entrenas desde el primer día.',
    },
    promos: [
      {
        tag: 'Zona 01',
        title: 'Fuerza',
        text: 'Levantamiento, press y hipertrofia con pesas libres y racks.',
        cta: 'Reservar fuerza',
        href: '{{whatsappUrl:Hola, quiero reservar fuerza}}',
        slots: [
          { label: 'Lunes a viernes', value: '07:00 – 21:00' },
          { label: 'Sábados', value: '08:00 – 14:00' },
        ],
      },
      {
        tag: 'Zona 02',
        title: 'Funcional',
        text: 'Alta intensidad, cuerdas, barras y acondicionamiento en grupo.',
        cta: 'Reservar funcional',
        href: '{{whatsappUrl:Hola, quiero reservar funcional}}',
        slots: [
          { label: 'Lun / mié / vie', value: '07:00 / 19:00' },
          { label: 'Mar / jue', value: '08:00 / 20:00' },
        ],
      },
      {
        tag: 'Zona 03',
        title: 'Spinning',
        text: 'Cardio con música y resistencia controlada, grupos de doce.',
        cta: 'Reservar spinning',
        href: '{{whatsappUrl:Hola, quiero reservar spinning}}',
        slots: [
          { label: 'Lunes a viernes', value: '07:00 / 18:00 / 20:00' },
          { label: 'Sábados', value: '09:00' },
        ],
      },
      {
        tag: 'Zona 04',
        title: 'Movilidad',
        text: 'Estiramientos, liberación y recuperación para cerrar la semana.',
        cta: 'Reservar movilidad',
        href: '{{whatsappUrl:Hola, quiero reservar movilidad}}',
        slots: [
          { label: 'Martes y jueves', value: '09:00 / 20:30' },
          { label: 'Sábados', value: '10:30' },
        ],
      },
    ],
    prices: [
      {
        name: 'Día',
        price: '$80',
        description: 'Acceso del día',
        features: [
          'Acceso a todas las zonas',
          'Lockers disponibles',
          'Regaderas incluidas',
        ],
        cta: 'Comprar pase',
        href: '{{whatsappUrl:Hola, quiero el pase del día}}',
      },
      {
        name: 'Mensual',
        price: '$690',
        description: 'Mes corrido',
        badge: 'Más popular',
        features: [
          'Acceso ilimitado en horario abierto',
          'Clases grupales sin costo extra',
          'Rutina de bienvenida',
        ],
        cta: 'Elegir mensual',
        href: '{{whatsappUrl:Hola, quiero la mensualidad}}',
      },
      {
        name: 'Trimestre',
        price: '$1,850',
        description: 'Ahorro trimestral',
        features: [
          'Todos los beneficios mensuales',
          'Congelamiento de membresía 1 vez',
          '1 invitado al mes',
        ],
        cta: 'Elegir trimestre',
        href: '{{whatsappUrl:Hola, quiero el plan trimestral}}',
      },
    ],
  },
} satisfies SectionMeta;
