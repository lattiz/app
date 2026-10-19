// GENERATED from specs/floreria-casa-confeti.spec.json (spec e112920bb92f, file e7225c650834). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-base-casa-confeti-v1',
  name: 'Casa Confeti',
  category: 'florerias',
  description:
    'Florería de barrio: arreglos con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'floreria',
  archetype: 'essential',
  theme: 'floreria-base-casa-confeti-v1',
  content: 'floreria.casa-confeti.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'notice-bar',
      props: {
        links: [
          {
            label: 'Nosotros',
            href: '#nosotros',
          },
          {
            label: 'Paquetes',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Reservas',
            href: '#ubicacion',
          },
        ],
      },
    },
    {
      slot: 'hero',
      variant: 'duo-arch',
      props: {
        detailImage: 'gallery-01.jpg',
        detailAlt: 'Detalle del trabajo terminado, visto de cerca',
        title:
          'Cumpleaños sin <span class="lz-title__serif">preocupaciones.</span>',
        text: 'Paquetes de fiesta infantil en {{city}}: salón, juegos y anfitrión. Cotiza tu fecha por WhatsApp.',
        primaryCta: 'Cotizar fecha',
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
          name: 'Narvarte',
          address: '{{address}}',
          hours: 'Mar–Vie 10:00–18:00 · Sáb–Dom 9:00–20:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Narvarte',
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
            label: 'Nosotros',
            href: '#nosotros',
          },
          {
            label: 'Paquetes',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Reservas',
            href: '#ubicacion',
          },
        ],
      },
    },
  ],
} satisfies Manifest;
