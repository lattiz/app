// GENERATED from specs/restaurante-casa-rosa-mantequilla.spec.json (spec 812e459d198f, file 63fa166ea100). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-base-casa-rosa-mantequilla-v1',
  name: 'Casa Rosa Mantequilla',
  category: 'restaurantes',
  description:
    'Restaurante de barrio: menú con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'restaurante',
  archetype: 'essential',
  theme: 'restaurante-base-casa-rosa-mantequilla-v1',
  content: 'restaurante.casa-rosa-mantequilla.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'Nosotros',
            href: '#nosotros',
          },
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
      variant: 'columns',
      props: {
        title: 'Pasteles y croissants de mantequilla',
        text: 'Repostería artesanal en La Paz, Puebla. Encarga tu pastel por WhatsApp y recógelo en tienda.',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
    },
    {
      slot: 'services',
      variant: 'price-list',
    },
    {
      slot: 'faq',
      variant: 'numbered-cards',
    },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        branch: {
          name: 'La Paz',
          address: '{{address}}',
          hours: 'Mar–Sáb 9:00–19:00 · Dom 9:00–15:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal La Paz',
        },
      },
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'big-wordmark',
      props: {
        links: [
          {
            label: 'Nosotros',
            href: '#nosotros',
          },
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
} satisfies Manifest;
