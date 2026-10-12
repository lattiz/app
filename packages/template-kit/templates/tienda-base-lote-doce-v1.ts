// GENERATED from specs/tienda-lote-doce.spec.json (spec 3065d05f2254, file cd60fc22e929). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'tienda-base-lote-doce-v1',
  name: 'Lote Doce',
  category: 'tiendas',
  description:
    'Tienda de barrio: catálogo con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'tienda',
  archetype: 'essential',
  theme: 'tienda-base-lote-doce-v1',
  content: 'tienda.lote-doce.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
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
      variant: 'split',
      props: {
        title:
          'Cosas bonitas, <span class="lz-title__serif">hechas para durar</span>.',
        text: 'Catálogo con precios claros. Aparta por WhatsApp y recoge en la Americana o recibe en casa.',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
    },
    {
      slot: 'services',
      variant: 'product-grid',
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
          name: 'Colonia Americana',
          address: '{{address}}',
          hours: 'Lun–Sáb 11:00–20:00 · Dom 11:00–16:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Colonia Americana',
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
