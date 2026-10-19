import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import type { Page } from 'playwright';
import { GIROS } from '../../../template-kit/giros';
import { loadTheme } from '../../../template-kit/src/lib/load';
import { paths } from '../../../template-kit/src/lib/paths';
import { open } from '../../../template-kit/src/lib/shoot';
import type { ContentObject } from '../../../template-kit/src/types';
import { launchBrowser } from '../lib/browser';
import { composePage, sectionsFor } from '../lib/probe';
import { usage } from '../lib/errors';
import { workDir } from './library';

/**
 * Fidelity harness: is a Stitch section already in the kit, *visually*? It renders the section from
 * the candidate's HTML (for measurement only: it needs the network for Stitch's Tailwind CDN and is
 * never served or kept) and every variant of the slot with the same copy in the same theme, then
 * compares structure at thumbnail size. Layout class is not enough to call something "already exists".
 */

/** Layout distance (text + box occupancy, 0 = same). Calibrated on the FAQ of barberia-don-porfirio-01 against the kit's faq variants (docs/stitch-native-sections.md). */
export const MATCH_STRUCTURE = 0.15;
export const MATCH_HEIGHT_RATIO: [number, number] = [0.7, 1.4];

export interface VariantMeasure {
  variant: string;
  structure: number;
  heightRatio: number;
  match: boolean;
}

export interface FidelityEntry {
  ref: string;
  slot: string;
  theme: string;
  measured: VariantMeasure[];
  best: string | null;
  verdict: 'match' | 'different';
  thresholds: { structure: number; heightRatio: [number, number] };
}

export const isMatch = (structure: number, heightRatio: number) =>
  structure <= MATCH_STRUCTURE &&
  heightRatio >= MATCH_HEIGHT_RATIO[0] &&
  heightRatio <= MATCH_HEIGHT_RATIO[1];

/**
 * Copy of a FAQ-like section (kicker, title, intro, question/answer cards), read from the DOM. Passed
 * to the page as text: tsx rewrites function bodies with helpers the browser doesn't have.
 */
const FAQ_READER = `(id) => {
  const root = document.getElementById(id);
  if (!root) return null;
  const text = (e) => ((e && e.textContent) || '').replace(/\\s+/g, ' ').trim();
  const all = Array.from(root.querySelectorAll('*'));
  const grid = all.find((e) => e.classList.contains('grid') && e.children.length >= 2);
  const items = Array.from(grid ? grid.children : []).flatMap((card) => {
    const q = card.querySelector('h3, h4, h5, summary, dt');
    const ps = Array.from(card.querySelectorAll('p'));
    const a = ps[ps.length - 1];
    return q && a ? [{ question: text(q), answer: text(a) }] : [];
  });
  const head = root.querySelector('h2');
  const wrap = head ? head.parentElement : null;
  const kicker = wrap ? wrap.querySelector('span, p') : null;
  const intro = wrap ? Array.from(wrap.querySelectorAll('p')).find((p) => p !== kicker) : null;
  const out = { title: text(head), items };
  if (kicker && kicker !== head) out.kicker = text(kicker);
  if (intro) out.intro = text(intro);
  return out;
}`;

async function readFaqCopy(
  page: Page,
  ref: string,
): Promise<ContentObject | null> {
  return page.evaluate(
    `(${FAQ_READER})(${JSON.stringify(ref)})`,
  ) as Promise<ContentObject | null>;
}

/**
 * Geometry of a section: text blocks and boxes (cards, buttons) as rectangles normalized to the
 * section. Layout, not pixels: color, font and copy length don't move it.
 */
