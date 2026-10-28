import type { GiroDefinition } from '../src/spec/giro';
import { palette } from '../src/spec/presets';

/**
 * Academia de combate (box, muay thai, MMA, BJJ, karate, taekwondo): disciplinas con horario y nivel,
 * clase de prueba, mensualidades, coaches con trayectoria, grupo infantil y reglas de seguridad.
 * La mayoría se ve agresiva (oscura); los dojos familiares (karate, taekwondo) van en claro.
 */

export default {
  id: 'academia-combate',
  label: 'Academia de combate',
  aliases: [
    'academia de box',
    'box',
    'boxeo',
    'muay thai',
    'mma',
    'artes marciales mixtas',
    'jiu-jitsu brasileño',
    'bjj',
    'karate',
    'taekwondo',
    'kickboxing',
    'lucha',
    'artes marciales',
    'dojo',
  ],
  rules: [
    'Sin promesas de ganar peleas ni de «defensa personal garantizada»; nada de «te volverás invencible».',
    'El sparring es opcional y por nivel; menciona protecciones (guantes, bucal, espinilleras) cuando hables de contacto.',
    'Grados y trayectoria sin inventar federaciones, títulos ni récords verificables: «cinta negra 2.º dan» sí, nombres de ligas o marcas no.',
    'Sin violencia gráfica ni lenguaje de pelea callejera; con niños, el tono es disciplina, respeto y juego.',
    'Recomienda una valoración médica antes de empezar si hay lesiones; no des consejos médicos.',
  ],
  category: 'academias-combate',
  businessCategory: 'other',
  schemaType: 'SportsActivityLocation',
  description: {
    pro: 'Academia de combate con identidad propia: disciplinas, horarios, coaches, el tatami en fotos, reseñas y clase de prueba',
    basico:
      'Academia de box, muay thai o artes marciales: mensualidades, preguntas frecuentes y ubicación',
  },
  palettes: {
    'esquina-roja': palette({
      label: 'Esquina roja (oscuro, acento rojo)',
      scheme: 'dark',
      bg: '#0F0D0D',
      surface: '#191515',
      surface2: '#241E1E',
      text: '#F5F1F0',
      muted: '#B3A9A7',
      accent: '#D42A35',
      onAccent: '#FFFFFF',
      accentText: '#F0686A',
      photoTreatment: 'none',
      placeholder: 'grain',
    }),
    'cinturon-oro': palette({
      label: 'Cinturón de oro (oscuro, acento dorado)',
      scheme: 'dark',
      bg: '#0E0E10',
      surface: '#18181B',
      surface2: '#232326',
      text: '#F4F2EC',
      muted: '#ABA79C',
      accent: '#F2B705',
      onAccent: '#0E0E10',
      accentText: '#F5C53A',
      photoTreatment: 'warm',
      placeholder: 'rules',
    }),
    veneno: palette({
      label: 'Veneno (oscuro, acento verde ácido)',
      scheme: 'dark',
      bg: '#0C0F0C',
      surface: '#151A15',
      surface2: '#1F261F',
      text: '#EFF4EE',
      muted: '#A3ADA2',
      accent: '#7FD63A',
      onAccent: '#0C0F0C',
      accentText: '#95E05A',
      photoTreatment: 'grayscale',
      placeholder: 'grain',
    }),
    'esquina-azul': palette({
      label: 'Esquina azul (oscuro, acento cian)',
      scheme: 'dark',
      bg: '#0A0F16',
      surface: '#111924',
      surface2: '#192432',
      text: '#ECF3FA',
      muted: '#9FB0C2',
      accent: '#2EC4F1',
      onAccent: '#0A0F16',
      accentText: '#5ED1F4',
      photoTreatment: 'none',
      placeholder: 'rules',
    }),
    dojo: palette({
      label: 'Dojo (claro, acento índigo)',
      scheme: 'light',
      bg: '#F7F5F0',
      surface: '#FFFFFF',
      surface2: '#E9E5DC',
      text: '#16161D',
      muted: '#4E4D57',
      accent: '#2B3A8C',
      onAccent: '#FFFFFF',
      accentText: '#4C5CCF',
      photoTreatment: 'none',
      placeholder: 'dots',
    }),
    tatami: palette({
      label: 'Tatami (claro, acento morado)',
      scheme: 'light',
      bg: '#F5F3F6',
      surface: '#FFFFFF',
      surface2: '#E6E1E9',
      text: '#18141B',
      muted: '#524A57',
      accent: '#6A2C91',
      onAccent: '#FFFFFF',
      accentText: '#8E48C2',
      photoTreatment: 'none',
      placeholder: 'blobs',
    }),
  },
  fontPairs: [
    'anton+space-grotesk',
    'archivo-black+space-grotesk',
    'unbounded+manrope',
    'bricolage-grotesque+inter',
    'sora+inter',
  ],
  shapes: ['brutal', 'urbano', 'sutil', 'redondo'],
  sections: {
    pro: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'image-bg' },
      { role: 'marquee', variant: 'ticker' },
      { role: 'about', variant: 'stats-strip' },
      { role: 'catalog', variant: 'cards' },
      { role: 'team', variant: 'grid' },
      { role: 'proof', variant: 'mosaic' },
      { role: 'testimonials', variant: 'cards' },
      { role: 'faq', variant: 'two-col' },
      { role: 'contact', variant: 'with-contact' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'big-wordmark' },
    ],
    basico: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'split' },
      { role: 'about', variant: 'brief' },
      { role: 'catalog', variant: 'cards' },
      { role: 'faq', variant: 'list' },
      { role: 'contact', variant: 'single' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'minimal-centered' },
    ],
  },
  motion: { preset: 'editorial', progress: true },
  navLabels: {
    about: 'La academia',
    services: 'Clases',
    team: 'Coaches',
    gallery: 'Fotos',
    testimonials: 'Reseñas',
    faq: 'Dudas',
    locations: 'Visítanos',
  },
  business: {
    tagline: 'Academia de box y artes marciales',
    whatsappMessage: 'Hola, quiero una clase de prueba',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    city: 'CDMX',
    hours: 'Lun–Vie 7:00–22:00 · Sáb 9:00–14:00',
    address: 'Calle Ejemplo 120, Col. Centro, CDMX',
    branch: 'Centro',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: box, muay thai, MMA, jiu-jitsu, karate y taekwondo para adultos y niños. Pide tu clase de prueba.',
  },
  copy: {
    navbar: { cta: 'Clase de prueba' },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Boxeador golpeando un costal en una academia con poca luz',
      eyebrow: 'Box y artes marciales · {{branch}}',
      title:
        'Aprende a pelear con <span class="lz-title__serif">técnica</span>.',
      text: 'Box, muay thai, MMA y jiu-jitsu para adultos; karate y taekwondo para niños. Empiezas desde cero y el sparring llega cuando tú y tu coach lo deciden.',
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
      kicker: '{{index}} — La academia',
      title:
        'Disciplina que se <span class="lz-title__serif">nota</span> fuera del tatami.',
      summary:
        'En {{shortName}} entrenas por niveles: primero la técnica y la condición, después el contacto, siempre con protecciones y con un coach a un lado.',
      statement:
        'Nadie sube al ring en su primera semana: aprendes a moverte, a cubrirte y a respirar antes de pensar en el sparring.',
      image: 'about.jpg',
      imageAlt:
        'Ring de box con cuerdas rojas y guantes colgados en la esquina',
      sticker: 'Por niveles',
      paragraphs: [
        'Clases de 60 minutos por disciplina y nivel, de lunes a sábado.',
        'El sparring es opcional y con protecciones: guantes, bucal y espinilleras.',
        'Si tienes alguna lesión, consulta a tu médico antes de empezar y avísale a tu coach.',
      ],
      stats: [
        { value: '6', label: 'Disciplinas' },
        { value: '4 años', label: 'Edad mínima en niños' },
        { value: '4.9 ★', label: 'En Google' },
      ],
    },
    services: {
      kicker: '{{index}} — Clases',
      title: 'Disciplinas y <span class="lz-title__serif">mensualidades</span>',
      intro:
        'Precios en pesos mexicanos. La primera clase es de prueba; los guantes y vendas te los prestamos ese día.',
      prices: [
        {
          name: 'Clase de prueba',
          price: '$0',
          description:
            'Una clase de la disciplina que elijas, con equipo prestado.',
        },
        {
          name: 'Una disciplina',
          price: '$950',
          description:
            'Tres clases por semana de box, muay thai, MMA o jiu-jitsu.',
        },
        {
          name: 'Todas las disciplinas',
          price: '$1,390',
          description: 'Clases ilimitadas en cualquier horario de adultos.',
        },
        {
          name: 'Niños: karate o taekwondo',
          price: '$750',
          description:
            'Dos clases por semana para 4 a 13 años, con examen de grado.',
        },
        {
          name: 'Clase privada',
          price: '$500',
          description: 'Una hora uno a uno con el coach de tu disciplina.',
        },
        {
          name: 'Inscripción',
          price: '$400',
          description:
            'Una vez al año; incluye playera y seguro de la academia.',
        },
      ],
      promos: [
        {
          tag: 'Primera vez',
          title: 'Clase de prueba sin costo',
          text: 'Ven a una clase, conoce al coach y decide después.',
          cta: 'Pedir clase',
          href: '{{whatsappUrl:Hola, quiero una clase de prueba}}',
        },
        {
          tag: 'Hermanos',
          title: 'Segundo hijo con descuento',
          text: 'El segundo hermano en karate o taekwondo paga 15 % menos.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero inscribir a mis hijos}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Fotos',
      title: 'Así se <span class="lz-title__serif">entrena</span> aquí',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Costales',
          alt: 'Fila de costales colgados en la academia',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Guantes',
          alt: 'Guantes de box colgados en la pared',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Muay thai',
          alt: 'Alumno pateando unas paletas que sostiene el coach',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Jiu-jitsu',
          alt: 'Dos alumnos en kimono practicando en el tatami',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Karate infantil',
          alt: 'Niños en karategi haciendo una posición de guardia',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Taekwondo',
          alt: 'Alumna lanzando una patada alta',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'El ring',
          alt: 'Ring de box vacío con luz lateral',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Vendaje',
          alt: 'Manos vendadas antes de entrenar',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Coaches',
      title: 'Quién te <span class="lz-title__serif">entrena</span>',
      members: [
        {
          name: 'Ramón Ortega',
          role: 'Head coach de box',
          tags: ['Box', 'Acondicionamiento'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Ramón Ortega con guantes de entrenamiento',
        },
        {
          name: 'Ana Ruiz',
          role: 'Coach de muay thai',
          tags: ['Muay thai', 'Kickboxing'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Ana Ruiz con vendas en las manos',
        },
        {
          name: 'Iván Paredes',
          role: 'Profesor de jiu-jitsu',
          tags: ['Cinta negra', 'MMA'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Iván Paredes en kimono',
        },
        {
          name: 'Laura Medina',
          role: 'Karate y taekwondo infantil',
          tags: ['Niños', 'Cinta negra 2.º dan'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Laura Medina en dobok',
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
          text: 'Llegué sin saber tirar un golpe. Tres meses después sigo viniendo y nunca me obligaron a hacer sparring.',
          author: 'Andrés M.',
        },
        {
          text: 'Mi hijo entró a karate con 6 años; aprendió a esperar su turno y a saludar al entrar. Le encanta.',
          author: 'Paola S.',
        },
        {
          text: 'Las clases de jiu-jitsu son muy técnicas y el profe explica cada movimiento con calma.',
          author: 'Héctor V.',
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
          question: '¿Es obligatorio hacer sparring?',
          answer:
            'No. El sparring es opcional, por nivel y siempre con protecciones; puedes entrenar solo técnica.',
        },
        {
          question: '¿Qué equipo necesito?',
          answer:
            'Para la clase de prueba te prestamos guantes y vendas. Después te recomendamos tus propios guantes, vendas y bucal.',
        },
        {
          question: '¿Desde qué edad aceptan niños?',
          answer:
            'Karate y taekwondo desde los 4 años, en grupos por edad y con examen de grado cada trimestre.',
        },
        {
          question: '¿Qué horarios tienen?',
          answer:
            'Adultos entre semana en la mañana y en la noche; niños por la tarde; sábados por la mañana. Te mandamos el horario de tu disciplina por WhatsApp.',
        },
        {
          question: '¿Puedo competir?',
          answer:
            'Si quieres, el coach te prepara para torneos amateur cuando tengas el nivel; no es requisito para entrenar.',
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
    },
    'floating-whatsapp': { label: 'Pedir clase de prueba por WhatsApp' },
    footer: {
      about:
        'Academia en {{city}}. Box, muay thai, MMA, jiu-jitsu, karate y taekwondo para adultos y niños, por niveles.',
      branchesTitle: 'Academia',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
    },
  },
  heroAlternates: [
    'Técnica primero, <span class="lz-title__serif">contacto después</span>.',
    'Tu primera clase de box <span class="lz-title__serif">es de prueba</span>.',
    'Disciplina para adultos y <span class="lz-title__serif">niños</span>.',
    'Tu academia de combate en <span class="lz-title__serif">{{branch}}</span>.',
  ],
  images: {
    hero: { query: 'boxer training punching bag', orientation: 'landscape' },
    about: { query: 'boxing ring ropes gloves', orientation: 'portrait' },
    'team-1': {
      query: 'boxing trainer man gloves portrait',
      orientation: 'portrait',
    },
    'team-2': {
      query: 'woman boxer hand wraps',
      orientation: 'portrait',
    },
    'team-3': {
      query: 'man martial arts black belt',
      orientation: 'portrait',
    },
    'team-4': { query: 'woman karate white uniform', orientation: 'portrait' },
    'gallery-01': { query: 'punching bags boxing gym', orientation: 'square' },
    'gallery-02': { query: 'boxing gloves hanging', orientation: 'square' },
    'gallery-03': { query: 'muay thai kick pads', orientation: 'square' },
    'gallery-04': {
      query: 'brazilian jiu jitsu training',
      orientation: 'square',
    },
    'gallery-05': { query: 'kids karate class', orientation: 'square' },
    'gallery-06': { query: 'taekwondo high kick', orientation: 'square' },
    'gallery-07': { query: 'empty boxing ring', orientation: 'square' },
    'gallery-08': { query: 'boxing hand wraps', orientation: 'square' },
  },
  demoHours: {
    mon: [{ open: '07:00', close: '22:00' }],
    tue: [{ open: '07:00', close: '22:00' }],
    wed: [{ open: '07:00', close: '22:00' }],
    thu: [{ open: '07:00', close: '22:00' }],
    fri: [{ open: '07:00', close: '22:00' }],
    sat: [{ open: '09:00', close: '14:00' }],
  },
  priceRange: '$$',
} satisfies GiroDefinition;
