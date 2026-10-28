// GENERATED from specs/academia-combate-esquina-nueve.spec.json (spec f701fe3a0c0c, file 92c240bdd57e). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'academia-combate',
  locale: 'es-MX',
  business: {
    name: 'Esquina Nueve',
    shortName: 'Esquina Nueve',
    tagline: 'Academia de box, muay thai y MMA',
    city: 'Monterrey',
    phone: '+52 81 0000 0000',
    whatsapp: '5218100000000',
    whatsappMessage: 'Hola, quiero una clase de prueba en Esquina Nueve',
    address: 'Calle Fundidora 214, Col. Obrera, Monterrey, N.L.',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@esquinanueve.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=esquina+nueve+col+obrera',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=esquina+nueve+col+obrera',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: box, muay thai, MMA y jiu-jitsu para adultos; karate y taekwondo para niños. Pide tu clase de prueba.',
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
      image: 'hero.jpg',
      imageAlt:
        'Boxeadora con guantes frente a un costal pesado en la penumbra',
      eyebrow: 'Box y artes marciales · Col. Obrera',
      title:
        'Entrena en serio. <span class="lz-title__serif">Empieza desde cero.</span>',
      text: 'Box, muay thai, MMA y jiu-jitsu por niveles, con un coach a tu lado. El sparring llega cuando tú y tu coach lo deciden.',
      primaryCta: 'Pedir clase de prueba',
      secondaryCta: 'Ver horarios',
      secondaryHref: '#servicios',
      sticker: 'Primera clase sin costo',
    },
    marquee: {
      label: 'Disciplinas de la academia',
      items: [
        'Box',
        'Muay thai',
        'MMA',
        'Jiu-jitsu',
        'Karate niños',
        'Taekwondo niños',
        'Condición',
      ],
    },
    about: {
      kicker: '{{index}} — La academia',
      title:
        'Disciplina que se <span class="lz-title__serif">nota</span> fuera del tatami.',
      summary:
        'En {{shortName}} entrenas por niveles: primero técnica y condición, después el contacto, siempre con protecciones y con un coach a un lado.',
      statement:
        'Aquí nadie pelea en su primera semana: primero aprendes a moverte, cubrirte y respirar con calma.',
      image: 'about.jpg',
      imageAlt: 'Ring de box con las cuerdas y un costal al fondo',
      sticker: 'Por niveles',
      paragraphs: [
        'Clases de 60 minutos por disciplina y nivel, de lunes a sábado.',
        'El sparring es opcional y con protecciones: guantes, bucal y espinilleras.',
        'Si tienes una lesión, consulta a tu médico antes de empezar y avisa a tu coach.',
      ],
      stats: [
        {
          value: '6',
          label: 'Disciplinas',
        },
        {
          value: '4',
          label: 'Coaches',
        },
        {
          value: '60',
          label: 'Minutos por clase',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Clases',
      title: 'Horarios y <span class="lz-title__serif">mensualidades</span>',
      intro:
        'Elige tu horario, tu disciplina y tu nivel; el plan lo decides después.',
      legend: [
        {
          label: 'Principiante',
        },
        {
          label: 'Intermedio',
        },
        {
          label: 'Avanzado',
        },
        {
          label: 'Todos',
        },
      ],
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
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
          time: '16:00',
          cells: [
            {
              day: 'Lunes',
              discipline: 'Karate niños',
              level: '6–12 años',
            },
            {
              day: 'Martes',
            },
            {
              day: 'Miércoles',
              discipline: 'Taekwondo niños',
              level: '6–12 años',
            },
            {
              day: 'Jueves',
            },
            {
              day: 'Viernes',
              discipline: 'Karate niños',
              level: '6–12 años',
            },
            {
              day: 'Sábado',
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
      note: 'Sparring opcional y con protecciones. Con una lesión, consulta a tu médico.',
      trial: {
        title: 'Primera clase sin costo',
        text: 'Ven con ropa deportiva. Te prestamos guantes y vendas.',
        cta: 'Agendar prueba',
        href: '{{whatsappUrl:Hola, quiero una clase de prueba}}',
      },
      plans: {
        kicker: 'Mensualidades',
        title: 'Elige tu <span class="lz-title__serif">plan</span>',
      },
      prices: [
        {
          name: 'Acceso parcial',
          price: 'Desde $650',
          unit: '/ mes',
          features: [
            '3 clases por semana',
            'Box o muay thai',
            'Regaderas y lockers',
          ],
          cta: 'Elegir plan',
          href: '{{whatsappUrl:Hola, quiero el acceso parcial}}',
        },
        {
          name: 'Acceso total',
          price: '$950',
          unit: '/ mes',
          badge: 'Más popular',
          features: [
            'Todas las disciplinas de adultos',
            'Horarios de mañana y noche',
            'Sparring opcional con protecciones',
          ],
          cta: 'Elegir acceso total',
          href: '{{whatsappUrl:Hola, quiero el acceso total}}',
        },
        {
          name: 'Trimestral',
          price: '$2,500',
          unit: '/ 3 meses',
          features: [
            'Mismas clases del acceso total',
            'Un solo pago trimestral',
            'Congelas si te lesionas',
          ],
          cta: 'Pedir trimestral',
          href: '{{whatsappUrl:Hola, quiero el plan trimestral}}',
        },
      ],
      promos: [
        {
          tag: 'Lun, mié y vie',
          title: 'Niños de 6 a 12: karate y taekwondo',
          cta: 'Más información',
          href: '{{whatsappUrl:Hola, quiero informes del grupo infantil}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Fotos',
      title: 'Así se <span class="lz-title__serif">entrena</span> aquí',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Costal',
          alt: 'Costal pesado azul colgado frente a un fondo negro',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Zona de costales',
          alt: 'Coach entrenando entre costales pesados en una nave con vigas',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Manoplas',
          alt: 'Alumna golpeando las manoplas que sostiene el coach',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Jiu-jitsu',
          alt: 'Dos alumnos practicando jiu-jitsu sobre el tatami',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Condición',
          alt: 'Mano con magnesio sujetando una pesa rusa sobre fondo negro',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Coaches',
      title: 'Quién te <span class="lz-title__serif">entrena</span>',
      intro:
        'Cada disciplina con su coach, el grado a la vista y una trayectoria corta.',
      members: [
        {
          name: 'Rodrigo Garza',
          role: 'Box y muay thai',
          rank: 'Coach de box · 6 años',
          rankTone: 'dark',
          rankSteps: '2',
          bio: 'Peleó en torneos amateur y hoy arma las clases de principiantes. Cuida la guardia antes que la fuerza.',
          specialty: 'Especialidad: golpeo y defensa',
          image: 'team-1.jpg',
          imageAlt:
            'Retrato de Rodrigo Garza, coach de box, con vendas rojas en las manos',
        },
        {
          name: 'Alejandro Salinas',
          role: 'MMA y jiu-jitsu · Head coach',
          rank: 'Cinta negra de BJJ · 2.º grado',
          rankTone: 'dark',
          rankSteps: '2',
          bio: 'Compite en grappling a nivel regional y organiza el sparring por niveles.',
          specialty: 'Especialidad: lucha en piso',
          image: 'team-2.jpg',
          imageAlt:
            'Retrato de Alejandro Salinas, coach de jiu-jitsu, con kimono y cinta negra',
        },
        {
          name: 'Sofía Lara',
          role: 'Karate y taekwondo niños',
          rank: 'Cinta negra · 1.er dan',
          rankTone: 'dark',
          rankSteps: '1',
          bio: 'Da clases a niños de 6 a 12 años con disciplina, respeto y juego.',
          specialty: 'Especialidad: base y coordinación',
          image: 'team-3.jpg',
          imageAlt:
            'Retrato de Sofía Lara en karategi con los puños en guardia',
        },
        {
          name: 'Mariana Treviño',
          role: 'Kickboxing y taekwondo',
          rank: 'Cinta azul · kickboxing',
          rankTone: 'mid',
          rankSteps: '0',
          bio: 'Junta las patadas del taekwondo con el trabajo de guantes del kickboxing y lleva las clases de condición.',
          specialty: 'Especialidad: patadas y condición',
          image: 'team-4.jpg',
          imageAlt:
            'Mariana Treviño lanzando una patada alta con guantes rojos y cinta azul',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.9',
      summary: '146 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Llegué sin condición y el coach ajustó todo a mi ritmo. A los dos meses ya aguanto la clase completa.',
          author: 'Daniela J.',
        },
        {
          text: 'Muay thai por la noche: grupo serio y ordenado. En el sparring siempre hay protecciones.',
          author: 'Carlos V.',
        },
        {
          text: 'Mi hijo va al grupo infantil los lunes y regresa con ganas. En clase se nota el respeto.',
          author: 'Esteban G.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Dudas',
      title: 'Antes de tu <span class="lz-title__serif">primera clase</span>',
      intro:
        'Lo que suelen preguntarnos antes de inscribirse. Si tienes otra duda, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Necesito experiencia o condición?',
          answer:
            'No. Hay grupos de principiante en cada disciplina y el coach ajusta la intensidad contigo.',
        },
        {
          question: '¿Qué llevo a mi primera clase?',
          answer:
            'Ropa deportiva y agua. El equipo de esa primera clase corre por nuestra cuenta.',
        },
        {
          question: '¿Es obligatorio hacer sparring?',
          answer:
            'No. Es opcional, por nivel y siempre con guantes, bucal y espinilleras. Puedes entrenar solo técnica.',
        },
        {
          question: '¿Y si tengo una lesión o un niño pequeño?',
          answer:
            'Consulta a tu médico y avisa a tu coach: ajusta los ejercicios. El grupo infantil es de 6 a 12 años.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Ven a tu <span class="lz-title__serif">primera clase</span>',
      contactText:
        'Respondemos mensajes en horario de la academia. Aparta tu clase de prueba con un día de anticipación.',
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
          name: 'Col. Obrera',
          address: '{{address}}',
          hours: 'Lun–Vie 06:00–22:00 · Sáb 07:00–14:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Col. Obrera',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Pedir clase de prueba por WhatsApp',
    },
    footer: {
      about:
        'Esquina Nueve, academia en {{city}}: box, muay thai, MMA, jiu-jitsu y artes marciales para niños.',
      branchesTitle: 'Academia',
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
          name: 'Col. Obrera',
          address: '{{address}}',
          hours: 'Lun–Vie 06:00–22:00 · Sáb 07:00–14:00',
        },
      ],
    },
  },
} satisfies ContentPack;
