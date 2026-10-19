// GENERATED from specs/barberia-la-insignia.spec.json (spec 023c9502fca0, file e2a507c4d693). Do not edit: use the spec, or freeze.
import type { ContentPack } from '../src/types';

export default {
  vertical: 'barberia',
  locale: 'es-MX',
  business: {
    name: 'La Insignia',
    shortName: 'La Insignia',
    tagline: 'Barbería de oficio',
    city: 'Guadalajara',
    phone: '+52 33 0000 0000',
    whatsapp: '5213300000000',
    whatsappMessage: 'Hola, quiero apartar una cita en La Insignia',
    address: 'Av. Chapultepec 118, Americana, Guadalajara, Jal.',
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@lainsignia.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=la+insignia+americana',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=la+insignia+americana',
  },
  head: {
    title: '{{name}}',
    description:
      '{{name}}, barbería de oficio en la Americana, Guadalajara. Corte clásico, afeitado a navaja y barba perfilada, con cita por WhatsApp.',
  },
  sections: {
    navbar: {
      cta: 'Reservar cita',
      links: [
        {
          label: 'Estudio',
          href: '#nosotros',
        },
        {
          label: 'Carta',
          href: '#servicios',
        },
        {
          label: 'Barberos',
          href: '#equipo',
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
      note: 'Sin anticipos · Respuesta en minutos',
      image: 'hero.jpg',
      imageAlt:
        'Sillón de barbero de cuero en penumbra con vapor de toalla caliente',
      eyebrow: 'Tradición y oficio · Guadalajara',
      title: 'Oficio de navaja, toalla y paciencia',
      text: 'Entras al sillón, la toalla va caliente, el filo no tiembla y sales en orden. El ritual de siempre, sin prisas ni poses.',
      primaryCta: 'Reservar cita',
      secondaryCta: 'Ver la carta',
      secondaryHref: '#servicios',
      sticker: 'Desde 2016',
    },
    about: {
      kicker: '{{index}} — La casa',
      title:
        'Un oficio que se <span class="lz-title__serif">aprende</span> mirando.',
      summary:
        'En {{shortName}} trabajamos como se hacía en las barberías de antes: vapor, aceite, navaja recta y una charla corta antes de empezar. Cada silla tiene su hora completa.',
      body: 'Cortamos a tijera y a máquina, afeitamos a navaja libre y usamos productos de pequeña producción.',
      imageAlt:
        'Brocha, navaja recta y toalla doblada sobre una repisa de madera oscura',
      plateLabel: 'Barbería de oficio',
      plateTitle: 'Navaja recta y vapor',
      plateAside: 'Desde 2014',
      features: [
        {
          title: 'Vapor antes de cada afeitado',
          text: 'Toalla caliente y aceite para abrir el poro antes de la hoja.',
        },
        {
          title: 'Navaja recta, hoja nueva',
          text: 'Cada afeitado empieza con una hoja nueva, abierta frente a ti.',
        },
        {
          title: 'Bálsamo frío al terminar',
          text: 'Cierra el poro y calma la piel, con productos de pequeña producción.',
        },
      ],
      stats: [
        {
          value: 'Desde 2014',
          label: 'En la colonia Americana',
        },
        {
          value: '3 barberos',
          label: 'Con oficio propio',
        },
        {
          value: '+7,000 citas',
          label: 'Atendidas en {{city}}',
        },
      ],
      statement:
        'La navaja no perdona la prisa: por eso cada afeitado empieza con vapor y termina con bálsamo frío.',
      image: 'about.jpg',
      paragraphs: [
        '{{shortName}} abrió con una sola silla de cuero y una regla: nadie se levanta sin haber sido escuchado.',
        'Cortamos a tijera y a máquina, afeitamos a navaja libre y usamos productos de pequeña producción.',
        'Sin pantallas ni fila. Una cita, tu silla y el tiempo que haga falta.',
      ],
    },
    services: {
      note: 'Cada servicio incluye café negro recién colado o agua fría de cortesía.',
      noteCta: 'Consultar horarios disponibles →',
      prices: [
        {
          name: 'Corte clásico',
          price: '$380',
          description:
            'Tijera y máquina, perfilado limpio y peinado con pomada mate.',
          duration: '45 minutos',
        },
        {
          name: 'Afeitado a navaja',
          price: '$320',
          description:
            'Vapor, aceite pre-afeitado, navaja libre y bálsamo frío.',
          duration: '40 minutos',
        },
        {
          name: 'Barba perfilada',
          price: '$260',
          description: 'Forma y contornos a navaja, con tónico para la piel.',
          duration: '35 minutos',
        },
        {
          name: 'Corte y barba',
          price: '$560',
          description:
            'El corte clásico con la barba perfilada en una sola cita.',
          duration: '75 minutos',
        },
        {
          name: 'Ritual completo',
          price: '$720',
          description:
            'Corte, afeitado a navaja, mascarilla y una bebida de cortesía.',
          duration: '90 minutos',
          badge: 'Ritual Insignia',
        },
        {
          name: 'Limpieza de cuello y ceja',
          price: '$150',
          description:
            'Mantenimiento rápido de contornos a navaja entre citas.',
          duration: '20 minutos',
        },
      ],
      kicker: '{{index}} — La carta',
      title: 'Cortes y <span class="lz-title__serif">rituales</span>',
      intro:
        'Precios en pesos mexicanos. Todo ritual incluye consulta, toalla caliente y acabado con producto.',
      promos: [
        {
          tag: 'Nota',
          title: 'Primera cita',
          text: 'La consulta inicial dura quince minutos y va incluida.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, es mi primera cita en La Insignia}}',
        },
        {
          tag: 'Nota',
          title: 'Pase mensual',
          text: 'Dos cortes y un afeitado al mes por $1,100, con agenda preferente.',
          cta: 'Preguntar',
          href: '{{whatsappUrl:Hola, quiero el pase mensual}}',
        },
        {
          tag: 'Nota',
          title: 'Grupos y bodas',
          text: 'Atendemos al novio y a sus padrinos en la barbería.',
          cta: 'Cotizar',
          href: '{{whatsappUrl:Hola, quiero cotizar un grupo}}',
        },
      ],
    },
    faq: {
      kicker: '{{index}} — Preguntas',
      title: 'Antes de <span class="lz-title__serif">venir</span>',
      intro:
        'Lo que conviene saber antes de sentarte. Si falta algo, escríbenos.',
      cta: 'Escribir por WhatsApp',
      items: [
        {
          question: '¿Cómo aparto mi cita?',
          answer:
            'Escríbenos por WhatsApp con un día de anticipación. Cada silla se reserva con su hora completa.',
        },
        {
          question: '¿Cuánto cuesta cada servicio?',
          answer:
            'El corte clásico cuesta $380, el afeitado a navaja $320 y el ritual completo $720.',
        },
        {
          question: '¿Cómo puedo pagar?',
          answer:
            'Efectivo, tarjeta o transferencia. La propina se comparte con quien te atendió y con el resto del equipo.',
        },
        {
          question: '¿Y si necesito cambiar la cita?',
          answer:
            'Si necesitas moverla, avísanos con 12 horas y te damos otro horario sin costo.',
        },
      ],
    },
    locations: {
      kicker: '{{index}} — Visítanos',
      hoursLabel: 'Horario',
      whatsappNote: 'Atención rápida para apartar tu turno',
      callNote: 'Llamada directa al mostrador',
      emailNote: 'Para grupos y eventos privados',
      whatsappCta: 'Agendar por WhatsApp',
      branches: [
        {
          name: 'Americana',
          address: '{{address}}',
          hours: 'Lun–Sáb 10:00–20:00',
          directionsUrl: 'https://maps.google.com/?q={{address}}',
          mapUrl: 'https://www.google.com/maps?q={{address}}&output=embed',
          mapTitle: 'Mapa de la sucursal Americana',
        },
      ],
      title: 'Pasa por la <span class="lz-title__serif">Americana</span>',
      callCta: 'Llamar',
      directionsLabel: 'Cómo llegar',
      contactText:
        'Contestamos de lunes a sábado dentro del horario. Para grupos, usa el correo.',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Reservar cita',
      callLabel: 'Teléfono',
      emailLabel: 'Correo',
    },
    'floating-whatsapp': {
      label: 'Escribir a La Insignia',
    },
    footer: {
      monogram: 'LI',
      motto: 'Oficio · Navaja · Barrio',
      about:
        'Barbería de oficio en Guadalajara. Corte clásico, afeitado a navaja y barba perfilada, con cita.',
      branchesTitle: 'La casa',
      branches: [
        {
          name: 'Americana',
          address: '{{address}}',
          hours: 'Lun–Sáb 10:00–20:00',
        },
      ],
      linksTitle: 'Secciones',
      links: [
        {
          label: 'Estudio',
          href: '#nosotros',
        },
        {
          label: 'Carta',
          href: '#servicios',
        },
        {
          label: 'Barberos',
          href: '#equipo',
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
      contactTitle: 'Contacto',
    },
    team: {
      kicker: '{{index}} — Los barberos',
      title: 'Las manos <span class="lz-title__serif">detrás</span>',
      members: [
        {
          name: 'Ramiro Cuevas',
          role: 'Fundador · navaja libre',
          tags: ['Afeitado', 'Toalla caliente'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Ramiro Cuevas con una navaja recta',
        },
        {
          name: 'Abel Ocampo',
          role: 'Corte clásico',
          tags: ['Tijera', 'Fade clásico'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Abel Ocampo con peine y tijera',
        },
        {
          name: 'Nicolás Paredes',
          role: 'Barba y perfilado',
          tags: ['Perfilado', 'Tónicos'],
          image: 'team-3.jpg',
          imageAlt: 'Retrato de Nicolás Paredes perfilando una barba',
        },
      ],
    },
    gallery: {
      kicker: '{{index}} — La casa en fotos',
      title: 'Cuaderno de <span class="lz-title__serif">cortes</span>',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Sillón de cuero',
          alt: 'Sillón de barbero de cuero con estructura cromada',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Navaja libre',
          alt: 'Navaja recta de acero sobre una toalla',
        },
        {
          image: 'gallery-03.jpg',
          caption: 'Corte en curso',
          alt: 'Barbero trabajando un corte con tijera',
        },
        {
          image: 'gallery-04.jpg',
          caption: 'Vapor',
          alt: 'Toalla caliente humeante lista para el afeitado',
        },
        {
          image: 'gallery-05.jpg',
          caption: 'Instrumental',
          alt: 'Tijeras y peines ordenados sobre madera',
        },
        {
          image: 'gallery-06.jpg',
          caption: 'Perfilado',
          alt: 'Barba perfilada con navaja',
        },
        {
          image: 'gallery-07.jpg',
          caption: 'Pomada mate',
          alt: 'Frascos de pomada sobre la repisa',
        },
        {
          image: 'gallery-08.jpg',
          caption: 'La casa',
          alt: 'Dos sillones y luz tenue en la barbería',
        },
      ],
    },
    testimonials: {
      kicker: 'Clientela habitual',
      title: 'Palabra de barrio',
      intro: 'Testimonios directos de quienes no cambian de barbero por nada.',
      reviews: [
        {
          text: 'Ramiro afeita como pocos: la toalla a punto y cero prisa. Llevo cuatro años viniendo cada mes.',
          author: 'Héctor V.',
          place: 'Cliente desde 2021',
        },
        {
          text: 'Me corté el pelo y la barba en una cita y salí con tiempo de sobra. Todo en orden.',
          author: 'Emiliano S.',
          place: 'Colonia Roma',
        },
        {
          text: 'El ritual completo es un buen regalo. Me trataron con calma de principio a fin.',
          author: 'Daniel R.',
          place: 'San Rafael',
        },
      ],
      score: '4.9',
      summary: 'Opiniones de ejemplo',
      allReviewsCta: 'Leer todas',
      writeReviewCta: 'Escribir una opinión',
    },
    marquee: {
      label: 'Especialidades de la barbería',
      items: [
        'Navaja libre',
        'Vapor y toalla',
        'Corte clásico',
        'Barba perfilada',
        'Solo con cita',
      ],
    },
  },
} satisfies ContentPack;
