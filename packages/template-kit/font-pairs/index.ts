import type { FontPairPreset } from '../src/spec/presets';

/**
 * Font pair library (extended catalog). Same delivery as the legacy pairs (Google Fonts css2 +
 * metric-matched local fallback); `affinity` orders the compiler's pick per giro.
 */

export interface LibraryFontPair extends FontPairPreset {
  mood: string[];
  /** Giro ids in order of fit; unlisted giros may still use it. */
  affinity: string[];
}

export const EXTENDED_FONT_PAIRS: Record<string, LibraryFontPair> = {};
