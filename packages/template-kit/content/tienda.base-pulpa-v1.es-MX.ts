// GENERATED from specs/tienda-base-pulpa-v1.spec.json (spec 24604ee80ca9, file 1888c8b08ff0). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'tienda',
  locale: 'es-MX',
  business: {
    name: 'Pulpa',
    shortName: 'Pulpa',
    tagline: 'Smoothies y healthy snacks',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero pedir un smoothie',
    address: 'Calle Lamartine 0000, Col. Polanco V Sección, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@pulpabar.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=pulpa+polanco',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=pulpa+polanco',
  },
  head: {
    title: '{{name}} · Smoothies y snacks saludables en Polanco',
    description:
      'Barra de smoothies en Polanco, {{city}}: vasos con proteína, bowls y snacks. Haz tu pedido por WhatsApp.',
  },
  sections: {
    navbar: {
      notice: 'Abierto hoy desde las 7:00',
      cta: 'Pedir',
      links: [
        {
          label: 'Arma tu vaso',
          href: '#nosotros',
        },
        {
          label: 'Smoothies',
          href: '#servicios',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#ubicacion',
        },
      ],
    },
    hero: {
      chips: [
        'Proteína en cada vaso',
        'Receta base sin azúcar añadida',
        'Ingredientes que sí reconoces',
      ],
      sticker: 'Recién preparado',
      spotlightTitle: 'Vaso verde',
      spotlightText: 'Apio, espinaca y lima.',
      metaLabel: 'Listo en unos minutos',
      metaValue: 'Con tu nombre en el vaso',
      image: 'hero.jpg',
      imageAlt: 'Smoothie verde sobre una barra de jugos con fruta fresca',
      eyebrow: 'Smoothies y snacks · Polanco',
      title:
        'Smoothies con proteína y <span class="lz-title__serif">sin azúcar añadida</span>',
      text: 'Vasos hechos al momento con fruta, verdura y proteína. Pide por WhatsApp y pasa por ellos a la barra.',
      primaryCta: 'Pedir por WhatsApp',
      secondaryCta: 'Ver el menú',
      secondaryHref: '#servicios',
    },
    marquee: {
      label: 'Lo que encuentras en la tienda',
      items: [
        'Ropa de temporada',
        'Accesorios hechos a mano',
        'Regalos con envoltura',
        'Apartados por WhatsApp',
        'Envíos en la ciudad',
      ],
    },
    about: {
      kicker: '{{index}} — Tu mezcla',
      title: 'Tu vaso, a tu <span class="lz-title__serif">medida</span>',
      summary:
        'Escoge líquido, proteína y topping. Nosotros lo licuamos frente a ti.',
      features: [
        {
          title: 'Escoge tu líquido',
          text: 'Vegetales o fermentados, tú decides.',
          options: [
            {
              name: 'Leche de almendra',
            },
            {
              name: 'Leche de avena',
            },
            {
              name: 'Agua de coco',
            },
          ],
        },
        {
          title: 'Suma proteína',
          text: 'Con los gramos por porción a la vista.',
          options: [
            {
              name: 'Whey',
              note: '24 g',
            },
            {
              name: 'Chícharo',
              note: '22 g',
            },
          ],
        },
        {
          title: 'Cierra con un topping',
          text: 'Un toque crujiente o cremoso.',
          options: [
            {
              name: 'Chía',
            },
            {
              name: 'Cacao nibs',
            },
          ],
        },
      ],
      panelTitle: 'Un ejemplo de pedido',
      panelTag: 'Muestra',
      stats: [
        {
          label: 'Líquido',
          value: 'Avena',
        },
        {
          label: 'Proteína',
          value: 'Chícharo',
        },
        {
          label: 'Topping',
          value: 'Chía',
        },
        {
          label: 'Tiempo',
          value: '~4 minutos',
        },
      ],
      panelNote: 'Mándanos tu mezcla por WhatsApp y te avisamos cuando esté.',
      cta: 'Pedir esta mezcla',
      statement:
        'Pocas cosas, bien claras: lo que lleva el vaso lo ves en la barra.',
      image: 'about.jpg',
      imageAlt: 'Barra de jugos con ingredientes frescos',
      sticker: 'Talleres locales',
      paragraphs: [
        'Licuamos al momento, con fruta y verdura de la semana.',
        'Pides por WhatsApp y tu vaso te espera con tu nombre.',
      ],
    },
    services: {
      intro:
        'Precios de muestra en pesos. Los tamaños se confirman por WhatsApp.',
      cta: 'Lo quiero',
      products: [
        {
          name: 'Matcha verde',
          price: '$115',
          description: 'Espinaca, matcha y plátano con leche de almendra.',
          href: '{{whatsappUrl:Hola, quiero el matcha verde}}',
          badge: '22 g de proteína',
          tags: ['Verde'],
        },
        {
          name: 'Bosque rojo',
          price: '$120',
          description: 'Fresa, frambuesa y zarzamora con proteína de vainilla.',
          href: '{{whatsappUrl:Hola, quiero el bosque rojo}}',
          badge: '25 g de proteína',
          tags: ['Post-entreno'],
          flag: 'Favorito',
        },
        {
          name: 'Cacao y cacahuate',
          price: '$125',
          description: 'Cacao, cacahuate y avena con plátano maduro.',
          href: '{{whatsappUrl:Hola, quiero el de cacao y cacahuate}}',
          badge: '24 g de proteína',
          tags: ['Fibra'],
        },
        {
          name: 'Azul coco',
          price: '$130',
          description: 'Espirulina azul, piña y coco rallado en agua de coco.',
          href: '{{whatsappUrl:Hola, quiero el azul coco}}',
          badge: '20 g de proteína',
          tags: ['Refrescante'],
        },
      ],
      kicker: '{{index}} — Carta',
      title: 'Los de la <span class="lz-title__serif">casa</span>',
      prices: [
        {
          name: 'Matcha verde',
          price: '$115',
          description: 'Espinaca, matcha y plátano con leche de almendra.',
        },
        {
          name: 'Bosque rojo',
          price: '$120',
          description: 'Fresa, frambuesa y zarzamora con proteína de vainilla.',
        },
        {
          name: 'Cacao y cacahuate',
          price: '$125',
          description: 'Cacao, cacahuate y avena con plátano maduro.',
        },
        {
          name: 'Azul coco',
          price: '$130',
          description: 'Espirulina azul, piña y coco rallado en agua de coco.',
        },
      ],
      promos: [
        {
          tag: 'Pedidos grandes',
          title: 'Para tu clase o tu oficina',
          text: 'Escríbenos un día antes y los dejamos por tandas.',
          cta: 'Escribir',
          href: '{{whatsappUrl:Hola, quiero un pedido grande}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Fotos',
      title: 'Así se ve la <span class="lz-title__serif">tienda</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Aparador',
          alt: 'Aparador de la tienda con prendas de temporada',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Percheros',
          alt: 'Percheros de madera con ropa ordenada por color',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Accesorios',
          alt: 'Mesa con aretes, pulseras y bolsas',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Envoltura',
          alt: 'Manos envolviendo un regalo con papel kraft',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Probadores',
          alt: 'Probador con cortina de lino y espejo',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Del taller',
          alt: 'Artesana tejiendo una bolsa de palma',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Cerámica',
          alt: 'Repisa con tazas y platos de barro',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Fachada de la tienda con la puerta abierta',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quién te <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'Valeria Ortiz',
          role: 'Fundadora y compras',
          tags: ['Talleres', 'Colecciones'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Valeria Ortiz en la tienda',
        },
        {
          name: 'Emilio Rangel',
          role: 'Pedidos y envíos',
          tags: ['WhatsApp', 'Paquetería'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Emilio Rangel junto al mostrador',
        },
        {
          name: 'Ana Belén Cruz',
          role: 'Atención en tienda',
          tags: ['Tallas', 'Regalos'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Ana Belén Cruz sonriendo',
        },
        {
          name: 'Tomás Herrera',
          role: 'Fotografía del catálogo',
          tags: ['Fotos', 'Redes'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Tomás Herrera con una cámara',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.8',
      summary: '96 reseñas en Google',
      allReviewsCta: 'Ver reseñas',
      writeReviewCta: 'Escribir una reseña',
      reviews: [
        {
          text: 'El vaso verde con proteína vegetal me sacó de apuros después del gimnasio.',
          author: 'Valeria T.',
          place: 'Polanco',
          initial: 'V',
        },
        {
          text: 'Me avisan por WhatsApp cuando está listo y no hago fila.',
          author: 'Andrés L.',
          place: 'Anzures',
          initial: 'A',
        },
        {
          text: 'Los toppings cambian cada semana y siempre sabe a fruta de verdad.',
          author: 'Paola S.',
          place: 'Clienta frecuente',
          initial: 'P',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Dudas',
      title: 'Lo que <span class="lz-title__serif">preguntan</span>',
      intro: 'Respuestas rápidas sobre pedidos, ingredientes y proteínas.',
      cta: 'Escribirnos',
      items: [
        {
          question: '¿Hay opciones sin lácteos?',
          answer:
            'Sí: las bases son vegetales y la proteína puede ser de chícharo, sin costo extra.',
        },
        {
          question: '¿Qué lleva para endulzar?',
          answer:
            'Solo la fruta de cada receta. Si quieres un toque extra, te ofrecemos dátil.',
        },
        {
          question: '¿Puedo recoger mi pedido?',
          answer:
            'Claro. Mándanos tu orden por WhatsApp y te avisamos cuando esté listo en la barra.',
        },
        {
          question: '¿De cuántos gramos es la proteína?',
          answer:
            'Cada vaso muestra su porción: entre 20 y 25 g según la receta.',
        },
        {
          question: '¿Hay alérgenos?',
          answer:
            'Usamos nueces, lácteos, gluten y cacahuate. Cuéntanos tu alergia al pedir.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Ven por el tuyo',
      title: 'Estamos en <span class="lz-title__serif">Polanco</span>',
      contactText:
        'Atendemos pedidos por WhatsApp mientras la barra está abierta. Afuera hay biciletero.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Hacer pedido',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Pedir por WhatsApp',
      callCta: 'Llamar',
      branch: {
        name: 'Polanco',
        address: '{{address}}',
        hours: 'Lun–Vie 7:00–20:00 · Sáb y Dom 8:00–17:00',
        directionsUrl: 'https://maps.google.com/?q={{address}}',
        mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
        mapTitle: 'Mapa de la sucursal Polanco',
      },
    },
    'floating-whatsapp': {
      label: 'Hacer un pedido por WhatsApp',
    },
    footer: {
      about:
        'Smoothies, bowls y snacks en {{city}}, hechos al momento y listos por WhatsApp.',
      placeTitle: 'Ubicación',
      placeNote: 'Polanco, CDMX. Biciletero afuera.',
      scheduleTitle: 'Horario',
      schedule: [
        {
          label: 'Lunes a viernes',
          value: '7:00–20:00',
        },
        {
          label: 'Sábado y domingo',
          value: '8:00–17:00',
        },
      ],
      contactTitle: 'Contacto',
      branchesTitle: 'Barra',
      linksTitle: 'Secciones',
      links: [
        {
          label: 'Arma tu vaso',
          href: '#nosotros',
        },
        {
          label: 'Smoothies',
          href: '#servicios',
        },
        {
          label: 'Preguntas',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#ubicacion',
        },
      ],
      branches: [
        {
          name: 'Polanco',
          address: '{{address}}',
          hours: 'Lun–Vie 7:00–20:00 · Sáb y Dom 8:00–17:00',
        },
      ],
    },
  },
} satisfies ContentPack;