const GEOMETRY_READER = `(sel) => {
  const root = document.querySelector(sel);
  if (!root) return null;
  const r0 = root.getBoundingClientRect();
  const rects = [];
  const push = (kind, el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 6) return;
    rects.push({ kind, x: (r.left - r0.left) / r0.width, y: (r.top - r0.top) / r0.height, w: r.width / r0.width, h: r.height / r0.height });
  };
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const direct = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (direct) push('text', el);
    const bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth);
    const bg = cs.backgroundColor;
    const filled = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
    const r = el.getBoundingClientRect();
    // An empty box is decoration (a glow, a rule), not a card.
    const hasContent = (el.textContent || '').trim().length > 1 || el.querySelector('img, picture, video, svg');
    if ((bw > 0 || filled) && hasContent && r.width > 60 && r.height > 24 && r.width < r0.width * 0.98) push('box', el);
  }
  // Anatomy: where the text sits inside each large box (title/price row, rule, footer row…).
  const cards = [];
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const r = el.getBoundingClientRect();
    if (r.width < r0.width * 0.12 || r.width > r0.width * 0.9 || r.height < 60) continue;
    const cs = getComputedStyle(el);
    const bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth);
    const bg = cs.backgroundColor;
    if (!(bw > 0 || (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'))) continue;
    const inner = [];
    for (const t of Array.from(el.querySelectorAll('*'))) {
      const direct = Array.from(t.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!direct) continue;
      const q = t.getBoundingClientRect();
      if (q.width < 8 || q.height < 6) continue;
      inner.push({ x: (q.left - r.left) / r.width, y: (q.top - r.top) / r.height, w: q.width / r.width, h: q.height / r.height });
    }
    if (inner.length >= 2) cards.push(inner);
  }
  return { w: r0.width, h: r0.height, rects, cards };
}`;

interface Rect {
  kind: 'text' | 'box';
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Geometry {
  w: number;
  h: number;
  rects: Rect[];
  /** Text rectangles inside each large box, normalized to the box. */
  cards?: Omit<Rect, 'kind'>[][];
}

const GRID = 48;

function occupancy(g: Geometry, kind: Rect['kind']): Uint8Array {
  const out = new Uint8Array(GRID * GRID);
  for (const r of g.rects)
    if (r.kind === kind) {
      const x0 = Math.max(0, Math.floor(r.x * GRID));
      const x1 = Math.min(GRID - 1, Math.ceil((r.x + r.w) * GRID) - 1);
      const y0 = Math.max(0, Math.floor(r.y * GRID));
      const y1 = Math.min(GRID - 1, Math.ceil((r.y + r.h) * GRID) - 1);
      for (let y = y0; y <= y1; y += 1)
        for (let x = x0; x <= x1; x += 1) out[y * GRID + x] = 1;
    }
  return out;
}

/** One-cell dilation: a card that is 20 px off still counts as the same card. */
function dilate(a: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length);
  for (let y = 0; y < GRID; y += 1)
    for (let x = 0; x < GRID; x += 1)
      if (a[y * GRID + x])
        for (let dy = -1; dy <= 1; dy += 1)
          for (let dx = -1; dx <= 1; dx += 1) {
            const yy = y + dy;
            const xx = x + dx;
            if (yy >= 0 && yy < GRID && xx >= 0 && xx < GRID)
              out[yy * GRID + xx] = 1;
          }
  return out;
}

/** Dice overlap of two occupancy maps, tolerant by one cell on both sides. */
export function dice(a: Uint8Array, b: Uint8Array): number {
  const da = dilate(a);
  const db = dilate(b);
  let inter = 0;
  let sa = 0;
  let sb = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] && db[i]) inter += 1;
    sa += a[i];
    if (b[i] && da[i]) inter += 1;
    sb += b[i];
  }
  const total = sa + sb;
  return total === 0 ? 1 : Math.min(1, inter / total);
}

const A = 16;

/** Average card anatomy: cells where at least half of the cards have text. */
export function anatomyMap(g: Geometry): Uint8Array | null {
  const cards = g.cards ?? [];
  if (cards.length < 2) return null;
  const count = new Float64Array(A * A);
  for (const card of cards) {
    const seen = new Uint8Array(A * A);
    for (const r of card) {
      const x0 = Math.max(0, Math.floor(r.x * A));
      const x1 = Math.min(A - 1, Math.ceil((r.x + r.w) * A) - 1);
      const y0 = Math.max(0, Math.floor(r.y * A));
      const y1 = Math.min(A - 1, Math.ceil((r.y + r.h) * A) - 1);
      for (let y = y0; y <= y1; y += 1)
        for (let x = x0; x <= x1; x += 1) seen[y * A + x] = 1;
    }
    for (let i = 0; i < seen.length; i += 1) count[i] += seen[i];
  }
  return Uint8Array.from(count, (v) => (v / cards.length >= 0.5 ? 1 : 0));
}

