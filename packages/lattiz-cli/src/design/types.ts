/**
 * Data model of the Stitch design library (design-library/stitch/<giro>/<id>/): candidate.json is
 * the flag, harvest.json what the harvester extracted. Plain data: nothing here is executable.
 */

export const CANDIDATE_STATUSES = [
  'collected',
  'harvested',
  'promoted',
  'shelved',
  'rejected',
] as const;
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

/** Allowed moves of the flag; `promoted` is terminal (undo it by reverting the promote commit). */
export const STATUS_MOVES: Record<CandidateStatus, CandidateStatus[]> = {
  collected: ['harvested', 'shelved', 'rejected'],
  harvested: ['harvested', 'promoted', 'shelved', 'rejected'],
  promoted: ['promoted'],
  shelved: ['collected', 'harvested', 'rejected'],
  rejected: [],
};

export interface PromotedRefs {
  palette?: string;
  fonts?: string;
  section?: string;
}

export interface Candidate {
  /** Folder name, `<giro>-<slug>-<nn>`. */
  id: string;
  giro: string;
  source: 'stitch';
  status: CandidateStatus;
  tags: string[];
  /** Free label for the visual spin of the candidate (e.g. "glass oscuro"). */
  spin?: string;
  /** Pointer to the ToS citation that allows commercial use. */
  license_ref: string;
  /** Candidate this one derives from (variant, edit). */
  reuse_of?: string;
  created_at: string;
  stitch: { project_id?: string; screen_ids?: string[] };
  /** Art direction the brief asked for, if any. */
  direction?: string;
  promoted?: PromotedRefs;
  notes?: string;
}

export interface TypeStep {
  /** Stitch token name (display-lg, body-md…), kept only as provenance. */
  token: string;
  role: 'display' | 'headline' | 'body' | 'label' | 'other';
  family: string;
  sizePx: number;
  weight?: number;
  lineHeightPx?: number;
  letterSpacingEm?: number;
}

export interface PaletteDraft {
  label: string;
  mode: 'light' | 'dark' | 'tinted';
  mood: string[];
  affinity: string[];
  bg: string;
  text: string;
  accent: string;
  surface?: string;
  surface2?: string;
  onAccent?: string;
  accentText?: string;
  photoTreatment: 'none' | 'grayscale' | 'warm' | 'duotone';
  placeholder: 'grain' | 'rules' | 'stripes' | 'blobs' | 'arches' | 'dots';
  /** Stitch tokens each seed color came from. */
  from: Record<string, string>;
  /** Result of the AA derivation at harvest time (kit buildPalette). */
  aa: { ok: boolean; problems: string[] };
  /** Stitch color names grouped by role; the kit never inherits those names. */
  roles: {
    surface: string[];
    text: string[];
    accent: string[];
    border: string[];
  };
  /** The palette as the kit's tokens (`--lz-color-*`), derived by buildPalette; empty when AA fails. */
  lz: Record<string, string>;
  /** Contrast of every text/background pair the design uses. */
  pairs: ContrastPair[];
  /** ΔE00 distance (ground + accent) to the closest palette of each giro it fits (A2 method). */
  distance: PaletteDistance[];
}

export interface ContrastPair {
  fg: string;
  bg: string;
  ratio: number;
  min: number;
  aa_pass: boolean;
}

export interface PaletteDistance {
  giro: string;
  nearest: string;
  distance: number;
  min: number;
  ok: boolean;
}

export interface TypographyDraft {
  scale: TypeStep[];
  displayFamily?: string;
  bodyFamily?: string;
  /** Families with a Google Fonts source (the only kind the kit can ship). */
  googleFamilies: string[];
  /** Families without one, never promoted. */
  unsupportedFamilies: string[];
  /** Icon webfonts (Material Symbols…): never a dependency, icons become inline SVG. */
  excludedFamilies: string[];
  /** Capsize metrics present (metric-matched fallback, CLS ≈ 0) per family. */
  metrics: Record<string, boolean>;
  /** Kit pair that already uses both faces, if any. */
  existingPair?: string;
  /** Compatible with how the kit delivers fonts (two Google families with metrics). */
  delivery: { ok: boolean; problems: string[] };
  radiusPx?: number;
  spacing?: Record<string, string>;
}

export const PATTERN_LAYOUTS = [
  'split',
  'centered',
  'card-grid',
  'bento',
  'stat-row',
  'quote',
  'link-columns',
  'band',
  'list',
] as const;
export type PatternLayout = (typeof PATTERN_LAYOUTS)[number];

export interface SectionPattern {
  /** Kit slot this pattern maps to. */
  slot: 'hero' | 'about' | 'services' | 'testimonials' | 'cta' | 'footer';
  layout: PatternLayout;
  /** Anchor id or comment label the section had in the source. */
  ref: string;
  columns: number;
  items: number;
  hasImage: boolean;
  hasStat: boolean;
  hasQuote: boolean;
  /** Surface treatment seen in the source (glass, flat, bordered, tinted). */
  surface: 'flat' | 'glass' | 'bordered' | 'tinted';
  heading?: string;
  /** What the kit has to drop or replace to build it (a form becomes a button, say). */
  notes?: string[];
  /** The kit already has it: `slot/variant`. Nothing is created. */
  existing?: string;
  /** New but mappable: files for an additive extended variant (promote writes them). */
  draft?: SectionDraft;
  /** Mappable = fits the kit's roles and ranges; only these can be promoted. */
  mappable: true;
}

