import { mapsEmbedUrl, mapsLinkUrl } from '../src/lib/content';
import type { ContentPack } from '../src/types';

const HOURS = 'Lun–Sáb 11:00–21:00 · Dom 12:00–18:00';

const branches = [
  {
    name: 'Condesa',
    address: '{{address}}',
    shortAddress: 'Av. Tamaulipas 120, Cuauhtémoc, CDMX',
    hours: HOURS,
    query: 'Condesa CDMX',
  },
  {
    name: 'Coyoacán',
    address: 'Av. Miguel Ángel de Quevedo 410, Coyoacán, CDMX',
    shortAddress: 'Av. Miguel Ángel de Quevedo 410, Coyoacán, CDMX',
    hours: HOURS,
    query: 'Coyoacán CDMX',
  },
];

const branchCards = branches.map((b) => ({
  name: b.name,
  address: b.address,
  hours: b.hours,
  directionsUrl: mapsLinkUrl(b.query),
  mapUrl: mapsEmbedUrl(b.query),
  mapTitle: `Mapa de la sucursal ${b.name}`,
}));

const footerBranches = branches.map((b) => ({
  name: b.name,
  address: b.shortAddress,
  hours: b.hours,
}));

const links = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Equipo', href: '#equipo' },
  { label: 'Sucursales', href: '#sucursales' },
  { label: 'Reseñas', href: '#resenas' },
];

/** Basic templates: one branch and no team/reviews, so menu and footer point at their own sections. */
export const basicLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Preguntas', href: '#preguntas' },
  { label: 'Ubicación', href: '#ubicacion' },
];

export const singleBranchFooter = footerBranches.slice(0, 1);

const galleryItems = [
  {
    caption: 'Skin fade con línea marcada',
    alt: 'Corte skin fade recién terminado con la línea frontal marcada a navaja',
  },
  {
    caption: 'Barba a navaja y toalla caliente',
    alt: 'Barbero perfilando una barba con navaja después de la toalla caliente',
  },
  {
    caption: 'Diseño freestyle',
    alt: 'Diseño freestyle de líneas rapadas en la nuca de un cliente',
  },
  {
    caption: 'Crop texturizado',
    alt: 'Corte crop con textura arriba y fade bajo a los lados',
  },
  {
    caption: 'Platinado',
    alt: 'Cliente con el cabello platinado y corte corto texturizado',
  },
  {
    caption: 'La estación de trabajo',
    alt: 'Estación de barbería con máquinas, navajas y espejo iluminado',
  },
  {
    caption: 'Corte infantil',
    alt: 'Niño sonriendo en la silla de barbería durante su corte',
  },
  {
    caption: 'Clásico a tijera',
    alt: 'Corte clásico a tijera peinado de lado con raya marcada',
  },
].map((item, i) => ({
  image: `gallery-${String(i + 1).padStart(2, '0')}.jpg`,
  ...item,
}));

