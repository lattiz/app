// GENERATED from specs/estetica-alheli-v2.spec.json (spec 204372a46f6f, file 5c8cb65f7447). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'estetica-base-alheli-v2',
  name: 'Alhelí Nail Atelier',
  category: 'esteticas',
  description:
    'Salón de belleza: servicios con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'estetica',
  archetype: 'essential',
  theme: 'estetica-base-alheli-v2',
  content: 'estetica.alheli-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'inline',
      props: {
        links: [
          {
            label: 'El salón',
            href: '#nosotros',
          },
          {
            label: 'Servicios',
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
      variant: 'offset-card',
      props: {
        imageAlt:
          'Primer plano de uñas rojas, dos de ellas con flores blancas y rojas pintadas a mano',
        title: 'Uñas de <span class="lz-title__serif">colección</span>.',
        text: 'Manicura de autor y nail art en San Álvaro. Elige tu colección y agenda por WhatsApp en un mensaje.',
      },
    },
    {
      slot: 'about',
      variant: 'booking-steps',
    },
    {
      slot: 'services',
      variant: 'collection-cards',
      props: {
        intro:
          'Dos colecciones para empezar; cada una incluye limado, cutícula y esmaltado.',
        prices: [
          {
            name: 'Nude y negro mate',
            price: 'Desde $850',
            description:
              'Contraste mate con líneas dibujadas a mano sobre una base nude.',
            duration: '90 min',
            image: 'product-01.jpg',
            imageAlt: 'Manos con uñas negras mate y nude con dibujos lineales',
            href: '{{whatsappUrl:Hola, quiero la colección Nude y negro mate}}',
          },
          {
            name: 'Color a tu medida',
            price: 'Desde $700',
            description:
              'Eliges el tono de la paleta del atelier y lo trabajamos con acabado brillante.',
            duration: '75 min',
            image: 'product-03.jpg',
            imageAlt: 'Hilera de esmaltes de uñas en tonos nude, rosa y rojo',
            href: '{{whatsappUrl:Hola, quiero la colección Color a tu medida}}',
          },
        ],
      },
    },
    {
      slot: 'faq',
      variant: 'grid',
      props: {
        items: [
          {
            question: '¿Cuánto cuesta una manicura de autor?',
            answer:
              'Las colecciones empiezan en $700 y el precio final se confirma al ver tu referencia.',
          },
          {
            question: '¿Cuánto dura una cita?',
            answer:
              'Entre 75 y 120 minutos, según la colección y el diseño que elijas.',
          },
          {
            question: '¿Puedo llevar una foto de referencia?',
            answer:
              'Sí, mándala por WhatsApp antes y te decimos cómo se adapta a tu largo y forma.',
          },
          {
            question: '¿Cómo cuidan la higiene?',
            answer:
              'Esterilizamos el instrumental metálico y usamos lima y pulidor nuevos con cada persona.',
          },
        ],
      },
    },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        branch: {
          name: 'San Álvaro',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–20:00 · Dom 10:00–15:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal San Álvaro',
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
            label: 'El salón',
            href: '#nosotros',
          },
          {
            label: 'Servicios',
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
  renews: 'estetica-base-alheli-v1',
} satisfies Manifest;
