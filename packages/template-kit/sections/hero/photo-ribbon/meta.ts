import type { SectionMeta } from '../../../src/types';

// Stitch: barberia-don-porfirio-01 (hero), rebuilt by hand
export default {
  slot: 'hero',
  variant: 'photo-ribbon',
  label: 'Portada',
  region: 'main',
  description:
    'Portada con foto a sangre bajo un velo oscuro que sube desde el pie; el contenido va a la izquierda y centrado en vertical: insignia con tres franjas, titular, texto, CTA de WhatsApp con ícono, un segundo CTA y una línea de confianza opcional. Contiene el único <h1>. Usa el esquema overlay/on-overlay.',
  intent:
    'Foto de ambiente y una sola voz a la izquierda, con insignia de oficio y línea de confianza; para barberías, talleres y restaurantes con carácter que quieren una portada fotográfica y contenida.',
  tiers: ['basic', 'pro'],
  archetypes: ['bold', 'showcase', 'trust'],
  placeholder: { width: 1600, height: 1000 },
  contentKeys: [
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta',
    'secondaryHref',
    'note?',
  ],
  sample: { note: 'Sin anticipos · Respuesta en minutos' },
} satisfies SectionMeta;
