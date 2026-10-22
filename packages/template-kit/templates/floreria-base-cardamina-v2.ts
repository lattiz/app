// GENERATED from specs/floreria-cardamina-v2.spec.json (spec 269653124ad6, file 52a3553fb3d2). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-base-cardamina-v2',
  name: 'Cardamina Florería Botánica',
  category: 'florerias',
  description:
    'Florería de barrio: arreglos con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'floreria',
  archetype: 'essential',
  theme: 'floreria-base-cardamina-v2',
  content: 'floreria.cardamina-v2.es-MX',
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
      variant: 'split',
      props: {
        title: 'Flores armadas a <span class="lz-title__serif">mano</span>.',
        text: 'Ramos y arreglos de temporada con precios claros. Escríbenos por WhatsApp y te respondemos el mismo día.',
        secondaryHref: '#servicios',
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
      variant: 'grid',
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
      variant: 'minimal-centered',
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
  renews: 'floreria-base-cardamina-v1',
} satisfies Manifest;
