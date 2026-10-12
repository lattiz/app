// GENERATED from specs/despacho-cifra-clara.spec.json (spec 5019d2696c43, file 12e8be437b73). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'despacho-base-cifra-clara-v1',
  name: 'Cifra Clara',
  category: 'despachos',
  description:
    'Despacho profesional: servicios con honorarios de referencia, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'despacho',
  archetype: 'essential',
  theme: 'despacho-base-cifra-clara-v1',
  content: 'despacho.cifra-clara.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'Despacho',
            href: '#nosotros',
          },
          {
            label: 'Servicios',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Contacto',
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
          'Contabilidad <span class="lz-title__serif">clara</span> para tu negocio.',
        text: 'Declaraciones, contabilidad mensual y nómina con honorarios claros. Agenda tu asesoría.',
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
          name: 'Centro Sur',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–18:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Centro Sur',
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
            label: 'Despacho',
            href: '#nosotros',
          },
          {
            label: 'Servicios',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Contacto',
            href: '#ubicacion',
          },
        ],
      },
    },
  ],
} satisfies Manifest;
