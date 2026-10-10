import postcss, { type Root } from 'postcss';
import type { ProjectData } from 'grapesjs';
import { COLOR_TOKENS, type Region, type Theme } from '../types';
import { findColorLiterals } from './color';
import { parseCss, styleRules } from './css';
import { parseDocument } from './dom';
import { formatCss, formatHtml } from './format';
import { renderProject } from './grapes';
import { splitCss } from './ownership';
import { sliceSlots } from './slice';

/** GrapesJS prepends its protected CSS to every export; the library's core.css owns those resets. */
const PROTECTED_CSS_RE =
  /^\s*\*\s*\{\s*box-sizing:\s*border-box;\s*\}\s*body\s*\{\s*margin:\s*0;\s*\}/;
/** Studio global-style classes: the editor never enables that panel, so `--lz-*` tokens replace them. */
const STUDIO_CLASS_RE = /^gjs-t-/;

export interface ExtractInput {
  html: string;
  css: string;
  /** Used when a slot has no `data-lz-variant`. */
  fallbackVariant: string;
}

export interface ExtractedSection {
  slot: string;
  variant: string;
  region: Region;
  label: string;
  html: string;
  css: string;
  meta: string;
  literals: string[];
}

export interface ExtractResult {
  sections: ExtractedSection[];
  core: string;
  coreLiterals: string[];
  themeDraft: Theme;
}

const LABELS: Record<string, string> = {
  navbar: 'Barra de navegación',
  hero: 'Portada',
  marquee: 'Cinta de especialidades',
  about: 'Nosotros',
  services: 'Servicios y precios',
  locations: 'Sucursales',
  team: 'Equipo',
  testimonials: 'Reseñas',
  'floating-whatsapp': 'Botón flotante de WhatsApp',
  footer: 'Pie de página',
};

function stripStudioClasses(doc: Document): void {
  for (const el of Array.from(doc.querySelectorAll('[class]'))) {
    for (const c of Array.from(el.classList))
      if (STUDIO_CLASS_RE.test(c)) el.classList.remove(c);
    if (el.classList.length === 0) el.removeAttribute('class');
  }
  doc.body.classList.remove(
    ...Array.from(doc.body.classList).filter((c) => STUDIO_CLASS_RE.test(c)),
  );
}

/** Removes `.gjs-t-*` rules and pulls the `:root` declarations out (themes own them now). */
function takeRoot(root: Root): Map<string, string> {
  const vars = new Map<string, string>();
  root.walkRules((rule) => {
    if (rule.selector.trim() === ':root') {
      rule.walkDecls((d) => {
        if (d.prop.startsWith('--lz-')) vars.set(d.prop, d.value);
      });
      rule.remove();
      return;
    }
    const selectors = rule.selectors.filter((s) => !/\.gjs-t-[\w-]+/.test(s));
    if (selectors.length === 0) rule.remove();
    else rule.selectors = selectors;
  });
  root.walkAtRules((at) => {
    if (at.nodes && at.nodes.length === 0) at.remove();
  });
  return vars;
}

function themeDraft(
  vars: Map<string, string>,
  fontsQuery: string,
  name: string,
): Theme {
  const v = (key: string) => vars.get(key) ?? 'TODO';
  const colors = Object.fromEntries(
    COLOR_TOKENS.map((t) => [t, v(`--lz-color-${t}`)]),
  ) as Theme['colors'];
  return {
    name,
    label: name,
    colors,
    tier: 'basic',
    fontPair: 'TODO',
    fonts: {
      display: v('--lz-font-display'),
      serif: v('--lz-font-serif'),
      body: v('--lz-font-body'),
      googleFonts: fontsQuery || 'TODO',
      displayTransform: 'uppercase',
      displayLeading: '0.9',
      displayWeight: '700',
      accentStyle: 'italic',
      accentTransform: 'lowercase',
    },
    shape: {
      radiusCard: vars.get('--lz-radius-card') ?? v('--lz-radius'),
      radiusPill: vars.get('--lz-radius-pill') ?? v('--lz-radius'),
      border: '1px',
      shadow: 'none',
    },
    density: 'regular',
    photoTreatment: 'none',
    accentWords: 'color',
    container: v('--lz-container'),
    effects: { mapFilter: 'none', heroImageFilter: 'none' },
  };
}

function literalsIn(root: Root): string[] {
  const out: string[] = [];
  for (const rule of styleRules(root)) {
    rule.walkDecls((d) => {
      for (const lit of findColorLiterals(d.value))
        out.push(`${rule.selector} { ${d.prop}: ${lit} }`);
    });
  }
  return out;
}

function metaSource(
  slot: string,
  variant: string,
  region: Region,
  numbered: boolean,
): string {
  return `import type { SectionMeta } from '../../../src/types';

export default {
  slot: '${slot}',
  variant: '${variant}',
  label: '${LABELS[slot] ?? slot}',
  region: '${region}',
  description: 'TODO: what this variant looks like and when to use it.',${numbered ? '\n  numbered: true,' : ''}
  contentKeys: [],
} satisfies SectionMeta;
`;
}

export function extractFromHtml(input: ExtractInput): ExtractResult {
  const doc = parseDocument(input.html).window.document;
  stripStudioClasses(doc);
  const fontsHref =
    Array.from(
      doc.querySelectorAll('link[href*="fonts.googleapis.com/css2"]'),
    )[0]?.getAttribute('href') ?? '';
  const fontsQuery = fontsHref
    .replace(/^.*?css2\?/, '')
    .split('&')
    .filter((p) => p && p !== 'display=swap')
    .join('&');

  const slices = sliceSlots(doc);
  const css = parseCss(input.css.replace(PROTECTED_CSS_RE, ''));
  const vars = takeRoot(css);
  const split = splitCss(css, new Map(slices.map((s) => [s.slot, s.classes])));

  const sections = slices.map((s) => {
    const variant = s.variant ?? input.fallbackVariant;
    if (!s.variant) s.element.setAttribute('data-lz-variant', variant);
    const sheet = split.slots.get(s.slot) ?? postcss.root();
    return {
      slot: s.slot,
      variant,
      region: s.region,
      label: LABELS[s.slot] ?? s.slot,
      html: `${formatHtml(s.element)}\n`,
      css: sheet.nodes.length > 0 ? formatCss(sheet) : '',
      meta: metaSource(
        s.slot,
        variant,
        s.region,
        s.element.querySelector('.lz-index') !== null,
      ),
      literals: literalsIn(sheet),
    };
  });

  return {
    sections,
    core: formatCss(split.core),
    coreLiterals: literalsIn(split.core),
    themeDraft: themeDraft(
      vars,
      fontsQuery,
      `${input.fallbackVariant}-extracted`,
    ),
  };
}

export async function extractFromProject(
  project: ProjectData,
  fallbackVariant: string,
): Promise<ExtractResult> {
  const { html, css } = await renderProject(project);
  return extractFromHtml({ html, css, fallbackVariant });
}
