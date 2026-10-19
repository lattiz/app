import { parseDocument } from '../../../../template-kit/src/lib/dom';
import type { NotMappable, PatternLayout, SectionPattern } from '../types';

export interface PatternResult {
  sections: SectionPattern[];
  notMappable: NotMappable[];
  imagesIgnored: number;
}

const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/);
const maxCols = (el: Element) =>
  Math.max(
    0,
    ...classes(el).map((c) => Number(/grid-cols-(\d+)$/.exec(c)?.[1] ?? 0)),
  );
const spanOf = (el: Element) =>
  Math.max(
    0,
    ...classes(el).map((c) => Number(/col-span-(\d+)$/.exec(c)?.[1] ?? 0)),
  );
const text = (el: Element | null | undefined) =>
  (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

/** The comment right before a node ("<!-- Hero Section -->"), a human label for the source. */
function labelBefore(el: Element): string | undefined {
  let n: Node | null = el.previousSibling;
  while (n && n.nodeType === 3 && !(n.textContent ?? '').trim())
    n = n.previousSibling;
  return n?.nodeType === 8 ? (n.textContent ?? '').trim() : undefined;
}

function gridOf(section: Element): Element | undefined {
  return [...section.querySelectorAll('*')].find(
    (el) => classes(el).includes('grid') && el.children.length >= 2,
  );
}

const QUOTE_START = /^["“«]/;
const STAT = /^\s*\d[\d.,]*\s*[+%kKMx]*\s*$/;

function surfaceOf(section: Element): SectionPattern['surface'] {
  const html = section.outerHTML;
  if (/glass|backdrop-blur/.test(html)) return 'glass';
  if (/\bbg-[\w-]+\/\d+/.test(classes(section).join(' '))) return 'tinted';
  if (/\bborder(-[btlr])?\b/.test(html)) return 'bordered';
  return 'flat';
}

function classify(section: Element, ref: string): SectionPattern | NotMappable {
  const tag = section.tagName.toLowerCase();
  for (const bad of ['iframe', 'video', 'canvas', 'audio', 'table'])
    if (section.querySelector(bad))
      return {
        ref,
        reason: `usa <${bad}>: el kit no lo admite en una sección`,
      };
  if (/swiper|carousel|slider/i.test(section.outerHTML))
    return {
      ref,
      reason: 'carrusel o slider: requiere JS, el kit no lo admite',
    };
  const grid = gridOf(section);
  const items = grid
    ? grid.children.length
    : section.querySelectorAll('li').length;
  const spans = new Set(
    grid ? [...grid.children].map(spanOf).filter(Boolean) : [],
  );
  const columns = Math.max(
    grid ? maxCols(grid) : 0,
    ...[...section.querySelectorAll('[class*="grid-cols-"]')].map(maxCols),
  );
  const hasImage = section.querySelector('img') !== null;
  const hasStat = [...section.querySelectorAll('*')].some(
    (el) => el.children.length === 0 && STAT.test(text(el)),
  );
  const hasQuote =
    section.querySelector('blockquote') !== null ||
    section.innerHTML.includes('format_quote') ||
    [...section.querySelectorAll('h2,h3,p')].some((e) =>
      QUOTE_START.test(text(e)),
    );
  const heading = text(section.querySelector('h1, h2'));
  const base = {
    ref,
    columns,
    items,
    hasImage,
    hasStat,
    hasQuote,
    surface: surfaceOf(section),
    ...(heading ? { heading: heading.slice(0, 80) } : {}),
    mappable: true as const,
  };
  const notes: string[] = [];
  if (section.querySelector('form'))
    notes.push(
      'form: el kit no tiene formularios; se vuelve botón de WhatsApp o correo',
    );
  const make = (slot: SectionPattern['slot'], layout: PatternLayout) => ({
    ...base,
    slot,
    layout,
    ...(notes.length ? { notes } : {}),
  });

  if (tag === 'footer')
    return make(
      'footer',
      section.querySelectorAll('a').length >= 3 ? 'link-columns' : 'list',
    );
  if (section.querySelector('h1')) {
    const split =
      hasImage &&
      (columns >= 2 || /md:flex-row|lg:flex-row/.test(section.outerHTML));
    return make('hero', split ? 'split' : 'centered');
  }
  if (items >= 3 && grid) {
    const varied = spans.size >= 2 && columns >= 6;
    return make('services', varied ? 'bento' : 'card-grid');
  }
  if (hasQuote && items <= 1 && !hasImage) return make('about', 'quote');
  if (hasStat && items >= 2) return make('about', 'stat-row');
  const buttons = section.querySelectorAll('a, button').length;
  if (heading && buttons >= 1 && section.querySelectorAll('p').length <= 3)
    return make(
      'cta',
      /bg-|glass|border/.test(section.outerHTML) ? 'band' : 'centered',
    );
  if (hasImage && columns >= 2) return make('about', 'split');
  return {
    ref,
    reason: 'no encaja en ningún rol del kit (hero, about, catálogo, cta, pie)',
  };
}

export function sectionPatterns(html: string): PatternResult {
  const doc = parseDocument(html).window.document;
  const imagesIgnored =
    doc.querySelectorAll('img').length +
    (html.match(/url\((?!['"]?data:)/g) ?? []).length;
  const roots = [
    ...doc.querySelectorAll('main > section, body > section'),
    ...doc.querySelectorAll('footer'),
  ];
  const sections: SectionPattern[] = [];
  const notMappable: NotMappable[] = [];
  roots.forEach((el, i) => {
    const ref =
      el.id || labelBefore(el) || `${el.tagName.toLowerCase()}-${i + 1}`;
    const r = classify(el, ref);
    if ('slot' in r) sections.push(r);
    else notMappable.push(r);
  });
  return { sections, notMappable, imagesIgnored };
}
