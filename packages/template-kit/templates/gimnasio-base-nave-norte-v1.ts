// GENERATED from specs/gimnasio-nave-norte.spec.json (spec 2f28c4a23c7a, file c707caf91222). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'gimnasio-base-nave-norte-v1',
  name: 'Nave Norte',
  category: 'gimnasios',
  description:
    'Gimnasio o estudio: membresías con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'gimnasio',
  archetype: 'essential',
  theme: 'gimnasio-base-nave-norte-v1',
  content: 'gimnasio.nave-norte.es-MX',
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
      variant: 'offset-card',
      props: {
        title:
          'Grupos pequeños, <span class="lz-title__serif">técnica primero</span>.',
        text: 'Membresías desde $890 al mes, clases desde las 6 am y tu primera clase de prueba sin costo.',
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
          name: 'Jardines del Moral',
          address: '{{address}}',
          hours: 'Lun–Vie 6:00–22:00 · Sáb 8:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Jardines del Moral',
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
