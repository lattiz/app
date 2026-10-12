import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Page } from 'playwright';
import { launch, open, primeLazyContent } from './shoot';

export const SHOT_WIDTHS = [360, 390, 768, 1024, 1440] as const;
export const MIN_FONT_PX = 12;
export const MIN_TAP_PX = 44;

export interface LayoutIssue {
  kind: 'overflow' | 'small-text' | 'tap-target';
  selector: string;
  detail: string;
}

export interface WidthReport {
  width: number;
  file: string;
  issues: LayoutIssue[];
}

/** Runs in the page: elements past the viewport, text below the minimum size, small tap targets. */
export function audit(limits: { minFont: number; minTap: number }): LayoutIssue[] {
  const vw = document.documentElement.clientWidth;
  const issues: LayoutIssue[] = [];
  const name = (el: Element): string => {
    const slot = el.closest('[data-lz-slot]')?.getAttribute('data-lz-slot');
    const cls = (el.getAttribute('class') ?? '').split(/\s+/)[0];
    return `${slot ? `${slot} › ` : ''}${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}`;
  };
  const visible = (el: Element): boolean => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  // An ancestor that scrolls or clips sideways (a carousel, a mask) makes the overflow intentional.
  const clipped = (el: Element): boolean => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== 'visible') return true;
    }
    return false;
  };
  const seen = new Set<string>();
  const push = (issue: LayoutIssue): void => {
    const key = `${issue.kind}|${issue.selector}`;
    if (seen.has(key)) return;
    seen.add(key);
    issues.push(issue);
  };

  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if ((r.right > vw + 1 || r.left < -1) && !clipped(el) && getComputedStyle(el).position !== 'fixed') {
      push({ kind: 'overflow', selector: name(el), detail: `${Math.round(r.left)}…${Math.round(r.right)} px in a ${vw} px viewport` });
    }
    const ownText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim());
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (ownText && size < limits.minFont) {
      push({ kind: 'small-text', selector: name(el), detail: `${size} px` });
    }
  }
  const tappable = 'a[href], button, summary, [role="button"], input, select, textarea';
  for (const el of Array.from(document.querySelectorAll(tappable))) {
    if (!visible(el)) continue;
    // Links inside running text are exempt (WCAG 2.5.8 inline exception).
    if (el.tagName === 'A' && el.parentElement?.closest('p, li > p, blockquote, figcaption')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < limits.minTap || r.height < limits.minTap) {
      push({ kind: 'tap-target', selector: name(el), detail: `${Math.round(r.width)}×${Math.round(r.height)} px` });
    }
  }
  return issues;
}

async function shootWidth(page: Page, width: number, url: string, file: string): Promise<LayoutIssue[]> {
  await page.setViewportSize({ width, height: 900 });
  await open(page, url);
  await primeLazyContent(page);
  await page.screenshot({ path: file, fullPage: true });
  // tsx keeps function names with a __name() helper that doesn't exist in the page.
  await page.evaluate('window.__name = (fn) => fn');
  return page.evaluate(audit, { minFont: MIN_FONT_PX, minTap: MIN_TAP_PX });
}

/** Viewports the fit report checks (width, height, phone emulation). */
export const FIT_VIEWPORTS: readonly [number, number, boolean][] = [
  [1440, 900, false],
  [1366, 768, false],
  [1280, 720, false],
  [1920, 1080, false],
  [390, 844, true],
  [360, 640, true],
  [844, 390, true],
];

export interface FitRow {
  viewport: string;
  slot: string;
  header: number;
  /** 0.9 × (window height − header height). */
  fit: number;
  content: number;
  /** Eyebrow-to-CTA block of a hero, for stacked layouts where the image sits below it. */
  text: number | null;
  ctaVisible: boolean | null;
  verdict: 'PASS' | 'PASS (text)' | 'FAIL' | 'n/a';
}

