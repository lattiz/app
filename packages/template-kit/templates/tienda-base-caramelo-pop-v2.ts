// GENERATED from specs/tienda-caramelo-pop-v2.spec.json (spec 8e0f9df6d256, file 72cff5216d88). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'tienda-base-caramelo-pop-v2',
  name: 'Caramelo Pop',
  category: 'tiendas',
  description:
    'Tienda de barrio: catálogo con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'tienda',
  archetype: 'essential',
  theme: 'tienda-base-caramelo-pop-v2',
  content: 'tienda.caramelo-pop-v2.es-MX',
  sections: [
    {
      slot: 'navbar',
      variant: 'centered-logo',
      props: {
        links: [
          {
            label: 'La tienda',
            href: '#nosotros',
          },
          {
            label: 'Catálogo',
            href: '#servicios',
          },
          {
            label: 'Envíos',
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
      variant: 'duo-arch',
      props: {
        detailImage: 'basico-product-01.jpg',
        detailAlt: 'Detalle de una bolsa de gomitas de colores',
        title: 'Dulces americanos',
        text: 'Gomitas, chocolates y sodas importadas. Pasa por tu bolsa o pide por WhatsApp.',
      },
    },
    {
      slot: 'about',
      variant: 'brief',
      props: {
        image: 'basico-about.jpg',
      },
    },
    {
      slot: 'services',
      variant: 'alternating-bands',
      props: {
        products: [
          {
            name: 'Chocolates',
            price: 'Desde $35',
            description: 'Con maní, caramelo o relleno cremoso.',
            image: 'basico-product-01.jpg',
            imageAlt: 'Barras de chocolate con envoltura sobre una mesa',
            href: '{{whatsappUrl:Hola, quiero chocolates}}',
            tag: 'Más pedido',
            chips: ['Con maní', 'Caramelo', 'Relleno'],
          },
          {
            name: 'Gomitas',
            price: 'Desde $30',
            description: 'Ácidas, suaves y de frutas, en bolsa.',
            image: 'basico-product-01.jpg',
            imageAlt: 'Tazón con gomitas de colores',
            href: '{{whatsappUrl:Hola, quiero gomitas}}',
            tag: 'Favoritas',
            chips: ['Ácidas', 'Suaves', 'Frutas'],
          },
          {
            name: 'Sodas importadas',
            price: 'Desde $38',
            description: 'Importadas de Estados Unidos, en lata y botella.',
            image: 'basico-product-01.jpg',
            imageAlt: 'Vaso de refresco con hielo y popote',
            href: '{{whatsappUrl:Hola, quiero sodas importadas}}',
            tag: 'Importadas',
            chips: ['Lata', 'Botella', 'Edición limitada'],
          },
          {
            name: 'Snacks',
            price: 'Desde $40',
            description: 'Salados y dulces para compartir.',
            image: 'basico-product-01.jpg',
            imageAlt: 'Palomitas de maíz en un recipiente',
            href: '{{whatsappUrl:Hola, quiero snacks}}',
            tag: 'Para compartir',
            chips: ['Dulces', 'Salados', 'Mezcla'],
          },
        ],
        title: 'Cuatro formas de endulzar el día',
      },
    },
    {
      slot: 'faq',
      variant: 'column-panels',
      props: {
        title: 'Antes de pedir',
      },
    },
    {
      slot: 'locations',
      variant: 'single',
      props: {
        branch: {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Sáb 10:00–20:00 · Dom 11:00–18:00',
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
            label: 'La tienda',
            href: '#nosotros',
          },
          {
            label: 'Catálogo',
            href: '#servicios',
          },
          {
            label: 'Envíos',
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
  renews: 'tienda-base-caramelo-pop-v1',
} satisfies Manifest;
