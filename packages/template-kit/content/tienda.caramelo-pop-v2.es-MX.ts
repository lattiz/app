// GENERATED from specs/tienda-caramelo-pop-v2.spec.json (spec 8e0f9df6d256, file 4a28f4390332). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'tienda',
  locale: 'es-MX',
  business: {
    name: 'Caramelo Pop',
    shortName: 'Caramelo',
    tagline: 'Dulces americanos',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero pedir una caja de dulces',
    address: 'Calle Gomita 17, Col. Clavería, Azcapotzalco, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@caramelopop.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=caramelo+pop+claveria',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=caramelo+pop+claveria',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: dulces importados de Estados Unidos, cajas armadas y pedidos por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Pide tu caja',
      links: [
        {
          label: 'La tienda',
          href: '#nosotros',
        },
        {
          label: 'Catálogo',
          href: '#servicios',
        },
        {
          label: 'Fotos',
          href: '#galeria',
        },
        {
          label: 'Envíos',
          href: '#preguntas',
        },
        {
          label: 'Visítanos',
          href: '#sucursales',
        },
      ],
    },
    hero: {
      sticker: 'Importados',
      note: 'Pedidos por WhatsApp',
      image: 'hero.jpg',
      imageAlt: 'Frascos y bolsas de dulces de colores en un estante de tienda',
      eyebrow: 'Tienda de dulces · Clavería',
      title: 'Dulces de allá, caja armada aquí',
      text: 'Chocolates, gomitas, sodas y snacks importados de Estados Unidos. Arma tu caja o llévate una bolsa.',
      primaryCta: 'Pide tu caja',
      secondaryCta: 'Ver categorías',
      secondaryHref: '#servicios',
      facts: [
        {
          value: 'Chocolates',
          label: 'Con maní, caramelo y relleno',
        },
        {
          value: 'Gomitas',
          label: 'Ácidas, suaves y de frutas',
        },
        {
          value: 'Sodas',
          label: 'Importadas de Estados Unidos',
        },
      ],
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
      kicker: '{{index}} — Nosotros',
      title: 'Dulces de otro lado, en tu colonia',
      summary:
        'En {{shortName}} juntamos dulces importados de Estados Unidos y los vendemos por pieza, en bolsa o en caja.',
      statement:
        'Dulces para probar, regalar y compartir. Elige uno o arma la caja completa.',
      image: 'about.jpg',
      imageAlt: 'Mostrador con frascos de dulces y una caja de regalo abierta',
      sticker: 'Por pieza o en caja',
      paragraphs: [
        '{{shortName}} empezó con un estante y hoy hay pasillos de gomitas, chocolates y sodas.',
        'Cambiamos las novedades por temporada: Halloween, Navidad y lo que llegue.',
        'Si no sabes qué probar, armamos una caja de prueba con un poco de todo.',
      ],
      stats: [
        {
          value: '6 categorías',
          label: 'De dulces y snacks',
        },
        {
          value: 'Temporada',
          label: 'Halloween y Navidad',
        },
        {
          value: 'Cajas',
          label: 'A tu medida',
        },
      ],
    },
    services: {
      products: [
        {
          name: 'Chocolates',
          price: 'Desde $35',
          description: 'Con maní, caramelo o relleno cremoso.',
          image: 'product-01.jpg',
          imageAlt: 'Barras de chocolate con envoltura sobre una mesa',
          href: '{{whatsappUrl:Hola, quiero chocolates}}',
          tag: 'Más pedido',
          chips: ['Con maní', 'Caramelo', 'Relleno'],
        },
        {
          name: 'Gomitas',
          price: 'Desde $30',
          description: 'Ácidas, suaves y de frutas, en bolsa.',
          image: 'product-02.jpg',
          imageAlt: 'Tazón con gomitas de colores',
          href: '{{whatsappUrl:Hola, quiero gomitas}}',
          tag: 'Favoritas',
          chips: ['Ácidas', 'Suaves', 'Frutas'],
        },
        {
          name: 'Sodas importadas',
          price: 'Desde $38',
          description: 'Importadas de Estados Unidos, en lata y botella.',
          image: 'product-03.jpg',
          imageAlt: 'Vaso de refresco con hielo y popote',
          href: '{{whatsappUrl:Hola, quiero sodas importadas}}',
          tag: 'Importadas',
          chips: ['Lata', 'Botella', 'Edición limitada'],
        },
        {
          name: 'Snacks',
          price: 'Desde $40',
          description: 'Salados y dulces para compartir.',
          image: 'product-04.jpg',
          imageAlt: 'Palomitas de maíz en un recipiente',
          href: '{{whatsappUrl:Hola, quiero snacks}}',
          tag: 'Para compartir',
          chips: ['Dulces', 'Salados', 'Mezcla'],
        },
      ],
      kicker: '{{index}} — Categorías',
      title:
        'Cuatro formas de <span class="lz-title__serif">endulzar</span> el día',
      intro:
        'Precios de referencia en pesos. Existencias y envíos se confirman por WhatsApp.',
      cta: 'Pedir',
      prices: [
        {
          name: 'Chocolates',
          price: 'Desde $35',
          description: 'Con maní, caramelo o relleno cremoso.',
        },
        {
          name: 'Gomitas',
          price: 'Desde $30',
          description: 'Ácidas, suaves y de frutas, en bolsa.',
        },
        {
          name: 'Sodas importadas',
          price: 'Desde $38',
          description: 'Importadas de Estados Unidos, en lata y botella.',
        },
        {
          name: 'Snacks',
          price: 'Desde $40',
          description: 'Salados y dulces para compartir.',
        },
      ],
      promos: [
        {
          tag: 'Arma tu caja',
          title: 'Caja de regalo o para llevar',
          text: 'Elige 8, 12 o 20 piezas y la armamos.',
          cta: 'Pide tu caja',
          href: '{{whatsappUrl:Hola, quiero armar una caja de dulces}}',
        },
        {
          tag: 'Fiestas',
          title: 'Mesas de dulces y mayoreo',
          text: 'Cotiza para fiestas, eventos y tiendas.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una mesa de dulces}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — La tienda',
      title: 'Un vistazo a los <span class="lz-title__serif">pasillos</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Gomitas a granel',
          alt: 'Contenedores con gomitas de colores',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Dulces surtidos',
          alt: 'Dulces de colores variados en exhibición',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Postres para regalar',
          alt: 'Cupcakes con crema y decoración de dulces',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Caja armada',
          alt: 'Dulces y chocolates surtidos',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Mesa de dulces',
          alt: 'Mesa con macarons y postres rosas',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Paletas de pastel',
          alt: 'Paletas de pastel decoradas',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Cereales',
          alt: 'Tazón de cereal con leche',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Novedades de temporada',
          alt: 'Dulces de temporada de color naranja y amarillo',
        },
      ],
      intro:
        'Un vistazo a los estantes, las cajas y las novedades de temporada.',
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
      kicker: '{{index}} — Clientes',
      title:
        'Lo que dicen <span class="lz-title__serif">nuestros clientes</span>',
      intro:
        'La alegría de abrir una cajita, en voz de quienes ya la probaron.',
      reviews: [
        {
          text: 'Armé una caja para el cumpleaños de mi sobrino y estuvo lista el mismo día.',
          author: 'Daniela R.',
          initials: 'DR',
          place: 'Azcapotzalco',
          stars: '5',
        },
        {
          text: 'Pedí por WhatsApp y me dijeron qué había en existencia antes de pagar.',
          author: 'Miguel A.',
        },
        {
          text: 'Probamos varias gomitas para una mesa de dulces y nos ayudaron a elegir sin prisa.',
          author: 'Paola S.',
        },
      ],
      score: '4.8',
      summary: '212 reseñas en Google',
      allReviewsCta: 'Ver reseñas en Google',
      writeReviewCta: 'Dejar reseña en Google',
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">pedir</span>',
      intro: 'Respuestas cortas para ir directo al dulce.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cómo hago un pedido?',
          answer:
            'Escríbenos por WhatsApp con lo que quieres. Te confirmamos existencias y precio.',
        },
        {
          question: '¿Hacen envíos?',
          answer:
            'Sí. El costo y el tiempo se confirman por WhatsApp según tu zona.',
        },
        {
          question: '¿De dónde son los dulces?',
          answer:
            'Importados de Estados Unidos. Las existencias cambian según la temporada.',
        },
        {
          question: '¿Venden al mayoreo?',
          answer:
            'Sí. Cotizamos fiestas, eventos y tiendas. Escríbenos con la cantidad aproximada.',
        },
        {
          question: '¿Hay alérgenos?',
          answer:
            'Revisa la etiqueta de cada producto. Si tienes alguna alergia, pregúntanos antes de comprar.',
        },
        {
          question: '¿Pueden armar una caja de regalo?',
          answer: 'Sí. Dinos el presupuesto y los gustos, y la armamos.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Pedidos',
      hoursLabel: 'Horario',
      whatsappCta: 'Pedir por WhatsApp',
      imageCaption: 'Pasa por tu bolsa',
      imageNote: 'Abierto hoy',
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Sáb 10:00–20:00 · Dom 11:00–18:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      ],
      title: 'Pide tu caja',
      contactText:
        'Compras y pedidos por WhatsApp. Envíos y existencias se confirman por mensaje.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Pide tu caja',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      callCta: 'Llamar',
      image: 'about.jpg',
      imageAlt: 'Frascos de vidrio con dulces de colores',
    },
    'floating-whatsapp': {
      label: 'Pedir por WhatsApp',
    },
    footer: {
      about:
        'Tienda de dulces americanos en Clavería, {{city}}. Pedidos y envíos por WhatsApp.',
      branchesTitle: 'Dónde estamos',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      links: [
        {
          label: 'La tienda',
          href: '#nosotros',
        },
        {
          label: 'Catálogo',
          href: '#servicios',
        },
        {
          label: 'Fotos',
          href: '#galeria',
        },
        {
          label: 'Envíos',
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
          hours: 'Lun–Sáb 10:00–20:00 · Dom 11:00–18:00',
        },
      ],
    },
  },
} satisfies ContentPack;