/** Dice on a 16-cell map, tolerant by one cell. */
function diceSmall(a: Uint8Array, b: Uint8Array): number {
  const near = (m: Uint8Array, i: number) => {
    const y = Math.floor(i / A);
    const x = i % A;
    for (let dy = -1; dy <= 1; dy += 1)
      for (let dx = -1; dx <= 1; dx += 1) {
        const yy = y + dy;
        const xx = x + dx;
        if (yy >= 0 && yy < A && xx >= 0 && xx < A && m[yy * A + xx])
          return true;
      }
    return false;
  };
  let inter = 0;
  let sa = 0;
  let sb = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] && near(b, i)) inter += 1;
    if (b[i] && near(a, i)) inter += 1;
    sa += a[i];
    sb += b[i];
  }
  return sa + sb === 0 ? 1 : Math.min(1, inter / (sa + sb));
}

/** Per card: text blocks, and rows that hold two or more blocks side by side (title + price). */
export function cardStats(
  g: Geometry,
): { blocks: number; pairedRows: number } | null {
  const cards = g.cards ?? [];
  if (cards.length < 2) return null;
  const avg = (xs: number[]) =>
    Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
  const rowsOf = (card: Omit<Rect, 'kind'>[]) => {
    const rows: Omit<Rect, 'kind'>[][] = [];
    for (const r of [...card].sort((a, b) => a.y - b.y)) {
      const row = rows.find(
        (x) => Math.abs(x[0].y + x[0].h / 2 - (r.y + r.h / 2)) < 0.07,
      );
      if (row) row.push(r);
      else rows.push([r]);
    }
    return rows.filter((row) => row.length >= 2).length;
  };
  return {
    blocks: avg(cards.map((c) => c.length)),
    pairedRows: avg(cards.map(rowsOf)),
  };
}

/** Large boxes (cards) and how many distinct columns they sit in: the skeleton of the section. */
export function skeleton(g: Geometry): { boxes: number; columns: number } {
  const big = g.rects.filter(
    (r) => r.kind === 'box' && r.w > 0.12 && r.w < 0.9 && r.h > 0.06,
  );
  const lefts: number[] = [];
  for (const r of big)
    if (!lefts.some((l) => Math.abs(l - r.x) < 0.04)) lefts.push(r.x);
  return { boxes: big.length, columns: lefts.length };
}

/** 0 = same layout; boxes and text weigh the same, then a penalty when the skeleton differs. */
export function layoutDistance(a: Geometry, b: Geometry): number {
  const text = dice(occupancy(a, 'text'), occupancy(b, 'text'));
  const hasBoxes =
    a.rects.some((r) => r.kind === 'box') ||
    b.rects.some((r) => r.kind === 'box');
  const box = hasBoxes ? dice(occupancy(a, 'box'), occupancy(b, 'box')) : text;
  const ma = anatomyMap(a);
  const mb = anatomyMap(b);
  // Both sides have cards: their inner anatomy weighs as much as the outer layout.
  const anatomy = ma && mb ? diceSmall(ma, mb) : null;
  const ca = cardStats(a);
  const cb = cardStats(b);
  // Two or more blocks of difference per card, or paired rows missing: another anatomy, not a restyle.
  const anatomyPenalty =
    ca && cb
      ? (Math.abs(ca.blocks - cb.blocks) >= 2 ? 0.15 : 0) +
        (Math.abs(ca.pairedRows - cb.pairedRows) >= 2 ? 0.15 : 0)
      : 0;
  const sa = skeleton(a);
  const sb = skeleton(b);
  const penalty =
    (sa.columns !== sb.columns ? 0.2 : 0) +
    (Math.max(sa.boxes, sb.boxes) >
    1.5 * Math.max(1, Math.min(sa.boxes, sb.boxes))
      ? 0.15
      : 0);
  return (
    Math.round(
      Math.min(
        1,
        1 -
          (anatomy === null ? (text + box) / 2 : (text + box + anatomy) / 3) +
          penalty +
          anatomyPenalty,
      ) * 1000,
    ) / 1000
  );
}

