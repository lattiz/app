import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Browser } from 'playwright';
import { GIROS } from '../../giros';
import { fontPairById } from '../spec/catalog';
import { SHAPES } from '../spec/presets';
import { composeTheme } from '../spec/theme';
import { renderSection } from './content';
import { escapeHtml } from './dom';
import { loadSectionMeta } from './load';
import { paths, REPO_ROOT, sectionDir } from './paths';
import { ensurePlaceholder } from './placeholders';
import { googleFontsHref, themeRootCss } from './theme';

/**
 * Font swap sanity check: the navbar + split hero with the kit's real CSS and a pair's fonts, with
 * the web font files held back 1.2 s so the swap happens after first paint. Reports cumulative layout
 * shift and LCP with the metric-matched fallback (what templates ship) and without it.
 */

export interface ClsResult {
  pair: string;
  width: number;
  cls: number;
  clsNoFallback: number;
  lcpMs: number;
}

const OUT = resolve(REPO_ROOT, '.lattiz/fonts-cls');

async function launch(): Promise<Browser> {
  try {
    return await chromium.launch();
  } catch (first) {
    const path = process.env.LATTIZ_CHROMIUM_PATH?.trim();
    if (path) return chromium.launch({ executablePath: path });
    throw first;
  }
}

async function page(pairId: string, fallback: boolean): Promise<string> {
  const fonts = fontPairById(pairId);
  if (!fonts) throw new Error(`par desconocido: ${pairId}`);
  const giro = GIROS.barberia;
  const theme = composeTheme({
    name: 'cls',
    label: 'cls',
    tier: 'pro',
    palette: giro.palettes['norte-atelier'],
    fontPair: { id: pairId, fonts },
    shape: SHAPES.sutil,
    brand: {},
  });
  const business = {
    ...giro.business,
    name: 'Casa Ejemplo',
    shortName: 'Ejemplo',
    year: '2026',
    instagramUrl: '',
    tiktokUrl: '',
    facebookUrl: '',
    email: 'hola@casa.mx',
    googleReviewsUrl: '',
    googleReviewUrl: '',
  };
  const parts: string[] = [];
  let css = readFileSync(paths.core, 'utf8');
  for (const [slot, variant] of [
    ['navbar', 'inline'],
    ['hero', 'split'],
  ] as const) {
    const meta = await loadSectionMeta(slot, variant);
    const data = {
      ...giro.copy[slot],
      ...(slot === 'navbar'
        ? {
            links: [
              { label: 'Servicios', href: '#servicios' },
              { label: 'Nosotros', href: '#nosotros' },
            ],
          }
        : {}),
    };
    const root = renderSection(
      readFileSync(resolve(sectionDir(slot, variant), 'section.html'), 'utf8'),
      data,
      { business, source: `${slot}/${variant}` },
    );
    for (const img of Array.from(root.querySelectorAll('img[src]'))) {
      const file = resolve(
        OUT,
        'assets',
        String(img.getAttribute('src')).split('/').at(-1) as string,
      );
      await ensurePlaceholder(
        file,
        meta.placeholder?.width ?? 1000,
        meta.placeholder?.height ?? 1250,
        theme,
        'barberia',
      );
      img.setAttribute('src', relative(OUT, file));
    }
    parts.push(root.outerHTML);
    css += `\n${readFileSync(resolve(sectionDir(slot, variant), 'section.css'), 'utf8')}`;
  }
  // Arial / Times New Roman / Courier New → their metric-compatible Liberation clones, so a Linux
  // box measures what a Windows/macOS/iOS visitor (who has the real ones) gets. Test page only.
  let root = themeRootCss(theme)
    .replace(
      /local\('Arial'\), local\('ArialMT'\)/g,
      "local('Liberation Sans')",
    )
    .replace(
      /local\('Times New Roman'\), local\('TimesNewRomanPSMT'\)/g,
      "local('Liberation Serif')",
    )
    .replace(
      /local\('Courier New'\), local\('CourierNewPSMT'\)/g,
      "local('Liberation Mono')",
    );
  // Without the fallback: drop the measured @font-face and its name from the stacks.
  if (!fallback)
    root = root
      .replace(/@font-face\s*\{[^}]*\}\s*/g, '')
      .replace(/'[^']+ Fallback', /g, '');
  const file = resolve(
    OUT,
    `${pairId}${fallback ? '' : '--sin-fallback'}.html`,
  );
  mkdirSync(OUT, { recursive: true });
  writeFileSync(
    file,
    `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(pairId)}</title><link href="${escapeHtml(googleFontsHref(theme))}" rel="stylesheet"><style>${root}\n${css}</style></head><body><div class="lz-page lz-page--pro">${parts[0]}<main>${parts[1]}</main></div></body></html>\n`,
  );
  return file;
}

export async function fontCls(
  pairs: string[],
  widths = [390, 1366],
): Promise<ClsResult[]> {
  const browser = await launch();
  const out: ClsResult[] = [];
  try {
    for (const pair of pairs) {
      for (const width of widths) {
        const measure = async (file: string) => {
          const context = await browser.newContext({
            viewport: { width, height: width < 600 ? 844 : 768 },
          });
          const p = await context.newPage();
          await p.addInitScript(() => {
            (window as unknown as { __cls: number; __lcp: number }).__cls = 0;
            new PerformanceObserver((list) => {
              for (const e of list.getEntries() as (PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              })[])
                if (!e.hadRecentInput)
                  (window as unknown as { __cls: number }).__cls += e.value;
            }).observe({ type: 'layout-shift', buffered: true });
            new PerformanceObserver((list) => {
              const last = list.getEntries().at(-1);
              if (last)
                (window as unknown as { __lcp: number }).__lcp = last.startTime;
            }).observe({ type: 'largest-contentful-paint', buffered: true });
          });
          // Hold the font files back so the first paint uses the fallback.
          await p.route('https://fonts.gstatic.com/**', async (route) => {
            await new Promise((r) => setTimeout(r, 1200));
            await route.continue();
          });
          await p.goto(pathToFileURL(file).href, { waitUntil: 'load' });
          await p.evaluate(() => document.fonts.ready);
          await p.waitForTimeout(800);
          const r = await p.evaluate(() => ({
            cls: (window as unknown as { __cls: number }).__cls,
            lcp: (window as unknown as { __lcp: number }).__lcp,
          }));
          await context.close();
          return r;
        };
        const withFallback = await measure(await page(pair, true));
        const without = await measure(await page(pair, false));
        out.push({
          pair,
          width,
          cls: Math.round(withFallback.cls * 1000) / 1000,
          clsNoFallback: Math.round(without.cls * 1000) / 1000,
          lcpMs: Math.round(withFallback.lcp),
        });
      }
    }
  } finally {
    await browser.close();
  }
  return out;
}
