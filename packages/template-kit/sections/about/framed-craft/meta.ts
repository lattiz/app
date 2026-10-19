import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-don-porfirio-01 (maestros), rebuilt by hand
export default {
  slot: 'about',
  variant: 'framed-craft',
  label: 'Nosotros',
  region: 'main',
  description:
    'Texto a la izquierda (antetítulo con filete, título, párrafo principal, párrafo de apoyo y tres filas de oficio con su marca numerada) y a la derecha una foto cuadrada enmarcada con esquinas de grabado y una placa con rótulo, texto y dato.',
  intent:
    'Una presentación del oficio que se lee como inventario de herramientas: lo que se hace a mano, en qué orden y con qué; para barberías, talleres y restaurantes de autor que quieren decir cómo trabajan en lugar de contar su historia.',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['bold'],
  placeholder: { width: 1000, height: 1000 },
  contentKeys: [
    'kicker?',
    'title',
    'summary',
    'body?',
    'image',
    'imageAlt',
    'plateLabel?',
    'plateTitle?',
    'plateAside?',
    'features[].title',
    'features[].text',
  ],
  sample: {
    kicker: 'El oficio · respeto al filo',
    title: 'Dos generaciones afeitando barbas duras.',
    summary:
      'El sillón de cuero no miente. Respetamos el tiempo del cliente y el filo de la hoja, con espuma tibia batida a brocha y toalla al vapor.',
    body: 'No somos franquicia rápida ni estudio de vanidad. Aquí el maestro barbero inspecciona el remolino del cabello, templa la navaja con piedra fina y te devuelve la presencia de quien respeta su propia imagen.',
    imageAlt:
      'Navajas y tijeras tradicionales de acero sobre una mesa de pizarra',
    plateLabel: 'Instrumentos certificados',
    plateTitle: 'Acero quirúrgico templado',
    plateAside: 'CDMX',
    features: [
      {
        title: 'Espuma batida a mano',
        text: 'Con brocha de cerda natural en tazón de peltre tibio.',
      },
      {
        title: 'Navaja de un solo uso',
        text: 'Hojas de acero abiertas directamente en tu presencia.',
      },
      {
        title: 'Loción artesanal de laurel y menta',
        text: 'Fórmula clásica que cierra el poro y apaga la irritación.',
      },
    ],
  },
} satisfies SectionMeta;