/** The reference's single location panel (address, hours, map link) as the kit's `branches`. */
const LOCATIONS_READER = `(id) => {
  const root = document.getElementById(id);
  if (!root) return null;
  const text = (e) => ((e && e.textContent) || '').replace(/\\s+/g, ' ').trim();
  const head = Array.from(root.querySelectorAll('h3'))[0];
  const panel = head ? head.closest('div[class*="rounded"]') : null;
  if (!panel) return null;
  const address = Array.from(panel.querySelectorAll('p')).map(text).find((t) => t.length > 12);
  const rows = Array.from(panel.querySelectorAll('div')).filter((d) => d.children.length === 2 && d.children[0].tagName === 'SPAN' && d.children[1].tagName === 'SPAN');
  const maps = Array.from(root.querySelectorAll('a')).find((a) => /maps/.test(a.getAttribute('href') || ''));
  if (!address || !rows.length || !maps) return null;
  const h2 = root.querySelector('h2');
  const lead = h2 ? Array.from(root.querySelectorAll('p')).find((p) => p.compareDocumentPosition(h2) & 2 && text(p).length > 30) : null;
  const wrap = h2 ? h2.parentElement : null;
  const kicker = wrap ? Array.from(wrap.querySelectorAll('span')).find((e) => text(e).length > 2) : null;
  return {
    title: text(h2),
    ...(lead ? { contactText: text(lead) } : {}),
    ...(kicker ? { kicker: text(kicker) } : {}),
    hoursLabel: text(rows[0].children[0]),
    branches: [{
      name: text(head),
      address,
      hours: text(rows[0].children[1]),
      directionsUrl: maps.getAttribute('href'),
      mapUrl: 'about:blank',
      mapTitle: text(head),
    }],
  };
}`;

async function readLocationsCopy(
  page: Page,
  ref: string,
): Promise<ContentObject | null> {
  return page.evaluate(
    `(${LOCATIONS_READER})(${JSON.stringify(ref)})`,
  ) as Promise<ContentObject | null>;
}

const READERS: Record<string, typeof readFaqCopy> = {
  faq: readFaqCopy,
  locations: readLocationsCopy,
};

export interface FidelityInput {
  candidateId: string;
  candidateDir: string;
  giro: string;
  ref: string;
  slot: string;
  variants?: string[];
  theme?: string;
  tier?: 'basic' | 'pro';
}

function defaultTheme(giro: string): string {
  const dir = paths.themes;
  const found = readdirSync(dir)
    .filter((f) => f.startsWith(`${giro}-`) && !f.includes('-base-'))
    .map((f) => f.replace(/\.json$/, ''))[0];
  if (!found)
    throw usage(`No hay un tema Pro de ${giro} para renderizar; pasa --theme.`);
  return found;
}

