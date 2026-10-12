// GENERATED from specs/floreria-flores-lupita.spec.json (spec 96279fd527fb, file a72cf94bc6d2). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-base-flores-lupita-v1',
  name: 'Flores Lupita',
  category: 'florerias',
  description:
    'Florería de barrio: arreglos con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'floreria',
  archetype: 'essential',
  theme: 'floreria-base-flores-lupita-v1',
  content: 'floreria.flores-lupita.es-MX',
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
      variant: 'split',
      props: {
        title:
          'Ramos hechos a mano, <span class="lz-title__serif">el mismo día</span>.',
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
      variant: 'two-col',
    },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        branch: {
          name: 'Coyoacán',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–19:00 · Dom 9:00–14:00',
          directionsUrl:
            'https://maps.google.com/?q=Francisco+Sosa+214%2C+Coyoac%C3%A1n%2C+CDMX',
          mapUrl:
            'https://www.google.com/maps?q=Francisco%20Sosa%20214%2C%20Coyoac%C3%A1n%2C%20CDMX&output=embed',
          mapTitle: 'Mapa de la sucursal Coyoacán',
        },
      },
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'columns',
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
