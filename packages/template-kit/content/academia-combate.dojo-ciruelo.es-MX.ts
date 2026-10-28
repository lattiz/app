// GENERATED from specs/academia-combate-dojo-ciruelo.spec.json (spec bacb84df9b64, file ddfb6d3b81e0). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'academia-combate',
  locale: 'es-MX',
  business: {
    name: 'Dojo Ciruelo',
    shortName: 'Dojo Ciruelo',
    tagline: 'Dojo familiar de karate, taekwondo y jiu-jitsu',
    city: 'Querétaro',
    phone: '+52 442 000 0000',
    whatsapp: '5214420000000',
    whatsappMessage: 'Hola, quiero una clase de prueba en Dojo Ciruelo',
    address: 'Calle Nogal 214, Col. Jardines',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@dojociruelo.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=dojo+ciruelo+jardines',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=dojo+ciruelo+jardines',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: clases por edad y nivel, desde 4 años. Pide tu clase de prueba sin costo.',
  },
  sections: {
    navbar: {
      cta: 'Clase de prueba',
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
          label: 'Coaches',
          href: '#equipo',
        },
        {
          label: 'Dudas',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      note: 'Clases de lunes a sábado',
      image: 'hero.jpg',
      imageAlt:
        'Alumnos de karate arrodillados en el dojo con sus cinturones negros frente a ellos',
      eyebrow: 'Dojo familiar · Jardines',
      title: 'Karate, taekwondo y jiu-jitsu para toda la familia.',
      text: 'Grupos para niños desde 4 años y para adultos que empiezan de cero. Clases por nivel, con respeto y a tu ritmo.',
      primaryCta: 'Pedir clase de prueba',
      secondaryCta: 'Ver horarios',
      secondaryHref: '#servicios',
      sticker: 'Primera clase sin costo',
    },
    marquee: {
      label: 'Disciplinas de la academia',
      items: ['Box', 'Muay thai', 'MMA', 'Jiu-jitsu', 'Karate', 'Taekwondo'],
    },
    about: {
      kicker: '{{index}} — El dojo',
      title: 'Disciplina que se aprende en familia.',
      summary:
        'Un dojo pequeño donde cada alumno tiene un coach al lado: niños desde 4 años y adultos que empiezan de cero.',
      statement:
        'Aquí nadie pelea la primera semana: se aprende a saludar, a moverse y a cuidar al compañero.',
      image: 'about.jpg',
      imageAlt:
        'Niño con uniforme blanco haciendo el saludo con las manos, en blanco y negro',
      sticker: 'Desde los 4 años',
      paragraphs: [
        'Los grupos de niños empiezan a los 4 años, con juego, reverencia y respeto antes que técnica.',
        'Los adultos nuevos entran a un grupo de principiantes, sin sparring y sin prisa.',
        'Si tienes una lesión, consulta a tu médico antes de empezar y avísale a tu coach.',
      ],
      stats: [
        {
          value: '3',
          label: 'Disciplinas',
        },
        {
          value: '4 años',
          label: 'Edad mínima en niños',
        },
        {
          value: '6 días',
          label: 'De clases a la semana',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Horario',
      title: 'Horario semanal',
      intro:
        'Clases de una hora, por edad y nivel. Los niños y los adultos nuevos empiezan en grupos de principiantes.',
      legend: [
        {
          label: 'Niños 4 a 7',
        },
        {
          label: 'Niños 8 a 12',
        },
        {
          label: 'Adultos nuevos',
        },
        {
          label: 'Todos los niveles',
        },
      ],
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      rows: [
        {
          time: '09:00–10:00',
          cells: [
            {
              day: 'Lunes',
              discipline: 'Karate',
              level: 'Adultos nuevos',
            },
            {
              day: 'Martes',
              discipline: 'Taekwondo',
              level: 'Adultos nuevos',
            },
            {
              day: 'Miércoles',
              discipline: 'Karate',
              level: 'Adultos nuevos',
            },
            {
              day: 'Jueves',
              discipline: 'Taekwondo',
              level: 'Adultos nuevos',
            },
            {
              day: 'Viernes',
              discipline: 'Jiu-jitsu',
              level: 'Todos los niveles',
            },
            {
              day: 'Sábado',
              discipline: 'Karate',
              level: 'Padres e hijos',
            },
          ],
        },
        {
          time: '17:00–18:00',
          cells: [
            {
              day: 'Lunes',
              discipline: 'Karate',
              level: 'Niños 4 a 7',
            },
            {
              day: 'Martes',
              discipline: 'Taekwondo',
              level: 'Niños 4 a 7',
            },
            {
              day: 'Miércoles',
              discipline: 'Karate',
              level: 'Niños 4 a 7',
            },
            {
              day: 'Jueves',
              discipline: 'Taekwondo',
              level: 'Niños 4 a 7',
            },
            {
              day: 'Viernes',
              discipline: 'Taekwondo',
              level: 'Niños 8 a 12',
            },
            {
              day: 'Sábado',
            },
          ],
        },
        {
          time: '18:15–19:15',
          cells: [
            {
              day: 'Lunes',
              discipline: 'Karate',
              level: 'Niños 8 a 12',
            },
            {
              day: 'Martes',
              discipline: 'Jiu-jitsu',
              level: 'Niños 8 a 12',
            },
            {
              day: 'Miércoles',
              discipline: 'Karate',
              level: 'Niños 8 a 12',
            },
            {
              day: 'Jueves',
              discipline: 'Jiu-jitsu',
              level: 'Niños 8 a 12',
            },
            {
              day: 'Viernes',
              discipline: 'Karate',
              level: 'Niños 8 a 12',
            },
            {
              day: 'Sábado',
            },
          ],
        },
        {
          time: '19:30–20:45',
          cells: [
            {
              day: 'Lunes',
              discipline: 'Jiu-jitsu',
              level: 'Adultos nuevos',
            },
            {
              day: 'Martes',
              discipline: 'Karate',
              level: 'Adultos nuevos',
            },
            {
              day: 'Miércoles',
              discipline: 'Jiu-jitsu',
              level: 'Adultos nuevos',
            },
            {
              day: 'Jueves',
              discipline: 'Karate',
              level: 'Adultos nuevos',
            },
            {
              day: 'Viernes',
              discipline: 'Jiu-jitsu',
              level: 'Todos los niveles',
            },
            {
              day: 'Sábado',
            },
          ],
        },
      ],
      note: 'El contacto es opcional y con protecciones. ¿Lesión? Consulta a tu médico.',
      trial: {
        title: 'La primera clase es de prueba',
        text: 'Elige una disciplina y ven con ropa cómoda. El uniforme te lo prestamos ese día.',
        cta: 'Pedir clase',
        href: '{{whatsappUrl:Hola, quiero una clase de prueba en Dojo Ciruelo}}',
      },
      plans: {
        kicker: 'Mensualidades',
        title: 'Mensualidades en pesos',
      },
      prices: [
        {
          name: 'Grupo infantil',
          price: '$850',
          unit: '/ mes',
          description: 'Dos clases por semana, de 4 a 12 años.',
          features: [
            'Karate o taekwondo',
            'Examen de cinta cada tres meses',
            'Uniforme prestado el primer mes',
          ],
          cta: 'Elegir plan',
          href: '{{whatsappUrl:Hola, quiero el plan del grupo infantil}}',
        },
        {
          name: 'Adultos nuevos',
          price: '$1,100',
          unit: '/ mes',
          description: 'Tres clases por semana de una disciplina.',
          badge: 'Más elegido',
          features: [
            'Karate, taekwondo o jiu-jitsu',
            'Grupo de nivel inicial',
            'Cambio de disciplina cada trimestre',
          ],
          cta: 'Elegir plan',
          href: '{{whatsappUrl:Hola, quiero el plan de adultos}}',
        },
        {
          name: 'Plan familiar',
          price: '$1,950',
          unit: '/ mes',
          description: 'Hasta tres integrantes, niños y adultos.',
          features: [
            'Cualquier horario de su nivel',
            'Un solo pago mensual',
            'Inscripción única de $350',
          ],
          cta: 'Elegir plan',
          href: '{{whatsappUrl:Hola, quiero el plan familiar}}',
        },
      ],
      promos: [
        {
          tag: 'Hermanos',
          title: 'Segundo hijo con 15 % de descuento',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero inscribir a mis hijos}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Fotos',
      title: 'Así se entrena aquí',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Primer golpe',
          alt: 'Niño con uniforme blanco practicando un golpe',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Kiai',
          alt: 'Alumna en karategi con cinta verde marcando un golpe con kiai',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Trabajo en suelo',
          alt: 'Dos adultos practicando jiu-jitsu sobre el tapete',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Los grados',
          alt: 'Cinturones de varios colores y negro, uno junto a otro',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Clase individual',
          alt: 'Coach enseñando una técnica a un niño',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'En el tatami',
          alt: 'Alumnos sentados en el tatami con sus cinturones atados',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Respeto',
          alt: 'Dos manos entrelazadas sobre mangas de kimono en señal de respeto',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Clase de niños',
          alt: 'Niña con uniforme blanco practicando un golpe en clase, con otro niño al fondo',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Coaches',
      title: 'Quién te enseña',
      intro:
        'Cada disciplina con su coach, el grado a la vista y una trayectoria corta.',
      members: [
        {
          name: 'Héctor Valdés',
          role: 'Karate',
          rank: 'Cinta negra · 3.er dan',
          rankTone: 'dark',
          rankSteps: '3',
          bio: 'Cinta negra desde los 19 años; lleva el grupo de adultos y la técnica básica.',
          specialty: 'Especialidad: kata y técnica básica',
          image: 'team-1.jpg',
          imageAlt:
            'Retrato de Héctor Valdés, coach de karate, con uniforme blanco y cinturón negro',
        },
        {
          name: 'Rodrigo Salinas',
          role: 'Taekwondo',
          rank: 'Cinta negra · 2.º dan',
          rankTone: 'dark',
          rankSteps: '2',
          bio: 'Forma a niños y jóvenes desde hace 12 años, con paciencia.',
          specialty: 'Especialidad: patadas y equilibrio',
          image: 'team-2.jpg',
          imageAlt:
            'Rodrigo Salinas, coach de taekwondo, lanzando una patada junto a un costal',
        },
        {
          name: 'Mateo Rangel',
          role: 'Jiu-jitsu brasileño',
          rank: 'Cinta negra · 1.er grado',
          rankTone: 'dark',
          rankSteps: '1',
          bio: 'Enseña jiu-jitsu a adultos nuevos desde 2014, con calma.',
          specialty: 'Especialidad: control en suelo',
          image: 'team-3.jpg',
          imageAlt:
            'Mateo Rangel, profesor de jiu-jitsu, sentado en seiza con su kimono',
        },
        {
          name: 'Daniela Ibarra',
          role: 'Grupo infantil',
          rank: 'Cinta café · karate',
          rankTone: 'mid',
          rankSteps: '0',
          bio: 'Lleva el grupo de 4 a 7 años, con juegos, reverencia y un cierre tranquilo.',
          specialty: 'Especialidad: iniciación infantil',
          image: 'team-4.jpg',
          imageAlt:
            'Daniela Ibarra, coach del grupo infantil, en guardia con uniforme blanco y cinturón café',
        },
      ],
    },
    testimonials: {
      scoreNote: 'Calificación de ejemplo',
      kicker: '{{index}} — Reseñas',
      score: '4.9',
      summary: '128 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Mi hija entró con 5 años y ya espera su turno y saluda al entrar. El grupo es pequeño y se nota el cuidado.',
          author: 'Paola S.',
        },
        {
          text: 'Llegué sin experiencia en jiu-jitsu. Nadie me exigió sparring y el coach explicó todo con calma.',
          author: 'Héctor V.',
        },
        {
          text: 'Vamos mi hijo y yo con el plan familiar; el horario de las 17:00 nos acomoda a los dos.',
          author: 'Andrés M.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Dudas',
      title: 'Antes de tu primera clase',
      intro: 'Lo que suelen preguntar los papás y los adultos nuevos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Desde qué edad pueden entrar los niños?',
          answer:
            'A partir de los 4 años, en un grupo de juego, reverencia y formas básicas con un coach para pocos niños.',
        },
        {
          question: '¿Necesito experiencia o buena condición?',
          answer:
            'No. Hay grupos de nivel inicial en cada disciplina y el coach ajusta el ritmo contigo.',
        },
        {
          question: '¿Qué incluye la clase de prueba?',
          answer:
            'Una clase de la disciplina que elijas, con uniforme prestado y sin costo. Avísanos por WhatsApp para apartar lugar.',
        },
        {
          question: '¿Hay sparring?',
          answer:
            'Es opcional, por nivel y siempre con protecciones: guantes, bucal y espinilleras. Puedes entrenar solo técnica.',
        },
        {
          question: '¿Qué hago si tengo una lesión?',
          answer:
            'Consulta a tu médico antes de empezar y avísale a tu coach para que adapte los ejercicios.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Visítanos en Jardines',
      contactText:
        'Escríbenos para elegir horario o ven a ver una clase. Hay área de espera para los papás.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Clase de prueba',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Pedir clase de prueba',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Jardines',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–10:30 y 16:30–21:00 · Sáb 8:30–12:30',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Jardines',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Pedir clase de prueba',
    },
    footer: {
      about:
        'Dojo familiar de {{city}}. Reverencia, técnica y respeto desde los 4 años.',
      branchesTitle: 'Dojo',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
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
          label: 'Coaches',
          href: '#equipo',
        },
        {
          label: 'Dudas',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'Jardines',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–10:30 y 16:30–21:00 · Sáb 8:30–12:30',
        },
      ],
    },
  },
} satisfies ContentPack;
