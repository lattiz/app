// GENERATED from specs/restaurante-casa-comal.spec.json (spec 12fc8dabf1eb, file 1215d309a5a1). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-base-casa-comal-v1',
  name: 'Casa Comal',
  category: 'restaurantes',
  description:
    'Restaurante de barrio: menú con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'restaurante',
  archetype: 'essential',
  theme: 'restaurante-base-casa-comal-v1',
  content: 'restaurante.casa-comal.es-MX',
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
          'Sabores de <span class="lz-title__serif">casa</span> en Santa María la Ribera.',
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
          name: 'Santa María la Ribera',
          address: '{{address}}',
          hours: 'Mar–Sáb 13:00–23:00 · Dom 13:00–18:00',
          directionsUrl:
            'https://maps.google.com/?q=Jaime+Torres+Bodet+150%2C+Santa+Mar%C3%ADa+la+Ribera%2C+CDMX',
          mapUrl:
            'https://www.google.com/maps?q=Jaime%20Torres%20Bodet%20150%2C%20Santa%20Mar%C3%ADa%20la%20Ribera%2C%20CDMX&output=embed',
          mapTitle: 'Mapa de la sucursal Santa María la Ribera',
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
} satisfies Manifest;
