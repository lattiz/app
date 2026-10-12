// GENERATED from specs/dental-arboleda.spec.json (spec 0757763d1134, file d919ea1c303d). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'dental-base-arboleda-v1',
  name: 'Dental Arboleda',
  category: 'dentales',
  description:
    'Consultorio dental: tratamientos con precios de referencia, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'dental',
  archetype: 'essential',
  theme: 'dental-base-arboleda-v1',
  content: 'dental.arboleda.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'Consultorio',
            href: '#nosotros',
          },
          {
            label: 'Tratamientos',
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
      variant: 'image-bg',
      props: {
        title:
          'Tu dentista de confianza en <span class="lz-title__serif">García Ginerés</span>.',
        text: 'Limpieza, resinas y ortodoncia con valoración previa y precios por escrito. Agenda por WhatsApp.',
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
          name: 'García Ginerés',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–19:00 · Sáb 9:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal García Ginerés',
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
            label: 'Consultorio',
            href: '#nosotros',
          },
          {
            label: 'Tratamientos',
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
