import type { SectionMeta } from '../../../src/types';

// Stitch: restaurante-ceniza-brasa-pizarra-01 (carta), rebuilt by hand
export default {
  slot: 'services',
  variant: 'chalk-board',
  label: 'Pizarra de turnos',
  region: 'main',
  description:
    'Cabecera con título grande y una nota de precios a la derecha, y debajo una pizarra de tres columnas contiguas dentro de un marco: cada columna con nombre de grupo subrayado y una etiqueta pequeña, y platillos con nombre en mayúsculas, precio grande en la fuente de titulares y descripción corta. Sin fotos.',
  intent:
    'Una carta que se lee como una pizarra de cocina: tres grupos a la vista y precios que se escanean de un vistazo; para parrillas y bares con menú corto por zonas (brasa, barra, para compartir).',
  numbered: true,
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'editorial'],
  contentKeys: [
    'kicker',
    'title',
    'note?',
    'cta?',
    'groups[].title',
    'groups[].tag?',
    'groups[].items[].name',
    'groups[].items[].price',
    'groups[].items[].description?',
  ],
  sample: {
    note: 'Precios en MXN · IVA incluido',
    cta: 'Pedir por WhatsApp',
    groups: [
      {
        title: 'Brasa',
        tag: '01 · Carnes',
        items: [
          { name: 'Rib eye 400 g', price: '$590', description: 'Con mantequilla de ajo y elote asado.' },
          { name: 'Pollo en recado negro', price: '$340', description: 'Medio pollo de granja marinado.' },
        ],
      },
      {
        title: 'Barra',
        tag: '02 · Tragos',
        items: [
          { name: 'Xoconostle ahumado', price: '$180', description: 'Mezcal ahumado y sal de gusano.' },
          { name: 'Stout de la casa', price: '$160' },
        ],
      },
      {
        title: 'Para compartir',
        tag: '03 · Centro',
        items: [
          { name: 'Tuétanos en canoa', price: '$240', description: 'Con tortillas de maíz azul.' },
          { name: 'Queso de sartén', price: '$170', description: 'Epazote fresco y rajas.' },
        ],
      },
    ],
  },
} satisfies SectionMeta;
