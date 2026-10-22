// GENERATED from specs/restaurante-claveria-verde-v2.spec.json (spec 0ee305495571, file 98912e5aff3a). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-base-claveria-verde-v2',
  name: 'Clavería Verde',
  category: 'restaurantes',
  description:
    'Restaurante de barrio: menú con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'restaurante',
  archetype: 'essential',
  theme: 'restaurante-base-claveria-verde-v2',
  content: 'restaurante.claveria-verde-v2.es-MX',
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
            label: 'Menú',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Reservar',
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
          'Comida <span class="lz-title__serif">del día</span>, hecha en Clavería.',
        text: 'Carta con precios, guisos de temporada y tortillas del momento. Pide por WhatsApp o pasa a comer.',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
    },
    {
      slot: 'services',
      variant: 'dish-spotlight',
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
          hours: 'Lun–Sáb 8:30–20:00 · Dom 9:00–17:00',
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
      variant: 'minimal-centered',
      props: {
        links: [
          {
            label: 'Nosotros',
            href: '#nosotros',
          },
          {
            label: 'Menú',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Reservar',
            href: '#ubicacion',
          },
        ],
      },
    },
  ],
  renews: 'restaurante-base-claveria-verde-v1',
} satisfies Manifest;
