/**
 * --motion for the seed: tags each section of a template with `data-lz-section`
 * (Lattiz Motion v2, docs/lattiz-motion.md) and the root wrapper with
 * `data-lz-motion`. The runtime derives every animation from those two attributes,
 * so no inner node is decorated. Classification reads the exported HTML (the
 * GrapesJS JSON often omits tag names) and is applied to the JSON by section order;
 * both must expose the same sections or the seed stops.
 *
 * Precedence per section: override (manifest `motion.sections`) > an existing
 * `data-lz-section` (manual) > heuristics. Idempotent: re-running yields the same
 * attributes and never adds v1 node attributes (only `data-lz-lightbox` on
 * editorial galleries, as before).
 */
import { parse, type HTMLElement } from 'node-html-parser';
import { injectMotion } from '../../apps/tenant-sites/lib/lz-motion';

export type MotionPreset = 'calm' | 'editorial' | 'none';
export const MOTION_PRESETS: readonly MotionPreset[] = [
  'calm',
  'editorial',
  'none',
];
export const SECTION_TYPES = [
  'hero',
  'about',
  'cards',
  'steps',
  'timeline',
  'gallery',
  'stats',
  'testimonials',
  'pricing',
  'team',
  'faq',
  'contact',
  'cta',
  'footer',
  'none',
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];
export const PATTERNS = ['cascade', 'alternate', 'converge', 'center-out', 'wave', 'none'] as const;
export type Pattern = (typeof PATTERNS)[number];

/** The runtime's default pattern per type (apps/tenant-sites/lib/lz-motion/src/runtime.js). */
const DEFAULT_PATTERN: Partial<Record<SectionType, Pattern>> = {
  faq: 'alternate',
  steps: 'alternate',
  timeline: 'alternate',
  testimonials: 'alternate',
  cards: 'converge',
  pricing: 'converge',
  gallery: 'wave',
  stats: 'center-out',
};

/** Template-kit slots map straight to a type; heuristics only run for other exports. */
const SLOT_TYPES: Record<string, SectionType> = {
  hero: 'hero',
  about: 'about',
  services: 'cards',
  catalog: 'cards',
  pricing: 'pricing',
  team: 'team',
  gallery: 'gallery',
  proof: 'gallery',
  stats: 'stats',
  steps: 'steps',
  timeline: 'timeline',
  testimonials: 'testimonials',
  faq: 'faq',
  locations: 'contact',
  contact: 'contact',
  cta: 'cta',
  footer: 'footer',
};

/** One manual correction: a type, or a type plus a pattern. */
export type SectionOverride = SectionType | { type?: SectionType; pattern?: Pattern };
/** Keys: slot name, `#id` or the section's index in the classification table. */
export type SectionOverrides = Record<string, SectionOverride>;

// Chrome that must stay put: fixed/sticky bars and self-animated tickers.
const SKIP_SLOTS = new Set(['navbar', 'floating-whatsapp', 'marquee']);
const TEXT_BLOCK = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,summary,dt,dd';
// Same pattern as the runtime's counter detection; prices ($) are not stats.
const NUMERIC = /^([^\d\s$]{0,3})\s?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(\s?[^\d]{0,12})$/;

export interface SectionRow {
  index: number;
  block: string;
  type: SectionType | 'skip';
  pattern: Pattern | '';
  reason: string;
  /** Rough count of reveal groups on a phone: heading block + items of look-alike lists + lone images. */
  revealGroups: number;
  nodes: number;
  text: number;
  media: number;
  groups: number;
  numeric: number;
  buttons: number;
}

export interface MotionResult {
  rows: SectionRow[];
  /** Sections whose type differs from what the source already had (0 on a re-run). */
  changed: number;
}

// ── HTML side ────────────────────────────────────────────────────────────────

function elements(el: HTMLElement): HTMLElement[] {
  return el.childNodes.filter((n): n is HTMLElement => n.nodeType === 1);
}

function signature(el: HTMLElement): string {
  return `${el.rawTagName?.toLowerCase()}.${el.classList.value[0] ?? ''}`;
}

