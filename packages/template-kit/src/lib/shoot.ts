import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright';
import { KitError } from './args';

export interface ShotSet {
  thumbnail: string;
  review: string[];
}

async function launch(): Promise<Browser> {
  // Same fallback as the seed script: an installed Chrome when `playwright install chromium` hasn't run.
  return chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
}

async function open(page: Page, url: string): Promise<void> {
  // Map iframes can keep the network busy; a loaded page with settled fonts is enough.
  await page
    .goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    .catch(() => page.waitForLoadState('load'));
  await page.evaluate(() => document.fonts.ready);
}

/** Scrolls through the page so lazy images load before a full-page capture. */
async function primeLazyContent(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

export async function shootDist(dir: string): Promise<ShotSet> {
  const html = resolve(dir, 'index.html');
  if (!existsSync(html))
    throw new KitError(`${html} does not exist; run kit:compile first.`);
  const url = pathToFileURL(html).href;
  const reviewDir = resolve(dir, 'review');
  mkdirSync(reviewDir, { recursive: true });
  const browser = await launch();
  try {
    const thumbnail = resolve(dir, 'thumbnail.jpg');
    const desktop = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    await open(desktop, url);
    // Matches the seed's thumbnail: let entrance animations settle, then capture the first viewport.
    await desktop.waitForTimeout(1_500);
    await desktop.screenshot({ path: thumbnail, type: 'jpeg', quality: 82 });
    await desktop.close();

    const review: string[] = [];
    const shots = [
      { name: 'desktop-full.png', width: 1280, height: 800 },
      { name: 'tablet-992-full.png', width: 992, height: 900 },
      { name: 'mobile-390.png', width: 390, height: 844, viewportOnly: true },
      { name: 'mobile-390-full.png', width: 390, height: 844 },
    ];
    for (const shot of shots) {
      const page = await browser.newPage({
        viewport: { width: shot.width, height: shot.height },
        reducedMotion: 'reduce',
      });
      await open(page, url);
      if (!shot.viewportOnly) await primeLazyContent(page);
      const path = resolve(reviewDir, shot.name);
      await page.screenshot({ path, fullPage: !shot.viewportOnly });
      review.push(path);
      await page.close();
    }
    return { thumbnail, review };
  } finally {
    await browser.close();
  }
}
