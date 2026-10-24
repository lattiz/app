// GENERATED from specs/floreria-casa-confeti-v2.spec.json (spec 361edbc44e43, file de839fd490c5). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'floreria-base-casa-confeti-v2',
  name: 'Casa Confeti',
  category: 'florerias',
  description:
    'Florería de barrio: arreglos con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'floreria',
  archetype: 'essential',
  theme: 'floreria-base-casa-confeti-v2',
  content: 'floreria.casa-confeti-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'La fiesta',
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
      variant: 'centered-arch',
      props: {
        title: 'Cumpleaños <span class="lz-title__serif">sin carreras.</span>',
        text: 'Paquetes con salón, juegos y anfitrión en {{city}}. Cotiza tu fecha por WhatsApp.',
        primaryCta: 'Cotizar fecha',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
      props: {
        kicker: '{{index}} — El salón',
        title: 'Una fiesta <span class="lz-title__serif">a su medida</span>',
        summary:
          'Salón techado en Narvarte con juegos, mesa de dulces y anfitrión; tú solo llegas con los invitados.',
        stats: [
          {
            value: '50',
            label: 'invitados máximo',
          },
          {
            value: '3 h',
            label: 'de salón por fiesta',
          },
          {
            value: '2–10',
            label: 'años de edad',
          },
        ],
      },
    },
    {
      slot: 'services',
      variant: 'party-tiers',
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
      variant: 'big-wordmark',
      props: {
        links: [
          {
            label: 'La fiesta',
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
  renews: 'floreria-base-casa-confeti-v1',
} satisfies Manifest;
