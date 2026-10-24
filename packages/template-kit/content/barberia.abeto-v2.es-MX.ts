// GENERATED from specs/barberia-abeto-v2.spec.json (spec 6e61ec7e3369, file 8316412cf659). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'barberia',
  locale: 'es-MX',
  business: {
    name: 'Abeto Barbería',
    shortName: 'Abeto',
    tagline: 'Barbería de caballeros',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero reservar una cita en Abeto',
    address: 'Av. de la Paz 38, San Ángel, Álvaro Obregón, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'citas@abetobarberia.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=abeto+barberia+san+angel',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=abeto+barberia+san+angel',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en San Ángel, {{city}}: ritual de afeitado con navaja, corte a tijera y barba, solo con cita por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Reservar',
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
          label: 'Barberos',
          href: '#equipo',
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
        'Interior de una barbería con sillones de cuero y espejos en una pared verde',
      eyebrow: 'Barbería de caballeros · San Ángel',
      title: 'El ritual de la <span class="lz-title__serif">navaja</span>.',
      text: 'Afeitado con toalla caliente, corte a tijera y un sillón de cuero que te espera a tu hora. Reserva en un mensaje.',
      primaryCta: 'Reservar cita',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Desde 2016',
      kicker: 'Apertura',
      tag: 'San Ángel · CDMX',
      info: [
        {
          label: 'Horario',
          value: 'Mar–Sáb 10:00–21:00',
        },
        {
          label: 'Colonia',
          value: 'San Ángel',
        },
        {
          label: 'Cita',
          value: 'En un mensaje de WhatsApp',
        },
      ],
    },
    about: {
      kicker: '{{index}} — La casa',
      title:
        'Oficio clásico, <span class="lz-title__serif">trato de hoy</span>.',
      summary:
        'En {{shortName}} la barbería se hace como antes: navaja recta, toalla caliente y tiempo. Pocas sillas, citas espaciadas y un barbero que recuerda cómo te gusta el corte.',
      stats: [
        {
          value: '4',
          label: 'Sillones de cuero',
        },
        {
          value: '45',
          label: 'Minutos por cita',
        },
        {
          value: '4.9 ★',
          label: 'En Google',
        },
      ],
      statement:
        'Una buena navaja no se apura: cada afeitado empieza con vapor, sigue con dos pasadas y termina en silencio.',
      image: 'about.jpg',
      imageAlt: 'Mostrador antiguo con pomadas, tónicos y una caja de madera',
      paragraphs: [
        'Tenemos cuatro sillones de cuero restaurados y un poste de barbero que gira desde que abrimos.',
        'Cada cita dura lo que tiene que durar; entre una y otra limpiamos y esterilizamos todo.',
        'Te ofrecemos un café de olla o un mezcal mientras esperas.',
      ],
      sticker: 'Navaja recta',
    },
    services: {
      kicker: '{{index}} / Servicios',
      title: 'La <span class="lz-title__serif">carta</span> de la casa',
      intro:
        'Precios en pesos mexicanos. Cada servicio incluye lavado, toalla caliente y acabado.',
      prices: [
        {
          name: 'Corte a tijera',
          price: '$650',
          description: 'Corte clásico o contemporáneo, con lavado y peinado.',
          duration: '45 min',
        },
        {
          name: 'Ritual de afeitado',
          price: '$580',
          description: 'Vapor, dos pasadas de navaja recta y bálsamo frío.',
          duration: '40 min',
        },
        {
          name: 'Corte y barba',
          price: '$890',
          description: 'Corte a tijera con barba perfilada a navaja.',
          duration: '70 min',
        },
        {
          name: 'Arreglo de barba',
          price: '$420',
          description: 'Forma, contornos a navaja y aceite de cedro.',
          duration: '30 min',
        },
        {
          name: 'Ritual completo',
          price: '$1,250',
          description: 'Corte, afeitado clásico y masaje de cuero cabelludo.',
          duration: '90 min',
          tag: 'La casa',
        },
        {
          name: 'Corte para niños',
          price: '$450',
          description: 'Hasta 12 años, con la misma calma.',
          duration: '30 min',
        },
      ],
      promos: [
        {
          tag: 'Primera visita',
          title: 'Conoce el ritual de afeitado',
          text: 'En tu primera cita, el afeitado clásico va con 15 % menos.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero el ritual de afeitado de primera visita}}',
        },
        {
          tag: 'Novios',
          title: 'Arreglo para el día de la boda',
          text: 'Corte y afeitado para el novio y sus padrinos, en la casa o en tu evento.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar el arreglo para una boda}}',
        },
      ],
      cta: 'Reservar cita',
    },
    faq: {
      kicker: '{{index}} / Preguntas',
      title: 'Antes de tu <span class="lz-title__serif">cita</span>',
      intro:
        'Lo que conviene saber antes de sentarte en el sillón. Para lo demás, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Atienden sin cita?',
          answer:
            'Solo con cita, para darle a cada cliente su tiempo completo. Reserva por WhatsApp con un día de anticipación.',
        },
        {
          question: '¿Cuánto dura el ritual de afeitado?',
          answer:
            'Unos 40 minutos: vapor, dos pasadas de navaja recta, toalla fría y bálsamo.',
        },
        {
          question: '¿Usan navaja desechable?',
          answer:
            'Usamos navaja recta con hoja nueva en cada cliente y esterilizamos el resto del instrumental.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer: 'Efectivo, tarjeta y transferencia.',
        },
        {
          question: '¿Hay estacionamiento?',
          answer:
            'Hay valet en la esquina y lugares en la calle los fines de semana.',
        },
        {
          question: '¿Atienden bodas y eventos?',
          answer:
            'Sí, en la casa o en tu evento, con cotización previa por WhatsApp.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} / Visítanos',
      title: 'Tu sillón en <span class="lz-title__serif">San Ángel</span>',
      hoursLabel: 'Horario',
      whatsappCta: 'Reservar por WhatsApp',
      callCta: 'Llamar',
      directionsLabel: 'Cómo llegar',
      contactText:
        'Respondemos mensajes en horario de la casa. Si vas a llegar tarde, avísanos y movemos tu cita.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      branches: [
        {
          name: 'San Ángel',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–21:00 · Dom 10:00–16:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal San Ángel',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Reservar en Abeto por WhatsApp',
    },
    footer: {
      about:
        'Barbería de caballeros en {{city}}. Navaja recta, toalla caliente y corte a tijera, solo con cita.',
      branchesTitle: 'La casa',
      branches: [
        {
          name: 'San Ángel',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–21:00 · Dom 10:00–16:00',
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
          label: 'Barberos',
          href: '#equipo',
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
      kicker: '{{index}} / Barberos',
      title: 'Quién lleva la <span class="lz-title__serif">navaja</span>',
      members: [
        {
          name: 'Julián Arriola',
          role: 'Maestro barbero',
          tags: ['Navaja recta', 'Corte clásico'],
          image: 'team-1.jpg',
          imageAlt:
            'Retrato en blanco y negro de Julián Arriola, barbero con barba larga',
        },
        {
          name: 'Rafael Cordero',
          role: 'Barba y afeitado',
          tags: ['Toalla caliente', 'Perfilado'],
          image: 'team-2.jpg',
          imageAlt:
            'Rafael Cordero, con gorra, cortando el cabello a un cliente',
        },
        {
          name: 'Santiago Velarde',
          role: 'Corte a tijera',
          tags: ['Tijera', 'Peinados'],
          image: 'team-3.jpg',
          imageAlt:
            'Santiago Velarde, de cabello rizado, junto a un cliente en el sillón',
        },
        {
          name: 'Mateo Ibarra',
          role: 'Perfilado y barba',
          tags: ['Barba', 'Navaja'],
          image: 'team-4.jpg',
          imageAlt: 'Mateo Ibarra pasando la máquina por la nuca de un cliente',
        },
      ],
      intro: 'Manos de oficio y atención sin prisa.',
    },
    gallery: {
      kicker: '{{index}} / La casa',
      title: 'Navaja, cuero y <span class="lz-title__serif">acero</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Corte a tijera',
          alt: 'Barbero cortando a tijera el cabello de un cliente',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Navaja recta',
          alt: 'Barbero con cubrebocas perfilando con navaja recta',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Peine y navaja',
          alt: 'Peine y navaja recta sobre el cabello, en blanco y negro',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Afeitado clásico',
          alt: 'Barbero preparando el rostro de un cliente para el afeitado',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'El salón',
          alt: 'Interior de la barbería visto desde la puerta, con cuadros en la pared',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Degradado',
          alt: 'Corte degradado con raya marcada en un cliente con cubrebocas',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'El poste',
          alt: 'Poste de barbero rojo, blanco y azul iluminado',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'La casa',
          alt: 'Barberos trabajando en el salón con lámparas colgantes y ventanal',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} / Opiniones',
      score: '4.9',
      summary: '238 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'El afeitado con toalla caliente es otra cosa: Julián se toma su tiempo y sales con la piel tranquila.',
          author: 'Emiliano R.',
          place: 'Cliente desde 2021',
        },
        {
          text: 'Reservé por WhatsApp para el día de mi boda y nos atendieron a mí y a mis padrinos sin una sola prisa.',
          author: 'Diego S.',
          place: 'Cliente desde 2022',
        },
        {
          text: 'Sillones de cuero, café de olla y un corte que dura bien todo el mes. Mi lugar del sábado.',
          author: 'Pablo M.',
          place: 'Cliente desde 2020',
        },
      ],
      title:
        'La estima de <span class="lz-title__serif">quienes vuelven</span>',
    },
    marquee: {
      label: 'El oficio de la casa',
      items: [
        'Navaja recta',
        'Toalla caliente',
        'Corte a tijera',
        'Sillones de cuero',
        'Solo con cita',
      ],
    },
  },
} satisfies ContentPack;
