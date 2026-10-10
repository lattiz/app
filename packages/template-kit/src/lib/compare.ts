import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

/** Computed properties that decide how a page looks; compared element by element. */
const PROPS = [
  'display',
  'position',
  'width',
  'height',
  'margin',
  'padding',
  'gap',
  'grid-template-columns',
  'color',
  'background-color',
  'background-image',
  'border-top-color',
  'border-bottom-color',
  'border-top-width',
  'border-radius',
  'box-shadow',
  'filter',
  'opacity',
  'transform',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-transform',
  '-webkit-text-stroke-color',
  '-webkit-text-stroke-width',
  'animation-name',
  'backdrop-filter',
  'z-index',
] as const;

// Plain JS string: tsx would inject helpers (__name) into a serialized TS function.
// Section roots are keyed by data-lz-slot so an added section doesn't shift every later path.
const SNAPSHOT_SCRIPT = `(props) => {
  const out = [];
  const visit = (el, path) => {
    if (el.namespaceURI !== 'http://www.w3.org/1999/xhtml') return;
    const cs = getComputedStyle(el);
    const style = {};
    for (const p of props) style[p] = cs.getPropertyValue(p);
    const attrs = {};
    for (const a of Array.from(el.attributes)) if (a.name !== 'class') attrs[a.name] = a.value;
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.nodeValue || '').join('').trim();
    out.push({ path, tag: el.localName, text: own, attrs, style });
    Array.from(el.children).forEach((c, i) => visit(c, path + '>' + c.localName + '[' + (c.getAttribute('data-lz-slot') || i) + ']'));
  };
  visit(document.body, 'body');
  return out;
}`;

export interface ElementSnapshot {
  path: string;
  tag: string;
  text: string;
  attrs: Record<string, string>;
  style: Record<string, string>;
}

export interface Difference {
  path: string;
  kind: 'style' | 'text' | 'attr' | 'structure';
  detail: string;
}

async function snapshot(
  file: string,
  width: number,
): Promise<ElementSnapshot[]> {
  const browser = await chromium
    .launch()
    .catch(() => chromium.launch({ channel: 'chrome' }));
  try {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    // Block network: fonts, maps and images differ by environment, not by template.
    await page.route(/^https?:/, (route) => route.abort());
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    return (await page.evaluate(
      `(${SNAPSHOT_SCRIPT})(${JSON.stringify(PROPS)})`,
    )) as ElementSnapshot[];
  } finally {
    await browser.close();
  }
}

/** color-mix() computes to `color(srgb …)`; express it as rgb()/rgba() so equal colors compare equal. */
export function normalizeColors(value: string): string {
  return value.replace(
    /color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)/g,
    (_m, r: string, g: string, b: string, a?: string) => {
      const c = [r, g, b]
        .map((v) => Math.round(parseFloat(v) * 255))
        .join(', ');
      return a === undefined || a === '1' ? `rgb(${c})` : `rgba(${c}, ${a})`;
    },
  );
}

/** Element-by-element comparison of two renders at one viewport width. */
export async function comparePages(
  expectedFile: string,
  actualFile: string,
  width: number,
): Promise<Difference[]> {
  const [a, b] = await Promise.all([
    snapshot(expectedFile, width),
    snapshot(actualFile, width),
  ]);
  const diffs: Difference[] = [];
  if (a.length !== b.length)
    diffs.push({
      path: 'body',
      kind: 'structure',
      detail: `${a.length} elements vs ${b.length}`,
    });
  const byPath = new Map(b.map((e) => [e.path, e]));
  for (const ea of a) {
    const eb = byPath.get(ea.path);
    if (!eb || eb.tag !== ea.tag) {
      diffs.push({
        path: ea.path,
        kind: 'structure',
        detail: `<${ea.tag}> missing or replaced by <${eb?.tag ?? '∅'}>`,
      });
      continue;
    }
    if (ea.text !== eb.text)
      diffs.push({
        path: ea.path,
        kind: 'text',
        detail: `"${ea.text}" → "${eb.text}"`,
      });
    for (const key of new Set([
      ...Object.keys(ea.attrs),
      ...Object.keys(eb.attrs),
    ])) {
      if (ea.attrs[key] !== eb.attrs[key]) {
        diffs.push({
          path: ea.path,
          kind: 'attr',
          detail: `${key}: ${ea.attrs[key] ?? '∅'} → ${eb.attrs[key] ?? '∅'}`,
        });
      }
    }
    for (const prop of Object.keys(ea.style)) {
      if (normalizeColors(ea.style[prop]) !== normalizeColors(eb.style[prop])) {
        diffs.push({
          path: ea.path,
          kind: 'style',
          detail: `${prop}: ${ea.style[prop]} → ${eb.style[prop]}`,
        });
      }
    }
  }
  return diffs;
}
