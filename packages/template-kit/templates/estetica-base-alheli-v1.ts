// GENERATED from specs/estetica-alheli.spec.json (spec c5b874c728ac, file 48de222d7fdb). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'estetica-base-alheli-v1',
  name: 'Alhelí Nail Atelier',
  category: 'esteticas',
  description:
    'Salón de belleza: servicios con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'estetica',
  archetype: 'essential',
  theme: 'estetica-base-alheli-v1',
  content: 'estetica.alheli.es-MX',
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
        eyebrow: 'Uñas · San Álvaro',
        title: 'Tu manicura, <span class="lz-title__serif">al detalle</span>.',
        text: 'Gel, acrílico y nail art con instrumental esterilizado en cada cita. Escríbenos y elegimos tu horario.',
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
          name: 'San Álvaro',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–20:00 · Dom 10:00–15:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal San Álvaro',
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
