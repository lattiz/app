// GENERATED from specs/restaurante-hoja-y-barro-v2.spec.json (spec 86e027853e52, file acb89a3b839b). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-base-hoja-y-barro-v2',
  name: 'Hoja y Barro',
  category: 'restaurantes',
  description:
    'Restaurante de barrio: menú con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'restaurante',
  archetype: 'essential',
  theme: 'restaurante-base-hoja-y-barro-v2',
  content: 'restaurante.hoja-y-barro-v2.es-MX',
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
            label: 'Nosotros',
            href: '#nosotros',
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
      variant: 'centered-arch',
      props: {
        title:
          'Café, matcha y <span class="lz-title__serif">snacks</span> de barra.',
        text: 'Bebidas y bocados hechos al momento en Roma Norte, cada uno sin azúcar o con azúcar. Pide por WhatsApp y pasa por ellos.',
      },
    },
    {
      slot: 'about',
      variant: 'order-steps',
    },
    {
      slot: 'services',
      variant: 'cards',
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
          name: 'Roma Norte',
          address: '{{address}}',
          hours: 'Lun–Vie 7:30–20:00 · Sáb–Dom 8:30–18:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Roma Norte',
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
            label: 'Menú',
            href: '#servicios',
          },
          {
            label: 'Nosotros',
            href: '#nosotros',
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
  renews: 'restaurante-base-hoja-y-barro-v1',
} satisfies Manifest;
