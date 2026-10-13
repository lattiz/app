import type { FontPairPreset } from '../src/spec/presets';
import { LIBRARY } from './library';

/**
 * Font pair library (extended catalog). Same delivery as the legacy pairs (Google Fonts css2 +
 * metric-matched local fallback); `affinity` orders the compiler's pick per giro.
 */

export interface LibraryFontPair extends FontPairPreset {
  mood: string[];
  /** Giro ids in order of fit; unlisted giros may still use it. */
  affinity: string[];
  /** Recommended style presets (src/lib/style.ts) for the display face. */
  case: 'upper' | 'none';
  tracking: 'tight' | 'normal' | 'wide';
  typeScale: 'tight' | 'normal' | 'expressive';
  /** License per family (Google Fonts: OFL-1.1 or Apache-2.0), checked by `kit:fonts`. */
  licenses: Record<string, 'OFL-1.1' | 'Apache-2.0'>;
}

export const EXTENDED_FONT_PAIRS: Record<string, LibraryFontPair> = LIBRARY;