/** ≥ 3 look-alike siblings, as the runtime's isGroup; runs of plain paragraphs don't count. */
function groupCount(root: HTMLElement): number {
  let count = 0;
  const visit = (el: HTMLElement): void => {
    const kids = elements(el);
    if (kids.length >= 3) {
      const sig = signature(kids[1]);
      const same = kids.filter((k) => signature(k) === sig).length;
      if (same >= 3 && same >= kids.length - 1 && !sig.startsWith('p.'))
        count += 1;
    }
    kids.forEach(visit);
  };
  visit(root);
  return count;
}

function isButton(el: HTMLElement): boolean {
  const tag = el.rawTagName?.toLowerCase();
  return (
    tag === 'button' ||
    el.getAttribute('role') === 'button' ||
    (tag === 'a' && /button|btn/.test(el.getAttribute('class') ?? ''))
  );
}

function isNumeric(el: HTMLElement): boolean {
  if (elements(el).length > 0) return false;
  const m = NUMERIC.exec(el.text.trim());
  return !!m && !(/^(19|20)\d\d$/.test(m[2]) && !m[3]);
}

/** Sections in document order: kit blocks by data-lz-slot, else top-level section/header/footer. */
function htmlSections(doc: HTMLElement): HTMLElement[] {
  const slotted = doc.querySelectorAll('[data-lz-slot]');
  if (slotted.length > 0) return slotted;
  const BLOCKS = new Set(['section', 'header', 'footer']);
  const nested = (el: HTMLElement): boolean => {
    for (let p = el.parentNode; p; p = p.parentNode)
      if (BLOCKS.has(p.rawTagName?.toLowerCase() ?? '')) return true;
    return false;
  };
  return doc
    .querySelectorAll('section, header, footer')
    .filter((el) => !nested(el));
}

function describe(el: HTMLElement): string {
  const slot = el.getAttribute('data-lz-slot');
  if (slot) return `${slot}/${el.getAttribute('data-lz-variant') ?? ''}`;
  const id = el.getAttribute('id');
  return `${el.rawTagName?.toLowerCase()}${id ? `#${id}` : ''}`;
}

function overrideFor(
  el: HTMLElement,
  index: number,
  overrides: SectionOverrides,
): { type?: SectionType; pattern?: Pattern } | undefined {
  const slot = el.getAttribute('data-lz-slot');
  const id = el.getAttribute('id');
  const hit =
    overrides[String(index)] ??
    (id ? overrides[`#${id}`] : undefined) ??
    (slot ? overrides[slot] : undefined);
  return typeof hit === 'string' ? { type: hit } : hit;
}

/** Reveal groups the runtime will build when everything stacks (phones). */
function revealGroups(el: HTMLElement): number {
  let items = 0;
  const visit = (node: HTMLElement): void => {
    const kids = elements(node);
    if (kids.length >= 3) {
      const sig = signature(kids[1]);
      const same = kids.filter((k) => signature(k) === sig).length;
      if (same >= 3 && same >= kids.length - 1 && !sig.startsWith('p.')) {
        items += kids.length;
        return;
      }
    }
    kids.forEach(visit);
  };
  visit(el);
  const lone = el.querySelectorAll('img, video, iframe').filter(
    (m) => !m.parentNode?.closest?.('li, figure, article, details'),
  ).length;
  return 1 + items + lone;
}

