// GENERATED from specs/restaurante-fresca-nube.spec.json (spec ca4b32eadb34, file 8d4fff024fb3). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'Fresca Nube',
    shortName: 'Fresca Nube',
    tagline: 'Fresas, crepas y postres',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero hacer un pedido',
    address: 'Calle Pitágoras 1180, Narvarte Poniente, Benito Juárez, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@frescanube.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=fresca+nube+narvarte',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=fresca+nube+narvarte',
  },
  head: {
    title: '{{name}} · Fresas con crema y crepas en Narvarte',
    description:
      '{{name}} en Narvarte, {{city}}: fresas con crema, crepas artesanales y snacks dulces para llevar o para quedarte un rato.',
  },
  sections: {
    navbar: {
      cta: 'Hacer pedido',
      notice: 'Martes a domingo, de 12:00 a 21:00',
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
          label: 'Antojos',
          href: '#galeria',
        },
        {
          label: 'Reseñas',
          href: '#resenas',
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
        'Vaso de fresas con crema batida junto a una crepa con fresa sobre la barra',
      eyebrow: 'Fresas con crema · Narvarte',
      title:
        'Fresas con crema, <span class="lz-title__serif">recién</span> hechas.',
      text: 'Fresa del día, crema batida en casa y crepas que doblamos al momento. Pide por WhatsApp o ven por tu vaso a la barra.',
      primaryCta: 'Hacer pedido',
      secondaryCta: 'Ver el menú',
      secondaryHref: '#servicios',
      sticker: '',
      detailImage: 'gallery-01.jpg',
      detailAlt:
        'Fresas con crema y granola vistas de cerca en un vaso transparente',
    },
    marquee: {
      label: 'Lo que más pedimos',
      items: [
        'Fresas con crema',
        'Crepas al momento',
        'Crema batida en casa',
        'Waffles y malteadas',
        'Pedidos por WhatsApp',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Una barra <span class="lz-title__serif">dulce</span> en Narvarte.',
      summary:
        'En {{shortName}} lavamos y cortamos fresa cada mañana, batimos la crema en casa y doblamos cada crepa cuando la pides.',
      statement:
        'Fresa del día, crema hecha aquí y crepas al momento: lo sencillo, bien hecho y para antojarse.',
      image: 'about.jpg',
      imageAlt:
        'Barra de postres con vasos de fresas, crema y toppings en frascos de vidrio',
      sticker: '',
      paragraphs: [
        '{{shortName}} empezó como un carrito de fresas con crema en el parque de la colonia. Hoy tenemos barra, seis mesas y una ventanilla para pedidos.',
        'Compramos la fresa en la Central de Abasto tres veces por semana, batimos la crema sin conservadores y hacemos la masa de las crepas cada día.',
        'Ven por un vaso para el camino o quédate con un café; el menú cambia un poco con la temporada.',
      ],
      stats: [
        {
          value: '3 veces',
          label: 'Fresa fresca por semana',
        },
        {
          value: '12 toppings',
          label: 'Para armar tu vaso',
        },
        {
          value: '4.9 ★',
          label: 'En Google',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Menú',
      title: 'El <span class="lz-title__serif">menú</span>',
      intro:
        'Precios en pesos mexicanos. Todos los vasos llevan crema batida en casa; cada topping extra cuesta $10.',
      prices: [
        {
          name: 'Fresas con crema chico',
          price: '$75',
          description: 'Vaso de 12 oz con fresa picada y crema de vainilla.',
        },
        {
          name: 'Fresas con crema grande',
          price: '$110',
          description: 'Vaso de 16 oz con dos toppings a elegir.',
        },
        {
          name: 'Crepa de avellana y fresa',
          price: '$95',
          description: 'Untable de avellana, fresa fresca y azúcar glass.',
        },
        {
          name: 'Crepa de cajeta y nuez',
          price: '$90',
          description: 'Cajeta de la casa, nuez tostada y un toque de canela.',
        },
        {
          name: 'Waffle con frutos rojos',
          price: '$105',
          description: 'Waffle de mantequilla con fresa, zarzamora y crema.',
        },
        {
          name: 'Malteada de fresa',
          price: '$85',
          description: 'Fresa natural, helado de vainilla y crema batida.',
        },
      ],
      promos: [
        {
          tag: 'Para compartir',
          title: 'Charola de fresas para cuatro',
          text: 'Fresa, crema, chocolate y cuatro toppings por $320.',
          cta: 'Pedir charola',
          href: '{{whatsappUrl:Hola, quiero una charola para compartir}}',
        },
        {
          tag: 'Eventos',
          title: 'Barra de fresas para fiestas',
          text: 'Llevamos la barra a tu evento a partir de 30 personas.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar la barra para un evento}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Platillos',
      title: 'Recién <span class="lz-title__serif">servido</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Fresas con crema',
          alt: 'Vaso de fresas con crema batida y granola sobre una mesa blanca',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Crepa de cajeta',
          alt: 'Crepa doblada con cajeta y nuez en un plato rosa',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'La barra',
          alt: 'Barra con frascos de toppings y vasos listos para servir',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Waffle de frutos rojos',
          alt: 'Waffle con fresas, zarzamoras y crema batida',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Malteada de fresa',
          alt: 'Malteada rosa con crema batida y una fresa encima',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Charola para compartir',
          alt: 'Charola con fresas, crema y salsa de chocolate para varias personas',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Fresa del día',
          alt: 'Caja de fresas recién lavadas sobre la mesa de trabajo',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Las mesas',
          alt: 'Mesas pequeñas con sillas pastel junto a una ventana',
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
      score: '4.9',
      summary: '186 opiniones en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Pedimos la charola para el cumpleaños de mi hija y llegó a tiempo, con la crema bien fría. Las niñas no dejaron nada.',
          author: 'Fernanda L.',
        },
        {
          text: 'La crepa de cajeta con nuez es mi antojo de los viernes. La hacen al momento, delgadita y bien dorada.',
          author: 'Rodrigo M.',
        },
        {
          text: 'Vengo por un vaso chico después de la escuela con mi hermano. Siempre preguntan qué toppings queremos y no se equivocan.',
          author: 'Valeria G.',
        },
      ],
      scoreNote: 'Calificación de ejemplo',
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de tu <span class="lz-title__serif">antojo</span>',
      intro:
        'Dudas de quien viene por primera vez. ¿Algo más? Mándanos un mensaje.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Hacen pedidos para llevar?',
          answer:
            'Sí. Escríbenos por WhatsApp con tu pedido y te decimos a qué hora pasar; suele estar listo en 15 minutos.',
        },
        {
          question: '¿Tienen opciones sin lácteos?',
          answer:
            'Sí: crema vegetal de coco por $10 extra y crepas hechas con bebida de avena.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Aceptamos efectivo, tarjeta y pagos por transferencia al recoger.',
        },
        {
          question: '¿Hacen envíos a domicilio?',
          answer:
            'Entregamos en Narvarte y colonias cercanas con apps de reparto; para pedidos grandes, pregúntanos por WhatsApp.',
        },
        {
          question: '¿Pueden llevar la barra a una fiesta?',
          answer:
            'Sí, a partir de 30 personas. Mándanos la fecha y el número de invitados y te enviamos opciones.',
        },
        {
          question: '¿Qué pasa si no hay fresa buena?',
          answer:
            'Si un día la fresa no llega con buena calidad, te avisamos y te ofrecemos mango o frutos rojos.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Pasa por tu <span class="lz-title__serif">vaso</span>',
      contactText:
        'Pedidos por WhatsApp en horario de la barra. Para eventos, escríbenos con unos días de anticipación.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Hacer pedido',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Hacer pedido',
      callCta: 'Llamar',
      branches: [
        {
          name: 'Narvarte',
          address: '{{address}}',
          hours: 'Mar–Dom 12:00–21:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Narvarte',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Hacer pedido por WhatsApp',
    },
    footer: {
      about:
        'Fresas con crema, crepas y snacks dulces en Narvarte, {{city}}. Pedidos por WhatsApp.',
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
          label: 'Antojos',
          href: '#galeria',
        },
        {
          label: 'Reseñas',
          href: '#resenas',
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
          name: 'Narvarte',
          address: '{{address}}',
          hours: 'Mar–Dom 12:00–21:00',
        },
      ],
    },
  },
} satisfies ContentPack;
