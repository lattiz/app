// GENERATED from specs/restaurante-claveria-verde.spec.json (spec 9d5c34066125, file 88db45b47208). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'Clavería Verde',
    shortName: 'Clavería Verde',
    tagline: 'Cocina fresca de temporada',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero reservar una mesa en Clavería Verde',
    address: 'Calle Cedro 48, Col. Clavería, Azcapotzalco, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@claveriaverde.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=claveria+verde+claveria',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=claveria+verde+claveria',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en la colonia Clavería, CDMX: comida saludable de temporada, menú con precios y reservaciones por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Reservar mesa',
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
        'Mesa con bowls de verduras, aguacate y flores comestibles bajo luz de mediodía',
      eyebrow: 'Comida saludable · Clavería',
      title:
        'Come <span class="lz-title__serif">fresco</span> en el corazón de Clavería.',
      text: 'Verduras de mercado, tortillas de maíz nixtamalizado y guisos ligeros. Reserva por WhatsApp y ven a comer sin prisa.',
      primaryCta: 'Reservar mesa',
      secondaryCta: 'Ver el menú',
      secondaryHref: '#servicios',
      sticker: 'Menú de temporada',
    },
    marquee: {
      label: 'Lo que se pide en Clavería',
      items: [
        'Bowls de temporada',
        'Tortillas de maíz azul',
        'Aguas frescas de fruta',
        'Opciones veganas',
        'Pan de masa madre',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Cocina <span class="lz-title__serif">ligera</span>, sabor de barrio.',
      summary:
        'En {{shortName}} cocinamos con verduras y granos que llegan cada mañana al mercado de Clavería. Porciones justas, recetas de casa y mesa para quedarte.',
      statement:
        'Cocinamos con lo que llega al mercado de la colonia: poco aceite, mucha verdura y sabor de casa.',
      image: 'about.jpg',
      imageAlt:
        'Cocinera acomodando hojas verdes y flores sobre un platillo en la cocina abierta',
      sticker: 'Desde 2019',
      paragraphs: [
        '{{shortName}} abrió como una barra de jugos en una esquina de Clavería. Hoy tenemos comedor, cocina abierta y un menú que cambia cada temporada.',
        'Compramos a productores de Xochimilco y Milpa Alta, hacemos las tortillas cada mañana y preparamos aderezos y salsas sin conservadores.',
        'Pasa a desayunar, comer o merendar. La sobremesa también es parte del menú.',
      ],
      stats: [
        {
          value: '+7 años',
          label: 'Cocinando en Clavería',
        },
        {
          value: '12 bowls',
          label: 'Fijos y de temporada',
        },
        {
          value: '4.7 ★',
          label: 'Opiniones de ejemplo',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Menú',
      title: 'Nuestro <span class="lz-title__serif">menú</span>',
      intro:
        'Precios de ejemplo en pesos mexicanos. Pregunta por el bowl de temporada.',
      prices: [
        {
          name: 'Bowl de la milpa',
          price: '$165',
          description:
            'Frijol, calabacita, elote, aguacate y tortilla de maíz azul.',
        },
        {
          name: 'Ensalada de nopal y jícama',
          price: '$135',
          description:
            'Con limón, queso fresco y semillas de calabaza tostadas.',
        },
        {
          name: 'Tostadas de hongos',
          price: '$150',
          description:
            'Tres tostadas de hongos al ajillo, aguacate y salsa de chile guajillo.',
        },
        {
          name: 'Pescado en hoja de plátano',
          price: '$235',
          description:
            'Filete al vapor con arroz de cilantro y verduras salteadas.',
        },
        {
          name: 'Sopa de verduras de la casa',
          price: '$95',
          description:
            'Caldo ligero con verduras de temporada y un toque de epazote.',
        },
        {
          name: 'Agua fresca de jamaica y rosas',
          price: '$55',
          description:
            'Jamaica, pétalos de rosa y piloncillo, servida en jarra.',
        },
      ],
      promos: [
        {
          tag: 'Comida corrida',
          title: 'Menú del día, lunes a viernes',
          text: 'Sopa, bowl del día, agua fresca y postre por $175.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar para el menú del día}}',
        },
        {
          tag: 'Eventos',
          title: 'Desayunos y comidas para grupos',
          text: 'Reservamos el comedor para grupos de hasta 24 personas.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una comida para un grupo}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Platillos',
      title: 'Del mercado a tu <span class="lz-title__serif">mesa</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Bowl de la milpa',
          alt: 'Bowl con frijoles, calabacita, elote y aguacate sobre una mesa clara',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Tostadas de hongos',
          alt: 'Tostadas con hongos salteados y aguacate en un plato',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Tortillas del día',
          alt: 'Manos formando tortillas de maíz sobre un comal',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Pescado al vapor',
          alt: 'Filete de pescado con limón y hierbas frescas en un plato',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'El comedor',
          alt: 'Comedor luminoso con mesas de madera clara y plantas',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Aguas frescas',
          alt: 'Jarras de agua fresca de jamaica y fruta con hielo',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Postre de temporada',
          alt: 'Postre de fruta con crema en un plato blanco',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'La barra de jugos',
          alt: 'Barra con frutas, jugos y vasos de vidrio',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Cocina',
      title: 'Quién <span class="lz-title__serif">cocina</span>',
      members: [
        {
          name: 'Renata Villalobos',
          role: 'Chef y fundadora',
          tags: ['Cocina de mercado', 'Milpa'],
          image: 'team-1.jpg',
          imageAlt:
            'Retrato de Renata Villalobos con filipina blanca en la cocina',
        },
        {
          name: 'Emilio Barrera',
          role: 'Parrilla y vapor',
          tags: ['Pescados', 'Verduras'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Emilio Barrera junto a la estufa',
        },
        {
          name: 'Ximena Cortés',
          role: 'Panadería y postres',
          tags: ['Masa madre', 'Fruta'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Ximena Cortés con harina en las manos',
        },
        {
          name: 'Tomás Aguirre',
          role: 'Sala y barra',
          tags: ['Aguas frescas', 'Servicio'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Tomás Aguirre detrás de la barra de jugos',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.7',
      summary: 'Opiniones de ejemplo en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Fuimos a desayunar un sábado y el bowl de la milpa nos dejó contentos. La mesa junto a la ventana, perfecta.',
          author: 'Daniela R.',
        },
        {
          text: 'Reservé por WhatsApp en un minuto. Nos atendieron con calma y las tortillas azules estaban recién hechas.',
          author: 'Miguel A.',
        },
        {
          text: 'Hicimos la comida de cumpleaños de mi mamá en el comedor. Hubo opciones veganas para todos.',
          author: 'Paola S.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro:
        'Dudas frecuentes sobre mesas, ingredientes y pedidos. Para otras, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Necesito reservar?',
          answer:
            'Los fines de semana te lo recomendamos. Entre semana casi siempre hay mesa, pero reservar por WhatsApp te asegura lugar.',
        },
        {
          question: '¿Tienen opciones veganas o vegetarianas?',
          answer:
            'Sí, la mayor parte del menú es vegetariana y hay platos veganos marcados. Pregunta por los ingredientes de cada uno.',
        },
        {
          question: '¿Manejan alérgenos?',
          answer:
            'Cuéntanos qué necesitas evitar y te decimos qué lleva cada platillo. Compartimos cocina, así que no podemos descartar trazas.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Aceptamos efectivo, tarjeta de débito o crédito, y también transferencia.',
        },
        {
          question: '¿Hacen pedidos para llevar?',
          answer:
            'Sí. Manda tu pedido por WhatsApp y te avisamos cuándo pasar. Lo empacamos en envases compostables.',
        },
        {
          question: '¿Hay dónde estacionarse?',
          answer:
            'No tenemos estacionamiento propio. Hay lugares en la calle y un estacionamiento público a dos cuadras.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Reservar',
      title: 'Te esperamos en <span class="lz-title__serif">Clavería</span>',
      contactText:
        'Reserva o pide para llevar por WhatsApp dentro del horario. Para grupos, mejor escríbenos al correo.',
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
          hours: 'Lun–Sáb 8:30–20:00 · Dom 9:00–17:00',
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
        'Comida saludable de temporada en Clavería, {{city}}. Mesa y pedidos para llevar por WhatsApp.',
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
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Sáb 8:30–20:00 · Dom 9:00–17:00',
        },
      ],
    },
  },
} satisfies ContentPack;
