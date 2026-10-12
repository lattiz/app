import type { GiroPalette } from '../src/spec/presets';
import { LIBRARY } from './library';

/**
 * Global palette library (extended catalog): any giro may use any of these; `affinity` only orders
 * the compiler's pick. Ids are stable (`pal-<name>`). Giros keep their own legacy palettes in giros/.
 */

export interface LibraryPalette extends GiroPalette {
  /** light / dark, or tinted: a colored ground (not paper white, not near-black). */
  mode: 'light' | 'dark' | 'tinted';
  mood: string[];
  /** Giro ids in order of fit; unlisted giros may still use it. */
  affinity: string[];
}

/** Built from palettes/seeds.ts by `kit:palettes --write` (AA-checked, frozen hex values). */
export const EXTENDED_PALETTES: Record<string, LibraryPalette> = LIBRARY;
