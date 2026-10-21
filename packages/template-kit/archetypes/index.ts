import type { ThemeStyle } from '../src/lib/style';
import type { Role } from '../src/tiers';

/**
 * Page archetypes (WP7): the dials of docs/template-kit-design-principles.md §1 turned into data the
 * compiler can follow in Part 3 (WP8). Each one fixes the WP3 style presets, the Motion preset, the
 * preferred variant per role and tier (best first; extended variants first, a legacy fallback last)
 * and the giros it suits. Nothing reads this yet except the gallery sheet and the tests: specs keep
 * compiling exactly as before.
 */

export type ArchetypeId =
  | 'editorial'
  | 'showcase'
  | 'catalog'
  | 'booking'
  | 'trust'
  | 'bold'
  | 'soft'
  | 'minimal';

/** Roles of the blueprints plus `cta`, the CTA band slot registered in WP8. */
export type ArchetypeRole = Role | 'cta';

export interface ArchetypeSection {
  role: ArchetypeRole;
  /** Variants of the role's slot, best first. */
  variants: string[];
}

export interface Archetype {
  id: ArchetypeId;
  label: string;
  /** One line: what it is for. */
  intent: string;
  /** taste-skill dials, 1–10: variance (symmetry → asymmetry), motion, density. */
  dials: { variance: number; motion: number; density: number };
  /** WP3 presets the archetype sets; a spec can still move any of them. */
  style: ThemeStyle;
  /** Legacy shape presets (brand.shape) that agree with the style, best first. */
  shapes: string[];
  /** Pro Motion preset; Básico never loads Motion. */
  motion: 'calm' | 'editorial';
  /** Palette and font pair moods (palettes/, font-pairs/) that fit, best first. */
  moods: string[];
  /** Giro ids in order of fit. */
  giros: string[];
  /** Page order per tier: hero first, whatsapp last (blueprint positions). */
  sections: { pro: ArchetypeSection[]; basic: ArchetypeSection[] };
  /** Pro archetype of blueprints/service-landing.pro.ts it maps to until WP8 registers these. */
  blueprintArchetype: 'editorial-atelier' | 'street-luxe' | 'neo-brutal';
  /** What the gallery sheet renders: a giro and a palette + font pair from the libraries. */
  specimen: { giro: string; palette: string; fontPair: string };
}

