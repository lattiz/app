import type { GiroDefinition } from '../src/spec/giro';
import { palette } from '../src/spec/presets';

/** Veterinaria / estética canina: consultas y servicios con precio, médicos con cédula, fotos y citas. */

export default {
  id: 'veterinaria',
  label: 'Veterinaria / estética canina',
  aliases: [
    'veterinaria',
    'veterinario',
    'clínica veterinaria',
    'estética canina',
    'grooming',
    'hotel de mascotas',
    'guardería canina',
    'tienda de mascotas con consultorio',
  ],
  rules: [
    'Sin promesas de curación ni diagnósticos por WhatsApp; urgencias: llamar.',
    'Médicos con «Cédula profesional 0000000» como marcador; nunca una cédula real.',
    'Marcas de alimento o medicamento ficticias o genéricas («alimento premium», «desparasitante»).',
  ],
  category: 'veterinarias',
  businessCategory: 'other',
  schemaType: 'VeterinaryCare',
  description: {
    pro: 'Veterinaria con identidad propia: consultas y estética, médicos, instalaciones, reseñas, preguntas y citas',
    basico:
      'Veterinaria de barrio: servicios con precios, preguntas frecuentes y ubicación',
  },
  palettes: {
    hierbabuena: palette({
      label: 'Hierbabuena (claro, verde)',
      scheme: 'light',
      bg: '#F3F8F6',
      surface: '#FFFFFF',
      surface2: '#DDECE6',
      text: '#0F201B',
      muted: '#455E57',
      accent: '#1F7A6A',
      onAccent: '#FFFFFF',
      accentText: '#2A8574',
      photoTreatment: 'none',
      placeholder: 'blobs',
    }),
    cielo: palette({
      label: 'Cielo (claro, azul)',
      scheme: 'light',
      bg: '#F3F6FA',
      surface: '#FFFFFF',
      surface2: '#E1E8F2',
      text: '#0F1B2C',
      muted: '#475569',
      accent: '#2563A8',
      onAccent: '#FFFFFF',
      accentText: '#3A72B2',
      photoTreatment: 'none',
      placeholder: 'dots',
    }),
    durazno: palette({
      label: 'Durazno (claro, naranja cálido)',
      scheme: 'light',
      bg: '#FCF6F1',
      surface: '#FFFFFF',
      surface2: '#F3E5DA',
      text: '#25170F',
      muted: '#62514A',
      accent: '#B0502A',
      onAccent: '#FFFFFF',
      accentText: '#B0502A',
      photoTreatment: 'warm',
      placeholder: 'arches',
    }),
    lila: palette({
      label: 'Lila (claro, violeta)',
      scheme: 'light',
      bg: '#F7F5FA',
      surface: '#FFFFFF',
      surface2: '#E7E2F1',
      text: '#1A1529',
      muted: '#524C65',
      accent: '#6A4BA8',
      onAccent: '#FFFFFF',
      accentText: '#7759B2',
      photoTreatment: 'none',
      placeholder: 'rules',
    }),
    bosque: palette({
      label: 'Bosque (oscuro, acento lima)',
      scheme: 'dark',
      bg: '#101612',
      surface: '#17201A',
      surface2: '#202B23',
      text: '#EEF4EF',
      muted: '#A6B5AA',
      accent: '#A8D672',
      onAccent: '#101612',
      accentText: '#B5DD86',
      photoTreatment: 'none',
      placeholder: 'grain',
    }),
  },
  fontPairs: [
    'young-serif+figtree',
    'fraunces+nunito-sans',
    'bricolage-grotesque+inter',
    'lora+figtree',
    'sora+inter',
  ],
  shapes: ['redondo', 'organico', 'suave', 'sutil'],
  sections: {
    pro: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'split' },
      { role: 'about', variant: 'text-image-offset' },
      { role: 'catalog', variant: 'cards' },
      { role: 'team', variant: 'grid' },
      { role: 'proof', variant: 'grid' },
      { role: 'testimonials', variant: 'cards' },
      { role: 'faq', variant: 'list' },
      { role: 'contact', variant: 'with-contact' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'columns' },
    ],
    basico: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'centered-arch' },
      { role: 'about', variant: 'brief' },
      { role: 'catalog', variant: 'price-list' },
      { role: 'faq', variant: 'two-col' },
      { role: 'contact', variant: 'single' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'minimal-centered' },
    ],
  },
  motion: { preset: 'calm', progress: false },
  navLabels: {
    about: 'Nosotros',
    services: 'Servicios',
    team: 'Médicos',
    gallery: 'Instalaciones',
    testimonials: 'Reseñas',
    faq: 'Preguntas',
    locations: 'Citas',
  },
  business: {
    tagline: 'Veterinaria y estética',
    whatsappMessage: 'Hola, quiero agendar una cita para mi mascota',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    city: 'CDMX',
    hours: 'Lun–Sáb 9:00–20:00 · Dom 10:00–14:00',
    address: 'Calle Ejemplo 33, Col. Centro, CDMX',
    branch: 'Centro',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}} en {{city}}: consultas, vacunas, estética canina y hospedaje con citas por WhatsApp.',
  },
  copy: {
    navbar: { cta: 'Agendar cita' },
    hero: {
      image: 'hero.jpg',
      imageAlt: 'Veterinaria revisando a un perro sobre la mesa de consulta',
      eyebrow: 'Veterinaria · {{branch}}',
      title:
        'Cuidamos a tu mascota <span class="lz-title__serif">como familia</span>.',
      text: 'Consultas con tiempo, vacunas al día, baño y corte. Agenda por WhatsApp y te recordamos la próxima cita.',
      primaryCta: 'Agendar cita',
      secondaryCta: 'Ver servicios',
      secondaryHref: '#servicios',
      sticker: 'Perros y gatos',
    },
    marquee: {
      label: 'Servicios de la veterinaria',
      items: [
        'Consulta general',
        'Vacunas',
        'Desparasitación',
        'Baño y corte',
        'Hospedaje',
      ],
    },
    about: {
      kicker: '{{index}} — Nosotros',
      title:
        'Consultas <span class="lz-title__serif">tranquilas</span>, para ellos y para ti.',
      summary:
        'En {{shortName}} revisamos a cada mascota sin prisa, te explicamos lo que encontramos y te mandamos el carnet y los recordatorios por WhatsApp.',
      statement:
        'Una mascota tranquila se revisa mejor: por eso damos tiempo, premios y una mesa sin prisas.',
      image: 'about.jpg',
      imageAlt: 'Gato sobre una manta en la sala de consulta',
      sticker: 'Cédula profesional 0000000',
      paragraphs: [
        'Atendemos perros y gatos de todas las edades, con cita para no amontonar la sala.',
        'Llevamos su carnet de vacunas y te avisamos por WhatsApp cuando toca la siguiente.',
        'En estética usamos productos suaves y secado a temperatura baja.',
      ],
      stats: [
        { value: '+10 años', label: 'En el barrio' },
        { value: '+5,000', label: 'Mascotas atendidas' },
        { value: '4.9 ★', label: 'En Google' },
      ],
    },
    services: {
      kicker: '{{index}} — Servicios',
      title: 'Servicios y <span class="lz-title__serif">precios</span>',
      intro:
        'Precios en pesos mexicanos para perros y gatos; varían según tamaño. Te confirmamos al agendar.',
      prices: [
        {
          name: 'Consulta general',
          price: '$450',
          description: 'Revisión completa y plan de cuidado.',
        },
        {
          name: 'Vacuna',
          price: 'Desde $350',
          description: 'Aplicación y registro en el carnet.',
        },
        {
          name: 'Desparasitación',
          price: 'Desde $180',
          description: 'Interna o externa, según peso.',
        },
        {
          name: 'Baño y corte',
          price: 'Desde $380',
          description: 'Baño, corte, uñas y limpieza de oídos.',
        },
        {
          name: 'Esterilización',
          price: 'Cotiza',
          description: 'Valoración previa y cuidados posteriores.',
        },
        {
          name: 'Hospedaje',
          price: '$350/noche',
          description: 'Con paseos, comida y fotos diarias.',
        },
      ],
      promos: [
        {
          tag: 'Cachorros',
          title: 'Paquete de primeras vacunas',
          text: 'Esquema completo con consulta y carnet; pregunta por pagos en partes.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero el paquete de vacunas para cachorro}}',
        },
        {
          tag: 'Estética',
          title: 'Baño mensual con recordatorio',
          text: 'Agenda el baño cada mes y te avisamos por WhatsApp un día antes.',
          cta: 'Agendar',
          href: '{{whatsappUrl:Hola, quiero agendar baño mensual}}',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — Instalaciones',
      title: 'Un lugar <span class="lz-title__serif">limpio</span> y tranquilo',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Recepción',
          alt: 'Recepción de la veterinaria con un perro esperando',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Consultorio',
          alt: 'Mesa de consulta veterinaria limpia',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Estética',
          alt: 'Perro en la tina de baño con espuma',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Gatos',
          alt: 'Gato descansando en una cama de consultorio',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Corte',
          alt: 'Estilista canina cortando el pelo a un perro pequeño',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Hospedaje',
          alt: 'Área de hospedaje con camas y juguetes',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Vacunas',
          alt: 'Carnet de vacunación junto a una correa',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'Entrada',
          alt: 'Fachada de la veterinaria con un perro en la puerta',
        },
      ],
    },
    team: {
      kicker: '{{index}} — Médicos',
      title: 'Quién los <span class="lz-title__serif">atiende</span>',
      members: [
        {
          name: 'MVZ Laura Zamora',
          role: 'Médica veterinaria',
          tags: ['Cédula 0000000', 'Perros'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de la MVZ Laura Zamora con un perro',
        },
        {
          name: 'MVZ Andrés Peña',
          role: 'Medicina felina',
          tags: ['Cédula 0000000', 'Gatos'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato del MVZ Andrés Peña cargando un gato',
        },
        {
          name: 'Ximena Duarte',
          role: 'Estética canina',
          tags: ['Baño', 'Corte'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Ximena Duarte en el área de estética',
        },
        {
          name: 'Rubén Olvera',
          role: 'Recepción y hospedaje',
          tags: ['Citas', 'Paseos'],
          image: 'team-4.jpg',
          imageAlt: 'Retrato de Rubén Olvera en la recepción',
        },
      ],
    },
    testimonials: {
      kicker: '{{index}} — Reseñas',
      score: '4.9',
      summary: '205 reseñas en Google',
      allReviewsCta: 'Ver todas en Google',
      writeReviewCta: 'Dejar reseña en Google',
      reviews: [
        {
          text: 'La doctora fue muy paciente con mi gata, que odia salir de casa. Me explicó todo y me mandó el carnet por WhatsApp.',
          author: 'Carolina H.',
        },
        {
          text: 'Llevo a mi perro al baño cada mes y siempre regresa tranquilo y oliendo rico.',
          author: 'Eduardo M.',
        },
        {
          text: 'Lo dejamos en hospedaje un fin de semana y nos mandaron fotos todos los días.',
          author: 'Natalia B.',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Preguntas <span class="lz-title__serif">frecuentes</span>',
      intro:
        'Lo que suelen preguntarnos antes de la primera visita. Para lo demás, escríbenos.',
      cta: 'Preguntar por WhatsApp',
      items: [
        {
          question: '¿Necesito cita?',
          answer:
            'Para consulta y estética, sí. Si tu mascota tiene una urgencia, llámanos antes de venir.',
        },
        {
          question: '¿Atienden gatos?',
          answer:
            'Sí, con horarios y una sala de espera separada para que estén más tranquilos.',
        },
        {
          question: '¿Cuánto cuesta el baño?',
          answer:
            'Desde $380 según tamaño y largo de pelo; te confirmamos el precio al agendar.',
        },
        {
          question: '¿Qué llevo a la primera consulta?',
          answer:
            'Su carnet de vacunas si lo tienes, y si es posible, una muestra de heces reciente.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer: 'Efectivo, tarjetas de débito y crédito, y transferencia.',
        },
        {
          question: '¿Cómo funciona el hospedaje?',
          answer:
            'Pedimos vacunas al día; incluye comida, paseos y fotos diarias por WhatsApp.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Citas',
      title: 'Agenda su <span class="lz-title__serif">cita</span>',
      contactText:
        'Respondemos mensajes en horario de la clínica. En una urgencia, llámanos antes de salir.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Agendar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
      directionsLabel: 'Cómo llegar',
      hoursLabel: 'Horario',
      whatsappCta: 'Agendar por WhatsApp',
      callCta: 'Llamar',
    },
    'floating-whatsapp': { label: 'Agendar cita por WhatsApp' },
    footer: {
      about:
        'Veterinaria en {{city}}. Consultas, vacunas, estética canina y hospedaje con cita por WhatsApp.',
      branchesTitle: 'Clínica',
      linksTitle: 'Secciones',
      contactTitle: 'Contacto',
    },
  },
  heroAlternates: [
    'Tu veterinaria de confianza en <span class="lz-title__serif">{{branch}}</span>.',
    'Consultas, vacunas y <span class="lz-title__serif">baños</span> sin prisas.',
    'Para perros y gatos, <span class="lz-title__serif">con cariño</span>.',
    'Agenda hoy y <span class="lz-title__serif">te recordamos</span> la próxima.',
  ],
  images: {
    hero: {
      query: 'veterinarian examining dog clinic',
      orientation: 'landscape',
    },
    about: { query: 'cat blanket vet clinic', orientation: 'portrait' },
    'team-1': {
      query: 'female veterinarian with dog portrait',
      orientation: 'portrait',
    },
    'team-2': {
      query: 'male veterinarian holding cat',
      orientation: 'portrait',
    },
    'team-3': { query: 'dog groomer portrait', orientation: 'portrait' },
    'team-4': {
      query: 'young man portrait reception',
      orientation: 'portrait',
    },
    'gallery-01': { query: 'vet clinic reception dog', orientation: 'square' },
    'gallery-02': { query: 'veterinary exam table', orientation: 'square' },
    'gallery-03': { query: 'dog bath grooming foam', orientation: 'square' },
    'gallery-04': { query: 'cat resting bed', orientation: 'square' },
    'gallery-05': { query: 'groomer cutting small dog', orientation: 'square' },
    'gallery-06': { query: 'dog boarding beds toys', orientation: 'square' },
    'gallery-07': {
      query: 'dog leash vaccination card',
      orientation: 'square',
    },
    'gallery-08': { query: 'dog at shop door', orientation: 'square' },
  },
  demoHours: {
    mon: [{ open: '09:00', close: '20:00' }],
    tue: [{ open: '09:00', close: '20:00' }],
    wed: [{ open: '09:00', close: '20:00' }],
    thu: [{ open: '09:00', close: '20:00' }],
    fri: [{ open: '09:00', close: '20:00' }],
    sat: [{ open: '09:00', close: '20:00' }],
    sun: [{ open: '10:00', close: '14:00' }],
  },
  priceRange: '$$',
} satisfies GiroDefinition;
