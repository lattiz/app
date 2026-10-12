// GENERATED from specs/despacho-cifra-clara.spec.json (spec 5019d2696c43, file 927f2638d508). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'despacho',
  locale: 'es-MX',
  business: {
    name: 'Cifra Clara',
    shortName: 'Cifra Clara',
    tagline: 'Despacho contable',
    city: 'Querétaro',
    phone: '+52 442 000 0000',
    whatsapp: '5214420000000',
    whatsappMessage: 'Hola, quiero agendar una asesoría',
    address: 'Blvd. Bernardo Quintana 4100, Piso 2, Centro Sur, Querétaro',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'contacto@cifraclara.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=cifra+clara+centro+sur',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=cifra+clara+centro+sur',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: contabilidad, declaraciones, nómina y asesoría fiscal para personas y empresas.',
  },
  sections: {
    navbar: {
      cta: 'Agendar asesoría',
      links: [
        {
          label: 'Despacho',
          href: '#nosotros',
        },
        {
          label: 'Servicios',
          href: '#servicios',
        },
        {
          label: 'Socios',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Contacto',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Contadora revisando documentos con un cliente en una oficina',
      eyebrow: 'Despacho contable · Centro Sur',
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
        {
          value: '+18 años',
          label: 'De experiencia',
        },
        {
          value: '+250',
          label: 'Clientes al mes',
        },
        {
          value: '4.8 ★',
          label: 'En Google',
        },
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
      branches: [
        {
          name: 'Centro Sur',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–18:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Centro Sur',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Agendar asesoría por WhatsApp',
    },
    footer: {
      about:
        'Despacho contable en {{city}}. Contabilidad, declaraciones, nómina y asesoría para personas y empresas.',
      branchesTitle: 'Oficina',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'Despacho',
          href: '#nosotros',
        },
        {
          label: 'Servicios',
          href: '#servicios',
        },
        {
          label: 'Socios',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Contacto',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'Centro Sur',
          address: '{{address}}',
          hours: 'Lun–Vie 9:00–18:00',
        },
      ],
    },
  },
} satisfies ContentPack;