/** Runs in the page: content height of every [data-lz-fit] section, background media excluded. */
export function measureFit(): Omit<FitRow, 'viewport' | 'verdict'>[] {
  const header = document.querySelector('header, [data-lz-slot="navbar"]');
  const hh = header ? Math.round(header.getBoundingClientRect().height) : 0;
  const fit = Math.round((innerHeight - hh) * 0.9);
  const inFlow = (el: Element, section: Element): boolean => {
    for (let p: Element | null = el; p && p !== section; p = p.parentElement) {
      if (/absolute|fixed/.test(getComputedStyle(p).position)) return false;
    }
    return true;
  };
  const span = (els: Element[]): [number, number] => {
    let top = Infinity;
    let bottom = -Infinity;
    for (const el of els) {
      const b = el.getBoundingClientRect();
      if (b.height < 1 || b.width < 2) continue;
      top = Math.min(top, b.top);
      bottom = Math.max(bottom, b.bottom);
    }
    return [top, bottom];
  };
  return Array.from(document.querySelectorAll('[data-lz-fit]')).map((section) => {
    const all = Array.from(section.querySelectorAll('h1, h2, h3, p, a, button, img, figure, ul, ol')).filter((el) => inFlow(el, section));
    const [top, bottom] = span(all);
    const ctas = all.filter((el) => /button|btn/.test(el.getAttribute('class') ?? ''));
    const text = all.filter((el) => el.tagName !== 'IMG' && el.tagName !== 'FIGURE' && !el.querySelector('img'));
    const [tTop, tBottom] = span(text);
    const media = all.filter((el) => el.tagName === 'IMG');
    const [mTop] = span(media);
    const isHero = section.getAttribute('data-lz-slot') === 'hero';
    const lastCta = ctas[ctas.length - 1];
    return {
      slot: section.getAttribute('data-lz-slot') ?? '?',
      header: hh,
      fit,
      content: Math.round(bottom - top),
      // Only meaningful when the image is stacked below the text.
      text: isHero && media.length && mTop >= tBottom - 1 ? Math.round(tBottom - tTop) : null,
      ctaVisible: isHero && lastCta ? lastCta.getBoundingClientRect().bottom + scrollY <= innerHeight : null,
    };
  });
}

/** Fit report: [data-lz-fit] sections must use at most 90 % of the window under the header. */
export async function fitReport(distDirPath: string, outDir: string): Promise<FitRow[]> {
  mkdirSync(outDir, { recursive: true });
  const url = pathToFileURL(resolve(distDirPath, 'index.html')).href;
  const browser = await launch();
  try {
    const rows: FitRow[] = [];
    for (const [width, height, phone] of FIT_VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width, height },
        isMobile: phone,
        hasTouch: phone,
        deviceScaleFactor: phone ? 2 : 1,
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await open(page, url);
      const viewport = `${width}x${height}`;
      await page.screenshot({ path: resolve(outDir, `fit-${viewport}.png`) });
      await page.evaluate('window.__name = (fn) => fn');
      for (const m of await page.evaluate(measureFit)) {
        const verdict: FitRow['verdict'] =
          height <= 560
            ? 'n/a'
            : m.content <= m.fit
              ? 'PASS'
              : m.text !== null && m.text <= m.fit && m.ctaVisible
                ? 'PASS (text)'
                : 'FAIL';
        rows.push({ viewport, ...m, verdict });
      }
      await context.close();
    }
    writeFileSync(resolve(outDir, 'fit.json'), `${JSON.stringify(rows, null, 2)}\n`);
    return rows;
  } finally {
    await browser.close();
  }
}

/** Full-page shots of dist/<id>/index.html at every width into `outDir`, plus a layout report. */
export async function shootWidths(distDirPath: string, outDir: string): Promise<WidthReport[]> {
  mkdirSync(outDir, { recursive: true });
  const url = pathToFileURL(resolve(distDirPath, 'index.html')).href;
  const browser = await launch();
  try {
    const reports: WidthReport[] = [];
    for (const width of SHOT_WIDTHS) {
      const page = await browser.newPage({ reducedMotion: 'reduce' });
      const file = resolve(outDir, `${width}.png`);
      reports.push({ width, file, issues: await shootWidth(page, width, url, file) });
      await page.close();
    }
    writeFileSync(resolve(outDir, 'report.json'), `${JSON.stringify(reports, null, 2)}\n`);
    return reports;
  } finally {
    await browser.close();
  }
}
