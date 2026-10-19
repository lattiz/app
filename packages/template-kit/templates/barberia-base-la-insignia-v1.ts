// GENERATED from specs/barberia-la-insignia.spec.json (spec 023c9502fca0, file 05ca563d0456). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'barberia-base-la-insignia-v1',
  name: 'La Insignia',
  category: 'barberias',
  description:
    'Barbería de barrio: precios claros, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'barberia',
  archetype: 'essential',
  theme: 'barberia-base-la-insignia-v1',
  content: 'barberia.la-insignia.es-MX',
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
        title: 'Corte limpio, afeitado a navaja',
        text: 'Cortes clásicos y afeitado con toalla caliente en la colonia Americana, con cita por WhatsApp.',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
    },
    {
      slot: 'services',
      variant: 'ritual-cards',
    },
    {
      slot: 'faq',
      variant: 'numbered-cards',
    },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        branch: {
          name: 'Americana',
          address: '{{address}}',
          hours: 'Lun–Sáb 10:00–20:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Americana',
        },
      },
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'signature-bar',
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
