// GENERATED from specs/restaurante-ceniza-v2.spec.json (spec 38d821242b7c, file 4393684013af). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'restaurante-base-ceniza-v2',
  name: 'Ceniza Grill & Bar',
  category: 'restaurantes',
  description:
    'Restaurante de barrio: menú con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'restaurante',
  archetype: 'essential',
  theme: 'restaurante-base-ceniza-v2',
  content: 'restaurante.ceniza-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'index-strip',
      props: {
        links: [
          {
            label: 'Menú',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Visítanos',
            href: '#sucursales',
          },
        ],
      },
    },
    {
      slot: 'hero',
      variant: 'split-mosaic',
      props: {
        image: 'product-01.jpg',
        imageAlt: 'Corte de res sobre las brasas con llamas',
        title: 'Fuego. Humo. Noche.',
        text: 'Cortes al carbón, burgers y cocteles de la barra. Pide directo por WhatsApp, sin rodeos.',
        primaryCta: 'Pedir por WhatsApp',
        note: 'Para llevar o para recoger',
        imageLabel: 'Corte de la casa',
        imageNote: 'Al carbón de encino',
        tiles: [
          {
            label: 'Burger Ceniza',
            note: 'Carne ahumada · Brioche',
          },
          {
            label: 'Alitas',
            note: 'Salsa ahumada',
          },
          {
            label: 'Coctel',
            note: 'Mezcal y romero',
          },
        ],
      },
    },
    {
      slot: 'services',
      variant: 'chalk-board',
      props: {
        groups: [
          {
            title: 'Brasa',
            tag: '01 · Carnes',
            items: [
              {
                name: 'Rib eye 400 g',
                price: '$590',
                description:
                  'Sellado a fuego alto, con mantequilla de ajo y elote asado.',
              },
              {
                name: 'Burger Ceniza',
                price: '$215',
                description:
                  '180 g de res, cheddar añejo y cebolla caramelizada.',
              },
              {
                name: 'Costillas BBQ',
                price: '$385',
                description:
                  'Media costillar con salsa de la casa y ensalada de col.',
              },
            ],
          },
          {
            title: 'Barra',
            tag: '02 · Tragos',
            items: [
              {
                name: 'Xoconostle ahumado',
                price: '$180',
                description: 'Mezcal ahumado y sal de gusano.',
              },
              {
                name: 'Charanda y cacao',
                price: '$195',
                description: 'Ron de caña, cacao tatemado y bitter.',
              },
              {
                name: 'Sotol del desierto',
                price: '$210',
                description: 'Romero quemado y toronja.',
              },
            ],
          },
          {
            title: 'Para compartir',
            tag: '03 · Centro',
            items: [
              {
                name: 'Alitas al carbón',
                price: '$195',
                description: 'Diez piezas con salsa de chile de árbol.',
              },
              {
                name: 'Tuétano en canoa',
                price: '$240',
                description: 'Con tortillas de maíz azul.',
              },
              {
                name: 'Queso de sartén',
                price: '$170',
                description: 'Epazote fresco y rajas.',
              },
            ],
          },
        ],
      },
    },
    {
      slot: 'faq',
      variant: 'rule-table',
      props: {
        items: [
          {
            topic: 'Acceso',
            question: '¿Necesito reservar?',
            answer:
              'De jueves a sábado en la noche, sí. Entre semana casi siempre hay lugar; un mensaje por WhatsApp te aparta la mesa.',
          },
          {
            topic: 'Cocina',
            question: '¿Tienen opciones sin carne?',
            answer:
              'Sí: burger de hongos portobello a la parrilla, elote asado y ensaladas. Pregunta por el especial del día.',
          },
          {
            topic: 'Edad',
            question: '¿Pueden venir menores?',
            answer:
              'Sí, al comedor y con un adulto. En la barra servimos alcohol solo a mayores de 18 con identificación.',
          },
          {
            topic: 'Pago',
            question: '¿Qué formas de pago aceptan?',
            answer:
              'Efectivo, tarjeta de débito o crédito y transferencia. La cuenta se puede dividir por mesa.',
          },
        ],
      },
    },
    {
      slot: 'locations',
      variant: 'table-map',
    },
    {
      slot: 'floating-whatsapp',
      variant: 'bubble',
    },
    {
      slot: 'footer',
      variant: 'receipt',
      props: {
        links: [
          {
            label: 'Menú',
            href: '#servicios',
          },
          {
            label: 'Preguntas',
            href: '#preguntas',
          },
          {
            label: 'Visítanos',
            href: '#sucursales',
          },
        ],
      },
    },
  ],
  renews: 'restaurante-base-ceniza-v1',
} satisfies Manifest;
