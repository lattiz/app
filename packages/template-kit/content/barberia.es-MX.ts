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

const links = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Equipo', href: '#equipo' },
  { label: 'Sucursales', href: '#sucursales' },
  { label: 'Reseñas', href: '#resenas' },
];

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
    googleReviewsUrl:
      'https://www.google.com/search?q=barberia+oxidobarberclub',
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
      directionsLabel: 'Cómo llegar',
      branches: branches.map((b) => ({
        name: b.name,
        address: b.address,
        hours: b.hours,
        directionsUrl: mapsLinkUrl(b.query),
        mapUrl: mapsEmbedUrl(b.query),
        mapTitle: `Mapa de la sucursal ${b.name}`,
      })),
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
      branches: branches.map((b) => ({
        name: b.name,
        address: b.shortAddress,
        hours: b.hours,
      })),
      linksTitle: 'Explorar',
      links,
    },
  },
} satisfies ContentPack;
