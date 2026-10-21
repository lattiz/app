// GENERATED from specs/clinica-cauce-v2.spec.json (spec 22a6ba4f9bc5, file d85cad2dd93f). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'clinica-base-cauce-v2',
  name: 'Cauce Fisioterapia',
  category: 'clinicas',
  description:
    'Consultorio: servicios con precios, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'clinica',
  archetype: 'essential',
  theme: 'clinica-base-cauce-v2',
  content: 'clinica.cauce-v2.es-MX',
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
      variant: 'panel',
      props: {
        title:
          'Fisioterapia en <span class="lz-title__serif">Clavería</span>, con cita y a tu ritmo.',
        text: 'Valoración, terapia manual y ejercicio guiado. Escríbenos por WhatsApp y te proponemos un horario esta semana.',
      },
    },
    {
      slot: 'about',
      variant: 'booking-steps',
      props: {
        kicker: '{{index}} — Cómo agendar',
        title: 'Agenda en <span class="lz-title__serif">tres pasos</span>',
        summary:
          'Sin llamadas largas: escribes, te proponemos horario y llegas con tu cita confirmada.',
        steps: [
          {
            title: 'Escríbenos',
            text: 'Cuéntanos por WhatsApp qué molestia tienes y qué horario te acomoda.',
          },
          {
            title: 'Confirma tu cita',
            text: 'Te proponemos un horario esta semana y te enviamos la dirección y un recordatorio.',
          },
          {
            title: 'Ven a tu valoración',
            text: 'Llegas con ropa cómoda; revisamos tu movimiento y te damos un plan por escrito.',
          },
        ],
      },
    },
    {
      slot: 'services',
      variant: 'menu-columns',
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
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Vie 8:00–20:00 · Sáb 9:00–14:00',
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
  renews: 'clinica-base-cauce-v1',
} satisfies Manifest;
