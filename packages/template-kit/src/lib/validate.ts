import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import type { Root } from 'postcss';
import type { ColorToken, Manifest, Theme } from '../types';
import {
  composite,
  contrastRatio,
  findColorLiterals,
  type Rgba,
} from './color';
import { atRuleChain, isReducedMotionMedia, parseCss } from './css';
import { countedSlots, isTier, TIERS, type Role } from '../tiers';
import { parseDocument, parseFragment } from './dom';
import { KIT_ROOT } from './paths';
import { hueDistance } from './color';
import { fingerprint, similarity, type Fingerprint } from './similarity';
import { tokenColor } from './theme';

export type RuleId =
  | 'color-literal'
  | 'inline-style'
  | 'external-image'
  | 'slot-attrs'
  | 'utility-class'
  | 'script'
  | 'h1-count'
  | 'img-alt'
  | 'reduced-motion'
  | 'breakpoint'
  | 'radius-card'
  | 'contrast'
  | 'anchor'
  | 'project'
  | 'similarity'
  | 'tier-count'
  | 'required-role'
  | 'whatsapp'
  | 'form'
  | 'heading-order'
  | 'img-size'
  | 'empty-link'
  | 'head'
  | 'faq-details'
  | 'theme-ownership'
  | 'unique-theme'
  | 'unique-font-pair'
  | 'accent-hue'
  | 'unique-headline'
  | 'unique-hero';

export interface Finding {
  rule: RuleId;
  file: string;
  line?: number;
  message: string;
}

export interface ValidationSection {
  slot: string;
  variant: string;
  /** Role the blueprint resolved for this slot (absent in pre-tier snapshots). */
  role?: Role;
  htmlFile: string;
  cssFile: string;
  /** Fragment after content was applied. */
  rendered: string;
}

export interface ValidationTarget {
  manifest: Manifest;
  /** templates/<id>.ts, for findings about the section list; null for fixtures. */
  manifestFile: string | null;
  theme: Theme;
  themeFile: string;
  coreFile: string;
  sections: ValidationSection[];
  /** Final preview page (what the editor exports, CSS inlined). */
  previewHtml: string;
  previewFile: string;
  project: unknown;
  projectFile: string;
  /** Local image files available to the page, by name under assets/. */
  assetNames: Set<string>;
}

export interface ValidationReport {
  findings: Finding[];
  /** Scores against templates of the same vertical and tier, with that tier's limit. */
  similarity: { other: string; score: number }[];
  similarityLimit: number;
}

/** WhatsApp's brand green is the only literal allowed outside :root. */
export const COLOR_ALLOWLIST = new Set(['#25d366']);
export const ALLOWED_BREAKPOINTS = new Set([992, 480]);
export const MAX_CARD_RADIUS_PX = 32;

const rel = (file: string) => relative(KIT_ROOT, file) || file;

type Locate = (el: Element) => number | undefined;

const sourceDocs = new Map<string, ReturnType<typeof parseDocument>>();

/** Line in section.html of the source element a rendered one came from (same tag and class). */
function sourceLocator(htmlFile: string): Locate {
  if (!existsSync(htmlFile)) return () => undefined;
  let dom = sourceDocs.get(htmlFile);
  if (!dom) {
    dom = parseDocument(
      `<!DOCTYPE html><html><body>${readFileSync(htmlFile, 'utf8')}</body></html>`,
      true,
    );
    sourceDocs.set(htmlFile, dom);
  }
  const source = dom;
  return (el) => {
    const match = Array.from(
      source.window.document.body.querySelectorAll(el.localName),
    ).find((c) => c.getAttribute('class') === el.getAttribute('class'));
    return match ? source.nodeLocation(match)?.startLine : undefined;
  };
}

/** Line of `pattern` in the manifest source, so section-list findings point somewhere useful. */
function manifestRef(
  t: ValidationTarget,
  pattern: RegExp,
): { file: string; line?: number } {
  if (!t.manifestFile || !existsSync(t.manifestFile))
    return { file: t.manifest.id };
  const lines = readFileSync(t.manifestFile, 'utf8').split('\n');
  const index = lines.findIndex((l) => pattern.test(l));
  return {
    file: rel(t.manifestFile),
    ...(index >= 0 ? { line: index + 1 } : {}),
  };
}

// ── CSS sources ──────────────────────────────────────────────────────────────

