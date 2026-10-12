import type { GiroDefinition } from '../src/spec/giro';
import { palette } from '../src/spec/presets';

/**
 * Despacho contable o jurídico: servicios con honorarios de referencia, socios con cédula, preguntas
 * y citas. El copy por defecto es contable; un despacho jurídico cambia services/faq en el spec y
 * pone demoProfile.category = "legal".
 */

export default {
  id: 'despacho',
  label: 'Despacho contable o jurídico',
  aliases: [
    'despacho contable',
    'contador',
    'contadora',
    'contabilidad',
    'despacho jurídico',
    'abogado',
    'abogada',
    'despacho fiscal',
    'asesoría fiscal',
    'gestoría',
    'consultoría',
  ],
  rules: [
    'Giro regulado: sin «ganamos tu juicio», «evita multas», «recupera tu dinero» ni promesas de resultado fiscal o legal.',
    'Cédulas como marcador: «Cédula profesional 0000000»; nunca una cédula, RFC o número de registro real.',
    'Honorarios «desde» y de referencia; el monto exacto, en la cotización.',
    'Jurídico: cambia services, faq y about en el spec y pon "demoProfile": { "category": "legal" }.',
  ],
  category: 'despachos',
  businessCategory: 'accounting',
  schemaType: 'AccountingService',
  description: {
    pro: 'Despacho con identidad propia: servicios, socios, el despacho en fotos, reseñas, preguntas y citas',
    basico:
      'Despacho profesional: servicios con honorarios de referencia, preguntas frecuentes y ubicación',
  },
  palettes: {
    marino: palette({
      label: 'Marino (claro, azul serio)',
      scheme: 'light',
      bg: '#F5F6F8',
      surface: '#FFFFFF',
      surface2: '#E3E7EE',
      text: '#111827',
      muted: '#4B5563',
      accent: '#1E3A6E',
      onAccent: '#FFFFFF',
      accentText: '#546991',
      photoTreatment: 'none',
      placeholder: 'rules',
    }),
    ingles: palette({
      label: 'Verde inglés (claro, sobrio)',
      scheme: 'light',
      bg: '#F5F6F2',
      surface: '#FFFFFF',
      surface2: '#E2E6DC',
      text: '#141B15',
      muted: '#4A554B',
      accent: '#23573F',
      onAccent: '#FFFFFF',
      accentText: '#46725E',
      photoTreatment: 'none',
      placeholder: 'dots',
    }),
    vino: palette({
      label: 'Vino (claro, tinto)',
      scheme: 'light',
      bg: '#F9F6F4',
      surface: '#FFFFFF',
      surface2: '#EEE4E1',
      text: '#1F1416',
      muted: '#5B4B4E',
      accent: '#7A2433',
      onAccent: '#FFFFFF',
      accentText: '#975460',
      photoTreatment: 'none',
      placeholder: 'arches',
    }),
    berenjena: palette({
      label: 'Berenjena (claro, morado)',
      scheme: 'light',
      bg: '#F7F5F9',
      surface: '#FFFFFF',
      surface2: '#E7E2EE',
      text: '#1B1624',
      muted: '#544D60',
      accent: '#5B3A7A',
      onAccent: '#FFFFFF',
      accentText: '#795D92',
      photoTreatment: 'none',
      placeholder: 'blobs',
    }),
    nocturno: palette({
      label: 'Nocturno (oscuro, acento oro)',
      scheme: 'dark',
      bg: '#0F1319',
      surface: '#161C24',
      surface2: '#1F2730',
      text: '#EEF1F5',
      muted: '#A9B2BE',
      accent: '#E0B85A',
      onAccent: '#0F1319',
      accentText: '#E6C472',
      photoTreatment: 'none',
      placeholder: 'grain',
    }),
  },
  fontPairs: [
    'libre-baskerville+source-sans-3',
    'playfair-display+inter',
    'instrument-serif+instrument-sans',
    'sora+inter',
    'dm-serif-display+dm-sans',
  ],
  shapes: ['filete', 'sutil', 'urbano', 'suave'],
  sections: {
    pro: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'image-bg' },
      { role: 'about', variant: 'statement' },
      { role: 'catalog', variant: 'editorial-table' },
      { role: 'team', variant: 'list' },
      { role: 'proof', variant: 'strip' },
      { role: 'testimonials', variant: 'quote-feature' },
      { role: 'faq', variant: 'two-col' },
      { role: 'contact', variant: 'with-contact' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'columns' },
    ],
    basico: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'split' },
      { role: 'about', variant: 'brief' },
      { role: 'catalog', variant: 'editorial-table' },
      { role: 'faq', variant: 'list' },
      { role: 'contact', variant: 'single' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'columns' },
    ],
  },
  motion: { preset: 'editorial', progress: false },
  navLabels: {
    about: 'Despacho',
    services: 'Servicios',
    team: 'Socios',
    gallery: 'Oficina',
    testimonials: 'Clientes',
    faq: 'Preguntas',
    locations: 'Contacto',
  },
  business: {
    tagline: 'Despacho contable',
    whatsappMessage: 'Hola, quiero agendar una asesoría',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    city: 'CDMX',
    hours: 'Lun–Vie 9:00–18:00',
    address: 'Av. Ejemplo 500, Piso 3, Col. Centro, CDMX',
    branch: 'Centro',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: contabilidad, declaraciones, nómina y asesoría fiscal para personas y empresas.',
  },
  copy: {
    navbar: { cta: 'Agendar asesoría' },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Contadora revisando documentos con un cliente en una oficina',
      eyebrow: 'Despacho contable · {{branch}}',
      title:
        'Tus cuentas <span class="lz-title__serif">en orden</span>, cada mes.',
      text: 'Contabilidad, declaraciones y nómina para personas y empresas, con un contador que te contesta. Agenda tu primera asesoría.',
      primaryCta: 'Agendar asesoría',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Primera asesoría',
    },
    marquee: {
      label: 'Servicios del despacho',
      items: [
        'Contabilidad mensual',
        'Declaraciones',
        'Nómina',
        'Constitución de empresas',
        'Asesoría fiscal',
      ],
    },
    about: {
      kicker: '{{index}} — Despacho',
      title: 'Números claros y <span class="lz-title__serif">a tiempo</span>.',
      summary:
        'En {{shortName}} llevamos la contabilidad de personas y pequeñas empresas: te avisamos fechas, te explicamos cada declaración y contestamos tus dudas.',
      statement:
        'Llevar tus cuentas es también explicártelas: qué pagas, por qué y qué viene el próximo mes.',
      image: 'about.jpg',
      imageAlt: 'Oficina del despacho con escritorio, carpetas y luz natural',
      sticker: 'Cédula profesional 0000000',
      paragraphs: [
        'Cada cliente tiene un contador asignado que conoce su caso y le contesta por WhatsApp o correo.',
        'Te mandamos un resumen mensual con lo que se presentó y lo que sigue.',
        'Trabajamos en línea o en la oficina, como te acomode.',
      ],
      stats: [
        { value: '+18 años', label: 'De experiencia' },
        { value: '+250', label: 'Clientes al mes' },
        { value: '4.8 ★', label: 'En Google' },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Servicios y <span class="lz-title__serif">honorarios</span>',
      intro:
        'Honorarios de referencia en pesos, más IVA. Te mandamos una cotización según tu régimen y volumen.',
      prices: [
        {
          name: 'Contabilidad mensual',
          price: 'Desde $1,200',
          description: 'Registro, declaraciones mensuales y resumen.',
        },
        {
          name: 'Declaración anual',
          price: 'Desde $900',
          description: 'Personas físicas, con revisión de deducciones.',
        },
        {
          name: 'Nómina',
          price: '$90/persona',
          description: 'Cálculo, recibos y altas o bajas ante el IMSS.',
        },
        {
          name: 'Constitución de empresa',
          price: 'Cotiza',
          description: 'Acompañamiento en el alta y primeros trámites.',
        },
        {
          name: 'Regularización',
          price: 'Cotiza',
          description: 'Revisamos meses pendientes y armamos un plan.',
        },
        {
          name: 'Asesoría',
          price: '$600/hora',
          description: 'Una hora para revisar tu caso y resolver dudas.',
        },
      ],
      promos: [
        {
          tag: 'Primera vez',
          title: 'Primera asesoría de 30 minutos',
          text: 'Revisamos tu situación y te decimos qué servicio necesitas, sin compromiso.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero la primera asesoría de 30 minutos}}',
        },
        {
          tag: 'Empresas',
          title: 'Paquete contabilidad + nómina',
          text: 'Para empresas de hasta 20 empleados, con un solo contador de contacto.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar contabilidad y nómina}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Oficina',
      title: 'Dónde <span class="lz-title__serif">trabajamos</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción del despacho con sillas y una planta',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Sala de juntas',
          alt: 'Sala de juntas con mesa de madera',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Escritorios',
          alt: 'Escritorios con computadoras y documentos ordenados',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Archivo',
          alt: 'Estantes con carpetas archivadas',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Reunión',
          alt: 'Dos personas revisando una laptop en una mesa',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Biblioteca',
          alt: 'Libros de consulta en una repisa',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Café',
          alt: 'Taza de café junto a una libreta',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Edificio',
          alt: 'Fachada del edificio de oficinas',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Socios',
      title: 'Quién lleva tu <span class="lz-title__serif">caso</span>',
      members: [
        {
          name: 'C.P. Gabriela Ochoa',
          role: 'Socia directora',
          tags: ['Cédula 0000000', 'Empresas'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de la C.P. Gabriela Ochoa en la oficina',
        },
        {
          name: 'C.P. Martín Aguilar',
          role: 'Socio fiscal',
          tags: ['Cédula 0000000', 'Personas físicas'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato del C.P. Martín Aguilar con saco',
        },
        {
          name: 'Lic. Daniela Reyes',
          role: 'Nómina',
          tags: ['IMSS', 'Recibos'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de la Lic. Daniela Reyes sonriendo',
        },
        {
          name: 'Lic. Óscar Vela',
          role: 'Atención a clientes',
          tags: ['Citas', 'Documentos'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato del Lic. Óscar Vela junto a una ventana',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Clientes',
      score: '4.8',
      summary: '97 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Por fin entiendo qué pago cada mes. Me mandan un resumen claro y me contestan rápido.',
          author: 'Rodrigo T.',
        },
        {
          text: 'Nos ayudaron a ponernos al corriente con varios meses pendientes, paso a paso y sin regaños.',
          author: 'Patricia N.',
        },
        {
          text: 'Llevan la nómina de mi negocio desde hace años. Puntuales con cada fecha.',
          author: 'Arturo C.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que suelen preguntarnos antes de contratar. Para tu caso en particular, agenda una asesoría.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Atienden a personas físicas?',
          answer:
            'Sí: asalariados, profesionistas, arrendadores y pequeños negocios, además de empresas.',
        },
        {
          question: '¿Qué necesito para empezar?',
          answer:
            'Tu constancia de situación fiscal y acceso a tu información; en la primera asesoría te damos la lista completa.',
        },
        {
          question: '¿Trabajan en línea?',
          answer:
            'Sí. Puedes mandar todo por correo o WhatsApp y vernos por videollamada.',
        },
        {
          question: '¿Cuánto cobran?',
          answer:
            'Depende de tu régimen y volumen. Te mandamos una cotización por escrito antes de empezar.',
        },
        {
          question: '¿Me ayudan si tengo meses atrasados?',
          answer:
            'Sí: revisamos qué falta y te proponemos un plan para ponerte al corriente.',
        },
        {
          question: '¿Dan factura?',
          answer: 'Sí, por todos nuestros servicios.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Contacto',
      title: 'Agenda una <span class="lz-title__serif">asesoría</span>',
      contactText:
        'Respondemos mensajes en horario de oficina. Las asesorías son presenciales o por videollamada.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Agendar asesoría',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Escribir por WhatsApp',
      callCta: 'Llamar',
    },
    'floating-whatsapp': { label: 'Agendar asesoría por WhatsApp' },
    footer: {
      about:
        'Despacho contable en {{city}}. Contabilidad, declaraciones, nómina y asesoría para personas y empresas.',
      branchesTitle: 'Oficina',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
    },
  },
  heroAlternates: [
    'Contabilidad <span class="lz-title__serif">clara</span> para tu negocio.',
    'Un contador que <span class="lz-title__serif">te contesta</span>.',
    'Declaraciones a tiempo, <span class="lz-title__serif">sin enredos</span>.',
    'Tu despacho de confianza en <span class="lz-title__serif">{{branch}}</span>.',
  ],
  images: {
    hero: {
      query: 'accountant meeting client office documents',
      orientation: 'landscape',
    },
    about: {
      query: 'office desk folders natural light',
      orientation: 'portrait',
    },
    'team-1': {
      query: 'businesswoman portrait office',
      orientation: 'portrait',
    },
    'team-2': { query: 'businessman portrait suit', orientation: 'portrait' },
    'team-3': {
      query: 'young professional woman portrait',
      orientation: 'portrait',
    },
    'team-4': {
      query: 'young professional man portrait window',
      orientation: 'portrait',
    },
    'gallery-01': { query: 'office reception plant', orientation: 'square' },
    'gallery-02': { query: 'meeting room wooden table', orientation: 'square' },
    'gallery-03': { query: 'office desks computers', orientation: 'square' },
    'gallery-04': { query: 'archive shelves folders', orientation: 'square' },
    'gallery-05': { query: 'two people laptop meeting', orientation: 'square' },
    'gallery-06': { query: 'books shelf office', orientation: 'square' },
    'gallery-07': { query: 'coffee notebook desk', orientation: 'square' },
    'gallery-08': { query: 'office building facade', orientation: 'square' },
  },
  demoHours: {
    mon: [{ open: '09:00', close: '18:00' }],
    tue: [{ open: '09:00', close: '18:00' }],
    wed: [{ open: '09:00', close: '18:00' }],
    thu: [{ open: '09:00', close: '18:00' }],
    fri: [{ open: '09:00', close: '18:00' }],
  },
  priceRange: '$$',
} satisfies GiroDefinition;
