// GENERATED from specs/clinica-alba.spec.json (spec 47c45aaae383, file 6b11696a4ae7). Do not edit: use the spec, or freeze.
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
          directionsUrl:
            'https://maps.google.com/?q=Av.+Universidad+1020%2C+Narvarte+Poniente%2C+Benito+Ju%C3%A1rez%2C+CDMX',
          mapUrl:
            'https://www.google.com/maps?q=Av.%20Universidad%201020%2C%20Narvarte%20Poniente%2C%20Benito%20Ju%C3%A1rez%2C%20CDMX&output=embed',
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
