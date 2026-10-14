// GENERATED from specs/estetica-alheli.spec.json (spec c5b874c728ac, file 32e7ebbe91eb). Do not edit: use the spec, or freeze.
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
      '{{name}} en {{city}}: manicura de autor, nail art y cuidado de manos y pies con cita por WhatsApp.',
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
          label: 'Equipo',
          href: '#equipo',
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
      imageAlt: 'Manos con manicura de autor en tonos nude y detalles dorados',
      eyebrow: 'Manicura de autor · San Álvaro',
      title: 'Uñas con <span class="lz-title__serif">firma</span> propia.',
      text: 'Manicura de autor, nail art y cuidado de manos y pies en un espacio tranquilo. Agenda tu cita por WhatsApp en un mensaje.',
      primaryCta: 'Agendar cita',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Cita por WhatsApp',
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
      kicker: '{{index}} — Nosotras',
      title:
        'Arte en tus manos, <span class="lz-title__serif">con calma</span>.',
      summary:
        'En {{shortName}} cada cita es tuya: platicamos el diseño, trabajamos sin prisa y esterilizamos el instrumental antes de cada servicio.',
      statement:
        'El nail art se disfruta sin prisa: diseño a tu medida, instrumental esterilizado y un rato solo para ti.',
      image: 'about.jpg',
      imageAlt: 'Mesa de manicura con esmaltes en tonos nude y flores secas',
      sticker: 'Material esterilizado',
      paragraphs: [
        '{{shortName}} es un atelier pequeño: pocas citas al día para dedicarle tiempo a cada diseño.',
        'Antes de empezar revisamos tus referencias y elegimos forma, largo y color según tu día a día.',
        'El instrumental se esteriliza y la lima y el pulidor son nuevos para cada persona.',
      ],
      stats: [
        {
          value: '+10 años',
          label: 'De experiencia',
        },
        {
          value: '1 a 1',
          label: 'Una técnica por cita',
        },
        {
          value: '60–90 min',
          label: 'Por manicura de autor',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Servicios y <span class="lz-title__serif">diseños</span>',
      intro:
        'Precios de ejemplo en pesos mexicanos. El nail art se cotiza según el diseño.',
      prices: [
        {
          name: 'Manicura clásica',
          price: '$250',
          description:
            'Limado, cutícula e hidratación con esmalte tradicional.',
        },
        {
          name: 'Manicura en gel',
          price: '$380',
          description:
            'Esmalte semipermanente en el color que elijas, con retiro incluido.',
        },
        {
          name: 'Manicura de autor',
          price: 'Desde $550',
          description:
            'Diseño personalizado hecho a mano; lo platicamos antes de empezar.',
        },
        {
          name: 'Nail art por uña',
          price: 'Desde $40',
          description:
            'Cristales, foil, líneas o pintura a mano sobre tu manicura.',
        },
        {
          name: 'Pedicura spa',
          price: '$480',
          description:
            'Exfoliación, masaje de pies y esmalte tradicional o en gel.',
        },
        {
          name: 'Parafina para manos',
          price: '$220',
          description:
            'Baño tibio de parafina e hidratación profunda de cutícula.',
        },
      ],
      promos: [
        {
          tag: 'Paquete',
          title: 'Manicura y pedicura en gel',
          text: 'Agenda ambos servicios el mismo día y recibe un precio especial por el paquete.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero el paquete de manicura y pedicura en gel}}',
        },
        {
          tag: 'Eventos',
          title: 'Novias, XV años y fiestas',
          text: 'Manicura de autor para tu evento; escríbenos con tu fecha y tus referencias.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar uñas para un evento}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Atelier',
      title: 'Detalles que <span class="lz-title__serif">se notan</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción del atelier con flores secas y luz cálida',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Mesa de manicura',
          alt: 'Mesa de manicura con lámpara, limas y esmaltes ordenados',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Paleta de colores',
          alt: 'Esmaltes en tonos nude, rosa y champán sobre una charola',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Nail art a mano',
          alt: 'Manos con diseño pintado a mano y detalles dorados',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Pedicura spa',
          alt: 'Pies en remojo con pétalos en una tina de pedicura',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Diseños en gel',
          alt: 'Uñas en gel con acabado brillante en tonos neutros',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Instrumental',
          alt: 'Instrumental de manicura ordenado sobre una toalla blanca',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Cuidado de manos',
          alt: 'Manos recibiendo crema hidratante después de la manicura',
        },
      ],
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
      score: '4.9',
      summary: '58 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Llevé una foto de referencia y me propusieron un diseño que iba con la forma de mis uñas. Salí encantada.',
          author: 'Daniela R.',
        },
        {
          text: 'Abrieron el instrumental frente a mí y la cita fue tranquila, a la hora acordada.',
          author: 'Karen M.',
        },
        {
          text: 'Planeamos mis uñas de boda desde dos semanas antes por WhatsApp. Cada paso quedó claro.',
          author: 'Paola S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo básico antes de reservar tu primera cita. Para otra duda, escríbenos por WhatsApp.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cuánto cuesta una manicura de autor?',
          answer:
            'Desde $550; el precio final depende del diseño y se confirma al ver tu referencia.',
        },
        {
          question: '¿Cuánto dura una cita?',
          answer:
            'Una manicura en gel toma cerca de 60 minutos y una de autor entre 60 y 90, según el diseño.',
        },
        {
          question: '¿Puedo llevar una foto de referencia?',
          answer:
            'Sí, mándala por WhatsApp antes de tu cita y te decimos si se puede adaptar a tu largo y forma.',
        },
        {
          question: '¿Cómo cuidan la higiene?',
          answer:
            'Esterilizamos el instrumental metálico y usamos lima y pulidor nuevos en cada persona.',
        },
        {
          question: '¿Retiran el gel de otro salón?',
          answer:
            'Sí, el retiro cuesta $80 y se hace con cuidado para no desgastar tu uña natural.',
        },
        {
          question: '¿Qué pasa si debo cambiar mi cita?',
          answer:
            'Avísanos por WhatsApp con 12 horas de anticipación y la reprogramamos sin costo.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Reserva tu <span class="lz-title__serif">cita</span>',
      contactText:
        'Atendemos con cita de martes a domingo. Escríbenos por WhatsApp y confirmamos tu horario.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Agendar por WhatsApp',
      callCta: 'Llamar',
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
    },
    'floating-whatsapp': {
      label: 'Agendar cita por WhatsApp',
    },
    footer: {
      about:
        'Salón de uñas en {{city}}, colonia San Álvaro. Manicura de autor, nail art y pedicura con cita por WhatsApp.',
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
          label: 'Equipo',
          href: '#equipo',
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
