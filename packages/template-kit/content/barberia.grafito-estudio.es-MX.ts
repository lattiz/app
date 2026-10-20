// GENERATED from specs/barberia-grafito-estudio.spec.json (spec e41ae60c038f, file e662cba9582c). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'barberia',
  locale: 'es-MX',
  business: {
    name: 'Grafito Estudio',
    shortName: 'Grafito Estudio',
    tagline: '',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero agendar una cita en Grafito Estudio',
    address: 'Calle Tabasco 212, Roma Norte, Cuauhtémoc, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@grafitoestudio.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=grafito+estudio+roma+norte',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=grafito+estudio+roma+norte',
  },
  head: {
    title: '{{name}}',
    description:
      'Grafito Estudio: tatuajes de autor y perforaciones en Roma Norte, CDMX. Diseño a medida, material estéril de un solo uso y citas por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Agendar cita',
      links: [
        {
          label: 'Estudio',
          href: '#nosotros',
        },
        {
          label: 'Carta',
          href: '#servicios',
        },
        {
          label: 'Preguntas',
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
        'Mano de tatuador con máquina de bobinas sobre una pieza en blanco y negro',
      eyebrow: 'Tatuaje de autor · Roma Norte',
      title: 'Arte permanente, trazo de precisión.',
      text: 'Tatuajes de autor y perforaciones con diseño a medida y material estéril de un solo uso. Una cita, una pieza, cero improvisación.',
      primaryCta: 'Agendar cita',
      secondaryCta: 'Ver tarifas',
      secondaryHref: '#servicios',
      sticker: 'Desde 2017',
      note: 'Material estéril · Diseño a medida',
    },
    about: {
      kicker: '{{index}} — Protocolo',
      title: 'Higiene clínica, mirada de galería.',
      summary:
        'Cada pieza empieza con una consulta y termina con indicaciones por escrito. Agujas y cartuchos de un solo uso, superficies desinfectadas entre cliente y cliente.',
      body: 'No hay prisa ni improvisación: revisamos la idea, dibujamos el boceto sobre tu zona y sólo entonces abrimos el material estéril. El estudio se ve como una galería porque se trabaja como un quirófano.',
      imageAlt:
        'Instrumental esterilizado sobre una charola de acero en el estudio',
      plateLabel: 'Higiene',
      plateTitle: 'Esterilización certificada',
      plateAside: 'CDMX',
      features: [
        {
          title: 'Esterilización en autoclave',
          text: 'Instrumental envuelto y fechado; lo abrimos frente a ti.',
        },
        {
          title: 'Diseño a medida',
          text: 'Boceto propio sobre tu idea, tamaño y zona antes de tatuar.',
        },
        {
          title: 'Cuidados de cicatrización',
          text: 'Indicaciones escritas del estudio para las semanas siguientes.',
        },
      ],
      stats: [
        {
          value: '+9 años',
          label: 'Tatuando en CDMX',
        },
        {
          value: '3 artistas',
          label: 'Con firma propia',
        },
        {
          value: '+4,000 piezas',
          label: 'Hechas en {{city}}',
        },
      ],
      statement:
        'Una pieza permanente se diseña antes de tatuarse: primero escuchamos, luego dibujamos.',
      image: 'about.jpg',
      paragraphs: [
        '{{shortName}} nació en 2017 como un cuarto blanco con una sola camilla en la colonia Roma. Hoy somos tres artistas con la misma regla: toda cita empieza con una consulta de diseño.',
        'Trabajamos con agujas y cartuchos de un solo uso, instrumental esterilizado en autoclave y superficies cubiertas en cada sesión.',
        'Sin prisa y sin plantillas. Sólo la pieza que viniste a buscar, bien dibujada.',
      ],
    },
    services: {
      note: 'Consulta de diseño sin costo y ficha de salud antes de cada pieza.',
      noteCta: 'Consultar disponibilidad →',
      prices: [
        {
          name: 'Flash del día',
          price: '$1,200',
          description: 'Diseños listos, hasta 8 cm, sin boceto largo.',
          duration: '1 hora',
        },
        {
          name: 'Pieza pequeña',
          price: '$2,500',
          description: 'Línea fina o sombreado de hasta 10 cm.',
          duration: '2 horas',
        },
        {
          name: 'Sesión por hora',
          price: '$1,800',
          description: 'Pieza mediana o continuación de un proyecto, por hora.',
          duration: '3 horas',
        },
        {
          name: 'Pieza de autor',
          price: '$6,500',
          description: 'Diseño original con boceto, en una o dos sesiones.',
          duration: '4 a 6 horas',
          badge: 'Pieza de autor',
        },
        {
          name: 'Perforación',
          price: '$900',
          description: 'Joyería de titanio implantable incluida.',
          duration: '30 minutos',
        },
        {
          name: 'Retoque',
          price: '$600',
          description: 'Ajuste de línea o color en piezas hechas aquí.',
          duration: '45 minutos',
        },
      ],
      kicker: '{{index}} — Tarifas',
      title: 'Tarifa clara por pieza',
      intro:
        'Precios en pesos mexicanos. El presupuesto final se confirma tras la consulta de diseño.',
      promos: [
        {
          tag: 'Nota',
          title: 'Consulta de diseño',
          text: 'La primera charla sobre tu idea dura veinte minutos y no tiene costo.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero una consulta de diseño en Grafito Estudio}}',
        },
        {
          tag: 'Nota',
          title: 'Proyectos grandes',
          text: 'Mangas y espaldas se planean por sesiones, con boceto aprobado antes de empezar.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar un proyecto grande}}',
        },
        {
          tag: 'Nota',
          title: 'Perforación',
          text: 'Revisamos zona y anatomía antes de perforar y elegimos joyería de titanio contigo.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero información de una perforación}}',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de tu cita',
      intro: 'Lo que más nos preguntan antes de la primera sesión.',
      cta: 'Escribir por WhatsApp',
      items: [
        {
          question: '¿Duele mucho?',
          answer:
            'Depende de la zona y de cada persona. Te contamos qué esperar antes de empezar y puedes pedir pausas durante la sesión.',
        },
        {
          question: '¿Cómo cuido mi tatuaje?',
          answer:
            'Al terminar te damos indicaciones escritas del estudio: lavado suave, hidratación y qué evitar durante las primeras semanas.',
        },
        {
          question: '¿Incluyen retoques?',
          answer:
            'Los ajustes de una pieza hecha aquí se agendan por WhatsApp y se cobran con la tarifa de retoque.',
        },
        {
          question: '¿Hay edad mínima?',
          answer:
            'Atendemos desde los 18 años con identificación oficial. Para perforaciones, consulta por WhatsApp.',
        },
        {
          question: '¿Puedo reprogramar mi cita?',
          answer:
            'Avísanos con 24 horas de anticipación y la movemos sin costo. Con menos aviso podemos pedir un nuevo anticipo.',
        },
        {
          question: '¿Cuánto cuesta una pieza?',
          answer:
            'Depende del tamaño, la zona y el tiempo. El presupuesto llega tras la consulta de diseño, que no tiene costo.',
        },
      ],
    },
    locations: {
      kicker: 'Cita por WhatsApp',
      hoursLabel: 'Horario',
      whatsappNote: 'Respuesta en horario del estudio',
      callNote: 'Llamada directa a recepción',
      emailNote: 'Para proyectos grandes y cotizaciones',
      whatsappCta: 'Agendar por WhatsApp',
      branches: [
        {
          name: 'Roma Norte',
          address: '{{address}}',
          hours: 'Mar–Sáb 12:00–20:00 · Dom con cita',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Roma Norte',
        },
      ],
      title: 'Llega o agenda tu sesión',
      callCta: 'Llamar',
      directionsLabel: 'Abrir en Google Maps',
      contactText:
        'Sin formularios ni llamadas perdidas. Cuéntanos tu idea por WhatsApp y te respondemos con fecha y consulta de diseño.',
      whatsappLabel: 'WhatsApp directo',
      whatsappValue: 'Agendar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
    },
    'floating-whatsapp': {
      label: 'Escribir a Grafito Estudio',
    },
    footer: {
      monogram: 'GE',
      motto: 'Arte · Precisión · Piel',
      about:
        'Estudio de tatuajes de autor y perforaciones en Roma Norte, CDMX. Material estéril de un solo uso y citas por WhatsApp.',
      branchesTitle: 'Estudio',
      branches: [
        {
          name: 'Roma Norte',
          address: '{{address}}',
          hours: 'Mar–Sáb 12:00–20:00 · Dom con cita',
        },
      ],
      linksTitle: 'Secciones',
      links: [
        {
          label: 'Estudio',
          href: '#nosotros',
        },
        {
          label: 'Carta',
          href: '#servicios',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#sucursales',
        },
      ],
      contactTitle: 'Contacto',
    },
    team: {
      kicker: '{{index}} — Artistas',
      title: 'Artistas del estudio',
      members: [
        {
          name: 'Mara Quintero',
          role: 'Fundadora · línea fina',
          tags: ['Línea fina', 'Botánico'],
          image: 'team-1.jpg',
          imageAlt:
            'Retrato en blanco y negro de Mara Quintero junto a su estación',
        },
        {
          name: 'Dante Ibarra',
          role: 'Blackwork y gran formato',
          tags: ['Blackwork', 'Sombreado'],
          image: 'team-2.jpg',
          imageAlt:
            'Retrato en blanco y negro de Dante Ibarra con una máquina de tatuar',
        },
        {
          name: 'Noa Beltrán',
          role: 'Perforación corporal',
          tags: ['Titanio', 'Joyería'],
          image: 'team-3.jpg',
          imageAlt:
            'Retrato en blanco y negro de Noa Beltrán con joyería de titanio',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Trabajo',
      title: 'Archivo de piezas',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Línea fina botánica',
          alt: 'Tatuaje de línea fina de una rama botánica en un antebrazo',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Blackwork geométrico',
          alt: 'Tatuaje de blackwork con formas geométricas en un brazo',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Sombreado en blanco y negro',
          alt: 'Tatuaje con sombreado en blanco y negro sobre un hombro',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Piercing en titanio',
          alt: 'Perforación de oreja con joyería de titanio',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'La cabina, siempre limpia',
          alt: 'Cabina del estudio con camilla, luz cenital y paredes blancas',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Pieza de gran formato',
          alt: 'Tatuaje de gran formato en una espalda',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Instrumental estéril',
          alt: 'Instrumental esterilizado ordenado sobre una charola',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Detalle de línea',
          alt: 'Detalle de una línea fina recién tatuada',
        },
      ],
    },
    testimonials: {
      kicker: 'Clientes del estudio',
      title: 'Piezas que se quedan',
      intro: 'Opiniones de ejemplo de quienes ya traen su pieza.',
      reviews: [
        {
          text: 'Llegué con una idea vaga y salí con un boceto que la mejoraba. El estudio parece un quirófano, en el buen sentido.',
          author: 'Camila R.',
          place: 'Colonia Roma',
        },
        {
          text: 'Me explicaron cada paso de la perforación y los cuidados por escrito. Cero prisa, cero presión.',
          author: 'Diego T.',
          place: 'Condesa',
        },
        {
          text: 'Mi primer tatuaje fue aquí. Me dejaron ver el material nuevo abrirse frente a mí.',
          author: 'Valeria S.',
          place: 'Juárez',
        },
      ],
      score: '4.9',
      summary: 'Opiniones de ejemplo',
      allReviewsCta: 'Leer todas',
      writeReviewCta: 'Escribir una opinión',
    },
    marquee: {
      label: 'Especialidades del estudio',
      items: [
        'Línea fina',
        'Blackwork',
        'Piercing',
        'Diseño a medida',
        'Material estéril',
      ],
    },
  },
} satisfies ContentPack;
