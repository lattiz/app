// GENERATED from specs/estetica-alheli-v2.spec.json (spec 7eb4508f9aa2, file 7d0debe4b388). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'estetica',
  locale: 'es-MX',
  business: {
    name: 'Alhelí Nail Atelier',
    shortName: 'Alhelí',
    tagline: 'Salón de uñas',
    city: 'Azcapotzalco',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero agendar una cita de uñas',
    address: 'Calle Rosal 45, Col. San Álvaro, Azcapotzalco, 02090 CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@alhelinails.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=alheli+nail+atelier+san+alvaro',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=alheli+nail+atelier+san+alvaro',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: colecciones de uñas de autor, nail art y cuidado de manos y pies con cita por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Agendar cita',
      links: [
        {
          label: 'El salón',
          href: '#nosotros',
        },
        {
          label: 'Servicios',
          href: '#servicios',
        },
        {
          label: 'Fotos',
          href: '#galeria',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Citas',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      image: 'hero.jpg',
      imageAlt:
        'Manos pintando las uñas de otra persona con esmalte rojo sobre una tela rosa',
      eyebrow: 'Atelier de uñas · San Álvaro',
      title:
        'El arte de tus uñas, <span class="lz-title__serif">con calma</span>.',
      text: 'Colecciones de manicura de autor y cuidado de manos y pies, con pocas citas al día. Reserva por WhatsApp y llega a tu hora.',
      primaryCta: 'Reservar por WhatsApp',
      secondaryCta: 'Ver colecciones',
      secondaryHref: '#servicios',
      sticker: 'Pocas citas al día',
    },
    marquee: {
      label: 'Servicios del salón',
      items: [
        'Manicura de autor',
        'Nail art a mano',
        'Esmalte en gel',
        'Pedicura spa',
        'Parafina para manos',
      ],
    },
    about: {
      kicker: '{{index}} — El atelier',
      title:
        'Un atelier pequeño, <span class="lz-title__serif">hecho a mano</span>.',
      summary:
        'Sencillo y directo: elige una colección, escríbenos y llega a tu cita.',
      statement:
        'Pocas citas al día, diseño a tu medida y un rato solo para ti.',
      image: 'about.jpg',
      imageAlt: 'Mano con uñas en gris claro y verde menta, recién esmaltadas',
      sticker: 'Instrumental esterilizado',
      paragraphs: [
        '{{shortName}} abrió en San Álvaro con una idea sencilla: pocas citas al día para que cada diseño tenga su tiempo.',
        'Revisamos tus referencias, elegimos forma y largo según tu rutina y trabajamos sin prisa, con luz natural.',
        'Esterilizamos el instrumental antes de cada servicio y usamos lima y pulidor nuevos con cada persona.',
      ],
      stats: [
        {
          value: '+10 años',
          label: 'De experiencia',
        },
        {
          value: '4 estilos',
          label: 'Para elegir',
        },
        {
          value: '90 min',
          label: 'Promedio por cita',
        },
      ],
      primaryCta: 'Agendar por WhatsApp',
      steps: [
        {
          title: 'Elige tu colección',
          text: 'Revisa las colecciones y elige la que va contigo; si traes una referencia, mándala.',
        },
        {
          title: 'Reserva por WhatsApp',
          text: 'Escríbenos y acordamos fecha y horario según la disponibilidad de la semana.',
        },
        {
          title: 'Disfruta tu rato',
          text: 'Llegas a San Álvaro y te atendemos sin prisa, con una bebida de cortesía.',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Colecciones',
      title: 'Colecciones de <span class="lz-title__serif">autor</span>',
      intro:
        'Cada colección incluye limado, cutícula y esmaltado. Pedicura, parafina y retiro se confirman al agendar.',
      prices: [
        {
          name: 'Nude y negro mate',
          price: 'Desde $850',
          description:
            'Contraste mate con líneas dibujadas a mano sobre una base nude.',
          duration: '90 min',
          image: 'product-01.jpg',
          imageAlt: 'Manos con uñas negras mate y nude con dibujos lineales',
          href: '{{whatsappUrl:Hola, quiero la colección Nude y negro mate}}',
        },
        {
          name: 'Floral a mano',
          price: 'Desde $950',
          description:
            'Flores pintadas a mano en blanco y rojo sobre una base lisa a tu elección.',
          duration: '120 min',
          image: 'product-02.jpg',
          imageAlt: 'Uñas rojas con flores blancas y rojas pintadas a mano',
          href: '{{whatsappUrl:Hola, quiero la colección Floral a mano}}',
        },
        {
          name: 'Color a tu medida',
          price: 'Desde $700',
          description:
            'Eliges el tono de la paleta del atelier y lo trabajamos con acabado brillante.',
          duration: '75 min',
          image: 'product-03.jpg',
          imageAlt: 'Hilera de esmaltes de uñas en tonos nude, rosa y rojo',
          href: '{{whatsappUrl:Hola, quiero la colección Color a tu medida}}',
        },
        {
          name: 'Nail art de autor',
          price: 'Desde $1,100',
          description:
            'Color, pintura fina y herramientas para un diseño pensado para ti.',
          duration: '100 min',
          image: 'product-04.jpg',
          imageAlt:
            'Esmaltes de colores y herramientas de nail art sobre una mesa de espejo',
          href: '{{whatsappUrl:Hola, quiero la colección Nail art de autor}}',
        },
      ],
      promos: [
        {
          tag: 'Primera visita',
          title: 'Valoración de color sin costo',
          text: 'Antes de pintar platicamos el tono, el mantenimiento y el precio exacto.',
          cta: 'Valorar color',
          href: '{{whatsappUrl:Hola, quiero una valoración de color}}',
        },
        {
          tag: 'Eventos',
          title: 'Peinado y maquillaje para tu evento',
          text: 'Para bodas, graduaciones y XV años; también vamos a domicilio.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar peinado y maquillaje para un evento}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Atelier',
      title: 'Un vistazo al <span class="lz-title__serif">atelier</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Salón con sillas negras, espejo con luces y estante de esmaltes',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Mesa de manicura',
          alt: 'Manos aplicando esmalte sobre una mesa con servilleta',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Pétalos y color',
          alt: 'Mano con uñas rosa pálido y pétalos sobre los dedos',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Lámpara y tips',
          alt: 'Lámpara de uñas, lima y caja de tips sobre madera',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Pedicura spa',
          alt: 'Pies en remojo en una tina con hojas de hierbas',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Gel y pincel',
          alt: 'Mano con un pincel fino junto a un frasco de gel',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Manicura terminada',
          alt: 'Manos con uñas rosa y brillo sobre un cojín bordado junto a un espejo',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Cuidado de manos',
          alt: 'Manos recibiendo crema hidratante',
        },
      ],
      intro: 'Mesas, colores y detalles de un día cualquiera en {{shortName}}.',
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quién te <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'Valeria Montiel',
          role: 'Manicura de autor',
          tags: ['Nail art', 'Gel'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Valeria Montiel en el atelier',
        },
        {
          name: 'Dana Pedraza',
          role: 'Pedicura y spa',
          tags: ['Pedicura spa', 'Parafina'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Dana Pedraza sonriendo',
        },
        {
          name: 'Itzel Cordero',
          role: 'Nail art a mano',
          tags: ['Pintura a mano', 'Cristales'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Itzel Cordero junto a una ventana',
        },
        {
          name: 'Regina Soto',
          role: 'Uñas esculpidas',
          tags: ['Acrílico', 'Formas'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Regina Soto en la mesa de manicura',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Opiniones',
      title:
        'Lo que dicen <span class="lz-title__serif">nuestras clientas</span>',
      intro:
        'Opiniones de quienes ya pasaron por el atelier, en sus propias palabras.',
      reviews: [
        {
          text: 'Mandé una foto de referencia y me propusieron una versión que le iba a mis manos. La cita fue tranquila y a la hora.',
          author: 'Daniela R.',
          place: 'Clienta frecuente',
        },
        {
          text: 'Me gustó que esterilizan el instrumental frente a una y que explican cada paso del servicio.',
          author: 'Karen M.',
          place: 'Primera visita',
        },
        {
          text: 'Preparamos mis uñas para la boda con dos semanas de anticipación, todo por WhatsApp y sin confusiones.',
          author: 'Paola S.',
          place: 'Manicura de novia',
        },
      ],
      score: '4.9',
      summary: '58 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo esencial antes de reservar. Para cualquier otra duda, escríbenos por WhatsApp.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cuánto cuesta una manicura de autor?',
          answer:
            'Las colecciones empiezan en $700 y el precio final se confirma al ver tu referencia.',
        },
        {
          question: '¿Cuánto dura una cita?',
          answer:
            'Entre 75 y 120 minutos, según la colección y el diseño que elijas.',
        },
        {
          question: '¿Puedo llevar una foto de referencia?',
          answer:
            'Sí, mándala por WhatsApp antes y te decimos cómo se adapta a tu largo y forma.',
        },
        {
          question: '¿Cómo cuidan la higiene?',
          answer:
            'Esterilizamos el instrumental metálico y usamos lima y pulidor nuevos con cada persona.',
        },
        {
          question: '¿Retiran el gel de otro salón?',
          answer:
            'Sí, el retiro cuesta $80 y se hace con cuidado para proteger tu uña natural.',
        },
        {
          question: '¿Y si necesito cambiar mi cita?',
          answer:
            'Escríbenos por WhatsApp con un día de anticipación y buscamos otro horario sin costo.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      hoursLabel: 'Horario',
      whatsappCta: 'Reservar por WhatsApp',
      imageCaption: 'Te esperamos en el atelier',
      imageNote: 'Col. San Álvaro, Azcapotzalco',
      branches: [
        {
          name: 'San Álvaro',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–20:00 · Dom 10:00–15:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal San Álvaro',
        },
      ],
      title: 'Reserva tu <span class="lz-title__serif">cita</span>',
      contactText:
        'Trabajamos con cita, de martes a domingo. Mándanos un mensaje y te proponemos horario.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      callCta: 'Llamar',
    },
    'floating-whatsapp': {
      label: 'Agendar cita por WhatsApp',
    },
    footer: {
      about:
        'Atelier de uñas en {{city}}, colonia San Álvaro. Colecciones de autor, nail art y cuidado de manos y pies con cita por WhatsApp.',
      branchesTitle: 'Atelier',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'El salón',
          href: '#nosotros',
        },
        {
          label: 'Servicios',
          href: '#servicios',
        },
        {
          label: 'Fotos',
          href: '#galeria',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Citas',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'San Álvaro',
          address: '{{address}}',
          hours: 'Mar–Sáb 10:00–20:00 · Dom 10:00–15:00',
        },
      ],
    },
  },
} satisfies ContentPack;
