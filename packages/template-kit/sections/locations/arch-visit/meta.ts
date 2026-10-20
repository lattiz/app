import type { SectionMeta } from '../../../src/types';

// Stitch: tienda-caramelo-pop-bandas-01 (contacto), rebuilt by hand
export default {
  slot: 'locations',
  variant: 'arch-visit',
  label: 'Contacto y ubicación',
  region: 'main',
  description:
    'Una tarjeta tintada a todo el ancho: a la izquierda antetítulo, título, línea de apoyo, tres botones en cápsula (WhatsApp, teléfono, correo) y dos fichas con la dirección y el horario; a la derecha, opcional, una foto en arco con una placa («¡Ven a conocernos!») sobre su pie. Sin formulario ni mapa incrustado.',
  intent:
    'Invitar a pasar por la tienda o escribir antes de que se acaben las existencias: canal directo, dónde y cuándo, con una foto del local; para tiendas de barrio que atienden mostrador y WhatsApp.',
  numbered: true,
  placeholder: { width: 800, height: 1000 },
  tiers: ['pro'],
  archetypes: ['soft'],
  contentKeys: [
    'kicker?',
    'title',
    'contactText',
    'whatsappCta',
    'callLabel',
    'directionsLabel',
    'hoursLabel?',
    'branches[].name',
    'branches[].address',
    'branches[].hours',
    'branches[].directionsUrl',
    'image?',
    'imageAlt?',
    'imageCaption?',
    'imageNote?',
  ],
  sample: {
    kicker: 'Estamos cerca de ti',
    hoursLabel: 'Horario de tienda',
    whatsappCta: 'Mándanos un WhatsApp',
    imageCaption: '¡Ven a conocernos!',
    imageNote: 'A 3 cuadras del parque',
    branches: [
      {
        name: 'Ubicación',
        address: 'Calle Palestina esq. Av. Clavería, Col. Clavería, Azcapotzalco, CDMX.',
        hours: 'Lunes a sábado: 11:00 – 20:30 h<br>Domingos: 12:00 – 18:00 h',
        directionsUrl: 'https://maps.google.com/?q=Calle+Palestina+Claveria+CDMX',
      },
    ],
  },
} satisfies SectionMeta;
