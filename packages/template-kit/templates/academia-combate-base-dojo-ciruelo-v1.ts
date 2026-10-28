// GENERATED from specs/academia-combate-dojo-ciruelo.spec.json (spec bacb84df9b64, file c282c852278f). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'academia-combate-base-dojo-ciruelo-v1',
  name: 'Dojo Ciruelo',
  category: 'academias-combate',
  description:
    'Academia de box, muay thai o artes marciales: mensualidades, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'academia-combate',
  archetype: 'essential',
  theme: 'academia-combate-base-dojo-ciruelo-v1',
  content: 'academia-combate.dojo-ciruelo.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'La academia',
            href: '#nosotros',
          },
          {
            label: 'Clases',
            href: '#servicios',
          },
          {
            label: 'Dudas',
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
        title:
          'Técnica primero, <span class="lz-title__serif">contacto después</span>.',
        text: 'Karate, taekwondo y jiu-jitsu por edad y nivel. Pide una clase de prueba sin costo.',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
    },
    {
      slot: 'services',
      variant: 'discipline-schedule',
      props: {
        promos: [],
      },
    },
    {
      slot: 'faq',
      variant: 'list',
    },
    {
      slot: 'locations',
      variant: 'single-card',
      props: {
        branch: {
          name: 'Jardines',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–10:30 y 16:30–21:00 · Sáb 8:30–12:30',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Jardines',
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
            label: 'La academia',
            href: '#nosotros',
          },
          {
            label: 'Clases',
            href: '#servicios',
          },
          {
            label: 'Dudas',
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
