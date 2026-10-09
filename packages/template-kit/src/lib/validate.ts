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
import { parseDocument, parseFragment } from './dom';
import { KIT_ROOT } from './paths';
import {
  SIMILARITY_LIMIT,
  fingerprint,
  similarity,
  type Fingerprint,
} from './similarity';
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
  | 'similarity';

export interface Finding {
  rule: RuleId;
  file: string;
  line?: number;
  message: string;
}

export interface ValidationSection {
  slot: string;
  variant: string;
  htmlFile: string;
  cssFile: string;
  /** Fragment after content was applied. */
  rendered: string;
}

export interface ValidationTarget {
  manifest: Manifest;
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
  similarity: { other: string; score: number }[];
}

/** WhatsApp's brand green is the only literal allowed outside :root. */
export const COLOR_ALLOWLIST = new Set(['#25d366']);
export const ALLOWED_BREAKPOINTS = new Set([992, 480]);
export const MAX_CARD_RADIUS_PX = 32;

const rel = (file: string) => relative(KIT_ROOT, file) || file;

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

function checkMarkup(
  scope: ParentNode,
  file: string,
  out: Finding[],
  assets: Set<string>,
): void {
  for (const el of Array.from(scope.querySelectorAll('*'))) {
    if (el.hasAttribute('style'))
      out.push({
        rule: 'inline-style',
        file,
        message: `${describe(el)} has style="" — move it to the section's CSS`,
      });
    if (el.localName === 'script')
      out.push({
        rule: 'script',
        file,
        message:
          '<script> is not allowed in sections (published sites run no template JS)',
      });
    for (const attr of Array.from(el.attributes)) {
      if (/^on/i.test(attr.name))
        out.push({
          rule: 'script',
          file,
          message: `${describe(el)} has inline handler ${attr.name}`,
        });
      if (/^\s*javascript:/i.test(attr.value))
        out.push({
          rule: 'script',
          file,
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
              file,
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
            file,
            message: `"${cls}" looks like a Tailwind utility — write lz-* BEM classes in section.css`,
          });
        else if (!CLASS_RE.test(cls))
          out.push({
            rule: 'utility-class',
            file,
            message: `"${cls}" is not an lz-* BEM class (lz-block__element--modifier)`,
          });
      }
    }
    const refs: [string, string][] = [];
    if (el.localName === 'img') {
      refs.push(['src', el.getAttribute('src') ?? '']);
      const alt = el.getAttribute('alt');
      if (
        (alt === null || alt.trim() === '') &&
        el.getAttribute('aria-hidden') !== 'true'
      ) {
        out.push({
          rule: 'img-alt',
          file,
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
            file,
            message: `${describe(el)} ${attr}="${src}" — images must be local files under assets/<vertical>/ (the seed uploads them to R2)`,
          });
        else if (!assets.has(src.slice('assets/'.length)))
          out.push({
            rule: 'external-image',
            file,
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
  const doc = parseDocument(t.previewHtml).window.document;
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
  ['accent', 'bg', 3, 'accent display words / hover links'],
  ['accent', 'surface', 3, 'accent on cards'],
  ['on-overlay', 'overlay', 4.5, 'hero text on the image overlay'],
  ['accent', 'overlay', 3, 'accent words in the hero'],
  ['text', 'navbar-bg', 4.5, 'navbar links'],
];

function cardRadiusPx(value: string): number | null {
  const m = /^([\d.]+)(px|rem|em)?$/.exec(value.trim());
  if (!m) return null;
  return parseFloat(m[1]) * (m[2] && m[2] !== 'px' ? 16 : 1);
}

export function checkTheme(theme: Theme, file: string): Finding[] {
  const out: Finding[] = [];
  const radius = cardRadiusPx(theme.radius.card);
  if (radius === null || radius > MAX_CARD_RADIUS_PX) {
    out.push({
      rule: 'radius-card',
      file,
      message: `radius.card "${theme.radius.card}" must be a length ≤ ${MAX_CARD_RADIUS_PX}px (cards stay near-square; pills use radius.pill)`,
    });
  }
  const bg = tokenColor(theme, 'bg');
  for (const [fgToken, bgToken, min, use] of CONTRAST_PAIRS) {
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
    checkMarkup(rendered, rel(s.htmlFile), findings, t.assetNames);
  }
  checkPage(t, findings);
  checkProject(t, findings);
  findings.push(...checkTheme(t.theme, rel(t.themeFile)));

  const mine = fingerprint(t.manifest, t.theme);
  const scores = others
    .filter((o) => o.id !== mine.id && o.vertical === mine.vertical)
    .map((o) => ({ other: o.id, score: similarity(mine, o).score }));
  for (const s of scores) {
    if (s.score > SIMILARITY_LIMIT) {
      findings.push({
        rule: 'similarity',
        file: t.manifest.id,
        message: `similarity with ${s.other} is ${s.score} (> ${SIMILARITY_LIMIT}): change sections/variants, theme or font pair`,
      });
    }
  }
  return { findings: dedupe(findings), similarity: scores };
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
