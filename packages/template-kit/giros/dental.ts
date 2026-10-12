import type { GiroDefinition } from '../src/spec/giro';
import { palette } from '../src/spec/presets';

/** Consultorio dental / ortodoncia: tratamientos con precio de referencia, especialistas con cédula, citas. */

export default {
  id: 'dental',
  label: 'Consultorio dental',
  aliases: [
    'dentista',
    'consultorio dental',
    'clínica dental',
    'ortodoncia',
    'ortodoncista',
    'odontopediatría',
    'endodoncia',
    'implantes dentales',
    'limpieza dental',
  ],
  rules: [
    'Giro regulado: nada de «sin dolor», «sonrisa perfecta», «resultados garantizados» ni antes/después.',
    'Cédulas como marcador: «Cédula profesional 0000000»; el cliente pone la real. Nunca una cédula real.',
    'Precios «desde» y de referencia: el plan exacto se da tras la valoración.',
    'Urgencias: indica llamar o escribir; no diagnósticos por WhatsApp.',
  ],
  category: 'dentales',
  businessCategory: 'dental',
  schemaType: 'Dentist',
  description: {
    pro: 'Consultorio dental con identidad propia: tratamientos, especialistas, instalaciones, reseñas, preguntas y citas',
    basico:
      'Consultorio dental: tratamientos con precios de referencia, preguntas frecuentes y ubicación',
  },
  palettes: {
    nube: palette({
      label: 'Nube (claro, azul)',
      scheme: 'light',
      bg: '#F4F7FB',
      surface: '#FFFFFF',
      surface2: '#E1E9F3',
      text: '#0F1A2A',
      muted: '#475569',
      accent: '#1F5FA6',
      onAccent: '#FFFFFF',
      accentText: '#2F6CB0',
      photoTreatment: 'none',
      placeholder: 'dots',
    }),
    agua: palette({
      label: 'Agua (claro, verde agua)',
      scheme: 'light',
      bg: '#F2F8F6',
      surface: '#FFFFFF',
      surface2: '#DCEDE7',
      text: '#0E201B',
      muted: '#455E57',
      accent: '#187A64',
      onAccent: '#FFFFFF',
      accentText: '#187A64',
      overlay: 'bg',
      photoTreatment: 'none',
      placeholder: 'rules',
    }),
    coral: palette({
      label: 'Coral (claro, cálido)',
      scheme: 'light',
      bg: '#FBF6F3',
      surface: '#FFFFFF',
      surface2: '#F2E5DE',
      text: '#24160F',
      muted: '#61514A',
      accent: '#B23C2E',
      onAccent: '#FFFFFF',
      accentText: '#B54436',
      photoTreatment: 'warm',
      placeholder: 'arches',
    }),
    iris: palette({
      label: 'Iris (claro, violeta azulado)',
      scheme: 'light',
      bg: '#F5F5FB',
      surface: '#FFFFFF',
      surface2: '#E5E4F3',
      text: '#16152B',
      muted: '#4E4D68',
      accent: '#5446B5',
      onAccent: '#FFFFFF',
      accentText: '#695CBE',
      photoTreatment: 'none',
      placeholder: 'blobs',
    }),
    grafito: palette({
      label: 'Grafito (oscuro, acento ámbar)',
      scheme: 'dark',
      bg: '#11161B',
      surface: '#182028',
      surface2: '#212B35',
      text: '#ECF2F7',
      muted: '#A5B3C1',
      accent: '#F1C25B',
      onAccent: '#11161B',
      accentText: '#F3CB72',
      photoTreatment: 'none',
      placeholder: 'grain',
    }),
  },
  fontPairs: [
    'sora+inter',
    'lora+figtree',
    'bricolage-grotesque+inter',
    'libre-baskerville+source-sans-3',
    'fraunces+nunito-sans',
  ],
  shapes: ['suave', 'redondo', 'sutil', 'organico'],
  sections: {
    pro: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'split' },
      { role: 'about', variant: 'stats-strip' },
      { role: 'catalog', variant: 'cards' },
      { role: 'team', variant: 'grid' },
      { role: 'proof', variant: 'grid' },
      { role: 'testimonials', variant: 'cards' },
      { role: 'faq', variant: 'two-col' },
      { role: 'contact', variant: 'with-contact' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'columns' },
    ],
    basico: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'image-bg' },
      { role: 'about', variant: 'brief' },
      { role: 'catalog', variant: 'cards' },
      { role: 'faq', variant: 'list' },
      { role: 'contact', variant: 'single' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'minimal-centered' },
    ],
  },
  motion: { preset: 'calm', progress: false },
  navLabels: {
    about: 'Consultorio',
    services: 'Tratamientos',
    team: 'Especialistas',
    gallery: 'Instalaciones',
    testimonials: 'Opiniones',
    faq: 'Preguntas',
    locations: 'Citas',
  },
  business: {
    tagline: 'Consultorio dental',
    whatsappMessage: 'Hola, quiero agendar una valoración',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    city: 'CDMX',
    hours: 'Lun–Vie 9:00–19:00 · Sáb 9:00–14:00',
    address: 'Av. Ejemplo 210, Col. Centro, CDMX',
    branch: 'Centro',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: limpieza, resinas, ortodoncia y más, con valoración previa y citas por WhatsApp.',
  },
  copy: {
    navbar: { cta: 'Agendar cita' },
    hero: {
      image: 'hero.jpg',
      imageAlt:
        'Dentista explicando un tratamiento a una paciente en el consultorio',
      eyebrow: 'Consultorio dental · {{branch}}',
      title: 'Cuidamos tu boca <span class="lz-title__serif">con calma</span>.',
      text: 'Valoración con tiempo para tus dudas, un plan por escrito con precios y recordatorios por WhatsApp. Agenda en un mensaje.',
      primaryCta: 'Agendar valoración',
      secondaryCta: 'Ver tratamientos',
      secondaryHref: '#servicios',
      sticker: 'Citas esta semana',
    },
    marquee: {
      label: 'Tratamientos del consultorio',
      items: [
        'Limpieza dental',
        'Resinas',
        'Ortodoncia',
        'Odontopediatría',
        'Blanqueamiento',
      ],
    },
    about: {
      kicker: '{{index}} — Consultorio',
      title:
        'Explicamos todo <span class="lz-title__serif">antes</span> de empezar.',
      summary:
        'En {{shortName}} cada tratamiento empieza con una valoración: revisamos, te mostramos lo que vemos y te damos un plan por escrito con precios.',
      statement:
        'Antes de tocar un diente, te explicamos qué vemos, qué opciones hay y cuánto cuesta cada una.',
      image: 'about.jpg',
      imageAlt: 'Sala de espera del consultorio dental con luz natural',
      sticker: 'Cédula profesional 0000000',
      paragraphs: [
        'Trabajamos con cita para respetar tu tiempo; las consultas no se empalman.',
        'Esterilizamos el instrumental en cada cita y usamos material desechable.',
        'Te mandamos recordatorios y el plan de tratamiento por WhatsApp o correo.',
      ],
      stats: [
        { value: '+12 años', label: 'De consulta' },
        { value: '4', label: 'Especialistas' },
        { value: '4.9 ★', label: 'En Google' },
      ],
    },
    services: {
      kicker: '{{index}} — Tratamientos',
      title: 'Tratamientos y <span class="lz-title__serif">precios</span>',
      intro:
        'Precios de referencia en pesos mexicanos; el plan exacto se define en la valoración.',
      prices: [
        {
          name: 'Valoración',
          price: '$350',
          description: 'Revisión, fotos intraorales y plan por escrito.',
        },
        {
          name: 'Limpieza dental',
          price: '$750',
          description: 'Profilaxis con ultrasonido y pulido.',
        },
        {
          name: 'Resina',
          price: 'Desde $900',
          description: 'Restauración del color de tu diente, por pieza.',
        },
        {
          name: 'Ortodoncia',
          price: '$1,200/mes',
          description: 'Brackets o alineadores, según valoración.',
        },
        {
          name: 'Blanqueamiento',
          price: 'Desde $3,500',
          description: 'En consultorio, después de una limpieza.',
        },
        {
          name: 'Consulta de niños',
          price: '$450',
          description: 'Revisión, flúor y consejos para casa.',
        },
      ],
      promos: [
        {
          tag: 'Primera visita',
          title: 'Valoración y limpieza el mismo día',
          text: 'Agenda las dos en una cita y te damos 10 % en la limpieza.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero valoración y limpieza el mismo día}}',
        },
        {
          tag: 'Familias',
          title: 'Revisión para toda la familia',
          text: 'Agenda a dos o más integrantes en el mismo horario.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar una revisión familiar}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Instalaciones',
      title: 'Un consultorio <span class="lz-title__serif">tranquilo</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción del consultorio con mostrador blanco',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Sillón dental',
          alt: 'Sillón dental junto a una ventana',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Esterilización',
          alt: 'Área de esterilización con instrumental empaquetado',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Radiografía',
          alt: 'Equipo de radiografía dental en una pared',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Sala de espera',
          alt: 'Sala de espera con sillas y plantas',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Para niños',
          alt: 'Rincón infantil con libros y juguetes',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Instrumental',
          alt: 'Charola con instrumental dental ordenado',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Puerta de entrada del consultorio',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Especialistas',
      title: 'Quién te <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'Dra. Adriana Fuentes',
          role: 'Cirujana dentista',
          tags: ['Cédula 0000000', 'Prevención'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de la Dra. Adriana Fuentes con filipina',
        },
        {
          name: 'Dr. Raúl Medina',
          role: 'Ortodoncia',
          tags: ['Cédula 0000000', 'Brackets'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato del Dr. Raúl Medina en el consultorio',
        },
        {
          name: 'Dra. Itzel Navarro',
          role: 'Odontopediatría',
          tags: ['Cédula 0000000', 'Niños'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de la Dra. Itzel Navarro sonriendo',
        },
        {
          name: 'Dr. Javier Ponce',
          role: 'Endodoncia',
          tags: ['Cédula 0000000', 'Conductos'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato del Dr. Javier Ponce junto a una ventana',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '164 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Me explicaron el plan con fotos y precios antes de empezar. Nada de sorpresas en la cuenta.',
          author: 'Alejandra V.',
        },
        {
          text: 'Mi hijo tenía miedo y la doctora tuvo toda la paciencia. Ahora pregunta cuándo vuelve.',
          author: 'Héctor M.',
        },
        {
          text: 'Agendé por WhatsApp, me recordaron la cita un día antes y me atendieron puntual.',
          author: 'Brenda S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que suelen preguntarnos antes de la primera cita. Si tienes otra duda, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cuánto cuesta la valoración?',
          answer:
            'La valoración cuesta $350 e incluye revisión, fotos y un plan por escrito con precios.',
        },
        {
          question: '¿Atienden urgencias?',
          answer:
            'Llámanos o escríbenos: en horario de consulta buscamos un espacio el mismo día.',
        },
        {
          question: '¿Atienden a niños?',
          answer:
            'Sí, con una odontopediatra y citas pensadas para que los niños vayan tranquilos.',
        },
        {
          question: '¿Puedo pagar la ortodoncia por mes?',
          answer:
            'Sí: un pago inicial y mensualidades durante el tratamiento. Te lo detallamos en la valoración.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Efectivo, tarjetas de débito y crédito, y transferencia. Damos factura.',
        },
        {
          question: '¿Cómo cambio mi cita?',
          answer:
            'Avísanos por WhatsApp con 24 horas de anticipación y te damos otro horario.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Agenda tu <span class="lz-title__serif">cita</span>',
      contactText:
        'Respondemos mensajes en horario de consulta. Si tienes dolor o una urgencia, mejor llámanos.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Agendar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Agendar por WhatsApp',
      callCta: 'Llamar',
    },
    'floating-whatsapp': { label: 'Agendar cita dental por WhatsApp' },
    footer: {
      about:
        'Consultorio dental en {{city}}. Valoración, limpieza, resinas y ortodoncia con cita por WhatsApp.',
      branchesTitle: 'Consultorio',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
    },
  },
  heroAlternates: [
    'Tu dentista de confianza en <span class="lz-title__serif">{{branch}}</span>.',
    'Un plan claro <span class="lz-title__serif">antes</span> de cada tratamiento.',
    'Citas puntuales y <span class="lz-title__serif">sin sorpresas</span>.',
    'Odontología para <span class="lz-title__serif">toda la familia</span>.',
  ],
  images: {
    hero: {
      query: 'dentist explaining patient clinic',
      orientation: 'landscape',
    },
    about: { query: 'dental clinic waiting room', orientation: 'portrait' },
    'team-1': { query: 'female dentist portrait', orientation: 'portrait' },
    'team-2': { query: 'male dentist portrait', orientation: 'portrait' },
    'team-3': { query: 'pediatric dentist portrait', orientation: 'portrait' },
    'team-4': { query: 'dentist man portrait window', orientation: 'portrait' },
    'gallery-01': { query: 'dental clinic reception', orientation: 'square' },
    'gallery-02': { query: 'dental chair window', orientation: 'square' },
    'gallery-03': { query: 'dental sterilization', orientation: 'square' },
    'gallery-04': { query: 'dental x-ray equipment', orientation: 'square' },
    'gallery-05': {
      query: 'clinic waiting room plants',
      orientation: 'square',
    },
    'gallery-06': { query: 'kids corner toys books', orientation: 'square' },
    'gallery-07': { query: 'dental instruments tray', orientation: 'square' },
    'gallery-08': { query: 'clinic door entrance', orientation: 'square' },
  },
  demoHours: {
    mon: [{ open: '09:00', close: '19:00' }],
    tue: [{ open: '09:00', close: '19:00' }],
    wed: [{ open: '09:00', close: '19:00' }],
    thu: [{ open: '09:00', close: '19:00' }],
    fri: [{ open: '09:00', close: '19:00' }],
    sat: [{ open: '09:00', close: '14:00' }],
  },
  priceRange: '$$',
} satisfies GiroDefinition;