function classify(
  sections: HTMLElement[],
  overrides: SectionOverrides,
): SectionRow[] {
  const lastMain = [...sections]
    .reverse()
    .find(
      (el) =>
        el.rawTagName?.toLowerCase() !== 'footer' &&
        el.getAttribute('data-lz-slot') !== 'footer' &&
        !SKIP_SLOTS.has(el.getAttribute('data-lz-slot') ?? ''),
    );
  let firstContent = true;
  return sections.map((el, index) => {
    const slot = el.getAttribute('data-lz-slot') ?? '';
    const tag = el.rawTagName?.toLowerCase() ?? '';
    const text = el
      .querySelectorAll(TEXT_BLOCK)
      .filter((t) => t.text.trim()).length;
    const media = el.querySelectorAll('img, video, iframe').length;
    const images = el.querySelectorAll('img, video').length;
    const groups = groupCount(el);
    const numeric = el.querySelectorAll('*').filter(isNumeric).length;
    const buttons = el.querySelectorAll('a, button, [role=button]').filter(isButton).length;
    const row = {
      index,
      block: describe(el),
      pattern: '' as Pattern | '',
      revealGroups: revealGroups(el),
      nodes: el.querySelectorAll('*').length + 1,
      text,
      media,
      groups,
      numeric,
      buttons,
    };
    const override = overrideFor(el, index, overrides);
    const manualPattern = el.getAttribute('data-lz-pattern');
    const withPattern = (r: Omit<SectionRow, 'pattern'> & { pattern?: Pattern | '' }): SectionRow => {
      const type = r.type;
      const pattern =
        override?.pattern ??
        ((PATTERNS as readonly string[]).includes(manualPattern ?? '') ? (manualPattern as Pattern) : undefined) ??
        (type === 'skip' || type === 'none' || type === 'footer' ? '' : (DEFAULT_PATTERN[type] ?? 'cascade'));
      return { ...r, pattern };
    };
    const manual = el.getAttribute('data-lz-section');
    const known = (t: string | undefined): t is SectionType =>
      !!t && (SECTION_TYPES as readonly string[]).includes(t);
    if (override?.type) return withPattern({ ...row, type: override.type, reason: 'override' });
    if (known(manual)) return withPattern({ ...row, type: manual, reason: 'manual' });
    if (manual === 'text') return withPattern({ ...row, type: 'about', reason: 'manual (v2 text)' });
    if (SKIP_SLOTS.has(slot) || (!slot && tag === 'header'))
      return withPattern({ ...row, type: 'skip', reason: 'chrome' });

    const isFirst = firstContent;
    firstContent = false;
    const pick = (type: SectionType, reason: string): SectionRow => withPattern({ ...row, type, reason });
    if (SLOT_TYPES[slot]) return pick(SLOT_TYPES[slot], `slot ${slot}`);
    if (tag === 'footer' || slot === 'footer') return pick('footer', 'footer');
    if (el.querySelector('h1')) return pick('hero', 'has h1');
    if (isFirst) return pick('hero', 'first section');
    if (el.querySelectorAll('details').length >= 3) return pick('faq', 'details list');
    if (el.querySelector('form')) return pick('contact', 'has a form');
    if (numeric >= 3 && numeric * 4 >= text) return pick('stats', `${numeric} numbers`);
    if (images >= 3 && images * 2 >= text) return pick('gallery', `${images} images`);
    if (el.querySelectorAll('blockquote').length >= 2) return pick('testimonials', 'quotes');
    if (groups > 0) return pick('cards', 'look-alike siblings');
    if (el === lastMain && buttons > 0) return pick('cta', 'last with a button');
    return pick('about', 'default');
  });
}

function rootWrapper(doc: HTMLElement): HTMLElement | null {
  return doc.querySelector('.lz-page') ?? doc.querySelector('body');
}

/** Tags the preview/export HTML. With `withRuntime` the runtime is inlined (Pro previews). */
export function motionHtml(
  html: string,
  preset: MotionPreset,
  overrides: SectionOverrides,
  withRuntime: boolean,
  progress = false,
): { html: string; result: MotionResult } {
  const doc = parse(html, { comment: true });
  const sections = htmlSections(doc);
  const rows = classify(sections, overrides);
  if (preset === 'none') return { html, result: { rows, changed: 0 } };
  let changed = 0;
  rows.forEach((row, i) => {
    if (row.type === 'skip') return;
    const el = sections[i];
    if (
      el.getAttribute('data-lz-section') !== row.type ||
      (el.getAttribute('data-lz-pattern') ?? '') !== row.pattern
    )
      changed += 1;
    el.setAttribute('data-lz-section', row.type);
    if (row.pattern) el.setAttribute('data-lz-pattern', row.pattern);
    else el.removeAttribute('data-lz-pattern');
    if (
      preset === 'editorial' &&
      row.type === 'gallery' &&
      !el.hasAttribute('data-lz-lightbox')
    )
      el.setAttribute('data-lz-lightbox', '');
  });
  const root = rootWrapper(doc);
  root?.setAttribute('data-lz-motion', preset);
  if (progress) root?.setAttribute('data-lz-progress', '');
  else root?.removeAttribute('data-lz-progress');
  const tagged = doc.toString();
  return {
    html: withRuntime ? injectMotion(tagged) : tagged,
    result: { rows, changed },
  };
}