const s = (role: ArchetypeRole, ...variants: string[]): ArchetypeSection => ({
  role,
  variants,
});

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  editorial: {
    id: 'editorial',
    label: 'Editorial',
    intent:
      'Revista: tipografía grande, filetes en vez de cajas, mucho aire y texto que se lee como artículo.',
    dials: { variance: 6, motion: 5, density: 3 },
    style: {
      shape: 'sharp',
      surface: 'flat',
      density: 'airy',
      divider: 'hairline',
      imageTreatment: 'offset',
      typeScale: 'expressive',
      tracking: 'tight',
    },
    shapes: ['filete', 'sutil'],
    motion: 'calm',
    moods: ['editorial', 'sobrio', 'lujo'],
    giros: ['despacho', 'floreria', 'restaurante', 'estetica'],
    sections: {
      pro: [
        s('header', 'inline'),
        s('hero', 'columns', 'rail', 'centered-arch'),
        s('about', 'portrait', 'statement'),
        s('catalog', 'menu-columns', 'editorial-table'),
        s('proof', 'mosaic'),
        s('team', 'list'),
        s('testimonials', 'quote-feature'),
        s('faq', 'two-col'),
        s('contact', 'map-link', 'with-contact'),
        s('whatsapp', 'bubble'),
        s('footer', 'ledger', 'columns'),
      ],
      basic: [
        s('header', 'inline'),
        s('hero', 'columns', 'centered-arch'),
        s('about', 'brief'),
        s('catalog', 'menu-columns', 'editorial-table'),
        s('faq', 'two-col'),
        s('contact', 'single-card', 'single'),
        s('whatsapp', 'bubble'),
        s('footer', 'ledger', 'columns'),
      ],
    },
    blueprintArchetype: 'editorial-atelier',
    specimen: {
      giro: 'despacho',
      palette: 'pal-indigo-papel',
      fontPair: 'newsreader+public-sans',
    },
  },

  showcase: {
    id: 'showcase',
    label: 'Vitrina',
    intent:
      'El trabajo primero: la foto llena la portada y la galería manda; el texto acompaña.',
    dials: { variance: 8, motion: 6, density: 3 },
    style: {
      shape: 'soft',
      surface: 'flat',
      density: 'airy',
      divider: 'none',
      imageTreatment: 'plain',
      typeScale: 'normal',
    },
    shapes: ['suave', 'organico'],
    motion: 'editorial',
    moods: ['lujo', 'fresco', 'editorial'],
    giros: ['estetica', 'floreria', 'tienda', 'barberia', 'restaurante'],
    sections: {
      pro: [
        s('header', 'centered-logo'),
        s('hero', 'framed', 'stack', 'image-bg', 'photo-ribbon'),
        s('marquee', 'ticker'),
        s('about', 'text-image-offset'),
        s('catalog', 'cards', 'product-grid'),
        s('proof', 'bento', 'mosaic'),
        s('testimonials', 'quote-feature'),
        s('faq', 'list'),
        s('cta', 'band', 'urgent-line'),
        s('contact', 'with-contact', 'map-link'),
        s('whatsapp', 'bubble'),
        s('footer', 'big-wordmark'),
      ],
      basic: [
        s('header', 'centered-logo', 'inline'),
        s('hero', 'framed', 'image-bg', 'photo-ribbon'),
        s('catalog', 'cards', 'price-list'),
        s('faq', 'list'),
        s('cta', 'band', 'urgent-line'),
        s('contact', 'single-card', 'single'),
        s('whatsapp', 'bubble'),
        s('footer', 'minimal-centered'),
      ],
    },
    blueprintArchetype: 'editorial-atelier',
    specimen: {
      giro: 'estetica',
      palette: 'pal-rosa-vino',
      fontPair: 'gloock+onest',
    },
  },

  catalog: {
    id: 'catalog',
    label: 'Carta',
    intent:
      'Menú, productos y precios arriba, para escanear rápido; el aviso del día siempre a la vista.',
    dials: { variance: 5, motion: 4, density: 6 },
    style: {
      shape: 'soft',
      surface: 'outlined',
      density: 'cozy',
      divider: 'hairline',
      imageTreatment: 'plain',
      typeScale: 'normal',
    },
    shapes: ['sutil', 'suave', 'redondo'],
    motion: 'calm',
    moods: ['cálido', 'mexicano', 'juguetón', 'fresco'],
    giros: ['restaurante', 'tienda', 'barberia', 'estetica'],
    sections: {
      pro: [
        s('header', 'notice-bar'),
        s('hero', 'framed', 'bento', 'split'),
        s('about', 'stats-strip'),
        s('catalog', 'menu-columns', 'product-grid', 'price-list'),
        s('proof', 'grid'),
        s('testimonials', 'cards'),
        s('faq', 'grid'),
        s('cta', 'band', 'urgent-line'),
        s('contact', 'with-contact'),
        s('whatsapp', 'bubble'),
        s('footer', 'columns'),
      ],
      basic: [
        s('header', 'notice-bar'),
        s('hero', 'framed', 'split'),
        s('catalog', 'menu-columns', 'price-list'),
        s('faq', 'grid', 'list'),
        s('cta', 'band', 'urgent-line'),
        s('contact', 'single-card', 'single'),
        s('whatsapp', 'bubble'),
        s('footer', 'columns'),
      ],
    },
    blueprintArchetype: 'editorial-atelier',
    specimen: {
      giro: 'restaurante',
      palette: 'pal-azulejo',
      fontPair: 'petrona+rubik',
    },
  },

  booking: {
    id: 'booking',
    label: 'Reservar',
    intent:
      'Conversión: la cita por WhatsApp siempre a mano, horario de hoy visible, equipo y reseñas cerca.',
    dials: { variance: 4, motion: 4, density: 5 },
    style: {
      shape: 'round',
      surface: 'elevated',
      density: 'cozy',
      divider: 'none',
      imageTreatment: 'framed',
      typeScale: 'normal',
    },
    shapes: ['redondo', 'suave'],
    motion: 'calm',
    moods: ['clínico', 'fresco', 'suave'],
    giros: ['clinica', 'dental', 'veterinaria', 'estetica', 'gimnasio'],
    sections: {
      pro: [
        s('header', 'notice-bar'),
        s('hero', 'panel', 'split'),
        s('about', 'stats-strip', 'booking-steps'),
        s('catalog', 'cards'),
        s('team', 'spotlight', 'grid'),
        s('proof', 'strip'),
        s('testimonials', 'rating-wall', 'cards'),
        s('faq', 'grid'),
        s('contact', 'map-link', 'with-contact'),
        s('whatsapp', 'bubble'),
        s('footer', 'columns'),
      ],
      basic: [
        s('header', 'notice-bar'),
        s('hero', 'panel', 'split'),
        s('about', 'brief', 'booking-steps'),
        s('catalog', 'cards'),
        s('faq', 'list', 'grid'),
        s('contact', 'single-card', 'single'),
        s('whatsapp', 'bubble'),
        s('footer', 'columns'),
      ],
    },
    blueprintArchetype: 'editorial-atelier',
    specimen: {
      giro: 'dental',
      palette: 'pal-turquesa-agua',
      fontPair: 'red-hat-display+red-hat-text',
    },
  },

  trust: {
    id: 'trust',
    label: 'Confianza',
    intent:
      'Credenciales, equipo, proceso y muchas preguntas; tono sobrio, nada de promesas.',
    dials: { variance: 3, motion: 4, density: 5 },
    style: {
      shape: 'soft',
      surface: 'outlined',
      density: 'cozy',
      divider: 'hairline',
      imageTreatment: 'plain',
      typeScale: 'tight',
    },
    shapes: ['sutil', 'filete', 'suave'],
    motion: 'calm',
    moods: ['sobrio', 'clínico', 'editorial'],
    giros: ['despacho', 'clinica', 'dental', 'veterinaria'],
    sections: {
      pro: [
        s('header', 'inline'),
        s('hero', 'panel', 'bento', 'columns'),
        s('about', 'portrait', 'statement'),
        s('catalog', 'editorial-table', 'menu-columns'),
        s('team', 'spotlight', 'list'),
        s('proof', 'strip'),
        s('testimonials', 'rating-wall'),
        s('faq', 'two-col', 'grid'),
        s('contact', 'map-link'),
        s('whatsapp', 'bubble'),
        s('footer', 'ledger'),
      ],
      basic: [
        s('header', 'inline'),
        s('hero', 'panel', 'columns'),
        s('about', 'brief'),
        s('catalog', 'editorial-table'),
        s('faq', 'two-col', 'grid'),
        s('contact', 'single-card'),
        s('whatsapp', 'bubble'),
        s('footer', 'ledger'),
      ],
    },
    blueprintArchetype: 'editorial-atelier',
    specimen: {
      giro: 'clinica',
      palette: 'pal-niebla-grafito',
      fontPair: 'eb-garamond+albert-sans',
    },
  },

  bold: {
    id: 'bold',
    label: 'Cartel',
    intent:
      'Cartel urbano: condensada en mayúsculas, foto a sangre, cinta y bordes duros; mucha actitud.',
    dials: { variance: 9, motion: 7, density: 4 },
    style: {
      shape: 'sharp',
      surface: 'flat',
      density: 'compact',
      divider: 'rule',
      imageTreatment: 'duotone-overlay',
      typeScale: 'expressive',
      displayCase: 'upper',
    },
    shapes: ['brutal', 'urbano'],
    motion: 'editorial',
    moods: ['urbano', 'energía'],
    giros: ['barberia', 'gimnasio', 'tienda'],
    sections: {
      pro: [
        s('header', 'inline'),
        s('hero', 'poster', 'image-bg', 'photo-ribbon'),
        s('marquee', 'ticker'),
        s('about', 'stats-strip', 'text-image-offset', 'framed-craft'),
        s('catalog', 'menu-columns', 'price-list', 'ritual-cards'),
        s('proof', 'bento', 'grid'),
        s('testimonials', 'cards', 'paper-trio'),
        s('faq', 'list', 'numbered-cards'),
        s('cta', 'band', 'urgent-line'),
        s('contact', 'with-contact', 'booking-panel'),
        s('whatsapp', 'bubble'),
        s('footer', 'big-wordmark', 'signature-bar'),
      ],
      basic: [
        s('header', 'inline'),
        s('hero', 'poster', 'image-bg', 'photo-ribbon'),
        s('catalog', 'menu-columns', 'price-list', 'ritual-cards'),
        s('faq', 'list', 'numbered-cards'),
        s('cta', 'band', 'urgent-line'),
        s('contact', 'single-card', 'single', 'booking-panel'),
        s('whatsapp', 'bubble'),
        s('footer', 'columns', 'signature-bar'),
      ],
    },
    blueprintArchetype: 'neo-brutal',
    specimen: {
      giro: 'gimnasio',
      palette: 'pal-carbon-lima',
      fontPair: 'bebas-neue+barlow',
    },
  },

  soft: {
    id: 'soft',
    label: 'Amable',
    intent:
      'Amable: esquinas redondas, fondos teñidos y arcos; cálido sin volverse infantil.',
    dials: { variance: 5, motion: 5, density: 3 },
    style: {
      shape: 'pill',
      surface: 'tinted',
      density: 'airy',
      divider: 'none',
      imageTreatment: 'arch',
      typeScale: 'normal',
    },
    shapes: ['organico', 'redondo'],
    motion: 'calm',
    moods: ['suave', 'cálido', 'natural', 'juguetón'],
    giros: ['estetica', 'floreria', 'veterinaria', 'dental'],
    sections: {
      pro: [
        s('header', 'centered-logo'),
        s('hero', 'duo-arch', 'overlap', 'centered-arch', 'arch-sticker'),
        s('about', 'text-image-offset', 'booking-steps'),
        s('catalog', 'cards', 'alternating-bands'),
        s('team', 'grid'),
        s('proof', 'mosaic', 'collage'),
        s('testimonials', 'quote-feature', 'feature-stack'),
        s('faq', 'grid', 'column-panels'),
        s('contact', 'with-contact', 'arch-visit'),
        s('whatsapp', 'bubble'),
        s('footer', 'minimal-centered'),
      ],
      basic: [
        s('header', 'centered-logo', 'inline'),
        s('hero', 'duo-arch', 'centered-arch', 'arch-sticker'),
        s('about', 'brief', 'booking-steps'),
        s('catalog', 'cards', 'price-list', 'alternating-bands'),
        s('faq', 'two-col', 'grid', 'column-panels'),
        s('contact', 'single-card', 'single'),
        s('whatsapp', 'bubble'),
        s('footer', 'minimal-centered'),
      ],
    },
    blueprintArchetype: 'editorial-atelier',
    specimen: {
      giro: 'veterinaria',
      palette: 'pal-salvia-tinta',
      fontPair: 'fredoka+nunito',
    },
  },

  minimal: {
    id: 'minimal',
    label: 'Mínimo',
    intent:
      'Suizo: el texto manda, filetes finos, una sola foto fuerte y nada de adornos.',
    dials: { variance: 5, motion: 4, density: 2 },
    style: {
      shape: 'sharp',
      surface: 'flat',
      density: 'airy',
      divider: 'hairline',
      imageTreatment: 'plain',
      typeScale: 'tight',
    },
    shapes: ['filete', 'sutil'],
    motion: 'calm',
    moods: ['sobrio', 'editorial'],
    giros: ['despacho', 'clinica', 'tienda'],
    sections: {
      pro: [
        s('header', 'inline'),
        s('hero', 'columns', 'rail'),
        s('about', 'statement'),
        s('catalog', 'editorial-table', 'menu-columns'),
        s('proof', 'strip'),
        s('testimonials', 'rating-wall'),
        s('faq', 'list'),
        s('contact', 'map-link'),
        s('whatsapp', 'bubble'),
        s('footer', 'ledger'),
      ],
      basic: [
        s('header', 'inline'),
        s('hero', 'columns'),
        s('catalog', 'editorial-table', 'menu-columns'),
        s('faq', 'two-col', 'list'),
        s('contact', 'single-card'),
        s('whatsapp', 'bubble'),
        s('footer', 'ledger'),
      ],
    },
    blueprintArchetype: 'editorial-atelier',
    specimen: {
      giro: 'tienda',
      palette: 'pal-papel-tinta',
      fontPair: 'schibsted-grotesk+source-serif-4',
    },
  },
};

/** The first variant of every role: the page an archetype composes by default. */
export function archetypePage(
  archetype: Archetype,
  tier: 'pro' | 'basic',
): { role: ArchetypeRole; variant: string }[] {
  return archetype.sections[tier].map((x) => ({
    role: x.role,
    variant: x.variants[0],
  }));
}

export { FAMILIES, familyOf, type Family } from './families';
export { VERTICAL_MODULES, type VerticalModule } from './verticals';
