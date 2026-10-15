// GENERATED from specs/tienda-caramelo-pop.spec.json (spec abb4a47547e7, file 19bebf0a4c88). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'tienda-base-caramelo-pop-v1',
  name: 'Caramelo Pop',
  category: 'tiendas',
  description:
    'Tienda de barrio: catálogo con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'tienda',
  archetype: 'essential',
  theme: 'tienda-base-caramelo-pop-v1',
  content: 'tienda.caramelo-pop.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
      props: {
        links: [
          {
            label: 'La tienda',
            href: '#nosotros',
          },
          {
            label: 'Catálogo',
            href: '#servicios',
          },
          {
            label: 'Envíos',
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
      variant: 'offset-card',
      props: {
        title: 'Dulces americanos',
        text: 'Gomitas, chocolates y sodas importadas. Pasa por tu bolsa o pide por WhatsApp.',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
    },
    {
      slot: 'services',
      variant: 'cards',
    },
    {
      slot: 'faq',
      variant: 'two-col',
    },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        branch: {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Sáb 10:00–20:00 · Dom 11:00–18:00',
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
            label: 'La tienda',
            href: '#nosotros',
          },
          {
            label: 'Catálogo',
            href: '#servicios',
          },
          {
            label: 'Envíos',
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
} satisfies Manifest;
