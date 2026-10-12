// GENERATED from specs/veterinaria-clinica-nogal.spec.json (spec 62220a7fac35, file f3147e53990a). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'veterinaria-base-clinica-nogal-v1',
  name: 'Clínica Nogal',
  category: 'veterinarias',
  description:
    'Veterinaria de barrio: servicios con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'veterinaria',
  archetype: 'essential',
  theme: 'veterinaria-base-clinica-nogal-v1',
  content: 'veterinaria.clinica-nogal.es-MX',
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
          'Tu veterinaria de confianza en <span class="lz-title__serif">Colón</span>.',
        text: 'Consultas, vacunas y baño con precios claros. Agenda por WhatsApp y te recordamos la cita.',
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
          name: 'Colón',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–20:00 · Dom 10:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Colón',
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
