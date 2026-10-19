import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-don-porfirio-01 (resenas), rebuilt by hand
export default {
  slot: 'testimonials',
  variant: 'paper-trio',
  label: 'Reseñas',
  region: 'main',
  description:
    'Cabecera centrada (antetítulo entre filetes, título e introducción) y tres reseñas en tarjetas de papel que alternan claro y oscuro: comilla grande, cita en cursiva, filete y firma con el barrio. Sin resumen de Google; un botón opcional a WhatsApp cierra la sección.',
  intent:
    'Voces de clientela habitual que se leen como notas escritas a mano sobre papel y pizarra; para barberías, talleres y restaurantes de barrio que prefieren citas largas y con nombre antes que estrellas.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['bold'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'cta?',
    'reviews[].text',
    'reviews[].author',
    'reviews[].place?',
  ],
  sample: {
    kicker: 'Clientela habitual',
    title: 'Palabra de barrio',
    intro: 'Testimonios directos de quienes no cambian de barbero por nada.',
    reviews: [
      {
        text: 'Llevo cuatro años viniendo cada quincena antes de abrir el taller. No falla un solo trazo. Salgo listo para lo que venga.',
        author: 'Rogelio Morales',
        place: 'Santa María la Ribera',
      },
      {
        text: 'La toalla caliente y el filo son de otro calibre. No te inventan cortes raros; te dejan como hombre de palabra.',
        author: 'Carlos Valenzuela',
        place: 'Colonia Roma',
      },
      {
        text: 'Puntuales, pulcros y con música tranquila. Aquí se viene a relajarse y a salir bien arreglado.',
        author: 'David Menéndez',
        place: 'San Rafael',
      },
    ],
  },
} satisfies SectionMeta;
