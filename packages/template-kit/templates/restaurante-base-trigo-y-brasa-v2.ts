// GENERATED from specs/restaurante-trigo-y-brasa-v2.spec.json (spec c4c8c2d94ae1, file 947d5d0ea10c). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-base-trigo-y-brasa-v2',
  name: 'Trigo y Brasa',
  category: 'restaurantes',
  description:
    'Restaurante de barrio: menú con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'restaurante',
  archetype: 'essential',
  theme: 'restaurante-base-trigo-y-brasa-v2',
  content: 'restaurante.trigo-y-brasa-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'Menú',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Reservar',
            href: '#ubicacion',
          },
        ],
      },
    },
    {
      slot: 'hero',
      variant: 'offset-card',
      props: {
        eyebrow: 'Panadería · Clavería',
        title: 'Pan del día en Clavería',
        text: 'Masa madre y café cada mañana. Aparta tu pan y pasa por él.',
      },
    },
    {
      slot: 'services',
      variant: 'photo-rows',
      props: {
        prices: [
          {
            name: 'Hogaza de masa madre',
            price: '$95',
            description: '800 g de corteza crujiente y miga abierta.',
            image: 'product-01.jpg',
            imageAlt: 'Hogaza de masa madre con corteza marcada',
            tags: ['Masa madre', 'Del día'],
          },
          {
            name: 'Pan de ajo y hierbas',
            price: '$70',
            description:
              'Barra de corteza fina con mantequilla de hierbas; sale caliente.',
            image: 'product-02.jpg',
            imageAlt: 'Barra de pan abierta con mantequilla de ajo y hierbas',
            tags: ['Del día'],
          },
          {
            name: 'Pan de semillas',
            price: '$110',
            description: 'Girasol, ajonjolí y linaza; dura toda la semana.',
            image: 'product-03.jpg',
            imageAlt: 'Hogaza cubierta de semillas sobre una tabla de madera',
            tags: ['Semillas'],
          },
          {
            name: 'Croissant de mantequilla',
            price: '$45',
            description: 'Horneado al amanecer; con mermelada o solo.',
            image: 'product-04.jpg',
            imageAlt: 'Croissant dorado junto a un tazón de mermelada',
            tags: ['Mantequilla', 'Mañana'],
          },
        ],
      },
    },
    {
      slot: 'cta',
      variant: 'included-panel',
    },
    {
      slot: 'faq',
      variant: 'list',
    },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        branch: {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Mar–Dom 07:00–16:00 · Lun cerrado',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      },
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'minimal-centered',
      props: {
        links: [
          {
            label: 'Menú',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Reservar',
            href: '#ubicacion',
          },
        ],
      },
    },
  ],
  renews: 'restaurante-base-trigo-y-brasa-v1',
} satisfies Manifest;
