// GENERATED from specs/barberia-grafito-estudio.spec.json (spec e41ae60c038f, file 9cd0d3169479). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'barberia-base-grafito-estudio-v1',
  name: 'Grafito Estudio',
  category: 'barberias',
  description:
    'Barbería de barrio: precios claros, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'barberia',
  archetype: 'essential',
  theme: 'barberia-base-grafito-estudio-v1',
  content: 'barberia.grafito-estudio.es-MX',
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
        eyebrow: 'Tatuajes y piercing · CDMX',
        title: 'Tu pieza, diseñada a medida.',
        text: 'Agenda tu consulta por WhatsApp: hablamos de la idea, el tamaño y la zona antes de tatuar. Todo el material es estéril y de un solo uso.',
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
          name: 'Roma Norte',
          address: '{{address}}',
          hours: 'Mar–Sáb 12:00–20:00 · Dom con cita',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Roma Norte',
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
