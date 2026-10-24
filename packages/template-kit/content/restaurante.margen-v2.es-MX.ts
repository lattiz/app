// GENERATED from specs/restaurante-margen-v2.spec.json (spec 880697027b0b, file c6084ab6f98a). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'Margen Café',
    shortName: 'Margen',
    tagline: 'Café de especialidad y postres',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero hacer un pedido en Margen',
    address: 'Calle Tebas 57, Col. Clavería, Azcapotzalco, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@margencafe.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=margen+cafe+claveria',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=margen+cafe+claveria',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en Clavería, {{city}}: café de especialidad, postres artesanales y sándwiches gourmet. Pedidos por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Pedir',
      links: [
        {
          label: 'La casa',
          href: '#nosotros',
        },
        {
          label: 'La barra',
          href: '#servicios',
        },
        {
          label: 'Galería',
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
      imageAlt: 'Taza de café con arte latte sobre una mesa de madera oscura',
      eyebrow: 'Café de especialidad · Clavería',
      title: 'Café lento, <span class="lz-title__serif">página</span> abierta.',
      text: 'Café de especialidad, postres de la barra y sándwiches en pan de masa madre. Una mesa junto a la ventana, en Clavería.',
      primaryCta: 'Pedir por WhatsApp',
      secondaryCta: 'Ver la barra',
      secondaryHref: '#servicios',
      sticker: 'Recién molido',
      kicker: '01 / Clavería',
      tag: 'Café de especialidad',
      info: [
        {
          label: 'Horario',
          value: 'Lun–Vie 8:00–20:00',
        },
        {
          label: 'Colonia',
          value: 'Clavería',
        },
        {
          label: 'Pedidos',
          value: 'Por WhatsApp',
        },
      ],
    },
    marquee: {
      label: 'En la barra hoy',
      items: [
        'Café de Veracruz y Chiapas',
        'Filtrados en V60',
        'Pan de masa madre',
        'Postres de la casa',
        'Rincón de lectura',
      ],
    },
    about: {
      kicker: '{{index}} — La casa',
      title: 'Un rincón para <span class="lz-title__serif">quedarse</span>',
      summary:
        '{{shortName}} es una cafetería pequeña en Clavería: doce lugares, un librero para tomar prestado, plantas en la ventana y una barra donde preparamos todo frente a ti.',
      statement:
        'Aquí el café se hace despacio: molemos al momento, servimos en taza de barro y nadie te apura la mesa.',
      image: 'about.jpg',
      imageAlt: 'Barista sirviendo café filtrado en una barra de madera clara',
      sticker: 'Molido al momento',
      paragraphs: [
        'Abrimos en una casa vieja de Clavería. Conservamos el piso de pasta y la ventana grande; lo demás son libros, madera clara y plantas que crecen por la pared.',
        'Compramos café de pequeños productores de Veracruz y Chiapas y lo preparamos en espresso o filtrado, según el grano de la semana.',
        'Los postres y el pan salen de nuestro horno cada mañana. Los sándwiches se arman al momento, con pan de masa madre.',
      ],
      stats: [
        {
          value: '12',
          label: 'Lugares para sentarte',
        },
        {
          value: '6',
          label: 'Métodos de filtrado',
        },
        {
          value: '4.8',
          label: 'De 5 en Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — La barra',
      title: 'La <span class="lz-title__serif">barra</span>',
      intro:
        'Precios en pesos. Leche de avena o almendra sin costo extra; pregunta por el grano de la semana.',
      prices: [
        {
          name: 'Espresso doble',
          price: '$55',
          description: 'Grano de la semana, extraído al momento.',
        },
        {
          name: 'Latte de avena',
          price: '$75',
          description: 'Espresso doble con leche de avena texturizada.',
        },
        {
          name: 'Filtrado en V60',
          price: '$85',
          description:
            'Una taza de origen único; te contamos de qué finca viene.',
        },
        {
          name: 'Sándwich de pavo y brie',
          price: '$165',
          description:
            'Pan de masa madre, pavo horneado, brie, arúgula y mostaza de miel.',
        },
        {
          name: 'Focaccia caprese',
          price: '$145',
          description:
            'Jitomate, mozzarella fresca, albahaca y aceite de oliva.',
        },
        {
          name: 'Tarta de pera y almendra',
          price: '$90',
          description: 'Masa quebrada, crema de almendra y pera horneada.',
        },
      ],
      promos: [
        {
          tag: 'Entre semana',
          title: 'Mañanas de lectura',
          text: 'Filtrado del día y pan dulce por $95, de lunes a viernes de 8:00 a 11:00.',
          cta: 'Apartar mesa',
          href: '{{whatsappUrl:Hola, quiero apartar una mesa en la mañana}}',
        },
        {
          tag: 'Para casa',
          title: 'Café en grano de 250 g',
          text: 'Lo molemos para tu método: prensa, moka, V60 o espresso. Pídelo por WhatsApp.',
          cta: 'Pedir',
          href: '{{whatsappUrl:Hola, quiero una bolsa de café en grano}}',
        },
      ],
      note: 'Precios en pesos mexicanos',
      cta: 'Hacer pedido',
      groups: [
        {
          title: 'Café y bebidas',
          text: 'Granos de Veracruz y Chiapas, molidos al momento.',
          image: 'product-01.jpg',
          imageAlt: 'Café filtrado en V60 sobre una barra de madera',
          items: [
            {
              name: 'Espresso doble',
              price: '$55',
              description: 'Grano de la semana, extraído al momento.',
            },
            {
              name: 'Latte de avena',
              price: '$75',
              description: 'Espresso doble con leche de avena texturizada.',
            },
            {
              name: 'Filtrado en V60',
              price: '$85',
              description:
                'Una taza de origen único; te contamos de qué finca viene.',
            },
          ],
        },
        {
          title: 'Sándwiches y focaccias',
          text: 'Pan de masa madre horneado cada mañana.',
          image: 'product-02.jpg',
          imageAlt: 'Sándwich en pan de masa madre sobre un plato',
          items: [
            {
              name: 'Sándwich de pavo y brie',
              price: '$165',
              description: 'Pavo horneado, brie, arúgula y mostaza de miel.',
            },
            {
              name: 'Focaccia caprese',
              price: '$145',
              description:
                'Jitomate, mozzarella fresca, albahaca y aceite de oliva.',
            },
          ],
        },
        {
          title: 'Repostería',
          text: 'Del horno de la casa, todos los días.',
          image: 'product-03.jpg',
          imageAlt: 'Tarta horneada en una charola',
          items: [
            {
              name: 'Tarta de pera y almendra',
              price: '$90',
              description: 'Masa quebrada, crema de almendra y pera horneada.',
            },
            {
              name: 'Pan dulce del día',
              price: '$45',
              description: 'Pregunta qué salió del horno esta mañana.',
            },
          ],
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Galería',
      title: 'Luz de <span class="lz-title__serif">ventana</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Latte de avena',
          alt: 'Taza de cerámica con arte latte sobre una mesa de madera clara',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Pan de la mañana',
          alt: 'Croissants recién horneados en una charola',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Pavo y brie',
          alt: 'Sándwich en pan de masa madre partido a la mitad',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Tarta de pera',
          alt: 'Rebanada de tarta de pera y almendra en un plato de barro',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'El librero',
          alt: 'Rincón con sillón, librero y una lámpara encendida',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Filtrado en V60',
          alt: 'Barista vertiendo agua sobre un filtro de café en cono',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'La ventana',
          alt: 'Plantas colgantes y enredaderas junto a una ventana con luz de día',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Grano de la semana',
          alt: 'Bolsa de café en grano junto a una taza vacía',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Quién está en la <span class="lz-title__serif">barra</span>',
      members: [
        {
          name: 'Valeria Ríos',
          role: 'Fundadora y barista',
          tags: ['Filtrados', 'Catación'],
          image: 'team-1.jpg',
          imageAlt:
            'Retrato de Valeria Ríos con mandil de lona detrás de la barra',
        },
        {
          name: 'Tomás Aguilar',
          role: 'Compras de café',
          tags: ['Productores', 'Tueste'],
          image: 'team-2.jpg',
          imageAlt:
            'Retrato de Tomás Aguilar sosteniendo un costal de café verde',
        },
        {
          name: 'Sofía Medina',
          role: 'Repostería',
          tags: ['Tartas', 'Pan dulce'],
          image: 'team-3.jpg',
          imageAlt:
            'Retrato de Sofía Medina con harina en las manos junto al horno',
        },
        {
          name: 'Emilio Navarro',
          role: 'Cocina',
          tags: ['Sándwiches', 'Masa madre'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Emilio Navarro en la cocina abierta',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.8',
      summary: '260 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Vengo los sábados a leer un par de horas. Nadie te apura y el filtrado de Chiapas cambia cada semana; siempre me cuentan de dónde viene.',
          author: 'Regina T.',
        },
        {
          text: 'Pedí una tarta de pera entera por WhatsApp para el cumpleaños de mi mamá y estuvo lista a la hora acordada.',
          author: 'Andrés P.',
        },
        {
          text: 'El sándwich de pavo y brie con un latte de avena es mi comida de los martes. El lugar es pequeño y muy tranquilo.',
          author: 'Camila V.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro:
        'Mesas, leche vegetal, pedidos y mascotas. ¿Algo más? Mándanos un mensaje.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Puedo trabajar con mi computadora?',
          answer:
            'Sí, entre semana. Hay contactos en la barra y en la mesa larga; los fines de semana pedimos dejar las mesas pequeñas para quien viene a leer.',
        },
        {
          question: '¿Tienen leche vegetal?',
          answer:
            'Avena y almendra, sin costo extra. También hay opciones de postre sin lácteos; pregúntanos por las del día.',
        },
        {
          question: '¿Hacen pasteles o tartas por encargo?',
          answer:
            'Sí, con dos días de anticipación. Escríbenos por WhatsApp con el tamaño y la fecha.',
        },
        {
          question: '¿Puedo llevar a mi perro?',
          answer:
            'Sí, en la mesa de la entrada y con correa. Tenemos agua para él.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer: 'Efectivo, tarjeta de débito o crédito y transferencia.',
        },
        {
          question: '¿Hay estacionamiento?',
          answer:
            'No tenemos propio; en la calle suele haber lugar y hay un estacionamiento público a dos cuadras.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Pasa por tu <span class="lz-title__serif">taza</span>',
      contactText:
        'Pedidos para llevar y encargos por WhatsApp en horario de la cafetería. Para eventos pequeños, escríbenos por correo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Pedir para llevar',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Pedir por WhatsApp',
      callCta: 'Llamar',
      badge: 'Barra única',
      nearby: 'A pocas cuadras del metro · Bicis en la puerta',
      schedule: [
        {
          label: 'Lunes a viernes',
          value: '8:00 – 20:00',
        },
        {
          label: 'Sábado y domingo',
          value: '9:00 – 18:00',
          tag: 'Fin de semana',
        },
      ],
      scheduleNote: 'La cocina fría cierra media hora antes.',
      planNote: 'Croquis de barrio',
      routesTitle: 'Cómo llegar',
      routes: [
        {
          title: 'En metro',
          meta: 'Unos minutos',
          text: 'Baja en la estación más cercana y camina dos cuadras por la calle de la cafetería.',
        },
        {
          title: 'En bicicleta',
          meta: 'En la puerta',
          text: 'Hay un rack seguro frente al local para las bicis de clientes.',
        },
        {
          title: 'A pie',
          meta: 'De barrio',
          text: 'A pasos de la plaza de la colonia, por una banqueta con árboles.',
        },
      ],
      emailCta: 'Escribir',
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Lun–Vie 8:00–20:00 · Sáb y Dom 9:00–18:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Pedir por WhatsApp',
    },
    footer: {
      about:
        'Café de especialidad, postres artesanales y sándwiches gourmet en Clavería, {{city}}. Pedidos por WhatsApp.',
      branchesTitle: 'Dónde estamos',
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      placeTitle: 'Dónde estamos',
      placeNote: 'A unas cuadras del metro, sobre una calle tranquila.',
      scheduleTitle: 'Horario',
      schedule: [
        {
          label: 'Lunes a viernes',
          value: '8:00–20:00',
        },
        {
          label: 'Sábado y domingo',
          value: '9:00–18:00',
        },
      ],
      links: [
        {
          label: 'La casa',
          href: '#nosotros',
        },
        {
          label: 'La barra',
          href: '#servicios',
        },
        {
          label: 'Galería',
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
          hours: 'Lun–Vie 8:00–20:00 · Sáb y Dom 9:00–18:00',
        },
      ],
    },
    cta: {
      kicker: 'Edición limitada · esta semana',
      title: 'Hoy en barra: grano de la semana',
      stockLabel: 'Disponible:',
      stock: '12 bolsas de 250 g',
      blocks: [
        {
          title: 'Lote de la sierra norte de Puebla',
          text: 'Cultivado a 1,300 metros por una cooperativa pequeña. Proceso lavado y tueste medio.',
          notes: [
            'En taza: panela, naranja y cacao.',
            'Para prensa francesa o filtrado.',
          ],
        },
        {
          title: 'Horneada de temporada',
          text: 'Tarta de higo y requesón con masa de centeno. Sale a las 9:00 y se acaba.',
        },
      ],
      primaryCta: 'Apartar por WhatsApp',
    },
  },
} satisfies ContentPack;
