// GENERATED from specs/floreria-cardamina.spec.json (spec 2b263f80d11c, file 52a20013ecff). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'floreria',
  locale: 'es-MX',
  business: {
    name: 'Cardamina Florería Botánica',
    shortName: 'Cardamina',
    tagline: 'Diseño floral y botánico',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero cotizar un arreglo floral',
    address: 'Calle Michoacán 87, Col. Condesa, Cuauhtémoc, 06140 CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@cardamina.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=cardamina+floreria+botanica+condesa',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=cardamina+floreria+botanica+condesa',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en la Condesa, {{city}}: arreglos florales de diseño, eventos y diseño botánico con pedidos por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Cotizar',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Arreglos',
          href: '#servicios',
        },
        {
          label: 'Floristas',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Pedidos',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      image: 'hero.jpg',
      imageAlt:
        'Arreglo floral de diseño con follaje y flores en tonos verdes y blancos',
      eyebrow: 'Diseño floral · Condesa',
      title: 'Flores como <span class="lz-title__serif">composición</span>.',
      text: 'Arreglos de diseño, eventos íntimos y diseño botánico en la Condesa. Cuéntanos la ocasión por WhatsApp y te proponemos una composición.',
      primaryCta: 'Cotizar arreglo',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Pedidos con 48 h',
    },
    marquee: {
      label: 'Servicios de la florería',
      items: [
        'Arreglos de diseño',
        'Eventos y bodas',
        'Diseño botánico',
        'Suscripción floral',
        'Envíos en CDMX',
      ],
    },
    about: {
      kicker: '{{index}} — Taller',
      title:
        'Diseño botánico, <span class="lz-title__serif">hecho a mano</span>.',
      summary:
        'En {{shortName}} cada composición se piensa por color, textura y temporada. Trabajamos con pocos pedidos al día para cuidar cada detalle.',
      statement:
        'Cada arreglo parte de una idea: el espacio, la ocasión y la flor de temporada que mejor lo cuente.',
      image: 'about.jpg',
      imageAlt:
        'Mesa de taller con tallos, tijeras y cinta antes de armar un arreglo',
      sticker: 'Flor de temporada',
      paragraphs: [
        '{{shortName}} es un taller floral en la Condesa donde diseñamos arreglos, centros de mesa e instalaciones botánicas.',
        'Elegimos la flor según la temporada y el proveedor, y la acondicionamos antes de armar cada pieza.',
        'Para eventos visitamos el espacio o revisamos fotos contigo para proponer una paleta y una escala.',
      ],
      stats: [
        {
          value: '+9 años',
          label: 'De oficio floral',
        },
        {
          value: '48 h',
          label: 'Anticipación sugerida',
        },
        {
          value: '+120',
          label: 'Eventos diseñados',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Piezas y <span class="lz-title__serif">encargos</span>',
      intro:
        'Precios de ejemplo en pesos mexicanos. Los eventos se cotizan según espacio y flor.',
      prices: [
        {
          name: 'Ramo de diseño',
          price: '$650',
          description: 'Flor de temporada en paleta limitada, envuelto a mano.',
        },
        {
          name: 'Arreglo en jarrón',
          price: '$980',
          description:
            'Composición asimétrica con follaje, lista para exhibir.',
        },
        {
          name: 'Centro de mesa',
          price: 'Desde $720',
          description: 'Para cenas y eventos; la altura se ajusta a tu mesa.',
        },
        {
          name: 'Instalación botánica',
          price: 'Desde $4,500',
          description: 'Arco, muro o pérgola floral para bodas y eventos.',
        },
        {
          name: 'Planta de interior',
          price: '$420',
          description: 'En maceta de cerámica, con indicaciones de cuidado.',
        },
        {
          name: 'Suscripción floral',
          price: '$1,800',
          description: 'Una composición cada semana durante un mes.',
        },
      ],
      promos: [
        {
          tag: 'Eventos',
          title: 'Bodas y celebraciones privadas',
          text: 'Agenda una visita de diseño y recibe una propuesta de paleta y presupuesto por escrito.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar flores para un evento}}',
        },
        {
          tag: 'Empresas',
          title: 'Flores para recepción y oficinas',
          text: 'Arreglos semanales para tu espacio, con cambio programado y factura.',
          cta: 'Consultar',
          href: '{{whatsappUrl:Hola, quiero flores semanales para mi empresa}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Portafolio',
      title: 'Piezas <span class="lz-title__serif">recientes</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Centro de mesa',
          alt: 'Centro de mesa bajo con flores blancas y follaje verde',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Ramo de diseño',
          alt: 'Ramo de flores en tonos verdes y blancos envuelto en papel',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Instalación botánica',
          alt: 'Arco floral con follaje y flores en una boda al aire libre',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Arreglo en jarrón',
          alt: 'Jarrón de cerámica con una composición de flores y ramas',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Taller',
          alt: 'Mesa de taller con tallos, tijeras y cinta',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Plantas de interior',
          alt: 'Plantas de interior en macetas de cerámica sobre una repisa',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Evento',
          alt: 'Mesa de evento decorada con centros florales',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Fachada de la florería con plantas en la entrada',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Taller',
      title: 'Quién las <span class="lz-title__serif">diseña</span>',
      members: [
        {
          name: 'Inés Larrea',
          role: 'Dirección creativa',
          tags: ['Bodas', 'Paleta'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Inés Larrea en el taller floral',
        },
        {
          name: 'Tomás Rivadeneira',
          role: 'Diseño botánico',
          tags: ['Instalaciones', 'Follaje'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Tomás Rivadeneira entre plantas',
        },
        {
          name: 'Julia Anaya',
          role: 'Atención y pedidos',
          tags: ['Eventos', 'Envíos'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Julia Anaya sonriendo',
        },
        {
          name: 'Bruno Meza',
          role: 'Taller y entregas',
          tags: ['Mantenimiento', 'Rutas'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Bruno Meza junto a un arreglo',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '73 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Les mandé fotos del salón y propusieron una paleta que respetó todo. Los centros llegaron una hora antes.',
          author: 'Regina A.',
        },
        {
          text: 'Pedí un ramo para un aniversario y la tarjeta quedó escrita tal como la dicté. Llegó a tiempo.',
          author: 'Luis M.',
        },
        {
          text: 'Tienen flores de temporada que no encuentro en otros lugares. Me explicaron cómo cuidarlas.',
          author: 'Camila V.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que conviene saber antes de encargar. Para otros detalles, escríbenos por WhatsApp.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Con cuánto tiempo debo encargar?',
          answer:
            'Para ramos y arreglos, con 24 horas; para eventos, desde dos semanas antes para reservar flor y fecha.',
        },
        {
          question: '¿Hacen envíos?',
          answer:
            'Sí, en la Condesa, Roma y zonas cercanas. El costo se confirma según la dirección y el horario.',
        },
        {
          question: '¿Puedo elegir las flores?',
          answer:
            'Eliges colores y estilo; la variedad depende de la temporada y se confirma al armar tu pedido.',
        },
        {
          question: '¿Cómo cotizan un evento?',
          answer:
            'Revisamos fotos o visitamos el espacio y te enviamos propuesta de paleta y presupuesto por escrito.',
        },
        {
          question: '¿Cómo cuido mi arreglo?',
          answer:
            'Te damos indicaciones: agua limpia, lugar fresco sin sol directo y cambio de agua cada dos días.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Transferencia, tarjeta y efectivo. En eventos se pide un anticipo para reservar la fecha.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Taller',
      title: 'Visita o <span class="lz-title__serif">encarga</span>',
      contactText:
        'Recibimos pedidos por WhatsApp y visitas con cita en el taller. Cuéntanos fecha, lugar y estilo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Cotizar arreglo',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Pedir por WhatsApp',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Condesa',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–19:00 · Dom 10:00–15:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Condesa',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Cotizar por WhatsApp',
    },
    footer: {
      about:
        'Florería de diseño en la Condesa, {{city}}. Arreglos, eventos y diseño botánico con pedidos por WhatsApp.',
      branchesTitle: 'Taller',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Arreglos',
          href: '#servicios',
        },
        {
          label: 'Floristas',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Pedidos',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'Condesa',
          address: '{{address}}',
          hours: 'Lun–Sáb 9:00–19:00 · Dom 10:00–15:00',
        },
      ],
    },
  },
} satisfies ContentPack;
