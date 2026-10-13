// GENERATED from specs/restaurante-ceniza.spec.json (spec a89058674040, file 55b7af942eef). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'Ceniza Grill & Bar',
    shortName: 'Ceniza',
    tagline: 'Grill y bar al carbón',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero reservar una mesa en Ceniza',
    address: 'Calle Nilo 128, Col. Clavería, Azcapotzalco, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@ceniza.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=ceniza+grill+bar+claveria',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=ceniza+grill+bar+claveria',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en Clavería, {{city}}: cortes y hamburguesas al carbón, coctelería de autor y reservas por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Reservar',
      links: [
        {
          label: 'La casa',
          href: '#nosotros',
        },
        {
          label: 'Menú',
          href: '#servicios',
        },
        {
          label: 'Parrilla',
          href: '#galeria',
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
        'Corte de res sobre la parrilla de carbón con flamas y humo en la noche',
      eyebrow: 'Grill & bar · Clavería',
      title: 'Fuego alto, <span class="lz-title__serif">humo</span> y barra.',
      text: 'Cortes y hamburguesas sobre carbón de encino, cocteles de autor y luz baja. Reserva tu mesa por WhatsApp.',
      primaryCta: 'Reservar mesa',
      secondaryCta: 'Ver el menú',
      secondaryHref: '#servicios',
      sticker: 'Parrilla encendida',
    },
    marquee: {
      label: 'Lo que sale de la parrilla',
      items: [
        'Carbón de encino',
        'Burgers de 180 g',
        'Cortes a la leña',
        'Coctelería de autor',
        'Barra hasta la 1:30',
      ],
    },
    about: {
      kicker: '{{index}} — La casa',
      title: 'Parrilla a la <span class="lz-title__serif">vista</span>',
      summary:
        '{{shortName}} es un grill de concepto americano en Clavería: parrilla de carbón al centro, barra de concreto y madera, y una cocina que se ve desde cualquier mesa.',
      statement:
        'Aquí todo pasa por el fuego: el pan se tuesta en la parrilla, la carne descansa antes de servirse y el humo llega hasta la barra.',
      image: 'about.jpg',
      imageAlt: 'Parrillero volteando hamburguesas sobre brasas encendidas',
      sticker: 'Carbón de encino',
      paragraphs: [
        'Abrimos en una antigua bodega de Clavería. Dejamos los muros de tabique, las vigas de acero y pusimos la parrilla donde todos la vean.',
        'Molemos la carne de las hamburguesas cada mañana y sellamos los cortes a fuego alto. El término lo eliges tú; la parrilla lo respeta.',
        'En la barra mezclamos cocteles con jarabes de la casa, cítricos frescos y destilados mexicanos. Ven a cenar o solo a tomar algo.',
      ],
      stats: [
        {
          value: '180',
          label: 'Gramos por burger',
        },
        {
          value: '12',
          label: 'Cocteles de autor',
        },
        {
          value: '4.7',
          label: 'De 5 en Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Menú',
      title: 'De la <span class="lz-title__serif">parrilla</span>',
      intro:
        'Todo en pesos, con IVA. Las burgers salen con papas a la leña; pregunta por el corte de la semana.',
      prices: [
        {
          name: 'Burger Ceniza',
          price: '$215',
          description:
            '180 g de res, cheddar añejo, cebolla caramelizada y pan brioche tostado al carbón.',
        },
        {
          name: 'Burger ahumada',
          price: '$245',
          description:
            'Tocino ahumado en casa, queso gouda, chile chipotle y pepinillos.',
        },
        {
          name: 'Rib eye 400 g',
          price: '$590',
          description:
            'Sellado a fuego alto, con mantequilla de ajo y elote asado.',
        },
        {
          name: 'Costillas BBQ',
          price: '$385',
          description:
            'Media costillar de cerdo con salsa de la casa y ensalada de col.',
        },
        {
          name: 'Alitas al carbón',
          price: '$195',
          description:
            'Diez piezas con salsa de chile de árbol y aderezo de queso azul.',
        },
        {
          name: 'Coctel de autor',
          price: '$165',
          description:
            'Pregunta por los de temporada; también hay versiones sin alcohol.',
        },
      ],
      promos: [
        {
          tag: 'Entre semana',
          title: 'Comida de mediodía, de martes a viernes',
          text: 'Burger Ceniza, papas y agua fresca por $235, de 13:00 a 17:00.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar para la comida de mediodía}}',
        },
        {
          tag: 'Grupos',
          title: 'Cumpleaños y cenas de equipo',
          text: 'Apartamos la terraza de la bodega para grupos de hasta 40 personas.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una cena para grupo}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Parrilla',
      title: 'Brasa, barra y <span class="lz-title__serif">humo</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Burger Ceniza',
          alt: 'Hamburguesa con queso derretido sobre tabla de madera oscura',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Rib eye a fuego alto',
          alt: 'Corte rib eye con marcas de parrilla rebanado sobre tabla',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Costillas BBQ',
          alt: 'Costillas de cerdo glaseadas con salsa barbecue y humo',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Alitas al carbón',
          alt: 'Alitas de pollo asadas con salsa roja en un plato de peltre',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'La bodega',
          alt: 'Salón industrial con muros de tabique y luz cálida de noche',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Coctel ahumado',
          alt: 'Coctel en vaso corto con humo y piel de naranja',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Las brasas',
          alt: 'Brasas de carbón encendidas bajo la parrilla',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'La barra',
          alt: 'Barra de concreto con botellas iluminadas y bancos altos',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quién está en el <span class="lz-title__serif">fuego</span>',
      members: [
        {
          name: 'Rodrigo Valdés',
          role: 'Jefe de parrilla',
          tags: ['Cortes', 'Carbón'],
          image: 'team-1.jpg',
          imageAlt:
            'Retrato de Rodrigo Valdés con mandil de cuero junto a la parrilla',
        },
        {
          name: 'Mariana Castañeda',
          role: 'Chef ejecutiva',
          tags: ['Burgers', 'Salsas de la casa'],
          image: 'team-2.jpg',
          imageAlt:
            'Retrato de Mariana Castañeda con filipina negra en la cocina',
        },
        {
          name: 'Iván Soto',
          role: 'Jefe de barra',
          tags: ['Coctelería', 'Jarabes'],
          image: 'team-3.jpg',
          imageAlt:
            'Retrato de Iván Soto detrás de la barra preparando un coctel',
        },
        {
          name: 'Lucía Prado',
          role: 'Gerente de sala',
          tags: ['Reservas', 'Grupos'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Lucía Prado en el salón del restaurante',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.7',
      summary: '410 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Pedí el rib eye término medio y llegó exacto. La burger ahumada también vale cada peso; regresamos el viernes siguiente.',
          author: 'Alejandro G.',
        },
        {
          text: 'Festejamos un cumpleaños de 25 personas en la terraza. Lucía nos armó el menú por WhatsApp y todo salió a tiempo.',
          author: 'Fernanda M.',
        },
        {
          text: 'Fui solo por un coctel después del trabajo y terminé cenando alitas en la barra. El de mezcal con toronja es mi favorito.',
          author: 'Diego L.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro:
        'Reservas, barra, grupos y estacionamiento. ¿Algo más? Mándanos un mensaje y te contestamos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Necesito reservar?',
          answer:
            'De jueves a sábado en la noche, sí. De martes a miércoles casi siempre hay lugar; un mensaje por WhatsApp te aparta la mesa.',
        },
        {
          question: '¿Tienen opciones sin carne?',
          answer:
            'Sí: burger de hongos portobello a la parrilla, elote asado y ensaladas. Pregúntanos por el especial del día.',
        },
        {
          question: '¿Pueden venir menores de edad?',
          answer:
            'Sí, al comedor y acompañados de un adulto. En la barra servimos alcohol solo a mayores de 18 años con identificación.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Aceptamos efectivo, tarjeta de débito o crédito y transferencia; la cuenta se puede dividir por mesa.',
        },
        {
          question: '¿Puedo pedir para llevar?',
          answer:
            'Sí. Manda tu pedido por WhatsApp y te avisamos cuándo sale de la parrilla para que pases por él.',
        },
        {
          question: '¿Hay estacionamiento?',
          answer:
            'No tenemos estacionamiento propio; hay estacionamientos públicos a dos cuadras y lugar en la calle por la noche.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Te guardamos la <span class="lz-title__serif">mesa</span>',
      contactText:
        'Reservas y pedidos para llevar por WhatsApp en horario del restaurante. Para grupos y eventos, escríbenos por correo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar mesa',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Reservar por WhatsApp',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Mar–Jue 13:00–00:00 · Vie–Sáb 13:00–01:30 · Dom 13:00–20:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Reservar por WhatsApp',
    },
    footer: {
      about:
        'Grill y bar de concepto americano en Clavería, {{city}}. Cortes, burgers al carbón y coctelería de autor.',
      branchesTitle: 'Dónde estamos',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'La casa',
          href: '#nosotros',
        },
        {
          label: 'Menú',
          href: '#servicios',
        },
        {
          label: 'Parrilla',
          href: '#galeria',
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
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Mar–Jue 13:00–00:00 · Vie–Sáb 13:00–01:30 · Dom 13:00–20:00',
        },
      ],
    },
  },
} satisfies ContentPack;
