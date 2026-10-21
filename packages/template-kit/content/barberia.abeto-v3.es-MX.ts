// GENERATED from specs/barberia-abeto-v3.spec.json (spec 69ee2eeee689, file 77328924a722). Do not edit: use the spec, or freeze.
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
      '{{name}} en San Ángel, {{city}}: afeitado con navaja y toalla caliente, corte a tijera y arreglo de barba, solo con cita por WhatsApp.',
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
      note: 'Martes a sábado de 10:00 a 21:00',
      image: 'hero.jpg',
      imageAlt:
        'Sillón de barbero antiguo de cuero y metal, con lavabo y repisas de madera al fondo',
      eyebrow: 'Barbería clásica · San Ángel',
      title:
        'El ritual de la <span class="lz-title__serif">navaja</span>, sin prisa.',
      text: 'Toalla caliente, tijera y navaja recta en un sillón de cuero que te espera a tu hora. Reserva con un mensaje.',
      primaryCta: 'Reservar cita',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Desde 2012',
    },
    about: {
      kicker: '{{index}} — La casa',
      title:
        'Maestría de barrio, <span class="lz-title__serif">trato cercano</span>.',
      summary: 'Una barbería de pocas sillas donde cada cita tiene su tiempo.',
      stats: [
        {
          value: '4',
          label: 'Sillones de cuero',
        },
        {
          value: '45 min',
          label: 'Por cada cita',
        },
        {
          value: '2012',
          label: 'Abiertos desde',
        },
      ],
      statement:
        'Una navaja no se apura: el afeitado arranca con vapor, sigue con dos pasadas lentas y cierra en calma.',
      image: 'about.jpg',
      imageAlt:
        'Cliente con capa a rayas mientras el barbero le acomoda el cabello junto a la oreja, en blanco y negro',
      paragraphs: [
        '{{shortName}} nació como una barbería de barrio: navaja recta, toalla caliente y tiempo para conversar mientras trabajamos.',
        'Citas espaciadas, instrumental esterilizado entre cliente y cliente y un barbero que recuerda cómo te gusta el corte.',
        'Mientras esperas, te ofrecemos un café de olla.',
      ],
      sticker: 'Navaja recta',
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Servicios de la <span class="lz-title__serif">casa</span>',
      intro:
        'Precios en pesos mexicanos; todo servicio incluye toalla caliente y acabado.',
      prices: [
        {
          name: 'Corte a tijera',
          price: '$650',
          description:
            'Corte clásico o actual, con lavado, secado y peinado final.',
        },
        {
          name: 'Ritual de afeitado',
          price: '$580',
          description: 'Vapor, doble pasada de navaja recta y bálsamo fresco.',
        },
        {
          name: 'Corte y barba',
          price: '$890',
          description:
            'Corte con tijera y barba perfilada a navaja en la misma cita.',
        },
        {
          name: 'Arreglo de barba',
          price: '$420',
          description:
            'Forma, contornos a navaja y aceite de cedro para cerrar.',
        },
        {
          name: 'Ritual completo',
          price: '$1,250',
          description:
            'Corte a tijera, afeitado clásico y masaje en el cuero cabelludo.',
        },
        {
          name: 'Corte para niños',
          price: '$450',
          description:
            'Hasta los 12 años, en un sillón con la misma paciencia.',
        },
      ],
      promos: [
        {
          tag: 'Primera visita',
          title: 'Prueba el afeitado clásico',
          text: 'En tu primera cita, el afeitado con navaja lleva 15 % de descuento.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero el afeitado clásico de primera visita}}',
        },
        {
          tag: 'Eventos',
          title: 'Arreglo para bodas y celebraciones',
          text: 'Corte y afeitado para el novio y su grupo, en la casa o en tu evento.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar un arreglo para un evento}}',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de tu <span class="lz-title__serif">cita</span>',
      intro:
        'Lo esencial antes de sentarte en el sillón. Para lo demás, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Puedo llegar sin cita?',
          answer:
            'Trabajamos solo con cita para dedicarle a cada cliente su tiempo completo. Escríbenos por WhatsApp un día antes.',
        },
        {
          question: '¿Cuánto dura el afeitado con navaja?',
          answer:
            'Alrededor de 40 minutos, con vapor, doble pasada, toalla fría y bálsamo.',
        },
        {
          question: '¿La navaja se comparte entre clientes?',
          answer:
            'No: la hoja es nueva en cada cita y el resto del instrumental se esteriliza.',
        },
        {
          question: '¿Cómo puedo pagar?',
          answer: 'Aceptamos efectivo, tarjeta y transferencia.',
        },
        {
          question: '¿Dónde estaciono?',
          answer:
            'Hay valet en la esquina y lugar en la calle los fines de semana.',
        },
        {
          question: '¿Atienden bodas y eventos?',
          answer:
            'Sí: vamos a tu evento o los recibimos aquí, con cotización por WhatsApp.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Visítanos en <span class="lz-title__serif">San Ángel</span>',
      hoursLabel: 'Horario',
      whatsappCta: 'Reservar por WhatsApp',
      callCta: 'Llamar',
      directionsLabel: 'Cómo llegar',
      contactText:
        'Respondemos en horario de la casa. Si se te hace tarde, avísanos y reacomodamos tu cita.',
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
        'Barbería de caballeros en {{city}}: afeitado con navaja, corte a tijera y arreglo de barba con cita previa.',
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
      kicker: '{{index}} — Barberos',
      title: 'Las manos <span class="lz-title__serif">detrás</span>',
      members: [
        {
          name: 'Iñaki Ruiz',
          role: 'Fundador · tijera',
          tags: ['Corte clásico', 'Texturas'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Iñaki Ruiz con camisa de lino en el estudio',
        },
        {
          name: 'Tomás Ibarra',
          role: 'Afeitado y barba',
          tags: ['Navaja recta', 'Perfilado'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Tomás Ibarra afilando una navaja recta',
        },
        {
          name: 'Lucía Ferrer',
          role: 'Cortes largos',
          tags: ['Tijera', 'Melenas'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Lucía Ferrer peinando un corte largo',
        },
        {
          name: 'Gabriel Soto',
          role: 'Máquina y degradados',
          tags: ['Taper', 'Crop'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Gabriel Soto junto a su estación de trabajo',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — El oficio',
      title: 'Navaja, cuero y <span class="lz-title__serif">oficio</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Frente al espejo',
          alt: 'Cliente con capa a rayas frente al espejo, con navajas colgadas en la pared',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Toalla caliente',
          alt: 'Manos de barbero con una toalla caliente humeante, en blanco y negro',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Corte a tijera',
          alt: 'Barbero con camisa de cuadros cortando el cabello a un cliente en un salón con espejos',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Afeitado clásico',
          alt: 'Primer plano de un afeitado de barba con navaja recta',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Brocha y navaja',
          alt: 'Máquina de afeitar y brocha de afeitar sobre su soporte, fondo blanco',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Perfilado de nuca',
          alt: 'Barbero perfilando la nuca de un cliente con máquina y peine',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Barba cuidada',
          alt: 'Retrato en blanco y negro de un hombre calvo con barba larga y sonrisa',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'El poste',
          alt: 'Poste de barbero rojo, blanco y azul en la fachada',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      score: '4.9',
      summary: '238 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'La toalla caliente y la navaja hacen la diferencia: salgo con la piel tranquila y el corte limpio.',
          author: 'Emiliano R.',
        },
        {
          text: 'Reservé por WhatsApp para mi boda y atendieron a mis padrinos y a mí sin una sola prisa.',
          author: 'Diego S.',
        },
        {
          text: 'Café de olla, sillón de cuero y un corte que aguanta todo el mes. Mi cita fija de sábado.',
          author: 'Pablo M.',
        },
      ],
    },
    marquee: {
      label: 'Especialidades de la barbería',
      items: [
        'Fades',
        'Diseños',
        'Barba a navaja',
        'Cortes desde $270',
        'Sin fila, con cita',
      ],
    },
    cta: {
      kicker: 'Paso a paso',
      title: 'El ritual <span class="lz-title__serif">Abeto</span>',
      summary:
        'Una hora en el sillón, en cuatro tiempos y sin que nadie te apure.',
      primaryCta: 'Reservar cita',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      steps: [
        {
          title: 'Conversación',
          text: 'Hablamos de tu cabello y de cómo lo llevas antes de tomar la tijera.',
          duration: '10 min',
        },
        {
          title: 'Lavado y vapor',
          text: 'Limpieza suave y vapor para ablandar el vello y preparar la piel.',
          duration: '10 min',
        },
        {
          title: 'Corte y navaja',
          text: 'Tijera, máquina y navaja recta para perfilar con precisión.',
          duration: '30 min',
        },
        {
          title: 'Toalla caliente',
          text: 'Cierre con toalla caliente y bálsamo frío para sellar el servicio.',
          duration: '10 min',
        },
      ],
    },
  },
} satisfies ContentPack;
