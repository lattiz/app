// GENERATED from specs/clinica-alba.spec.json (spec e21639659c03, file c5a7ecef0bab). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'clinica-base-alba-v1',
  name: 'Clínica Alba',
  category: 'clinicas',
  description:
    'Consultorio: servicios con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'clinica',
  archetype: 'essential',
  theme: 'clinica-base-alba-v1',
  content: 'clinica.alba.es-MX',
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
          'Tu salud en <span class="lz-title__serif">buenas manos</span>, cerca de casa.',
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
      variant: 'list',
    },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        branch: {
          name: 'Narvarte',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–19:00 · Sáb 9:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Narvarte',
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
