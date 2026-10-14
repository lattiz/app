// GENERATED from specs/floreria-cardamina.spec.json (spec d93a7fdbf48a, file 48ef96796640). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-base-cardamina-v1',
  name: 'Cardamina Florería Botánica',
  category: 'florerias',
  description:
    'Florería de barrio: arreglos con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'floreria',
  archetype: 'essential',
  theme: 'floreria-base-cardamina-v1',
  content: 'floreria.cardamina.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
      props: {
        links: [
          {
            label: 'Nosotros',
            href: '#nosotros',
          },
          {
            label: 'Arreglos',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Pedidos',
            href: '#ubicacion',
          },
        ],
      },
    },
    {
      slot: 'hero',
      variant: 'centered-arch',
      props: {
        eyebrow: 'Florería · Condesa',
        title:
          'Flores de diseño, <span class="lz-title__serif">sin prisa</span>.',
        text: 'Ramos y centros de mesa con flor de la semana, armados en el taller. Escríbenos por WhatsApp y coordinamos fecha y entrega.',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
    },
    {
      slot: 'services',
      variant: 'editorial-table',
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
          name: 'Condesa',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–19:00 · Dom 10:00–15:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Condesa',
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
            label: 'Arreglos',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Pedidos',
            href: '#ubicacion',
          },
        ],
      },
    },
  ],
} satisfies Manifest;
