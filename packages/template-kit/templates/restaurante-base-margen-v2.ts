// GENERATED from specs/restaurante-margen-v2.spec.json (spec 880697027b0b, file 8d7ea8cb6c21). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-base-margen-v2',
  name: 'Margen Café',
  category: 'restaurantes',
  description:
    'Restaurante de barrio: menú con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'restaurante',
  archetype: 'essential',
  theme: 'restaurante-base-margen-v2',
  content: 'restaurante.margen-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'La barra',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Visítanos',
            href: '#ubicacion',
          },
        ],
      },
    },
    {
      slot: 'hero',
      variant: 'ticket-board',
      props: {
        eyebrow: 'Café y cocina fría · Clavería',
        title:
          'Café de especialidad en <span class="lz-title__serif">Clavería</span>',
        text: 'Espresso, métodos de filtrado, postres artesanales y sándwiches gourmet. Pide para llevar por WhatsApp o quédate a leer.',
        note: 'Barra abierta desde las 8:00',
        ticketTitle: 'Comanda de barra',
        ticketNo: '#0215',
        order: [
          {
            name: 'Flat white',
            note: 'Leche entera, doble espresso',
            price: '$70',
          },
          {
            name: 'Sándwich de pavo y brie',
            note: 'Pan de masa madre',
            price: '$165',
          },
          {
            name: 'Tarta de pera y almendra',
            note: 'Del horno de hoy',
            price: '$90',
          },
        ],
        totalLabel: 'Total',
        total: '$325 MXN',
        ticketCta: 'Pedir lo mismo por WhatsApp',
      },
    },
    {
      slot: 'services',
      variant: 'menu-leaders',
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
          hours: 'Lun–Vie 8:00–20:00 · Sáb y Dom 9:00–18:00',
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
      variant: 'hours-blocks',
      props: {
        links: [
          {
            label: 'La barra',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Visítanos',
            href: '#ubicacion',
          },
        ],
      },
    },
  ],
  renews: 'restaurante-base-margen-v1',
} satisfies Manifest;
