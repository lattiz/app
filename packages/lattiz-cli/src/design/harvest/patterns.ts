import { parseDocument } from '../../../../template-kit/src/lib/dom';
import type {
  ImageNeed,
  NotMappable,
  PatternLayout,
  SectionPattern,
} from '../types';

export interface PatternResult {
  sections: SectionPattern[];
  notMappable: NotMappable[];
  imagesIgnored: number;
  imageNeeds: ImageNeed[];
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
  // Skip whitespace and separator comments ("=====") to the first one that says something.
  while (
    n &&
    (n.nodeType === 3 ||
      (n.nodeType === 8 && /^[\s=\-*#_~]*$/.test(n.textContent ?? '')))
  )
    n = n.previousSibling;
  return n?.nodeType === 8 ? (n.textContent ?? '').trim() : undefined;
}

/** Real designs name their sections in the id or a comment (acerca, servicios, preguntas…). */
const HINTS: [SectionPattern['slot'] | 'contact', RegExp][] = [
  ['faq', /faq|pregunta|question|frecuent/i],
  ['testimonials', /testimon|opini[oó]n|rese[ñn]a|review/i],
  ['about', /about|acerca|nosotros|filosof|historia/i],
  ['services', /servic|tratamient|cat[aá]logo|precio|price|menu/i],
  ['contact', /contact|ubicaci[oó]n|location|visit/i],
];

const hintOf = (section: Element, ref: string) =>
  HINTS.find(([, re]) => re.test(`${section.id} ${ref}`))?.[0];

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
  if (/material-symbols|material-icons/.test(section.outerHTML))
    notes.push(
      'iconos de fuente (Material Symbols): el kit usa SVG en línea; se omiten',
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
    const bleed = [...section.querySelectorAll('img')].some((img) => {
      const own = `${img.getAttribute('class') ?? ''} ${img.parentElement?.getAttribute('class') ?? ''}`;
      return /\babsolute\b/.test(own) && /\binset-0\b/.test(own);
    });
    if (bleed && /bg-gradient|\bbg-[\w-]+\/\d+/.test(section.outerHTML))
      return make('hero', 'photo-overlay');
    const split =
      hasImage &&
      (columns >= 2 || /md:flex-row|lg:flex-row/.test(section.outerHTML));
    return make('hero', split ? 'split' : 'centered');
  }
  const hint = hintOf(section, ref);
  const ctaShaped =
    Boolean(heading) &&
    items < 3 &&
    section.querySelectorAll('a, button').length >= 1 &&
    section.querySelectorAll('p').length <= 3;
  // A short "contact" block with one action is the closing CTA; the data block is the kit's locations.
  if (hint === 'contact' && !ctaShaped)
    return {
      ref,
      reason:
        'contacto: el kit lo arma con locations/* y los datos del negocio, no desde el diseño',
    };
  if (hint === 'faq' || hint === 'testimonials')
    return make(hint, grid || columns >= 2 ? 'card-grid' : 'list');
  if (hint === 'about' && items >= 3 && grid)
    return {
      ref,
      reason: 'about con tarjetas: el kit no tiene una variante equivalente',
    };
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
      /text-center/.test(section.outerHTML) ? 'centered' : 'band',
    );
  if (hasImage && columns >= 2) return make('about', 'split');
  return {
    ref,
    reason: 'no encaja en ningún rol del kit (hero, about, catálogo, cta, pie)',
  };
}

/** What each photo has to be, from the markup's shape; never the picture or its URL. */
function imagesOf(section: Element, p: SectionPattern): ImageNeed[] {
  return [...section.querySelectorAll('img')].map((img) => {
    let ratio: number | undefined;
    for (
      let n: Element | null = img;
      n && n !== section.parentElement;
      n = n.parentElement
    ) {
      const m = /aspect-\[(\d+)\/(\d+)\]/.exec(n.getAttribute('class') ?? '');
      if (m) {
        ratio = Number(m[1]) / Number(m[2]);
        break;
      }
    }
    const cls = img.getAttribute('class') ?? '';
    return {
      ref: p.ref,
      slot: p.slot,
      orientation:
        ratio === undefined
          ? 'unspecified'
          : ratio < 0.95
            ? 'portrait'
            : ratio > 1.05
              ? 'landscape'
              : 'square',
      use:
        /\babsolute\b/.test(cls) && /\binset-0\b/.test(cls)
          ? 'background'
          : 'foreground',
    };
  });
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
  const imageNeeds: ImageNeed[] = [];
  roots.forEach((el, i) => {
    const ref =
      el.id || labelBefore(el) || `${el.tagName.toLowerCase()}-${i + 1}`;
    const r = classify(el, ref);
    if ('slot' in r) {
      sections.push(r);
      imageNeeds.push(...imagesOf(el, r));
    } else notMappable.push(r);
  });
  return { sections, notMappable, imagesIgnored, imageNeeds };
}
