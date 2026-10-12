// GENERATED from specs/tienda-lote-doce.spec.json (spec 3065d05f2254, file 38704e53803b). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'tienda',
  locale: 'es-MX',
  business: {
    name: 'Lote Doce',
    shortName: 'Lote Doce',
    tagline: 'Tienda y catálogo',
    city: 'Guadalajara',
    phone: '+52 33 0000 0000',
    whatsapp: '5213300000000',
    whatsappMessage: 'Hola, quiero hacer un pedido',
    address: 'Calle Libertad 1820, Col. Americana, Guadalajara',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'pedidos@lotedoce.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=lote+doce+colonia+americana',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=lote+doce+colonia+americana',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: catálogo con fotos y precios, apartados y envíos. Pide por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Hacer pedido',
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
      image: 'hero.jpg',
      imageAlt: 'Mostrador de una tienda con prendas dobladas y accesorios',
      eyebrow: 'Tienda y catálogo · Colonia Americana',
      title:
        'Piezas elegidas <span class="lz-title__serif">una por una</span>.',
      text: 'Ropa, accesorios y regalos de pequeños talleres. Mira el catálogo, aparta por WhatsApp y recoge en tienda o recibe en casa.',
      primaryCta: 'Pedir por WhatsApp',
      secondaryCta: 'Ver catálogo',
      secondaryHref: '#servicios',
      sticker: 'Novedades cada semana',
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
      kicker: '{{index}} — La tienda',
      title:
        'Una tienda <span class="lz-title__serif">pequeña</span>, con criterio.',
      summary:
        'En {{shortName}} elegimos cada pieza por cómo se siente, cuánto dura y quién la hizo. Pocas cosas, bien hechas, a precios claros.',
      statement:
        'Preferimos pocas piezas bien hechas a un catálogo enorme: si está en la tienda, la probamos antes.',
      image: 'about.jpg',
      imageAlt: 'Interior de la tienda con percheros de madera y luz natural',
      sticker: 'Talleres locales',
      paragraphs: [
        'Trabajamos con talleres de la región y te contamos de dónde viene cada pieza.',
        'Si algo te gusta, lo apartamos por WhatsApp hasta por tres días sin costo.',
        'Envolvemos para regalo y enviamos dentro de la ciudad; fuera de ella, por paquetería.',
      ],
      stats: [
        {
          value: '+300',
          label: 'Piezas en catálogo',
        },
        {
          value: '12',
          label: 'Talleres aliados',
        },
        {
          value: '4.8 ★',
          label: 'En Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Catálogo',
      title: 'Lo más <span class="lz-title__serif">pedido</span>',
      intro:
        'Precios en pesos mexicanos. Existencias y tallas se confirman por WhatsApp.',
      cta: 'Pedir',
      products: [
        {
          name: 'Blusa de lino',
          price: '$690',
          description: 'Corte holgado, tallas CH a G. Tres colores.',
          image: 'product-01.jpg',
          imageAlt: 'Blusa de lino color arena colgada en un gancho de madera',
          href: '{{whatsappUrl:Hola, quiero la blusa de lino}}',
        },
        {
          name: 'Bolsa tejida',
          price: '$520',
          description: 'Tejida a mano en palma, con forro y asa larga.',
          image: 'product-02.jpg',
          imageAlt: 'Bolsa tejida de palma sobre una mesa clara',
          href: '{{whatsappUrl:Hola, quiero la bolsa tejida}}',
        },
        {
          name: 'Aretes de latón',
          price: '$280',
          description: 'Ligeros, hechos en taller. Incluyen estuche.',
          image: 'product-03.jpg',
          imageAlt: 'Par de aretes dorados de latón sobre tela',
          href: '{{whatsappUrl:Hola, quiero los aretes de latón}}',
        },
        {
          name: 'Taza de barro',
          price: '$240',
          description: 'Barro esmaltado, 350 ml. Cada una es distinta.',
          image: 'product-04.jpg',
          imageAlt: 'Taza de barro esmaltado en color verde',
          href: '{{whatsappUrl:Hola, quiero la taza de barro}}',
        },
        {
          name: 'Pantalón recto',
          price: '$790',
          description: 'Gabardina de algodón, tiro alto. Tallas 26 a 34.',
          image: 'product-05.jpg',
          imageAlt: 'Pantalón recto color olivo doblado',
          href: '{{whatsappUrl:Hola, quiero el pantalón recto}}',
        },
        {
          name: 'Caja de regalo',
          price: '$450',
          description: 'Arma la tuya con tres piezas y la envolvemos.',
          image: 'product-06.jpg',
          imageAlt: 'Caja de regalo de cartón con listón y tarjeta',
          href: '{{whatsappUrl:Hola, quiero armar una caja de regalo}}',
        },
      ],
      prices: [
        {
          name: 'Envío en la ciudad',
          price: '$90',
          description: 'Entrega en 24 a 48 horas hábiles.',
        },
        {
          name: 'Envío nacional',
          price: 'Desde $180',
          description: 'Por paquetería, con número de guía.',
        },
        {
          name: 'Apartado',
          price: 'Sin costo',
          description: 'Te guardamos la pieza hasta tres días.',
        },
        {
          name: 'Envoltura de regalo',
          price: '$40',
          description: 'Papel, listón y tarjeta escrita a mano.',
        },
        {
          name: 'Cambio de talla',
          price: 'Sin costo',
          description: 'En los primeros 7 días, con etiqueta.',
        },
        {
          name: 'Pedido por mayoreo',
          price: 'Cotiza',
          description: 'Para eventos o tiendas, desde 10 piezas.',
        },
      ],
      promos: [
        {
          tag: 'Nuevo',
          title: 'Llegó la colección de temporada',
          text: 'Piezas nuevas cada semana: pide la lista completa por WhatsApp.',
          cta: 'Ver lista',
          href: '{{whatsappUrl:Hola, quiero la lista de novedades}}',
        },
        {
          tag: 'Regalos',
          title: 'Te armamos el regalo',
          text: 'Dinos el presupuesto y para quién es; te mandamos opciones con foto.',
          cta: 'Armar regalo',
          href: '{{whatsappUrl:Hola, quiero que me armen un regalo}}',
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
      summary: '212 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Pedí por WhatsApp una blusa en otra talla y me la apartaron en minutos. Llegó envuelta y con una nota.',
          author: 'Mariana R.',
        },
        {
          text: 'Les dije mi presupuesto para un regalo y me mandaron tres opciones con foto. Muy fácil.',
          author: 'Jorge L.',
        },
        {
          text: 'La tienda es pequeña pero todo está bien elegido. Siempre encuentro algo distinto.',
          author: 'Daniela P.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Envíos',
      title: 'Pedidos y <span class="lz-title__serif">envíos</span>',
      intro:
        'Lo que más nos preguntan antes de comprar. Si tienes otra duda, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Cómo hago un pedido?',
          answer:
            'Escríbenos por WhatsApp con la pieza y la talla. Te confirmamos existencia, total y forma de entrega.',
        },
        {
          question: '¿Hacen envíos?',
          answer:
            'Sí. Dentro de la ciudad en 24 a 48 horas hábiles y al resto del país por paquetería, con número de guía.',
        },
        {
          question: '¿Puedo apartar una pieza?',
          answer:
            'Sí, te la guardamos hasta tres días sin costo. Después vuelve al catálogo.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Efectivo y tarjeta en tienda; transferencia o enlace de pago para pedidos a domicilio.',
        },
        {
          question: '¿Puedo cambiar la talla?',
          answer:
            'Sí, en los primeros 7 días, con la etiqueta puesta y el ticket o mensaje de compra.',
        },
        {
          question: '¿Envuelven para regalo?',
          answer:
            'Sí: papel, listón y una tarjeta escrita a mano por $40. Avísanos al pedir.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Ven a la <span class="lz-title__serif">tienda</span>',
      contactText:
        'Contestamos pedidos por WhatsApp en horario de la tienda. Los pedidos de fin de semana salen el lunes.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Hacer pedido',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Pedir por WhatsApp',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Colonia Americana',
          address: '{{address}}',
          hours: 'Lun–Sáb 11:00–20:00 · Dom 11:00–16:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Colonia Americana',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Hacer un pedido por WhatsApp',
    },
    footer: {
      about:
        'Tienda en {{city}}. Ropa, accesorios y regalos de talleres locales, con pedidos por WhatsApp.',
      branchesTitle: 'Tienda',
      linksTitle: 'Secciones',
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
          name: 'Colonia Americana',
          address: '{{address}}',
          hours: 'Lun–Sáb 11:00–20:00 · Dom 11:00–16:00',
        },
      ],
    },
  },
} satisfies ContentPack;