// ── GrapesJS component JSON ──────────────────────────────────────────────────

interface Component {
  tagName?: string;
  type?: string;
  classes?: (string | { name?: string })[];
  attributes?: Record<string, unknown>;
  components?: unknown;
}

function kids(c: Component): Component[] {
  return Array.isArray(c.components)
    ? (c.components.filter((k) => k && typeof k === 'object') as Component[])
    : [];
}

function hasClass(c: Component, name: string): boolean {
  return (c.classes ?? []).some(
    (k) => (typeof k === 'string' ? k : k.name) === name,
  );
}

function jsonSections(root: Component): Component[] {
  const slotted: Component[] = [];
  const visit = (c: Component): void => {
    if (c.attributes?.['data-lz-slot'] !== undefined) slotted.push(c);
    else kids(c).forEach(visit);
  };
  visit(root);
  if (slotted.length > 0) return slotted;
  const tops: Component[] = [];
  const visitTop = (c: Component): void => {
    if (['section', 'header', 'footer'].includes(c.tagName?.toLowerCase() ?? ''))
      tops.push(c);
    else kids(c).forEach(visitTop);
  };
  visitTop(root);
  return tops;
}

function jsonRoot(wrapper: Component): Component {
  const find = (c: Component): Component | null => {
    if (hasClass(c, 'lz-page')) return c;
    for (const k of kids(c)) {
      const hit = find(k);
      if (hit) return hit;
    }
    return null;
  };
  return find(wrapper) ?? wrapper;
}

/** Applies the HTML classification to the project's component tree, in place. */
export function motionProject(
  project: { pages?: unknown[] },
  preset: MotionPreset,
  rows: SectionRow[],
  progress = false,
): void {
  if (preset === 'none') return;
  const frames = (project.pages ?? []).flatMap(
    (page) =>
      ((page as { frames?: { component?: Component }[] }).frames ?? []).map(
        (f) => f.component,
      ),
  );
  for (const wrapper of frames) {
    if (!wrapper) continue;
    const sections = jsonSections(wrapper);
    if (sections.length !== rows.length) {
      throw new Error(
        `motion: the project has ${sections.length} section(s) but the HTML has ${rows.length}; they must match.`,
      );
    }
    sections.forEach((c, i) => {
      const type = rows[i].type;
      if (type === 'skip') return;
      const attrs: Record<string, unknown> = { 'data-lz-section': type };
      if (rows[i].pattern) attrs['data-lz-pattern'] = rows[i].pattern;
      else if (c.attributes) delete c.attributes['data-lz-pattern'];
      if (
        preset === 'editorial' &&
        type === 'gallery' &&
        c.attributes?.['data-lz-lightbox'] === undefined
      )
        attrs['data-lz-lightbox'] = '';
      c.attributes = { ...(c.attributes ?? {}), ...attrs };
    });
    const root = jsonRoot(wrapper);
    root.attributes = { ...(root.attributes ?? {}), 'data-lz-motion': preset };
    if (progress) root.attributes['data-lz-progress'] = '';
    else delete root.attributes['data-lz-progress'];
  }
}

export function classificationTable(id: string, rows: SectionRow[]): string {
  const head = ['#', 'block', 'type', 'pattern', 'why', 'reveal groups', 'nodes', 'text', 'media', 'lists', 'num', 'btn'];
  const body = rows.map((r) => [
    String(r.index),
    r.block,
    r.type,
    r.pattern || '–',
    r.reason,
    r.type === 'skip' ? '–' : String(r.revealGroups),
    String(r.nodes),
    String(r.text),
    String(r.media),
    String(r.groups),
    String(r.numeric),
    String(r.buttons),
  ]);
  const widths = head.map((h, c) =>
    Math.max(h.length, ...body.map((row) => row[c].length)),
  );
  const line = (cells: string[]) =>
    '    ' + cells.map((cell, c) => cell.padEnd(widths[c])).join('  ');
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {});
  return [
    `  ${id}: ${Object.entries(counts)
      .map(([t, n]) => `${t} ${n}`)
      .join(', ')}`,
    line(head),
    ...body.map(line),
  ].join('\n');
}
