import type { GiroDefinition } from '../src/spec/giro';
import { palette } from '../src/spec/presets';

/**
 * Gimnasio / estudio (funcional, yoga, pilates, box): membresías con precio, clases y horarios,
 * coaches, fotos y clase de prueba. Los horarios viven en about/faq y en las membresías.
 */

export default {
  id: 'gimnasio',
  label: 'Gimnasio / estudio',
  aliases: [
    'gimnasio',
    'gym',
    'estudio de yoga',
    'pilates',
    'entrenamiento funcional',
    'box',
    'spinning',
    'artes marciales',
    'danza',
    'natación',
    'entrenador personal',
  ],
  rules: [
    'Sin promesas físicas: nada de «baja X kilos», «resultados en 30 días», «cuerpo perfecto» ni antes/después.',
    'Marcas de métodos registradas no se nombran (escribe «entrenamiento funcional», no la marca).',
    'Recomienda consultar a un médico antes de empezar si hay lesiones; no consejos médicos.',
  ],
  category: 'gimnasios',
  businessCategory: 'other',
  schemaType: 'ExerciseGym',
  description: {
    pro: 'Gimnasio con identidad propia: membresías, clases, coaches, el espacio en fotos, reseñas y clase de prueba',
    basico:
      'Gimnasio o estudio: membresías con precios, preguntas frecuentes y ubicación',
  },
  palettes: {
    voltaje: palette({
      label: 'Voltaje (oscuro, acento lima)',
      scheme: 'dark',
      bg: '#0E0F10',
      surface: '#17191B',
      surface2: '#212427',
      text: '#F2F4F1',
      muted: '#A9AFA8',
      accent: '#C6F24E',
      onAccent: '#0E0F10',
      accentText: '#CDF46A',
      photoTreatment: 'none',
      placeholder: 'grain',
    }),
    brasa: palette({
      label: 'Brasa (oscuro, acento naranja)',
      scheme: 'dark',
      bg: '#121010',
      surface: '#1C1817',
      surface2: '#272120',
      text: '#F6F1EE',
      muted: '#B6AAA5',
      accent: '#FF6B2C',
      onAccent: '#121010',
      accentText: '#FF8550',
      photoTreatment: 'warm',
      placeholder: 'grain',
    }),
    hielo: palette({
      label: 'Hielo (oscuro, acento cian)',
      scheme: 'dark',
      bg: '#0C1116',
      surface: '#131B23',
      surface2: '#1B2631',
      text: '#EDF4F9',
      muted: '#A2B1BF',
      accent: '#4CC9F0',
      onAccent: '#0C1116',
      accentText: '#6ED3F3',
      photoTreatment: 'none',
      placeholder: 'rules',
    }),
    cal: palette({
      label: 'Cal (claro, violeta)',
      scheme: 'light',
      bg: '#F5F5F7',
      surface: '#FFFFFF',
      surface2: '#E6E5EC',
      text: '#16151C',
      muted: '#4F4D5A',
      accent: '#6328CF',
      onAccent: '#FFFFFF',
      accentText: '#7A49D6',
      photoTreatment: 'none',
      placeholder: 'dots',
    }),
    cancha: palette({
      label: 'Cancha (claro, verde)',
      scheme: 'light',
      bg: '#F4F7F3',
      surface: '#FFFFFF',
      surface2: '#E0E9DE',
      text: '#121A12',
      muted: '#485547',
      accent: '#1D7A3E',
      onAccent: '#FFFFFF',
      accentText: '#2F8A4E',
      photoTreatment: 'none',
      placeholder: 'blobs',
    }),
  },
  fontPairs: [
    'anton+space-grotesk',
    'archivo-black+space-grotesk',
    'unbounded+manrope',
    'syne+karla',
    'bricolage-grotesque+inter',
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
    about: 'El gym',
    services: 'Membresías',
    team: 'Coaches',
    gallery: 'Fotos',
    testimonials: 'Reseñas',
    faq: 'Horarios',
    locations: 'Visítanos',
  },
  business: {
    tagline: 'Gimnasio y clases',
    whatsappMessage: 'Hola, quiero una clase de prueba',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    city: 'CDMX',
    hours: 'Lun–Vie 6:00–22:00 · Sáb 8:00–14:00',
    address: 'Calle Ejemplo 88, Col. Centro, CDMX',
    branch: 'Centro',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: membresías, clases de funcional, yoga y fuerza con coaches. Pide tu clase de prueba.',
  },
  copy: {
    navbar: { cta: 'Clase de prueba' },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Personas entrenando con pesas en un gimnasio iluminado',
      eyebrow: 'Gimnasio y clases · {{branch}}',
      title:
        'Entrena con <span class="lz-title__serif">constancia</span>, no con prisa.',
      text: 'Clases en grupo pequeño, coaches que te corrigen y horarios desde las 6 de la mañana. Tu primera clase es de prueba.',
      primaryCta: 'Pedir clase de prueba',
      secondaryCta: 'Ver membresías',
      secondaryHref: '#servicios',
      sticker: 'Grupos de 12',
    },
    marquee: {
      label: 'Clases del gimnasio',
      items: ['Funcional', 'Fuerza', 'Yoga', 'Movilidad', 'Cardio en grupo'],
    },
    about: {
      kicker: '{{index}} — El gym',
      title:
        'Un lugar para <span class="lz-title__serif">volver</span> cada semana.',
      summary:
        'En {{shortName}} entrenas en grupos pequeños con un coach que conoce tu nombre, tu nivel y cómo vas avanzando.',
      statement:
        'Lo importante no es la primera semana, sino la décima: por eso cuidamos la técnica y el ritmo de cada quien.',
      image: 'about.jpg',
      imageAlt: 'Zona de pesas del gimnasio con racks y discos',
      sticker: 'Clase de prueba',
      paragraphs: [
        'Clases de 50 minutos de lunes a sábado, temprano y en la noche.',
        'Cada clase se adapta a tu nivel: empiezas con técnica y subes la carga con el coach.',
        'Si tienes alguna lesión, consulta a tu médico antes de empezar y avísanos.',
      ],
      stats: [
        { value: '6:00', label: 'Primera clase' },
        { value: '12', label: 'Personas por grupo' },
        { value: '4.9 ★', label: 'En Google' },
      ],
    },
    services: {
      kicker: '{{index}} — Membresías',
      title: 'Membresías y <span class="lz-title__serif">clases</span>',
      intro:
        'Precios en pesos mexicanos. Sin inscripción el primer mes; pregunta por pagos trimestrales.',
      prices: [
        {
          name: 'Clase suelta',
          price: '$150',
          description: 'Cualquier clase del horario, sin membresía.',
        },
        {
          name: '8 clases al mes',
          price: '$890',
          description: 'Dos clases por semana, en el horario que elijas.',
        },
        {
          name: 'Ilimitado',
          price: '$1,290',
          description: 'Todas las clases y el área de pesas libre.',
        },
        {
          name: 'Estudiante',
          price: '$990',
          description: 'Ilimitado con credencial vigente.',
        },
        {
          name: 'Entrenamiento personal',
          price: '$450',
          description: 'Sesión uno a uno con plan de trabajo.',
        },
        {
          name: 'Yoga y movilidad',
          price: '$690',
          description: 'Ocho clases al mes, para estirar y respirar.',
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
          tag: 'En pareja',
          title: 'Inscríbanse juntos',
          text: 'Dos membresías ilimitadas con 10 % de descuento el primer mes.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, queremos inscribirnos en pareja}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Fotos',
      title: 'Así se <span class="lz-title__serif">entrena</span> aquí',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Zona de pesas',
          alt: 'Racks y discos de pesas en fila',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Funcional',
          alt: 'Grupo haciendo sentadillas con balón',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Yoga',
          alt: 'Clase de yoga sobre tapetes con luz de mañana',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Técnica',
          alt: 'Coach corrigiendo la postura de una alumna',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Cardio',
          alt: 'Bicicletas fijas en una sala',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Kettlebells',
          alt: 'Kettlebells de colores en el piso',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Vestidores',
          alt: 'Vestidores con lockers y bancas',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Fachada del gimnasio con letrero iluminado',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Coaches',
      title: 'Quién te <span class="lz-title__serif">entrena</span>',
      members: [
        {
          name: 'Diego Salazar',
          role: 'Head coach',
          tags: ['Fuerza', 'Técnica'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Diego Salazar en la zona de pesas',
        },
        {
          name: 'Mónica Villa',
          role: 'Coach de funcional',
          tags: ['Funcional', 'Cardio'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Mónica Villa con una cuerda de saltar',
        },
        {
          name: 'Sergio Lara',
          role: 'Entrenador personal',
          tags: ['Uno a uno', 'Principiantes'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Sergio Lara sonriendo',
        },
        {
          name: 'Elena Campos',
          role: 'Yoga y movilidad',
          tags: ['Yoga', 'Respiración'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Elena Campos sobre un tapete de yoga',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.9',
      summary: '183 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Llegué sin saber nada y el coach me enseñó la técnica desde cero. Los grupos son pequeños y se nota.',
          author: 'Mauricio E.',
        },
        {
          text: 'El horario de las 6 de la mañana me salvó. Ya llevo un año viniendo tres veces por semana.',
          author: 'Karen D.',
        },
        {
          text: 'Ambiente buena onda, nadie te presiona. Las clases de yoga de los sábados son mis favoritas.',
          author: 'Luis F.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Horarios',
      title: 'Horarios y <span class="lz-title__serif">dudas</span>',
      intro:
        'Lo que suelen preguntarnos antes de inscribirse. Si tienes otra duda, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Qué horarios tienen?',
          answer:
            'Clases de lunes a viernes a las 6:00, 7:00, 8:00, 18:00, 19:00 y 20:00; sábados a las 9:00 y 10:00.',
        },
        {
          question: '¿Necesito experiencia?',
          answer:
            'No. Cada clase tiene opciones para principiantes y el coach ajusta la carga contigo.',
        },
        {
          question: '¿Cómo es la clase de prueba?',
          answer:
            'Escríbenos para apartar lugar, llega 10 minutos antes y trae agua y toalla.',
        },
        {
          question: '¿Hay inscripción?',
          answer:
            'El primer mes no pagas inscripción. Después, una cuota anual que te confirmamos al inscribirte.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Efectivo, tarjeta y transferencia; también pagos trimestrales.',
        },
        {
          question: '¿Tienen regaderas y lockers?',
          answer: 'Sí, vestidores con regaderas y lockers con candado propio.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Ven a tu <span class="lz-title__serif">primera clase</span>',
      contactText:
        'Respondemos mensajes en horario del gimnasio. Aparta tu clase de prueba con un día de anticipación.',
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
        'Gimnasio en {{city}}. Clases de funcional, fuerza y yoga en grupos pequeños, con coaches.',
      branchesTitle: 'Gimnasio',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
    },
  },
  heroAlternates: [
    'Grupos pequeños, <span class="lz-title__serif">técnica primero</span>.',
    'Empieza hoy con una <span class="lz-title__serif">clase de prueba</span>.',
    'Fuerza, movilidad y <span class="lz-title__serif">buena onda</span>.',
    'Tu gimnasio de barrio en <span class="lz-title__serif">{{branch}}</span>.',
  ],
  images: {
    hero: { query: 'people training weights gym', orientation: 'landscape' },
    about: { query: 'gym weight area racks', orientation: 'portrait' },
    'team-1': { query: 'fitness coach man portrait', orientation: 'portrait' },
    'team-2': {
      query: 'fitness coach woman jump rope',
      orientation: 'portrait',
    },
    'team-3': {
      query: 'personal trainer portrait smiling',
      orientation: 'portrait',
    },
    'team-4': { query: 'yoga instructor portrait', orientation: 'portrait' },
    'gallery-01': { query: 'gym racks plates', orientation: 'square' },
    'gallery-02': {
      query: 'group squats medicine ball',
      orientation: 'square',
    },
    'gallery-03': { query: 'yoga class morning light', orientation: 'square' },
    'gallery-04': { query: 'coach correcting posture', orientation: 'square' },
    'gallery-05': { query: 'stationary bikes room', orientation: 'square' },
    'gallery-06': { query: 'kettlebells floor', orientation: 'square' },
    'gallery-07': { query: 'gym lockers bench', orientation: 'square' },
    'gallery-08': { query: 'gym entrance sign', orientation: 'square' },
  },
  demoHours: {
    mon: [{ open: '06:00', close: '22:00' }],
    tue: [{ open: '06:00', close: '22:00' }],
    wed: [{ open: '06:00', close: '22:00' }],
    thu: [{ open: '06:00', close: '22:00' }],
    fri: [{ open: '06:00', close: '22:00' }],
    sat: [{ open: '08:00', close: '14:00' }],
  },
  priceRange: '$$',
} satisfies GiroDefinition;
