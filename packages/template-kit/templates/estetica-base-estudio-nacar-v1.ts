// GENERATED from specs/estetica-estudio-nacar.spec.json (spec b88261b2b3eb, file 26ff1bfa8682). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'estetica-base-estudio-nacar-v1',
  name: 'Estudio Nácar',
  category: 'esteticas',
  description:
    'Salón de belleza: servicios con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'estetica',
  archetype: 'essential',
  theme: 'estetica-base-estudio-nacar-v1',
  content: 'estetica.estudio-nacar.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
      props: {
        links: [
          {
            label: 'El salón',
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
            label: 'Citas',
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
          'Belleza con <span class="lz-title__serif">calma</span>, cerca de ti.',
        text: 'Corte, color, uñas y pestañas con precios claros. Agenda por WhatsApp en un mensaje.',
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
      variant: 'list',
    },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        branch: {
          name: 'La Paz',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–20:00 · Dom 10:00–15:00',
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
      variant: 'minimal-centered',
      props: {
        links: [
          {
            label: 'El salón',
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
            label: 'Citas',
            href: '#ubicacion',
          },
        ],
      },
    },
  ],
} satisfies Manifest;
