// GENERATED from specs/restaurante-casa-comal.spec.json (spec 12fc8dabf1eb, file bd37d58481a6). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'Casa Comal',
    shortName: 'Casa Comal',
    tagline: 'Cocina de temporada',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero reservar una mesa',
    address: 'Jaime Torres Bodet 150, Santa María la Ribera, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'reservas@casacomal.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=casa+comal+santa+maria+la+ribera',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=casa+comal+santa+maria+la+ribera',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: cocina de temporada, menú con precios y reservaciones por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Reservar',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Menú',
          href: '#servicios',
        },
        {
          label: 'Cocina',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Reservar',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      image: 'hero.jpg',
      imageAlt:
        'Mesa servida con platillos de temporada y luz cálida de mediodía',
      eyebrow: 'Cocina de temporada · Santa María la Ribera',
      title:
        'Comida hecha con <span class="lz-title__serif">tiempo</span>, para compartir.',
      text: 'Ingredientes del mercado, recetas de casa y una mesa que te espera. Reserva por WhatsApp y llega a comer.',
      primaryCta: 'Reservar mesa',
      secondaryCta: 'Ver el menú',
      secondaryHref: '#servicios',
      sticker: 'Mesa para hoy',
    },
    marquee: {
      label: 'Lo que nos piden siempre',
      items: [
        'Cocina de mercado',
        'Tortillas a mano',
        'Mezcal y vinos mexicanos',
        'Postres de la casa',
        'Reservas por WhatsApp',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Una cocina <span class="lz-title__serif">abierta</span> y sin prisas.',
      summary:
        'En {{shortName}} cocinamos lo que llega del mercado esa mañana. Recetas de familia, porciones generosas y un servicio que te trata como de casa.',
      statement:
        'Cocinamos como en casa: lo que hay en el mercado, bien hecho y para compartir en la mesa.',
      image: 'about.jpg',
      imageAlt:
        'Cocinera emplatando en una cocina abierta con fogones encendidos',
      sticker: 'Desde 2015',
      paragraphs: [
        '{{shortName}} abrió como una fonda de seis mesas. Hoy la cocina sigue a la vista y el menú cambia con la temporada.',
        'Compramos a productores de la región, hacemos las tortillas a mano y preparamos los postres cada día.',
        'Ven con calma: la sobremesa también es parte de la comida.',
      ],
      stats: [
        {
          value: '+10 años',
          label: 'Cocinando en {{city}}',
        },
        {
          value: '40 platillos',
          label: 'En la carta del año',
        },
        {
          value: '4.8 ★',
          label: 'En Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Menú',
      title: 'El <span class="lz-title__serif">menú</span>',
      intro:
        'Precios en pesos mexicanos, IVA incluido. Pregunta por el platillo del día.',
      prices: [
        {
          name: 'Sopa del día',
          price: '$95',
          description: 'Caldo de la casa con verduras del mercado.',
        },
        {
          name: 'Tostadas de la casa',
          price: '$140',
          description: 'Tres tostadas con guisos de temporada.',
        },
        {
          name: 'Plato fuerte',
          price: '$220',
          description: 'Guiso del día con arroz, frijoles y tortillas a mano.',
        },
        {
          name: 'Pescado a la talla',
          price: '$290',
          description: 'Filete al carbón con ensalada y salsa de la casa.',
        },
        {
          name: 'Menú infantil',
          price: '$120',
          description: 'Porción pequeña con agua fresca y postre.',
        },
        {
          name: 'Postre de la casa',
          price: '$85',
          description: 'Flan, pastel o nieve, según el día.',
        },
      ],
      promos: [
        {
          tag: 'Comida corrida',
          title: 'Menú del día de lunes a viernes',
          text: 'Sopa, plato fuerte, agua y postre por $175.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar para el menú del día}}',
        },
        {
          tag: 'Eventos',
          title: 'Cumpleaños y comidas de empresa',
          text: 'Reservamos el salón para grupos de hasta 30 personas.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar un evento}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Platillos',
      title: 'De la cocina a tu <span class="lz-title__serif">mesa</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Guiso del día',
          alt: 'Cazuela de barro con guiso rojo y tortillas a un lado',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Tostadas de la casa',
          alt: 'Tres tostadas con guisos y crema sobre un plato de talavera',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Tortillas a mano',
          alt: 'Manos haciendo tortillas en un comal',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Pescado a la talla',
          alt: 'Filete de pescado asado al carbón con limones',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'El comedor',
          alt: 'Comedor con mesas de madera y luz natural',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Aguas frescas',
          alt: 'Jarras de agua de jamaica y horchata sobre la barra',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Postres del día',
          alt: 'Flan casero con caramelo en un plato blanco',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'La barra',
          alt: 'Barra con botellas de mezcal y copas',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Cocina',
      title: 'Quién <span class="lz-title__serif">cocina</span>',
      members: [
        {
          name: 'Carmen Ortiz',
          role: 'Chef y fundadora',
          tags: ['Cocina de mercado', 'Guisos'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Carmen Ortiz con filipina blanca en la cocina',
        },
        {
          name: 'Luis Herrera',
          role: 'Parrilla',
          tags: ['Carbón', 'Pescados'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Luis Herrera junto a la parrilla',
        },
        {
          name: 'Ana Ruiz',
          role: 'Repostería',
          tags: ['Postres', 'Pan'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Ana Ruiz decorando un pastel',
        },
        {
          name: 'Jorge Méndez',
          role: 'Sala y barra',
          tags: ['Mezcal', 'Servicio'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Jorge Méndez detrás de la barra',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.8',
      summary: '320 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'El guiso del día sabe a casa. Fuimos un domingo con mis papás y ya queremos regresar.',
          author: 'Daniela R.',
        },
        {
          text: 'Reservé por WhatsApp en dos minutos y la mesa estaba lista cuando llegamos. Las tortillas a mano, increíbles.',
          author: 'Miguel A.',
        },
        {
          text: 'Hicimos la comida de fin de año de la oficina en el salón. Atentos con todo y el menú, delicioso.',
          author: 'Paola S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro:
        'Lo que más nos preguntan. Si tienes otra duda, escríbenos por WhatsApp.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Necesito reservar?',
          answer:
            'Los fines de semana sí te lo recomendamos. Entre semana suele haber mesa, pero reservar por WhatsApp te asegura lugar.',
        },
        {
          question: '¿Tienen opciones vegetarianas?',
          answer:
            'Sí, siempre hay al menos un plato fuerte y una entrada sin carne. Pregúntanos por el del día.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer: 'Efectivo, tarjetas de débito y crédito, y transferencia.',
        },
        {
          question: '¿Hacen pedidos para llevar?',
          answer:
            'Sí. Escríbenos por WhatsApp con tu pedido y te decimos a qué hora pasar por él.',
        },
        {
          question: '¿Pueden recibir grupos o eventos?',
          answer:
            'Tenemos un salón para grupos de hasta 30 personas. Escríbenos con la fecha y te mandamos opciones de menú.',
        },
        {
          question: '¿Hay estacionamiento?',
          answer:
            'No tenemos estacionamiento propio, pero hay estacionamientos públicos a una cuadra.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Reservar',
      title: 'Te esperamos a la <span class="lz-title__serif">mesa</span>',
      contactText:
        'Reservas y pedidos por WhatsApp en horario del restaurante. Para eventos preferimos el correo.',
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
          name: 'Santa María la Ribera',
          address: '{{address}}',
          hours: 'Mar–Sáb 13:00–23:00 · Dom 13:00–18:00',
          directionsUrl:
            'https://maps.google.com/?q=Jaime+Torres+Bodet+150%2C+Santa+Mar%C3%ADa+la+Ribera%2C+CDMX',
          mapUrl:
            'https://www.google.com/maps?q=Jaime%20Torres%20Bodet%20150%2C%20Santa%20Mar%C3%ADa%20la%20Ribera%2C%20CDMX&output=embed',
          mapTitle: 'Mapa de la sucursal Santa María la Ribera',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Reservar por WhatsApp',
    },
    footer: {
      about:
        'Cocina de temporada en {{city}}. Reservas y pedidos para llevar por WhatsApp.',
      branchesTitle: 'Dónde estamos',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'Nosotros',
          href: '#nosotros',
        },
        {
          label: 'Menú',
          href: '#servicios',
        },
        {
          label: 'Cocina',
          href: '#equipo',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Reservar',
          href: '#sucursales',
        },
      ],
      branches: [
        {
          name: 'Santa María la Ribera',
          address: 'Jaime Torres Bodet 150, Santa María la Ribera, CDMX',
          hours: 'Mar–Sáb 13:00–23:00 · Dom 13:00–18:00',
        },
      ],
    },
  },
} satisfies ContentPack;
