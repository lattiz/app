import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-don-porfirio-01 (servicios), rebuilt by hand
export default {
  slot: 'services',
  variant: 'ritual-cards',
  label: 'Servicios y precios',
  region: 'main',
  description:
    'Cabecera partida (antetítulo y título a la izquierda, una línea a la derecha) y retícula de tarjetas con filete superior: nombre y precio en la misma fila, descripción, y al pie la duración con «Elegir servicio» hacia WhatsApp. Una tarjeta puede llevar una etiqueta («Ritual Insignia») que la resalta; una barra de nota cierra la sección.',
  intent:
    'Una carta de servicios que se lee como fichas de tarifa con acción propia, con una pieza estrella y una promesa al pie; para barberías, spas y estudios que venden por ritual y duración.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['bold'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'note?',
    'noteCta?',
    'prices[].name',
    'prices[].price',
    'prices[].description',
    'prices[].duration?',
    'prices[].badge?',
  ],
  sample: {
    note: 'Cada servicio incluye café negro recién colado o agua fría de cortesía.',
    noteCta: 'Consultar horarios disponibles →',
    prices: [
      {
        name: 'Corte ejecutivo',
        price: '$350',
        description:
          'Lavado, corte a tijera y máquina, peinado con pomada mate.',
        duration: '45 minutos',
      },
      {
        name: 'Afeitado a navaja',
        price: '$320',
        description: 'Toallas calientes, espuma densa, navaja libre y bálsamo.',
        duration: '40 minutos',
      },
      {
        name: 'Perfilado de barba',
        price: '$280',
        description:
          'Alineado con navaja, rebajado simétrico y aceite hidratante.',
        duration: '35 minutos',
      },
      {
        name: 'Ritual completo',
        price: '$580',
        description: 'Corte, afeitado y tónico mentolado en una sola sesión.',
        duration: '75 minutos',
        badge: 'Ritual estrella',
      },
      {
        name: 'Corte infantil',
        price: '$260',
        description: 'Corte limpio a tijera con paciencia y respeto.',
        duration: '35 minutos',
      },
      {
        name: 'Cuello y ceja',
        price: '$150',
        description: 'Mantenimiento rápido de contornos entre citas.',
        duration: '20 minutos',
      },
    ],
  },
} satisfies SectionMeta;
