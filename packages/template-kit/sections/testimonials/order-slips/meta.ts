import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-ceniza-contactos-mapa-01 (reseñas), rebuilt by hand
export default {
  slot: 'testimonials',
  variant: 'order-slips',
  label: 'Notas de la barra',
  region: 'main',
  description:
    'Cabecera con título enorme y una línea de apoyo bajo un filete, y tres comandas de papel (color de texto sobre el fondo de página) ligeramente giradas y escalonadas: franja de comanda y hora, cita grande, autor, lugar y un sello opcional; una nota centrada cierra la sección.',
  intent:
    'Reseñas que parecen comandas rescatadas del gancho de la cocina; para bares, parrillas y cafeterías con clientela de barrio que habla en frases cortas.',
  numbered: true,
  tiers: ['pro'],
  archetypes: ['bold', 'editorial'],
  contentKeys: [
    'kicker?',
    'title',
    'intro?',
    'note?',
    'reviews[].text',
    'reviews[].author',
    'reviews[].place?',
    'reviews[].ticket?',
    'reviews[].time?',
    'reviews[].stamp?',
  ],
  sample: {
    kicker: 'Reseñas de barrio',
    title: 'Notas de la barra',
    intro: 'Palabras de quienes se quedaron hasta que apagaron la campana.',
    note: '4.9 estrellas de boca en boca, sin filtros',
    reviews: [
      { text: 'La costilla se deshace con cuchara y la música en vinilo le da aire de taberna vieja.', author: 'Valeria S.', place: 'Colonia vecina', ticket: 'Comanda #119', time: '01:15', stamp: 'Repetidor' },
      { text: 'Pedimos la picaña entera para compartir entre cuatro y un par de jarras de cacao tostado.', author: 'Rodrigo M.', place: 'Barrio cercano', ticket: 'Comanda #143', time: '02:05' },
      { text: 'No vengas buscando velitas ni salsitas dulces: el tuétano con pulpo asado habla solo.', author: 'Héctor B.', place: 'Vecino del barrio', ticket: 'Comanda #084', time: '23:42' },
    ],
  },
} satisfies SectionMeta;