function cssSources(t: ValidationTarget): { file: string; root: Root }[] {
  const files = [
    t.coreFile,
    ...new Set(t.sections.map((s) => s.cssFile)),
  ].filter((f) => existsSync(f));
  return files.map((file) => ({
    file,
    root: parseCss(readFileSync(file, 'utf8'), file),
  }));
}

function checkColorLiterals(file: string, root: Root, out: Finding[]): void {
  root.walkDecls((decl) => {
    const parent = decl.parent;
    if (
      parent?.type === 'rule' &&
      (parent as { selector: string }).selector.trim() === ':root'
    )
      return;
    for (const lit of findColorLiterals(decl.value)) {
      if (COLOR_ALLOWLIST.has(lit.toLowerCase())) continue;
      out.push({
        rule: 'color-literal',
        file: rel(file),
        line: decl.source?.start?.line,
        message: `${decl.prop}: ${lit} — use a --lz-color-* token (color-mix() for tints); only ${[...COLOR_ALLOWLIST].join(', ')} is allowed`,
      });
    }
  });
}

function checkBreakpoints(file: string, root: Root, out: Finding[]): void {
  root.walkAtRules('media', (at) => {
    for (const m of at.params.matchAll(
      /(min|max)-width\s*:\s*([\d.]+)(px|em|rem)?/gi,
    )) {
      const px = parseFloat(m[2]) * (m[3] && m[3] !== 'px' ? 16 : 1);
      if (!ALLOWED_BREAKPOINTS.has(px)) {
        out.push({
          rule: 'breakpoint',
          file: rel(file),
          line: at.source?.start?.line,
          message: `@media ${at.params} — only 992px and 480px are allowed`,
        });
      }
    }
  });
}

const MOTION_PROPS =
  /^(animation|animation-name|transition|transition-property)$/i;

