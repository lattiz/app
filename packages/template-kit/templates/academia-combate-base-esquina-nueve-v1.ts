// GENERATED from specs/academia-combate-esquina-nueve.spec.json (spec f701fe3a0c0c, file 3433d2be60c9). Do not edit: use the spec, or freeze.
import type { Manifest } from '../src/types';

export default {
  id: 'academia-combate-base-esquina-nueve-v1',
  name: 'Esquina Nueve',
  category: 'academias-combate',
  description:
    'Academia de box, muay thai o artes marciales: mensualidades, preguntas frecuentes y ubicación',
  family: 'service-landing',
  tier: 'basic',
  vertical: 'academia-combate',
  archetype: 'essential',
  theme: 'academia-combate-base-esquina-nueve-v1',
  content: 'academia-combate.esquina-nueve.es-MX',
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
      variant: 'poster',
      props: {
        image: 'product-01.jpg',
        imageAlt: 'Alumna golpeando manoplas con su coach',
        title: 'Aquí se <span class="lz-title__serif">entrena</span>.',
        text: 'Clases de 60 minutos de lunes a sábado. La primera es sin costo.',
        primaryCta: 'Agendar prueba',
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
        rows: [
          {
            time: '07:00',
            cells: [
              {
                day: 'Lunes',
                discipline: 'Box',
                level: 'Principiante',
              },
              {
                day: 'Martes',
                discipline: 'Muay thai',
                level: 'Intermedio',
              },
              {
                day: 'Miércoles',
                discipline: 'Box',
                level: 'Principiante',
              },
              {
                day: 'Jueves',
                discipline: 'Muay thai',
                level: 'Intermedio',
              },
              {
                day: 'Viernes',
                discipline: 'Box',
                level: 'Avanzado',
              },
              {
                day: 'Sábado',
                discipline: 'Box',
                level: 'Todos',
              },
            ],
          },
          {
            time: '09:00',
            cells: [
              {
                day: 'Lunes',
                discipline: 'Condición',
                level: 'Todos',
              },
              {
                day: 'Martes',
                discipline: 'Jiu-jitsu',
                level: 'Principiante',
              },
              {
                day: 'Miércoles',
                discipline: 'Condición',
                level: 'Todos',
              },
              {
                day: 'Jueves',
                discipline: 'Jiu-jitsu',
                level: 'Intermedio',
              },
              {
                day: 'Viernes',
                discipline: 'Condición',
                level: 'Todos',
              },
              {
                day: 'Sábado',
                discipline: 'Taekwondo niños',
                level: '6–12 años',
              },
            ],
          },
          {
            time: '17:00',
            cells: [
              {
                day: 'Lunes',
                discipline: 'MMA',
                level: 'Principiante',
              },
              {
                day: 'Martes',
                discipline: 'Box',
                level: 'Todos',
              },
              {
                day: 'Miércoles',
                discipline: 'MMA',
                level: 'Intermedio',
              },
              {
                day: 'Jueves',
                discipline: 'Box',
                level: 'Todos',
              },
              {
                day: 'Viernes',
                discipline: 'MMA',
                level: 'Avanzado',
              },
              {
                day: 'Sábado',
              },
            ],
          },
          {
            time: '19:00',
            cells: [
              {
                day: 'Lunes',
                discipline: 'Muay thai',
                level: 'Avanzado',
              },
              {
                day: 'Martes',
                discipline: 'Jiu-jitsu',
                level: 'Avanzado',
              },
              {
                day: 'Miércoles',
                discipline: 'Muay thai',
                level: 'Intermedio',
              },
              {
                day: 'Jueves',
                discipline: 'Jiu-jitsu',
                level: 'Avanzado',
              },
              {
                day: 'Viernes',
                discipline: 'Muay thai',
                level: 'Todos',
              },
              {
                day: 'Sábado',
              },
            ],
          },
        ],
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
          name: 'Col. Obrera',
          address: '{{address}}',
          hours: 'Lun–Vie 06:00–22:00 · Sáb 07:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Col. Obrera',
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