export default {
  vertical: 'barberia',
  locale: 'es-MX',
  business: {
    name: 'ÓXIDO Barber Club',
    shortName: 'ÓXIDO',
    tagline: 'Barber Club',
    city: 'CDMX',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    whatsappMessage: 'Hola, quiero reservar un corte',
    address: 'Av. Tamaulipas 120, Condesa, Cuauhtémoc, CDMX',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'citas@oxidobarberclub.mx',
    googleReviewsUrl:
      'https://www.google.com/search?q=barberia+oxidobarberclub',
    // Tenants replace it with their own g.page/r/<id>/review link.
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=oxido+barber+club+cdmx',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}}, barbería urbana de lujo en {{city}}. Fades, diseños, barba a navaja y citas por WhatsApp desde $270 MXN.',
  },
  sections: {
    navbar: { cta: 'Reservar', links },
    hero: {
      image: 'hero-barber.jpg',
      imageAlt:
        'Barbero tatuado trabajando en una barbería oscura con iluminación dramática',
      eyebrow: 'Barbería urbana · {{city}}',
      title:
        'Corte de <span class="lz-title__serif">lujo</span>.<br>Actitud de calle.',
      text: 'Fades, diseños y barba a navaja. Agenda tu cita y sal con el drop del día. Desde $270 MXN.',
      primaryCta: 'Reservar por WhatsApp',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Agenda abierta',
    },
    marquee: {
      label: 'Especialidades de la barbería',
      items: [
        'Fades',
        'Diseños',
        'Barba a navaja',
        'Cortes desde $270',
        'Sin fila, con cita',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      image: 'about-detail.jpg',
      imageAlt:
        'Detalle de manos tatuadas sosteniendo máquina de barbería en una estación de trabajo',
      sticker: 'Est. 2018',
      title:
        'No es una barbería. Es un <span class="lz-title__serif">club</span>.',
      statement:
        'Un buen corte se nota una semana después, no solo al levantarte de la silla. Para eso trabajamos.',
      summary:
        'En {{shortName}} cortamos con técnica y sin prisa: te preguntamos qué buscas, te decimos qué te va y no te levantas de la silla hasta que el fade quede limpio. Más de ocho años en {{city}} y miles de cortes nos respaldan.',
      paragraphs: [
        'En {{shortName}} mezclamos técnica precisa, cultura callejera y una experiencia sin prisa. Aquí el corte importa tanto como la vibra: beats pesados, luz baja y atención al detalle desde el fade hasta el acabado.',
        'Nuestros barberos trabajan con mano firme, consulta real y tiempo en silla para que salgas limpio, fresco y con estilo propio. Nada genérico, nada improvisado.',
        'Es lujo urbano para quienes entienden que un buen corte también es identidad.',
      ],
      stats: [
        { value: '+8 años', label: 'Afinando el nivel' },
        { value: '4 barberos', label: 'Con estilo propio' },
        { value: '+12,000 cortes', label: 'Hechos en {{city}}' },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Cortes con <span class="lz-title__serif">carácter</span>',
      intro:
        'Precios en pesos, con lavado y peinado incluidos. Pagas al terminar, en efectivo o con tarjeta.',
      prices: [
        {
          name: 'Corte de cabello',
          price: '$270',
          description:
            'Fade, taper o corte clásico moderno con acabado limpio y asesoría de estilo.',
        },
        {
          name: 'Corte + barba',
          price: '$380',
          description:
            'Combo completo para salir con perfil afilado y líneas bien definidas.',
        },
        {
          name: 'Barba a navaja + toalla caliente',
          price: '$190',
          description:
            'Afeitado detallado con ritual de toalla caliente para un acabado más fino.',
        },
        {
          name: 'Diseño / freestyle',
          price: '+$60',
          description:
            'Líneas, gráficos o detalles personalizados para elevar el corte.',
        },
        {
          name: 'Corte infantil',
          price: '$220',
          description:
            'Corte cómodo y preciso para niños con atención cuidadosa y rápida.',
        },
        {
          name: 'Platinado / color',
          price: 'Desde $650',
          description:
            'Texturas y color con evaluación previa según largo, base y resultado buscado.',
        },
      ],
      promos: [
        {
          tag: 'Promo',
          title: 'Martes de crew — 2 cortes por $480',
          text: 'Caigan en dupla, entren finos y ahorren en la sesión. Ideal para compas, hermanos o roomies.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar la promo Martes de Crew}}',
        },
        {
          tag: 'Promo',
          title: 'Primera visita — 15% de descuento',
          text: 'Si es tu primera vez en {{shortName}}, te damos entrada con precio especial para que conozcas el nivel.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar mi primera visita}}',
        },
        {
          tag: 'Promo',
          title: 'Membresía — 4 cortes al mes por $900',
          text: 'Para quienes traen rutina de imagen seria. Mantén el fade fresco todo el mes sin pensar en cada cita.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero información de la membresía}}',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Sucursales',
      title: 'Agenda o <span class="lz-title__serif">pregunta</span>',
      contactText:
        'Contestamos por WhatsApp todos los días en horario de la barbería. Si prefieres, llámanos o mándanos un correo y te respondemos el mismo día.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reserva tu cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Reservar por WhatsApp',
      callCta: 'Llamar',
      branches: branchCards,
      branch: branchCards[0],
    },
    gallery: {
      kicker: '{{index}} — Galería',
      title: 'El trabajo <span class="lz-title__serif">habla</span>',
      items: galleryItems,
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que más nos preguntan antes de la primera visita. Si tu duda no está aquí, escríbenos y te contestamos en minutos.',
      cta: 'Pregunta por WhatsApp',
      items: [
        {
          question: '¿Cuánto cuesta un corte?',
          answer:
            'El corte de cabello cuesta $270 MXN y el combo corte + barba, $380. Los diseños y el freestyle van desde +$60. Todos los precios incluyen lavado y peinado, y pagas al terminar.',
        },
        {
          question: '¿Necesito cita o puedo llegar sin reservar?',
          answer:
            'Trabajamos con cita para que no hagas fila: escríbenos por WhatsApp y te confirmamos horario en minutos. Si hay una silla libre, también te atendemos sin cita.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer:
            'Efectivo, tarjeta de débito y crédito (Visa, Mastercard y American Express) y transferencia SPEI. No cobramos comisión por pagar con tarjeta.',
        },
        {
          question: '¿Puedo cancelar o cambiar mi cita?',
          answer:
            'Sí. Avísanos por WhatsApp con al menos 2 horas de anticipación y la movemos sin costo. Si llegas más de 15 minutos tarde, puede que tengamos que reprogramarte para no retrasar a los demás.',
        },
        {
          question: '¿Atienden a niños?',
          answer:
            'Sí. El corte infantil (hasta 12 años) cuesta $220 MXN. Te recomendamos agendar entre semana por la tarde, cuando hay menos movimiento y los peques están más tranquilos.',
        },
        {
          question: '¿Cuánto dura cada servicio?',
          answer:
            'Un corte toma de 40 a 45 minutos; corte + barba, alrededor de una hora; barba a navaja con toalla caliente, 30 minutos. Platinado o color, de 2 a 3 horas según el largo.',
        },
        {
          question: '¿Hay dónde estacionarse?',
          answer:
            'No tenemos estacionamiento propio, pero hay parquímetros sobre la avenida y estacionamientos públicos a una cuadra. Si llegas en bici, adentro hay dónde dejarla.',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Equipo',
      title: 'Conoce a los <span class="lz-title__serif">barberos</span>',
      members: [
        {
          name: 'Rolo',
          role: 'Fades y diseño',
          tags: ['Skin fade', 'Freestyle'],
          image: 'team-rolo.jpg',
          imageAlt: 'Retrato del barbero Rolo en interior de barbería urbana',
        },
        {
          name: 'Dante',
          role: 'Barba y navaja',
          tags: ['Shave', 'Toalla caliente'],
          image: 'team-dante.jpg',
          imageAlt: 'Retrato del barbero Dante con navaja y delantal negro',
        },
        {
          name: 'Kenji',
          role: 'Texturas y color',
          tags: ['Crop', 'Platinado'],
          image: 'team-kenji.jpg',
          imageAlt:
            'Retrato del barbero Kenji especializado en color y textura',
        },
        {
          name: 'Mara',
          role: 'Estilista, cortes unisex',
          tags: ['Textura', 'Scissor work'],
          image: 'team-mara.jpg',
          imageAlt:
            'Retrato de Mara realizando un corte unisex en barbería contemporánea',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.9',
      summary: '+320 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'Me dejaron el fade exactamente como lo pedí, limpio y bien conectado. La música, la atención y el ambiente se sienten premium sin volverse mamones. Ya es mi spot fijo.',
          author: 'Luis R. · hace 2 semanas',
        },
        {
          text: 'Reservé por WhatsApp y me atendieron puntual. Dante se rifó con la barba a navaja y la toalla caliente, neta se siente el detalle. Todo muy fino y cero prisa.',
          author: 'Mauricio T. · hace 2 semanas',
        },
        {
          text: 'La vibra del lugar está durísima: luces bajas, trap sonando y barberos con mucha técnica. Kenji me hizo textura y color con asesoría real, no solo por vender. Súper recomendado.',
          author: 'Ángel C. · hace 2 semanas',
        },
      ],
    },
    'floating-whatsapp': { label: 'Escríbenos por WhatsApp' },
    footer: {
      about:
        'Barbería urbana de lujo en Ciudad de México. Técnica precisa, cultura street y citas por WhatsApp para que llegues, te sientes y salgas con presencia.',
      branchesTitle: 'Sucursales',
      branches: footerBranches,
      linksTitle: 'Explorar',
      contactTitle: 'Contacto',
      links,
    },
  },
} satisfies ContentPack;
