// GENERATED from specs/restaurante-la-nota-azul-v2.spec.json (spec 6c6c43d83abc, file 8d1a462aa77d). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-base-la-nota-azul-v2',
  name: 'La Nota Azul',
  category: 'restaurantes',
  description:
    'Restaurante de barrio: menú con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'restaurante',
  archetype: 'essential',
  theme: 'restaurante-base-la-nota-azul-v2',
  content: 'restaurante.la-nota-azul-v2.es-MX',
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
      variant: 'centered-arch',
      props: {
        title: 'Pizza de horno en Clavería',
        text: 'Masa lenta, horno de leña y jazz de jueves a sábado. Reserva tu mesa por WhatsApp.',
      },
    },
    {
      slot: 'cta',
      variant: 'ticket-stub-bill',
    },
    {
      slot: 'services',
      variant: 'price-list',
    },
    {
      slot: 'faq',
      variant: 'list',
      props: {
        items: [
          {
            question: '¿Conviene apartar mesa?',
            answer:
              'De jueves a sábado sí, sobre todo si quieres lugar cerca del escenario.',
          },
          {
            question: '¿Hay cover para el jazz?',
            answer:
              'Con reserva entre semana no se cobra. Para fin de semana, consúltalo por WhatsApp.',
          },
          {
            question: '¿Hay pizzas sin carne?',
            answer:
              'Sí: la vegetariana y la margarita están siempre disponibles.',
          },
          {
            question: '¿Venden pizza para llevar?',
            answer: 'Sí. Pide por chat y te avisamos en cuánto tiempo pasar.',
          },
        ],
      },
    },
    {
      slot: 'locations',
      variant: 'single-card',
      props: {
        branch: {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Mar–Dom 13:00–23:00 · Lun cerrado',
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
      variant: 'big-wordmark',
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
  renews: 'restaurante-base-la-nota-azul-v1',
} satisfies Manifest;
