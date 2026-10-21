// GENERATED from specs/restaurante-trigo-y-brasa-v2.spec.json (spec 5c84ecf59d40, file 623a7d7bfd33). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'restaurante',
  locale: 'es-MX',
  business: {
    name: 'Trigo y Brasa',
    shortName: 'Trigo',
    tagline: 'Panadería',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero hacer un encargo de pan',
    address: 'Av. Cuitláhuac 000, Col. Clavería, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@trigoybrasa.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=trigo+y+brasa+claveria',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=trigo+y+brasa+claveria',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}}, panadería de masa madre en Clavería, {{city}}: hogazas, pan dulce y café. Aparta tu pan o haz tu encargo por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Hacer encargo',
      notice: 'Horneamos de 07:00 a 16:00 · Mar a Dom',
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
      detailImage: 'gallery-02.jpg',
      detailAlt: 'Estante de madera con hogazas de masa madre',
      image: 'hero.jpg',
      imageAlt:
        'Rebanadas de pan de masa madre sobre una mesa de madera con espigas de trigo',
      eyebrow: 'Masa madre · Clavería',
      title: 'Masa madre, tanda a tanda',
      text: 'Harina, agua, sal y tiempo. Aparta tu pieza por WhatsApp y pasa por ella.',
      primaryCta: 'Apartar mi pan',
      secondaryCta: 'Ver el pan de hoy',
      secondaryHref: '#servicios',
      sticker: 'Pan del día',
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
      kicker: '{{index}} — Tandas',
      title: 'Tandas del <span class="lz-title__serif">día</span>',
      summary:
        'Horneamos en tres tandas y lo que sale primero es lo que mejor se vende. Aparta tu pieza y pasa por ella.',
      primaryCta: 'Apartar mi pan',
      steps: [
        {
          title: '07:00 · Hogazas de masa madre',
          text: 'La primera tanda: 24 horas de fermentación y corteza firme. Ideal para el desayuno.',
        },
        {
          title: '10:00 · Pan dulce y centeno',
          text: 'Conchas, cuernos y hogazas de centeno con semillas, todavía tibios.',
        },
        {
          title: '13:00 · Focaccia y bollería',
          text: 'Focaccia de romero y croissants de mantequilla; de la última tanda queda poco.',
        },
      ],
      statement: 'Masa hecha a mano, sin prisa en la mesa ni en el horno.',
      image: 'hero.jpg',
      imageAlt: 'Pan de masa madre recién horneado en la mesa del taller',
      sticker: 'Desde 2015',
      paragraphs: [
        '{{shortName}} es una panadería de barrio con un horno, una mesa de trabajo y una barra de café.',
        'La masa madre se alimenta a diario y la fermentación dura lo que tiene que durar.',
        'Llega temprano: lo primero que sale es lo primero que se acaba.',
      ],
      stats: [
        {
          value: '24 h',
          label: 'De fermentación',
        },
        {
          value: '7:00',
          label: 'Primera tanda',
        },
        {
          value: '3',
          label: 'Tandas al día',
        },
      ],
    },
    services: {
      kicker: '{{index}} — Vitrina',
      title: 'Nuestros <span class="lz-title__serif">panes</span>',
      intro:
        'Precios de muestra en pesos, con IVA. Pregunta qué salió en la última tanda.',
      prices: [
        {
          name: 'Hogaza de masa madre',
          price: '$95',
          description: '800 g de corteza crujiente y miga abierta.',
          image: 'product-01.jpg',
          imageAlt: 'Hogaza de masa madre con corteza marcada',
          tags: ['Masa madre', 'Del día'],
        },
        {
          name: 'Pan de ajo y hierbas',
          price: '$70',
          description:
            'Barra de corteza fina con mantequilla de hierbas; sale caliente.',
          image: 'product-02.jpg',
          imageAlt: 'Barra de pan abierta con mantequilla de ajo y hierbas',
          tags: ['Del día'],
        },
        {
          name: 'Pan de semillas',
          price: '$110',
          description: 'Girasol, ajonjolí y linaza; dura toda la semana.',
          image: 'product-03.jpg',
          imageAlt: 'Hogaza cubierta de semillas sobre una tabla de madera',
          tags: ['Semillas'],
        },
        {
          name: 'Croissant de mantequilla',
          price: '$45',
          description: 'Horneado al amanecer; con mermelada o solo.',
          image: 'product-04.jpg',
          imageAlt: 'Croissant dorado junto a un tazón de mermelada',
          tags: ['Mantequilla', 'Mañana'],
        },
        {
          name: 'Pastel de ciruela',
          price: '$55',
          description:
            'Con migajas de mantequilla; por rebanada o entero por encargo.',
          image: 'product-05.jpg',
          imageAlt: 'Pastel de ciruela con migajas de mantequilla',
          tags: ['Temporada'],
        },
        {
          name: 'Café de la casa',
          price: '$40',
          description: 'Espresso, capuchino o filtrado, en taza.',
          image: 'product-06.jpg',
          imageAlt: 'Tres tazas de café con espuma sobre una mesa de madera',
          tags: ['Caliente'],
        },
      ],
      promos: [
        {
          tag: 'Encargos',
          title: 'Roscas y pasteles',
          text: 'Con 48 horas de anticipación.',
          cta: 'Hacer encargo',
          href: '{{whatsappUrl:Hola, quiero hacer un encargo de pan}}',
        },
        {
          tag: 'Eventos',
          title: 'Mesas de pan',
          text: 'Para reuniones de hasta 40 personas.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar una mesa de pan}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Del horno',
      title:
        'De la mesa de trabajo a <span class="lz-title__serif">tu mesa</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Hogazas recién horneadas',
          alt: 'Hogazas de masa madre con corteza dorada sobre una tabla de madera',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'La vitrina',
          alt: 'Estante de panadería con hogazas y bollos',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'El horno',
          alt: 'Panadero sacando pan del horno',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Masa en reposo',
          alt: 'Masa de pan creciendo en un recipiente',
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
      kicker: '{{index}} — Clientes',
      score: '4.8',
      summary: '320 opiniones en Google',
      allReviewsCta: 'Ver reseñas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'El pan de semillas me dura la semana entera. Paso cada sábado por mi hogaza.',
          author: 'Daniela R.',
        },
        {
          text: 'Pedí la rosca por WhatsApp y estaba lista a la hora que acordamos, con la fruta que quería.',
          author: 'Miguel A.',
        },
        {
          text: 'Me siento en la barra con un café y una concha. Es tranquilo y el pan sale tibio.',
          author: 'Paola S.',
        },
      ],
      title: 'Lo que dicen en <span class="lz-title__serif">la barra</span>',
      intro: 'Reseñas de clientes que apartan su pan por WhatsApp.',
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro:
        'Lo que más nos preguntan, en pocas líneas. Si tu duda no está aquí, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Hasta qué hora hay pan?',
          answer:
            'La primera tanda sale a las 7:00. Después de las 14:00 queda poco, sobre todo pan dulce.',
        },
        {
          question: '¿Con cuánto tiempo pido una rosca o un pastel?',
          answer:
            'Con 48 horas de margen. Para mesas de pan, escríbenos con la fecha del evento.',
        },
        {
          question: '¿Tienen pan sin lácteo?',
          answer:
            'Algunas hogazas se hacen solo con harina, agua y sal. Pregunta en el mostrador por la tanda.',
        },
        {
          question: '¿Puedo sentarme a desayunar?',
          answer:
            'Sí, hay mesas junto a la barra. También puedes llevar tu pan y tu café.',
        },
        {
          question: '¿Puedo apartar mi pan?',
          answer:
            'Sí. Mándanos tu pedido por WhatsApp y te decimos a qué hora pasar por él.',
        },
        {
          question: '¿Hay dónde estacionarse?',
          answer:
            'No tenemos estacionamiento propio; hay uno público a una cuadra.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      title: 'Pasa por tu <span class="lz-title__serif">pan</span>',
      contactText:
        'Para apartar pan y hacer encargos, escríbenos en horario de la panadería. Si es una mesa de pan, incluye la fecha.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Hacer encargo',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Encargo por WhatsApp',
      callCta: 'Llamar',
      whatsappNote: 'Encargos y pan apartado',
      callNote: 'Para pedidos del mismo día',
      emailNote: 'Cotizaciones de mesas de pan',
      branches: [
        {
          name: 'Clavería',
          address: '{{address}}',
          hours: 'Mar–Dom 07:00–16:00 · Lun cerrado',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Clavería',
        },
      ],
    },
    'floating-whatsapp': {
      label: 'Hacer encargo por WhatsApp',
    },
    footer: {
      about:
        'Panadería de masa madre en Clavería, {{city}}. Pan apartado y encargos por WhatsApp.',
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
          hours: 'Mar–Dom 07:00–16:00 · Lun cerrado',
        },
      ],
    },
    cta: {
      kicker: 'Encargos',
      title:
        'Roscas y pasteles por <span class="lz-title__serif">encargo</span>',
      text: 'Para festejos, reuniones y mesas de pan. Avísanos con dos días de margen.',
      primaryCta: 'Hacer encargo',
      panelTitle: 'Qué incluye',
      items: [
        'Masa madre de fermentación lenta',
        'Recoges en la panadería, en Clavería',
        'Mesas de pan para hasta 40 personas',
      ],
    },
  },
} satisfies ContentPack;
