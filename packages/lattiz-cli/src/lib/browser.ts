import { existsSync } from 'node:fs';
import { type Browser, chromium } from 'playwright';
import { usage } from './errors';

/** Playwright's Chromium, then an installed Chrome (as the kit does), then LATTIZ_CHROMIUM_PATH. */
export async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch();
  } catch (first) {
    try {
      return await chromium.launch({ channel: 'chrome' });
    } catch {
      const path = process.env.LATTIZ_CHROMIUM_PATH?.trim();
      if (path && existsSync(path))
        return chromium.launch({ executablePath: path });
      throw usage(
        `No pude abrir Chromium: ${(first as Error).message.split('\n')[0]}`,
        'pnpm exec playwright install chromium (o LATTIZ_CHROMIUM_PATH=<ruta a chrome> en .env)',
      );
    }
  }
}

/** Which browser `launchBrowser` would use, for doctor and Lighthouse. */
export function browserPath(): { path: string; source: string } | null {
  const bundled = chromium.executablePath();
  if (existsSync(bundled)) return { path: bundled, source: 'Playwright' };
  const custom = process.env.LATTIZ_CHROMIUM_PATH?.trim();
  if (custom && existsSync(custom))
    return { path: custom, source: 'LATTIZ_CHROMIUM_PATH' };
  return null;
}
