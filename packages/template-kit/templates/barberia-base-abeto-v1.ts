// GENERATED from specs/barberia-abeto.spec.json (spec 0f4588fa7dff, file c5c1842b1480). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'barberia-base-abeto-v1',
  name: 'Abeto Barbería',
  category: 'barberias',
  description:
    'Barbería de barrio: precios claros, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'barberia',
  archetype: 'essential',
  theme: 'barberia-base-abeto-v1',
  content: 'barberia.abeto.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'Estudio',
            href: '#nosotros',
          },
          {
            label: 'Carta',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
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
      variant: 'image-bg',
      props: {
        title: 'Clásico por <span class="lz-title__serif">oficio</span>.',
        text: 'Corte a tijera, barba a navaja y afeitado con toalla caliente en San Ángel. Precios claros y cita por WhatsApp.',
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
          name: 'San Ángel',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–21:00 · Dom 10:00–16:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal San Ángel',
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
            label: 'Estudio',
            href: '#nosotros',
          },
          {
            label: 'Carta',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
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
