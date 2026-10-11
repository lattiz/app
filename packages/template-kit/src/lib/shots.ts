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
function audit(limits: { minFont: number; minTap: number }): LayoutIssue[] {
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