/** Strips interaction pseudo-classes so `.a:hover` is covered by a guard on `.a`. */
function baseSelector(selector: string): string {
  return selector
    .replace(/:(hover|focus|focus-visible|focus-within|active)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkReducedMotion(
  sources: { file: string; root: Root }[],
  out: Finding[],
): void {
  const guarded = new Set<string>();
  let smoothGuarded = false;
  for (const { root } of sources) {
    root.walkRules((rule) => {
      if (!atRuleChain(rule).some(isReducedMotionMedia)) return;
      rule.walkDecls((d) => {
        if (MOTION_PROPS.test(d.prop) && /^none\b/.test(d.value))
          for (const s of rule.selectors) guarded.add(baseSelector(s));
        if (d.prop === 'scroll-behavior' && d.value === 'auto')
          smoothGuarded = true;
      });
    });
  }
  for (const { file, root } of sources) {
    root.walkDecls((decl) => {
      const parent = decl.parent;
      if (!parent || parent.type !== 'rule') return;
      const chain = atRuleChain(decl);
      if (
        chain.some(isReducedMotionMedia) ||
        chain.some((a) => /keyframes$/i.test(a.name))
      )
        return;
      const rule = parent as { selectors: string[] };
      const moves = MOTION_PROPS.test(decl.prop) && !/^none\b/.test(decl.value);
      if (moves) {
        for (const s of rule.selectors) {
          if (!guarded.has(baseSelector(s))) {
            out.push({
              rule: 'reduced-motion',
              file: rel(file),
              line: decl.source?.start?.line,
              message: `${s} { ${decl.prop} } has no @media (prefers-reduced-motion: reduce) override setting it to none`,
            });
          }
        }
      }
      if (
        decl.prop === 'scroll-behavior' &&
        decl.value === 'smooth' &&
        !smoothGuarded
      ) {
        out.push({
          rule: 'reduced-motion',
          file: rel(file),
          line: decl.source?.start?.line,
          message:
            'scroll-behavior: smooth needs a reduced-motion override to auto',
        });
      }
    });
  }
}

// ── HTML ─────────────────────────────────────────────────────────────────────

const TAILWIND_RE =
  /^(?:[a-z]+:)+|^-?(?:m|p)[trblxy]?-\d|^(?:flex|grid|block|inline|hidden|container|relative|absolute|fixed|sticky)$|^(?:w|h|min-w|max-w|min-h|max-h|gap|space-[xy]|text|bg|border|rounded|shadow|font|leading|tracking|z|top|left|right|bottom|inset|col-span|grid-cols|items|justify|opacity)-/;
const CLASS_RE =
  /^lz-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
const SVG_COLOR_ATTRS = [
  'fill',
  'stroke',
  'stop-color',
  'flood-color',
  'lighting-color',
  'color',
];

function describe(el: Element): string {
  const cls = el.getAttribute('class');
  return `<${el.localName}${cls ? ` class="${cls}"` : ''}>`;
}

function isLocalAsset(src: string): boolean {
  return /^assets\/[\w.-]+$/.test(src);
}

function hasAccessibleName(a: Element): boolean {
  if ((a.getAttribute('aria-label') ?? '').trim() !== '') return true;
  if ((a.textContent ?? '').trim() !== '') return true;
  return Array.from(a.querySelectorAll('img')).some(
    (img) => (img.getAttribute('alt') ?? '').trim() !== '',
  );
}

function checkMarkup(
  scope: ParentNode,
  file: string,
  out: Finding[],
  assets: Set<string>,
  locate: Locate,
): void {
  for (const el of Array.from(scope.querySelectorAll('*'))) {
    const line = locate(el);
    const at = line === undefined ? { file } : { file, line };
    if (el.localName === 'form')
      out.push({
        rule: 'form',
        ...at,
        message:
          '<form> is not allowed: contact is buttons only (WhatsApp, tel:, mailto:, map)',
      });
    if (el.localName === 'a') {
      const href = (el.getAttribute('href') ?? '').trim();
      if (href === '' || href === '#')
        out.push({
          rule: 'empty-link',
          ...at,
          message: `${describe(el)} has ${href === '' ? 'no href' : 'href="#"'} — link somewhere real or drop it`,
        });
      if (!hasAccessibleName(el))
        out.push({
          rule: 'empty-link',
          ...at,
          message: `${describe(el)} has no text, aria-label or img alt — screen readers announce nothing`,
        });
    }
    if (el.hasAttribute('style'))
      out.push({
        rule: 'inline-style',
        ...at,
        message: `${describe(el)} has style="" — move it to the section's CSS`,
      });
    if (el.localName === 'script')
      out.push({
        rule: 'script',
        ...at,
        message:
          '<script> is not allowed in sections (published sites run no template JS)',
      });
    for (const attr of Array.from(el.attributes)) {
      if (/^on/i.test(attr.name))
        out.push({
          rule: 'script',
          ...at,
          message: `${describe(el)} has inline handler ${attr.name}`,
        });
      if (/^\s*javascript:/i.test(attr.value))
        out.push({
          rule: 'script',
          ...at,
          message: `${describe(el)} ${attr.name} uses javascript:`,
        });
      if (
        SVG_COLOR_ATTRS.includes(attr.name) &&
        el.namespaceURI === 'http://www.w3.org/2000/svg'
      ) {
        for (const lit of findColorLiterals(attr.value)) {
          if (!COLOR_ALLOWLIST.has(lit.toLowerCase()))
            out.push({
              rule: 'color-literal',
              ...at,
              message: `${describe(el)} ${attr.name}="${attr.value}" — use currentColor`,
            });
        }
      }
    }
    if (el.namespaceURI === 'http://www.w3.org/1999/xhtml') {
      for (const cls of Array.from(el.classList)) {
        if (TAILWIND_RE.test(cls))
          out.push({
            rule: 'utility-class',
            ...at,
            message: `"${cls}" looks like a Tailwind utility — write lz-* BEM classes in section.css`,
          });
        else if (!CLASS_RE.test(cls))
          out.push({
            rule: 'utility-class',
            ...at,
            message: `"${cls}" is not an lz-* BEM class (lz-block__element--modifier)`,
          });
      }
    }
    const refs: [string, string][] = [];
    if (el.localName === 'img') {
      refs.push(['src', el.getAttribute('src') ?? '']);
      const sized = ['width', 'height'].every((a) =>
        /^\d+$/.test(el.getAttribute(a) ?? ''),
      );
      if (!sized)
        out.push({
          rule: 'img-size',
          ...at,
          message: `${describe(el)} needs numeric width and height attributes (reserves the aspect ratio, no layout shift)`,
        });
      const alt = el.getAttribute('alt');
      if (
        (alt === null || alt.trim() === '') &&
        el.getAttribute('aria-hidden') !== 'true'
      ) {
        out.push({
          rule: 'img-alt',
          ...at,
          message: `${describe(el)} needs a descriptive alt`,
        });
      }
    }
    if (el.hasAttribute('srcset'))
      refs.push(['srcset', el.getAttribute('srcset') ?? '']);
    if (el.localName === 'video' && el.hasAttribute('poster'))
      refs.push(['poster', el.getAttribute('poster') ?? '']);
    for (const [attr, value] of refs) {
      for (const src of value
        .split(',')
        .map((p) => p.trim().split(/\s+/)[0])
        .filter(Boolean)) {
        if (!isLocalAsset(src))
          out.push({
            rule: 'external-image',
            ...at,
            message: `${describe(el)} ${attr}="${src}" — images must be local files under assets/<vertical>/ (the seed uploads them to R2)`,
          });
        else if (!assets.has(src.slice('assets/'.length)))
          out.push({
            rule: 'external-image',
            ...at,
            message: `${describe(el)} ${attr}="${src}" does not exist`,
          });
      }
    }
  }
}

function checkSectionRoot(
  s: ValidationSection,
  root: Element | null,
  out: Finding[],
): void {
  const file = rel(s.htmlFile);
  if (!root) {
    out.push({
      rule: 'slot-attrs',
      file,
      message: 'section fragment is empty',
    });
    return;
  }
  const slot = root.getAttribute('data-lz-slot');
  const variant = root.getAttribute('data-lz-variant');
  if (!slot || !variant)
    out.push({
      rule: 'slot-attrs',
      file,
      message: `${describe(root)} needs data-lz-slot and data-lz-variant`,
    });
  else if (slot !== s.slot || variant !== s.variant)
    out.push({
      rule: 'slot-attrs',
      file,
      message: `root says ${slot}/${variant}, folder is ${s.slot}/${s.variant}`,
    });
}

function checkPage(t: ValidationTarget, out: Finding[]): void {
  const file = rel(t.previewFile);
  const dom = parseDocument(t.previewHtml, true);
  const doc = dom.window.document;
  const headLine = dom.nodeLocation(doc.head)?.startLine;
  const head = (message: string) =>
    out.push({
      rule: 'head',
      file,
      ...(headLine ? { line: headLine } : {}),
      message,
    });
  if (!(doc.documentElement.getAttribute('lang') ?? '').trim())
    head('<html> needs lang (the content pack locale, e.g. es-MX)');
  if (!(doc.querySelector('head > title')?.textContent ?? '').trim())
    head('<head> needs a <title> placeholder (the publisher replaces it)');
  if (
    !(
      doc
        .querySelector('head > meta[name="description"]')
        ?.getAttribute('content') ?? ''
    ).trim()
  )
    head('<head> needs a <meta name="description"> placeholder');
  const h1 = doc.querySelectorAll('h1').length;
  if (h1 !== 1)
    out.push({
      rule: 'h1-count',
      file,
      message: `the page has ${h1} <h1>; it needs exactly one (the hero title)`,
    });
  const roots = [
    ...Array.from(doc.querySelectorAll('.lz-page > header, .lz-page > footer')),
    ...Array.from(doc.querySelectorAll('main > *')),
  ];
  for (const el of roots) {
    if (
      !el.getAttribute('data-lz-slot') ||
      !el.getAttribute('data-lz-variant')
    ) {
      out.push({
        rule: 'slot-attrs',
        file,
        message: `${describe(el)} is a page-level block without data-lz-slot/data-lz-variant`,
      });
    }
  }
  for (const a of Array.from(doc.querySelectorAll('a[href^="#"]'))) {
    const id = decodeURIComponent((a.getAttribute('href') ?? '').slice(1));
    if (id && !doc.getElementById(id))
      out.push({
        rule: 'anchor',
        file,
        message: `${describe(a)} links to #${id}, which no section on this page has`,
      });
  }
  const css = Array.from(doc.querySelectorAll('style'))
    .map((s) => s.textContent ?? '')
    .join('\n');
  parseCss(css).walkRules((rule) => {
    if (/(^|[\s,>+~])#[\w-]+/.test(rule.selector)) {
      out.push({
        rule: 'inline-style',
        file,
        message: `CSS rule "${rule.selector}" targets an id — GrapesJS turns style="" into these; use classes`,
      });
    }
  });
}

function checkProject(t: ValidationTarget, out: Finding[]): void {
  const file = rel(t.projectFile);
  const json = JSON.stringify(t.project);
  const p = t.project as {
    custom?: { projectType?: string };
    pages?: unknown[];
  };
  if (p.custom?.projectType !== 'web')
    out.push({
      rule: 'project',
      file,
      message: 'custom.projectType must be "web"',
    });
  if (!Array.isArray(p.pages) || p.pages.length !== 1)
    out.push({
      rule: 'project',
      file,
      message: 'the project must have exactly one page',
    });
  if (/gjs-t-|"globalStyles"|"data-variable"/.test(json))
    out.push({
      rule: 'project',
      file,
      message:
        'Studio global styles (.gjs-t-*, globalStyles, data-variable) must not be emitted; --lz-* tokens are the only token system',
    });
}

// ── Theme ────────────────────────────────────────────────────────────────────

const CONTRAST_PAIRS: [ColorToken, ColorToken, number, string][] = [
  ['text', 'bg', 4.5, 'body text'],
  ['text', 'surface', 4.5, 'text on cards'],
  ['text', 'surface-2', 4.5, 'text on secondary surfaces'],
  ['muted', 'bg', 4.5, 'muted text'],
  ['muted', 'surface', 4.5, 'muted text on cards'],
  ['on-accent', 'accent', 4.5, 'button labels'],
  ['on-overlay', 'overlay', 4.5, 'hero text on the image overlay'],
  ['text', 'navbar-bg', 4.5, 'navbar links'],
];

/** Accent words are either colored text or accent-text on an accent marker. */
const ACCENT_PAIRS: Record<
  Theme['accentWords'],
  [ColorToken, ColorToken, number, string][]
> = {
  color: [
    ['accent-text', 'bg', 3, 'accent display words / hover links'],
    ['accent-text', 'surface', 3, 'accent on cards'],
    ['accent-text', 'overlay', 3, 'accent words in the image hero'],
  ],
  highlight: [['accent-text', 'accent', 4.5, 'highlighted accent words']],
};

function cardRadiusPx(value: string): number | null {
  const m = /^([\d.]+)(px|rem|em)?$/.exec(value.trim());
  if (!m) return null;
  return parseFloat(m[1]) * (m[2] && m[2] !== 'px' ? 16 : 1);
}

export function checkTheme(theme: Theme, file: string): Finding[] {
  const out: Finding[] = [];
  const radius = cardRadiusPx(theme.shape.radiusCard);
  if (radius === null || radius > MAX_CARD_RADIUS_PX) {
    out.push({
      rule: 'radius-card',
      file,
      message: `shape.radiusCard "${theme.shape.radiusCard}" must be a length ≤ ${MAX_CARD_RADIUS_PX}px (cards stay near-square; pills use radiusPill)`,
    });
  }
  const bg = tokenColor(theme, 'bg');
  for (const [fgToken, bgToken, min, use] of [
    ...CONTRAST_PAIRS,
    ...ACCENT_PAIRS[theme.accentWords],
  ]) {
    const fg = tokenColor(theme, fgToken);
    let back: Rgba | null = tokenColor(theme, bgToken);
    if (!fg || !back || !bg) {
      out.push({
        rule: 'contrast',
        file,
        message: `cannot parse colors.${!fg ? fgToken : !back ? bgToken : 'bg'}`,
      });
      continue;
    }
    // Translucent surfaces sit on the page background.
    if (back.a < 1)
      back = composite(
        back,
        bg.a < 1 ? composite(bg, { r: 255, g: 255, b: 255, a: 1 }) : bg,
      );
    const ratio = contrastRatio(fg, back);
    if (ratio < min)
      out.push({
        rule: 'contrast',
        file,
        message: `${fgToken} on ${bgToken} is ${ratio.toFixed(2)}:1, needs ${min}:1 (${use})`,
      });
  }
  return out;
}

// ── Tier, roles and page structure ──────────────────────────────────────────

function checkTier(t: ValidationTarget, out: Finding[]): void {
  const ref = manifestRef(t, /^\s*sections:/);
  const tierName = t.manifest.tier;
  if (!isTier(tierName)) {
    out.push({
      rule: 'required-role',
      ...manifestRef(t, /^\s*tier:/),
      message: `manifest.tier "${String(tierName)}" is not basic|pro`,
    });
    return;
  }
  if (t.theme.tier !== tierName)
    out.push({
      rule: 'theme-ownership',
      ...manifestRef(t, /^\s*theme:/),
      message: `theme "${t.theme.name}" belongs to ${t.theme.tier} templates; a ${tierName} template must use a ${tierName} theme (Pro themes are the Pro templates' identity)`,
    });
  const tier = TIERS[tierName];
  const counted = countedSlots(t.sections.map((s) => s.slot));
  if (counted.length < tier.countedMin || counted.length > tier.countedMax)
    out.push({
      rule: 'tier-count',
      ...ref,
      message: `${counted.length} counted sections (${counted.join(', ')}); ${tierName} needs ${tier.countedMin}–${tier.countedMax} (floating-whatsapp and marquee don't count)`,
    });
  const present = new Set(t.sections.map((s) => s.role));
  for (const role of tier.requiredRoles) {
    // The dedicated whatsapp rule reports a missing floating button.
    if (role === 'whatsapp' || present.has(role)) continue;
    out.push({
      rule: 'required-role',
      ...ref,
      message: `${tierName} requires role "${role}" (see blueprints/${t.manifest.family}.${tierName}.ts for the slot that fills it)`,
    });
  }
}

const WHATSAPP_LINK = 'a[href^="https://wa.me/"]';

function checkWhatsapp(t: ValidationTarget, out: Finding[]): void {
  const s = t.sections.find((x) => x.slot === 'floating-whatsapp');
  if (!s) {
    out.push({
      rule: 'whatsapp',
      ...manifestRef(t, /^\s*sections:/),
      message:
        'floating-whatsapp is mandatory in every tier (last slot of <main>)',
    });
    return;
  }
  const root = parseFragment(s.rendered).firstElementChild;
  if (root && !root.querySelector(WHATSAPP_LINK)) {
    const line = sourceLocator(s.htmlFile)(root.querySelector('a') ?? root);
    out.push({
      rule: 'whatsapp',
      file: rel(s.htmlFile),
      ...(line ? { line } : {}),
      message:
        'floating-whatsapp must link to {{whatsappUrl}} / {{whatsappUrl:mensaje}} (https://wa.me/…)',
    });
  }
}

/** Headings in page order may go down any number of levels but up only one at a time. */
function checkHeadingOrder(t: ValidationTarget, out: Finding[]): void {
  let previous = 0;
  for (const s of t.sections) {
    const locate = sourceLocator(s.htmlFile);
    for (const h of Array.from(
      parseFragment(s.rendered).querySelectorAll('h1, h2, h3, h4, h5, h6'),
    )) {
      const level = Number(h.localName[1]);
      if (level > previous + 1) {
        const line = locate(h);
        out.push({
          rule: 'heading-order',
          file: rel(s.htmlFile),
          ...(line ? { line } : {}),
          message: `${describe(h)} jumps from ${previous ? `h${previous}` : 'the top of the page'} to h${level}; don't skip heading levels`,
        });
      }
      previous = level;
    }
  }
}

function checkFaq(t: ValidationTarget, out: Finding[]): void {
  for (const s of t.sections.filter((x) => x.slot === 'faq')) {
    const root = parseFragment(s.rendered);
    const items = Array.from(root.querySelectorAll('details'));
    const locate = sourceLocator(s.htmlFile);
    if (items.length === 0 || items.some((d) => !d.querySelector('summary'))) {
      const first = root.firstElementChild;
      const line = first ? locate(first) : undefined;
      out.push({
        rule: 'faq-details',
        file: rel(s.htmlFile),
        ...(line ? { line } : {}),
        message:
          'FAQ items must be native <details open><summary>question</summary>answer</details> (no JS; the publisher extracts FAQPage from them)',
      });
      continue;
    }
    const closed = items.find((d) => !d.hasAttribute('open'));
    if (closed) {
      const line = locate(closed);
      out.push({
        rule: 'faq-details',
        file: rel(s.htmlFile),
        ...(line ? { line } : {}),
        message:
          '<details> must carry `open`: the editor canvas never toggles it, so a closed answer cannot be edited',
      });
    }
  }
}

// ── Uniqueness within a vertical ────────────────────────────────────────────

export const MIN_ACCENT_HUE_DISTANCE = 30;

/** The hero's <h1> markup as rendered, for the unique-headline rule. */
export function renderedHeadline(t: ValidationTarget): string {
  const hero = t.sections.find((s) => s.slot === 'hero');
  return hero
    ? (parseFragment(hero.rendered).querySelector('h1')?.innerHTML ?? '')
    : '';
}

/** Hard rules that keep two templates of one vertical from looking or reading the same. */
function checkUniqueness(
  t: ValidationTarget,
  mine: Fingerprint,
  others: Fingerprint[],
  out: Finding[],
): void {
  const peers = others.filter(
    (o) => o.id !== mine.id && o.vertical === mine.vertical,
  );
  const at = (pattern: RegExp) => manifestRef(t, pattern);
  for (const o of peers) {
    if (o.theme === mine.theme)
      out.push({
        rule: 'unique-theme',
        ...at(/^\s*theme:/),
        message: `theme "${mine.theme}" is already ${o.id}'s; every ${mine.vertical} template needs its own theme`,
      });
    if (o.fonts === mine.fonts)
      out.push({
        rule: 'unique-font-pair',
        ...at(/^\s*theme:/),
        message: `font pair "${mine.fonts}" is already ${o.id}'s; pick another display/body pair in the theme`,
      });
    if (
      mine.accentHue !== null &&
      o.accentHue !== null &&
      hueDistance(mine.accentHue, o.accentHue) < MIN_ACCENT_HUE_DISTANCE
    )
      out.push({
        rule: 'accent-hue',
        ...at(/^\s*theme:/),
        message: `accent hue ${Math.round(mine.accentHue)}° is ${Math.round(hueDistance(mine.accentHue, o.accentHue))}° from ${o.id} (${Math.round(o.accentHue)}°); keep ≥ ${MIN_ACCENT_HUE_DISTANCE}°`,
      });
    if (mine.headline !== '' && o.headline === mine.headline)
      out.push({
        rule: 'unique-headline',
        ...at(/slot: 'hero'/),
        message: `hero headline "${mine.headline}" is ${o.id}'s too; write this template's own`,
      });
    if (mine.tier === 'pro' && o.tier === 'pro' && o.hero === mine.hero)
      out.push({
        rule: 'unique-hero',
        ...at(/slot: 'hero'/),
        message: `hero/${mine.hero} is already ${o.id}'s; each Pro template needs its own hero variant`,
      });
  }
}

// ── Entry point ──────────────────────────────────────────────────────────────

export function validateTarget(
  t: ValidationTarget,
  others: Fingerprint[],
): ValidationReport {
  const findings: Finding[] = [];
  const sources = cssSources(t);
  for (const { file, root } of sources) {
    checkColorLiterals(file, root, findings);
    checkBreakpoints(file, root, findings);
  }
  checkReducedMotion(sources, findings);
  for (const s of t.sections) {
    const source = existsSync(s.htmlFile)
      ? parseFragment(readFileSync(s.htmlFile, 'utf8'))
      : null;
    checkSectionRoot(s, source?.firstElementChild ?? null, findings);
    const rendered = parseFragment(s.rendered);
    checkMarkup(
      rendered,
      rel(s.htmlFile),
      findings,
      t.assetNames,
      sourceLocator(s.htmlFile),
    );
  }
  checkPage(t, findings);
  checkTier(t, findings);
  checkWhatsapp(t, findings);
  checkHeadingOrder(t, findings);
  checkFaq(t, findings);
  checkProject(t, findings);
  findings.push(...checkTheme(t.theme, rel(t.themeFile)));

  const mine = fingerprint(t.manifest, t.theme, renderedHeadline(t));
  checkUniqueness(t, mine, others, findings);
  const limit = TIERS[mine.tier].similarityLimit;
  const scores = others
    .filter(
      (o) =>
        o.id !== mine.id &&
        o.vertical === mine.vertical &&
        o.tier === mine.tier,
    )
    .map((o) => ({ other: o.id, score: similarity(mine, o).score }));
  for (const s of scores) {
    if (s.score > limit) {
      findings.push({
        rule: 'similarity',
        file: t.manifest.id,
        message: `similarity with ${s.other} is ${s.score} (> ${limit} for ${mine.tier}): change hero/services variants, other sections, theme, font pair or shape`,
      });
    }
  }
  return {
    findings: dedupe(findings),
    similarity: scores,
    similarityLimit: limit,
  };
}

function dedupe(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.rule}|${f.file}|${f.line ?? ''}|${f.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function themeFileFor(theme: Theme): string {
  return resolve(KIT_ROOT, 'themes', `${theme.name}.json`);
}
