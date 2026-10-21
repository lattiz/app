// GENERATED from specs/restaurante-claveria-verde-v2.spec.json (spec 4723322519ff, file edbb5a9be3e5). Do not edit: use the spec, or freeze.
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
      '{{name}} en la colonia Clavería, CDMX: cocina de temporada, carta con precios y mesa por WhatsApp de lunes a domingo.',
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
          label: 'Platillos',
          href: '#galeria',
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
        'Chiles, pimiento rojo, pepino, limones y cebolla morada sobre una mesa de madera',
      eyebrow: 'Cocina de temporada · Clavería',
      title:
        'Verduras del mercado, <span class="lz-title__serif">cocinadas</span> cada día en Clavería.',
      text: 'Una carta corta que cambia con lo que llega al mercado: guisos de olla, tortillas del día y aguas frescas. Reserva por WhatsApp y come sin prisa.',
      primaryCta: 'Reservar por WhatsApp',
      secondaryCta: 'Ver la carta',
      secondaryHref: '#servicios',
      sticker: 'Mesa para hoy',
      note: 'Lun–Sáb 8:30–20:00 · Dom 9:00–17:00',
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
      kicker: '{{index}} — La cocina',
      title: 'Del mercado de Clavería a tu mesa, sin atajos.',
      summary:
        'Cada mañana vamos al mercado de la colonia, elegimos lo que está en su punto y armamos la carta del día. Cocinamos con poco aceite y con recetas de casa.',
      statement:
        'Elegimos lo que está en su punto en el mercado y lo cocinamos con calma.',
      image: 'about.jpg',
      imageAlt:
        'Cocinero emplatando una berenjena rellena de verduras con pinzas',
      sticker: 'Desde 2019',
      paragraphs: [
        '{{shortName}} empezó como una barra de jugos en una esquina de Clavería. Hoy tiene comedor, cocina a la vista y una carta que cambia con la temporada.',
        'Compramos a productores de Xochimilco y Milpa Alta, y lo que sobra del día no se guarda: se vuelve el caldo de mañana.',
        'Entre semana hay comida corrida; los fines de semana, desayunos largos. Pasa a la hora que quieras.',
      ],
      stats: [
        {
          value: 'Desde 2019',
          label: 'En la misma esquina',
        },
        {
          value: '6 de la mañana',
          label: 'Compras en el mercado',
        },
        {
          value: '3 turnos',
          label: 'Desayuno, comida, cena',
        },
      ],
      body: 'Las tortillas se hacen al momento y las salsas se muelen en molcajete. Cuando algo no llega, no lo ponemos.',
      plateLabel: 'Cocina a la vista',
      plateTitle: 'Camote y verdura de temporada',
      plateAside: 'Cambia cada semana',
      features: [
        {
          title: 'Compra diaria',
          text: 'Verdura, hierbas y chiles del mercado de la colonia.',
        },
        {
          title: 'Cocina de olla',
          text: 'Guisos lentos y caldos con poca grasa.',
        },
        {
          title: 'Masa propia',
          text: 'Tortillas y pan de masa madre hechos aquí.',
        },
      ],
      steps: [
        {
          title: 'Mándanos un mensaje',
          text: 'Dinos día, hora y cuántos van a venir.',
        },
        {
          title: 'Te confirmamos la mesa',
          text: 'Respondemos en horario de atención y apartamos tu lugar.',
        },
        {
          title: 'Llega y come sin prisa',
          text: 'Tu mesa te espera hasta 15 minutos después de la hora.',
        },
      ],
      primaryCta: 'Reservar por WhatsApp',
    },
    services: {
      kicker: 'La carta',
      title: 'La <span class="lz-title__serif">carta</span> de la semana',
      intro:
        'Los precios son de ejemplo. Los platos de temporada cambian cada semana.',
      image: 'product-01.jpg',
      imageAlt:
        'Enchiladas bañadas en salsa cremosa sobre un plato, con un tenedor',
      badge: 'Plato de la semana',
      featuredName: 'Enchiladas de pollo en salsa cremosa',
      featuredText:
        'Tortillas de maíz rellenas de pollo deshebrado, bañadas en salsa de chile poblano con crema y queso fresco. Se sirven con frijoles de la olla.',
      chipsLabel: 'Lleva:',
      chips: [
        'Maíz nixtamalizado',
        'Pollo deshebrado',
        'Chile poblano',
        'Queso fresco',
      ],
      featuredPrice: '$185',
      featuredCta: 'Pedir por WhatsApp',
      featuredHref:
        '{{whatsappUrl:Hola, quiero pedir las enchiladas de la semana}}',
      prices: [
        {
          name: 'Sopa de tortilla',
          price: '$95',
          description:
            'Caldo de jitomate con chile pasilla, aguacate y queso fresco.',
        },
        {
          name: 'Tostadas de hongos',
          price: '$150',
          description: 'Hongos al ajillo, aguacate y salsa de guajillo.',
        },
        {
          name: 'Bowl de la milpa',
          price: '$165',
          description: 'Frijol, calabacita, elote y tortilla de maíz azul.',
        },
        {
          name: 'Pescado en hoja de plátano',
          price: '$235',
          description: 'Al vapor, con arroz de cilantro y verduras salteadas.',
        },
        {
          name: 'Flan de cajeta',
          price: '$85',
          description: 'Con nuez tostada y un toque de sal.',
        },
        {
          name: 'Agua de jamaica y rosas',
          price: '$55',
          description: 'Jarra para compartir, con piloncillo.',
        },
      ],
      promos: [
        {
          tag: 'Lun–Vie',
          title: 'Comida corrida con postre',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar la comida corrida}}',
        },
        {
          tag: 'Grupos',
          title: 'Mesa para 8 a 24 personas',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una comida para un grupo}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — En la mesa',
      title: 'Lo que sale de <span class="lz-title__serif">la cocina</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Comedor con luz de mediodía',
          alt: 'Comedor con mesas de madera, sillas y una barra al fondo',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Tacos al pastor',
          alt: 'Plato de tacos al pastor con salsa y chiles en vinagre',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Totopos y pico de gallo',
          alt: 'Tazón de totopos con pico de gallo y guacamole',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Tacos de pescado',
          alt: 'Tacos de pescado empanizado con crema, cilantro y frijoles',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Bowl de temporada',
          alt: 'Bowl con verduras, aguacate y aderezo en una mesa de madera',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Jamaica',
          alt: 'Taza de té de jamaica rodeada de flores secas',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Flan de la casa',
          alt: 'Flan con caramelo y frambuesas en un plato',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Agua fresca de naranja',
          alt: 'Vaso de jugo de naranja con hielo sobre una tabla',
        },
      ],
      intro: 'Ocho momentos del día, del comal a la sobremesa.',
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
      kicker: '{{index}} — Opiniones',
      score: '4.8',
      summary: '320 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'El guiso de la semana estaba en su punto y las tortillas llegaron calientitas. Volvimos a la semana siguiente.',
          author: 'Lucía M.',
          place: 'Vecina de Clavería',
          initials: 'LM',
          stars: 5,
        },
        {
          text: 'Reservamos por WhatsApp y la mesa estaba lista. Hay opciones veganas que no son una ensalada triste.',
          author: 'Andrés P.',
          place: 'Comida entre semana',
          initials: 'AP',
          stars: 5,
        },
        {
          text: 'Celebramos un cumpleaños de doce personas y nos atendieron con calma. Pidan la jamaica con rosas.',
          author: 'Karla V.',
          place: 'Comida en grupo',
          initials: 'KV',
          stars: 5,
        },
      ],
      title: 'Lo que dicen en la <span class="lz-title__serif">mesa</span>',
      intro: 'Opiniones de ejemplo de quienes ya comieron aquí.',
    },
    faq: {
      kicker: '{{index}} — Antes de venir',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Mesas, alérgenos y pedidos para llevar. Para otras dudas, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Hace falta reservar?',
          answer:
            'De lunes a jueves casi siempre hay mesa. De viernes a domingo conviene reservar por WhatsApp.',
        },
        {
          question: '¿Hay platos veganos?',
          answer:
            'Sí, están marcados en la carta. Pregunta por el guiso vegano del día.',
        },
        {
          question: '¿Qué hago si tengo una alergia?',
          answer:
            'Avísanos al reservar o al pedir. Compartimos cocina, así que no podemos asegurar que no haya trazas.',
        },
        {
          question: '¿Puedo pedir para llevar?',
          answer:
            'Sí. Manda tu pedido por WhatsApp y te avisamos cuándo pasar por él.',
        },
        {
          question: '¿Aceptan tarjeta?',
          answer: 'Aceptamos efectivo, tarjeta y transferencia.',
        },
        {
          question: '¿Dónde me estaciono?',
          answer:
            'No tenemos estacionamiento propio. Hay lugar en la calle y un estacionamiento público a dos cuadras.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      hoursLabel: 'Horario',
      whatsappCta: 'Reservar por WhatsApp',
      imageCaption: 'El comedor de {{shortName}}',
      imageNote: 'Mesas adentro y en la terraza',
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
      title: 'Mesa lista en <span class="lz-title__serif">Clavería</span>',
      contactText:
        'Reserva o pide para llevar por WhatsApp en horario de atención. Si vienes en grupo, avísanos con un día de anticipación.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar mesa',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      callCta: 'Llamar',
      whatsappNote: 'Respondemos en horario de atención',
      callNote: 'Para avisar si llegas tarde',
      emailNote: 'Para grupos y eventos en el comedor',
      image: 'gallery-01.jpg',
      imageAlt: 'Comedor con mesas de madera, sillas y una barra al fondo',
    },
    'floating-whatsapp': {
      label: 'Reservar por WhatsApp',
    },
    footer: {
      about:
        'Cocina de temporada en Clavería, {{city}}. Mesas y pedidos para llevar por WhatsApp.',
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
          label: 'Platillos',
          href: '#galeria',
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
    cta: {
      title: 'Reserva tu mesa antes de las 2 de la tarde',
      text: 'Escríbenos con día, hora y número de personas. Te confirmamos por el mismo chat.',
      primaryCta: 'Reservar por WhatsApp',
      secondaryCta: 'Ver la carta',
      secondaryHref: '#servicios',
    },
  },
} satisfies ContentPack;
