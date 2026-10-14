import type { PrimitiveChoices } from '../primitives';
import type { ThemeStyle } from '../src/lib/style';
import type { ArchetypeId } from '../archetypes';

/** Taste rules a compiled template is checked against (src/spec/direction.ts › directionFindings). */
export type DirectionRule =
  /** The palette's scheme. */
  | 'scheme:light'
  | 'scheme:dark'
  /** Display face in capitals (theme displayTransform). */
  | 'display:upper'
  /** Display face is a serif. */
  | 'display:serif'
  /** Accent is near gray (monochrome page). */
  | 'accent:neutral'
  /** No linear/radial/conic gradients in the template's CSS. */
  | 'no-gradients';

/**
 * An art direction (extended catalog): data only. It fixes every taste decision so the same
 * direction always yields a coherent page; the spec compiler reads it with `layout.direction`.
 */
export interface ArtDirection {
  id: string;
  /** Spanish name shown in the CLI. */
  name: string;
  /** One line: what is distinctive and for which kind of business. */
  intent: string;
  /** Copy voice in Spanish (es-MX). */
  voice: {
    register: string;
    /** 3–5 rules: rhythm, vocabulary to use and to avoid. */
    rules: string[];
    avoid: string[];
    headline: string;
    cta: string;
  };
  /** Library palette ids (palettes/), best first; `byGiro` replaces the list for that giro. */
  palettes: { default: string[]; byGiro?: Record<string, string[]> };
  /** Font pair ids (legacy or extended), best first; `byGiro` replaces the list for that giro. */
  fontPairs: { default: string[]; byGiro?: Record<string, string[]> };
  /** All eight style presets (src/lib/style.ts). */
  style: Required<ThemeStyle>;
  /** Primitive style per family (primitives/). */
  primitives: Required<Omit<PrimitiveChoices, 'divider'>> &
    Pick<PrimitiveChoices, 'divider'>;
  /** Page archetypes (archetypes/), best first. */
  archetypes: ArchetypeId[];
  /** Hero variants per tier, best first. */
  heroes: { pro: string[]; basic: string[] };
  /** Pro Motion preset (Básico never loads Motion). */
  motion: 'calm' | 'editorial' | 'none';
  /** taste-skill dials, 1–10 (docs/template-kit-design-principles.md §1). */
  dials: { variance: number; motion: number; density: number };
  /** Giro ids in order of fit; not a restriction. */
  giros: string[];
  rules: DirectionRule[];
}
