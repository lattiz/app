/**
 * --motion for the seed: adds Lattiz Motion attributes (docs/lattiz-motion.md)
 * to a GrapesJS project by walking its component tree. Idempotent: a component
 * that already carries any motion attribute is never touched again, so re-seeding
 * (or hand-authored motion) is never doubled.
 */

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

interface Node {
  tagName?: string;
  type?: string;
  attributes?: Record<string, unknown>;
  components?: unknown;
  [key: string]: unknown;
}

function children(node: Node): Node[] {
  return Array.isArray(node.components)
    ? (node.components.filter((c) => c && typeof c === 'object') as Node[])
    : [];
}

function hasMotion(node: Node): boolean {
  return MOTION_ATTRS.some((attr) => node.attributes?.[attr] !== undefined);
}

function setAttrs(node: Node, attrs: Record<string, string>): boolean {
  if (hasMotion(node)) return false;
  node.attributes = { ...(node.attributes ?? {}), ...attrs };
  return true;
}

function find(node: Node, test: (n: Node) => boolean): Node | null {
  for (const child of children(node)) {
    if (test(child)) return child;
    const hit = find(child, test);
    if (hit) return hit;
  }
  return null;
}

function tag(node: Node): string {
  return (node.tagName ?? (node.type === 'text' ? 'div' : '')).toLowerCase();
}

export interface DecorationSummary {
  sections: number;
  inner: number;
}

function decorateSection(
  node: Node,
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
  if (setAttrs(node, root)) summary.sections += 1;
  if (preset !== 'editorial') return;

  const heading = find(node, (n) => tag(n) === 'h2');
  if (heading && setAttrs(heading, { 'data-lz-words': '' })) summary.inner += 1;
  if (!isGallery) {
    const list = find(
      node,
      (n) => ['ul', 'ol'].includes(tag(n)) && children(n).length >= 3,
    );
    if (list && setAttrs(list, { 'data-lz-stagger': '90' })) summary.inner += 1;
  }
}

function walk(
  node: Node,
  preset: MotionPreset,
  summary: DecorationSummary,
): void {
  const slot = node.attributes?.['data-lz-slot'];
  if (typeof slot === 'string') {
    if (!STATIC_SLOTS.has(slot)) decorateSection(node, slot, preset, summary);
    return;
  }
  for (const child of children(node)) walk(child, preset, summary);
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
      component?: Node;
    }[]) {
      if (frame.component) walk(frame.component, preset, summary);
    }
  }
  return summary;
}