async function sideBySide(
  left: string,
  right: string,
  out: string,
): Promise<void> {
  const h = 640;
  const a = await sharp(left)
    .resize({ height: h, fit: 'inside' })
    .png()
    .toBuffer();
  const b = await sharp(right)
    .resize({ height: h, fit: 'inside' })
    .png()
    .toBuffer();
  const [ma, mb] = await Promise.all([
    sharp(a).metadata(),
    sharp(b).metadata(),
  ]);
  await sharp({
    create: {
      width: (ma.width ?? 0) + (mb.width ?? 0) + 30,
      height: h + 20,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      { input: a, left: 10, top: 10 },
      { input: b, left: (ma.width ?? 0) + 20, top: 10 },
    ])
    .png()
    .toFile(out);
}

export async function measureFidelity(
  input: FidelityInput,
): Promise<FidelityEntry> {
  const source = join(input.candidateDir, 'source.html');
  if (!existsSync(source))
    throw usage(`"${input.candidateId}" no tiene source.html para medir.`);
  const slotDir = join(paths.sections, input.slot);
  const variants =
    input.variants ??
    readdirSync(slotDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `${input.slot}/${d.name}`);
  const theme = input.theme ?? defaultTheme(input.giro);
  const tier = input.tier ?? 'pro';
  const out = workDir('fidelity', input.candidateId, input.ref);
  mkdirSync(out, { recursive: true });
  const stitchPng = join(out, 'stitch.png');

  const browser = await launchBrowser();
  const measured: VariantMeasure[] = [];
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    await page
      .goto(pathToFileURL(source).href, {
        waitUntil: 'networkidle',
        timeout: 45_000,
      })
      .catch(() => undefined);
    await page.evaluate(() => document.fonts.ready);
    // Footers carry no id in most designs: fall back to the element itself.
    // Refs that are not a plain id (a comment label) and footers without id: the element itself.
    const plainId = /^[A-Za-z][\w-]*$/.test(input.ref);
    let selector = plainId ? `#${input.ref}` : 'footer';
    if (
      plainId &&
      input.slot === 'footer' &&
      (await page.locator(selector).count()) === 0
    )
      selector = 'footer';
    const target = page.locator(selector).first();
    if ((await target.count()) === 0)
      throw usage(`No hay una sección con id "${input.ref}" en ${source}.`);
    // The design's sticky header overlays the crop: measure the section alone.
    await page.addStyleTag({ content: 'header{display:none!important}' });
    await target.screenshot({ path: stitchPng });
    const stitchGeo = (await page.evaluate(
      `(${GEOMETRY_READER})(${JSON.stringify(selector)})`,
    )) as Geometry;
    const copy = await READERS[input.slot]?.(page, input.ref);
    const stitchMeta = await sharp(stitchPng).metadata();

    const giro = GIROS[input.giro];
    const skipped: string[] = [];
    for (const key of variants) {
      const [slot, variant] = key.split('/');
      try {
        const dir = join(out, `_page-${variant}`);
        mkdirSync(dir, { recursive: true });
        await composePage({
          id: `fidelity-${slot}-${variant}`,
          name: `Fidelidad ${key}`,
          tier,
          sections: sectionsFor(tier, slot, variant),
          giro,
          theme: { ...loadTheme(theme), tier },
          mode: 'demo',
          dir,
          // No CTA: the reference has none, and an extra button would change the height.
          extra: copy ? { [slot]: { ...copy, cta: '' } } : undefined,
        });
        const shot = join(out, `${variant}.png`);
        const kit = await browser.newPage({
          viewport: { width: 1280, height: 900 },
        });
        await open(kit, pathToFileURL(resolve(dir, 'index.html')).href);
        // Chrome (header, floating WhatsApp) overlays the crop; only the section is measured.
        await kit.addStyleTag({
          content:
            '[data-lz-slot="navbar"],[data-lz-slot="floating-whatsapp"],.lz-whatsapp{display:none!important}',
        });
        await kit
          .locator(`[data-lz-slot="${slot}"]`)
          .first()
          .screenshot({ path: shot });
        const kitGeo = (await kit.evaluate(
          `(${GEOMETRY_READER})(${JSON.stringify(`[data-lz-slot="${slot}"]`)})`,
        )) as Geometry;
        await kit.close();
        const meta = await sharp(shot).metadata();
        const structure = layoutDistance(stitchGeo, kitGeo);
        const heightRatio =
          Math.round(((meta.height ?? 1) / (stitchMeta.height ?? 1)) * 100) /
          100;
        measured.push({
          variant: key,
          structure,
          heightRatio,
          match: isMatch(structure, heightRatio),
        });
        await sideBySide(stitchPng, shot, join(out, `vs-${variant}.png`));
      } catch (error) {
        // A variant that cannot render with generic giro copy (a product grid, say) is skipped, not fatal.
        skipped.push(`${key}: ${(error as Error).message.split('\n')[0]}`);
      }
    }
    for (const k of skipped) console.error(`  (omitida) ${k}`);
  } finally {
    await browser.close();
  }
  measured.sort((a, b) => a.structure - b.structure);
  const best = measured[0] ?? null;
  const entry: FidelityEntry = {
    ref: input.ref,
    slot: input.slot,
    theme,
    measured,
    best: best?.variant ?? null,
    verdict: best?.match ? 'match' : 'different',
    thresholds: { structure: MATCH_STRUCTURE, heightRatio: MATCH_HEIGHT_RATIO },
  };
  return entry;
}

/** fidelity.json in the candidate folder: one entry per section ref, so harvest can read the verdicts. */
export function saveFidelity(candidateDir: string, entry: FidelityEntry): void {
  const file = join(candidateDir, 'fidelity.json');
  const all: Record<string, FidelityEntry> = existsSync(file)
    ? JSON.parse(readFileSync(file, 'utf8'))
    : {};
  all[entry.ref] = entry;
  writeFileSync(file, `${JSON.stringify(all, null, 2)}\n`);
}

export function readFidelity(
  candidateDir: string,
): Record<string, FidelityEntry> {
  const file = join(candidateDir, 'fidelity.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
}
