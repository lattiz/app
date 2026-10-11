/**
 * --motion for the seed: adds Lattiz Motion attributes (docs/lattiz-motion.md)
 * to a template. The same rules run on the GrapesJS component tree (what tenants
 * get) and on the preview HTML, so both stay identical. Idempotent: an element
 * that already carries any motion attribute is never touched again, so
 * re-seeding (or hand-authored motion) is never doubled.
 */
import { parse, type HTMLElement } from 'node-html-parser';
import { injectMotion } from '../../apps/tenant-sites/lib/lz-motion';

export type MotionPreset = 'calm' | 'editorial' | 'none';
export const MOTION_PRESETS: readonly MotionPreset[] = [
  'calm',
  'editorial',
  'none',
];

const MOTION_ATTRS = [
  'data-lz-reveal',
  'data-lz-stagger',
  'data-lz-words',
  'data-lz-counter',
  'data-lz-parallax',
  'data-lz-lightbox',
  'data-lz-compare',
  'data-lz-countdown',
  'data-lz-open-now',
];
// Above the fold or chrome: never animated (LCP and navigation stay instant).
const STATIC_SLOTS = new Set([
  'navbar',
  'header',
  'hero',
  'floating-whatsapp',
  'marquee',
  'footer',
]);
const GALLERY_SLOTS = new Set(['gallery', 'proof']);

/** The little the rules need from a node, so they run on JSON components and on HTML alike. */
interface MotionNode {
  tag(): string;
  attr(name: string): string | undefined;
  setAttrs(attrs: Record<string, string>): void;
  children(): MotionNode[];
}

export interface DecorationSummary {
  sections: number;
  inner: number;
}

function hasMotion(node: MotionNode): boolean {
  return MOTION_ATTRS.some((attr) => node.attr(attr) !== undefined);
}

function apply(node: MotionNode, attrs: Record<string, string>): boolean {
  if (hasMotion(node)) return false;
  node.setAttrs(attrs);
  return true;
}

function find(
  node: MotionNode,
  test: (n: MotionNode) => boolean,
): MotionNode | null {
  for (const child of node.children()) {
    if (test(child)) return child;
    const hit = find(child, test);
    if (hit) return hit;
  }
  return null;
}

function decorateSection(
  node: MotionNode,
  slot: string,
  preset: MotionPreset,
  summary: DecorationSummary,
): void {
  const isGallery = GALLERY_SLOTS.has(slot);
  const root: Record<string, string> =
    preset === 'editorial' && slot === 'testimonials'
      ? { 'data-lz-reveal': 'zoom' }
      : { 'data-lz-reveal': 'fade-up' };
  if (preset === 'editorial' && isGallery) root['data-lz-lightbox'] = '';
  if (apply(node, root)) summary.sections += 1;
  if (preset !== 'editorial') return;

  const heading = find(node, (n) => n.tag() === 'h2');
  if (heading && apply(heading, { 'data-lz-words': '' })) summary.inner += 1;
  if (!isGallery) {
    const list = find(
      node,
      (n) => ['ul', 'ol'].includes(n.tag()) && n.children().length >= 3,
    );
    if (list && apply(list, { 'data-lz-stagger': '90' })) summary.inner += 1;
  }
}

function walk(
  node: MotionNode,
  preset: MotionPreset,
  summary: DecorationSummary,
): void {
  const slot = node.attr('data-lz-slot');
  if (slot !== undefined) {
    if (!STATIC_SLOTS.has(slot)) decorateSection(node, slot, preset, summary);
    return;
  }
  for (const child of node.children()) walk(child, preset, summary);
}

// ── GrapesJS component JSON ──────────────────────────────────────────────────

interface Component {
  tagName?: string;
  type?: string;
  attributes?: Record<string, unknown>;
  components?: unknown;
}

function jsonNode(component: Component): MotionNode {
  return {
    tag: () =>
      (
        component.tagName ?? (component.type === 'text' ? 'div' : '')
      ).toLowerCase(),
    attr: (name) => {
      const value = component.attributes?.[name];
      return value === undefined ? undefined : String(value);
    },
    setAttrs: (attrs) => {
      component.attributes = { ...(component.attributes ?? {}), ...attrs };
    },
    children: () =>
      Array.isArray(component.components)
        ? (
            component.components.filter(
              (c) => c && typeof c === 'object',
            ) as Component[]
          ).map(jsonNode)
        : [],
  };
}

/** Mutates `project` in place; returns how many sections and inner elements were decorated. */
export function decorateMotion(
  project: { pages?: unknown[] },
  preset: MotionPreset,
): DecorationSummary {
  const summary: DecorationSummary = { sections: 0, inner: 0 };
  if (preset === 'none') return summary;
  for (const page of project.pages ?? []) {
    for (const frame of ((page as { frames?: unknown[] }).frames ?? []) as {
      component?: Component;
    }[]) {
      if (frame.component) walk(jsonNode(frame.component), preset, summary);
    }
  }
  return summary;
}

// ── Preview HTML ─────────────────────────────────────────────────────────────

function htmlNode(el: HTMLElement): MotionNode {
  return {
    tag: () => (el.rawTagName ?? '').toLowerCase(),
    attr: (name) =>
      el.hasAttribute(name) ? (el.getAttribute(name) ?? '') : undefined,
    setAttrs: (attrs) => {
      for (const [name, value] of Object.entries(attrs))
        el.setAttribute(name, value);
    },
    children: () =>
      el.childNodes
        .filter((n): n is HTMLElement => n.nodeType === 1)
        .map(htmlNode),
  };
}

/**
 * Same decoration on the static preview page. With `withRuntime` the Lattiz Motion
 * runtime is inlined so the preview animates like a published Pro site.
 */
export function decorateMotionHtml(
  html: string,
  preset: MotionPreset,
  withRuntime: boolean,
): { html: string; summary: DecorationSummary } {
  const summary: DecorationSummary = { sections: 0, inner: 0 };
  if (preset === 'none') return { html, summary };
  const doc = parse(html, { comment: true });
  walk(htmlNode(doc), preset, summary);
  const decorated = doc.toString();
  return { html: withRuntime ? injectMotion(decorated) : decorated, summary };
}
