// GENERATED from specs/gimnasio-pulso-deportivo-v2.spec.json (spec 9fbf17764e1c, file 43ae37386fc6). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'gimnasio-base-pulso-deportivo-v2',
  name: 'Pulso Deportivo',
  category: 'gimnasios',
  description:
    'Gimnasio o estudio: membresías con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'gimnasio',
  archetype: 'essential',
  theme: 'gimnasio-base-pulso-deportivo-v2',
  content: 'gimnasio.pulso-deportivo-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
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
      variant: 'centered-arch',
      props: {
        title: 'Entrena cerca de casa, sin complicarte',
        text: 'Clases en grupo, pesas y planes sencillos en Clavería. Agenda tu clase de prueba por WhatsApp.',
        primaryCta: 'Clase de prueba',
        sticker: 'Primera clase',
      },
    },
    {
      slot: 'services',
      variant: 'schedule-cards',
    },
    {
      slot: 'cta',
      variant: 'band',
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
      variant: 'signature-bar',
      props: {
        links: [
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
  renews: 'gimnasio-base-pulso-deportivo-v1',
} satisfies Manifest;
