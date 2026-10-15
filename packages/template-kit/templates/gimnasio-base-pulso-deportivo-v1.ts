// GENERATED from specs/gimnasio-pulso-deportivo.spec.json (spec a4484a2898ea, file 1a901d04de5c). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'gimnasio-base-pulso-deportivo-v1',
  name: 'Pulso Deportivo',
  category: 'gimnasios',
  description:
    'Gimnasio o estudio: membresías con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'gimnasio',
  archetype: 'essential',
  theme: 'gimnasio-base-pulso-deportivo-v1',
  content: 'gimnasio.pulso-deportivo.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'El gym',
            href: '#nosotros',
          },
          {
            label: 'Membresías',
            href: '#servicios',
          },
          {
            label: 'Horarios',
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
        title: 'Suplementos y consultas en Clavería',
        text: 'Proteínas, creatina y vitaminas, con una valoración antes de tu primer plan.',
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
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Vie 07:00–21:00 · Sáb 08:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      },
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'ledger',
      props: {
        links: [
          {
            label: 'El gym',
            href: '#nosotros',
          },
          {
            label: 'Membresías',
            href: '#servicios',
          },
          {
            label: 'Horarios',
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