export interface SectionDraft {
  variant: string;
  html: string;
  css: string;
  /** Source of meta.ts. */
  meta_ts: string;
  /** Raw and gzip bytes of what the variant adds to a page that uses it. */
  bytes: { html: number; css: number; css_gzip: number };
}

export type InteractivityKind =
  | 'reveal-on-scroll'
  | 'sticky-header'
  | 'parallax'
  | 'other-js';

export interface Interactivity {
  kind: InteractivityKind;
  /** What the source does (selectors, no code). */
  detail: string;
  /** What the kit does instead; JS from Stitch is never imported. */
  recommendation: string;
}

export interface ImageNeed {
  ref: string;
  slot: SectionPattern['slot'];
  orientation: 'portrait' | 'landscape' | 'square' | 'unspecified';
  use: 'foreground' | 'background';
}

export interface NotMappable {
  ref: string;
  reason: string;
}

export interface Harvest {
  version: 1;
  candidate_id: string;
  input: { file: string; kind: 'html' | 'design-md' };
  palette: PaletteDraft | null;
  typography: TypographyDraft;
  sections: SectionPattern[];
  not_mappable: NotMappable[];
  /** JS behaviors seen in the source and what replaces them. */
  interactivity: Interactivity[];
  /** What each slot's photo has to be (for IMAGES.md); never a URL. */
  image_needs: ImageNeed[];
  /** Images found in the source and deliberately dropped (never copied or linked). */
  images_ignored: number;
}

export class ValidationError extends Error {
  constructor(
    readonly file: string,
    readonly problems: string[],
  ) {
    super(`${file}: ${problems.join('; ')}`);
  }
}

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v !== '';
const isStrArr = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');
const HEX = /^#[0-9a-fA-F]{6}$/;

export function validateCandidate(input: unknown, file = 'candidate.json') {
  const p: string[] = [];
  if (!isRec(input)) throw new ValidationError(file, ['no es un objeto']);
  const o = input;
  if (!isStr(o.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(o.id))
    p.push('id: kebab-case obligatorio');
  if (!isStr(o.giro)) p.push('giro: obligatorio');
  if (o.source !== 'stitch') p.push('source: debe ser "stitch"');
  if (!CANDIDATE_STATUSES.includes(o.status as CandidateStatus))
    p.push(`status: uno de ${CANDIDATE_STATUSES.join(', ')}`);
  if (!isStrArr(o.tags)) p.push('tags: lista de textos');
  if (o.spin !== undefined && typeof o.spin !== 'string') p.push('spin: texto');
  if (!isStr(o.license_ref)) p.push('license_ref: obligatorio');
  if (o.reuse_of !== undefined && !isStr(o.reuse_of))
    p.push('reuse_of: id de otro candidato');
  if (!isStr(o.created_at) || Number.isNaN(Date.parse(o.created_at as string)))
    p.push('created_at: fecha ISO');
  if (!isRec(o.stitch)) p.push('stitch: objeto');
  else {
    if (o.stitch.project_id !== undefined && !isStr(o.stitch.project_id))
      p.push('stitch.project_id: texto');
    if (o.stitch.screen_ids !== undefined && !isStrArr(o.stitch.screen_ids))
      p.push('stitch.screen_ids: lista de textos');
  }
  if (p.length) throw new ValidationError(file, p);
  return input as unknown as Candidate;
}

export function validateHarvest(input: unknown, file = 'harvest.json') {
  const p: string[] = [];
  if (!isRec(input)) throw new ValidationError(file, ['no es un objeto']);
  const o = input;
  if (o.version !== 1) p.push('version: 1');
  if (!isStr(o.candidate_id)) p.push('candidate_id: obligatorio');
  if (
    !isRec(o.input) ||
    !['html', 'design-md'].includes(o.input.kind as string)
  )
    p.push('input.kind: html | design-md');
  if (o.palette !== null) {
    if (!isRec(o.palette)) p.push('palette: objeto o null');
    else
      for (const k of ['bg', 'text', 'accent'])
        if (!HEX.test(String(o.palette[k]))) p.push(`palette.${k}: #rrggbb`);
  }
  if (!isRec(o.typography) || !Array.isArray(o.typography.scale))
    p.push('typography.scale: lista');
  if (!Array.isArray(o.sections)) p.push('sections: lista');
  else
    for (const [i, s] of o.sections.entries()) {
      if (!isRec(s) || !PATTERN_LAYOUTS.includes(s.layout as PatternLayout))
        p.push(`sections[${i}].layout: uno de ${PATTERN_LAYOUTS.join(', ')}`);
    }
  if (!Array.isArray(o.not_mappable)) p.push('not_mappable: lista');
  if (typeof o.images_ignored !== 'number') p.push('images_ignored: número');
  if (p.length) throw new ValidationError(file, p);
  return input as unknown as Harvest;
}

/** Row of design-library/index.json (generated). */
export interface IndexEntry {
  id: string;
  giro: string;
  status: CandidateStatus;
  tags: string[];
  spin?: string;
  reuse_of?: string;
  created_at: string;
  harvested: boolean;
  path: string;
}
export interface LibraryIndex {
  version: 1;
  count: number;
  by_status: Record<CandidateStatus, number>;
  candidates: IndexEntry[];
}
