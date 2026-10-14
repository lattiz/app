import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright';
import { GIROS } from '../../giros';
import { EXTENDED_FONT_PAIRS } from '../../font-pairs';
import { EXTENDED_PALETTES } from '../../palettes';
import type { GiroDefinition } from '../spec/giro';
import { isLegacyVariant } from '../spec/catalog';
import { COPY_LIMITS } from '../spec/copy-lint';
import { missingPaths } from '../spec/copy-keys';
import {
  FONT_PAIRS,
  type FontPairPreset,
  type GiroPalette,
} from '../spec/presets';
import { composeTheme, paletteFindings } from '../spec/theme';
import type {
  Business,
  ContentObject,
  ContentValue,
  SectionMeta,
  Theme,
} from '../types';
import { contrastRatio, hueOf, parseColor } from './color';
import { styleSheet } from './gallery-style';
import { primitiveSheet } from './gallery-primitives';
import { directionSheet } from './gallery-directions';
import { mapsLinkUrl, renderSection } from './content';
import { escapeHtml } from './dom';
import { loadSectionMeta, loadTheme } from './load';
import { paths, REPO_ROOT, sectionDir } from './paths';
import { ensurePlaceholder } from './placeholders';
import {
  googleFontsHref,
  themeResolver,
  themeRootCss,
  tokenColor,
} from './theme';

/**
 * Visual QA harness (no full `lattiz check`): every section variant through the kit's real CSS in a
 * light and a dark theme, with demo, short and long stress copy, at 390 and 1440; palette specimens
 * with contrast; font pair specimens with a Spanish glyph test. One browser, sequential, always
 * closed. Output: .lattiz/gallery/ (untracked).
 */

export const GALLERY_DIR = resolve(REPO_ROOT, '.lattiz/gallery');
export const GALLERY_WIDTHS = [390, 1440] as const;
export type CopyMode = 'demo' | 'corto' | 'largo' | 'sin-imagen';

export interface GalleryOptions {
  /** Only these slots' section sheets (default: every slot). */
  slots?: string[];
  /** Only the variants outside the legacy catalog (src/spec/catalog.ts). */
  extendedOnly?: boolean;
  sections?: boolean;
  palettes?: boolean;
  fonts?: boolean;
  /** Style presets before/after (src/lib/style.ts). */
  tokens?: boolean;
  /** Primitive styles (primitives/) in three themes at 390 and 1440. */
  primitives?: boolean;
  /** Art-direction proofs: a twin per direction in two giros, built from specs (opt-in, slow). */
  directions?: boolean;
  /** Theme names under themes/ (default: one light, one dark). */
  themes?: string[];
  /** Adds a mode whose images point at missing files (the no-image fallback). */
  noImage?: boolean;
  out?: string;
  log?: (line: string) => void;
}

export interface GalleryResult {
  out: string;
  index: string;
  pages: string[];
  shots: number;
  ms: number;
}

export const DEFAULT_THEMES = ['norte-atelier', 'oxido'];

const GLYPHS = 'ñ á é í ó ú ü Ñ Á É Í Ó Ú Ü ¿ ¡ “ ” « » — … $1,250.00';
const FILLER = [
  'atención',
  'personalizada',
  'acompañamiento',
  'profesional',
  'cuidadosamente',
  'tradición',
  'artesanal',
  'Ñuñoa',
  'extraordinariamente',
  'Domínguez',
  'anticonstitucionalmente',
  'mañanas',
];
/** Keys whose value is a URL, an image or a number the layout never wraps. */
const SKIP = new Set([
  'image',
  'href',
  'secondaryHref',
  'directionsUrl',
  'mapUrl',
  'mapTitle',
  'score',
  'cta',
]);

async function launch(): Promise<Browser> {
  try {
    return await chromium.launch();
  } catch (first) {
    const path = process.env.LATTIZ_CHROMIUM_PATH?.trim();
    if (path && existsSync(path))
      return chromium.launch({ executablePath: path });
    try {
      return await chromium.launch({ channel: 'chrome' });
    } catch {
      throw first;
    }
  }
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const isObject = (v: unknown): v is ContentObject =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export function businessFor(giro: GiroDefinition, mode: CopyMode): Business {
  const base: Business = {
    name: 'Casa Ejemplo',
    shortName: 'Ejemplo',
    tagline: giro.business.tagline,
    city: giro.business.city,
    phone: giro.business.phone,
    whatsapp: giro.business.whatsapp,
    whatsappMessage: giro.business.whatsappMessage,
    address: giro.business.address,
    year: '2026',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    facebookUrl: 'https://facebook.com',
    email: 'hola@casaejemplo.mx',
    googleReviewsUrl: 'https://www.google.com/search?q=casa+ejemplo',
    googleReviewUrl:
      'https://www.google.com/maps/search/?api=1&query=casa+ejemplo',
  };
  if (mode === 'corto')
    return { ...base, name: 'Jo', shortName: 'Jo', tagline: 'Hola' };
  if (mode === 'largo')
    return {
      ...base,
      name: 'Peluquería y Barbería Hermanos Domínguez-Echeverría',
      shortName: 'Hermanos Domínguez',
      email: 'contacto.reservaciones@barberiahermanosdominguez.com.mx',
      address:
        'Avenida Insurgentes Sur 1458, Interior 12-B, Colonia Actipan, Alcaldía Benito Juárez, Ciudad de México',
    };
  return base;
}

/** Links, branches and the single branch the compiler normally derives from the spec. */
function derived(
  slot: string,
  giro: GiroDefinition,
  business: Business,
  mode: CopyMode,
): ContentObject {
  const anchors: [string, string][] = [
    ['about', '#nosotros'],
    ['services', '#servicios'],
    ['team', '#equipo'],
    ['faq', '#preguntas'],
    ['locations', '#sucursales'],
  ];
  const links = anchors
    .slice(0, mode === 'corto' ? 3 : 5)
    .map(([s, href]) => ({ label: giro.navLabels[s] ?? s, href }));
  const hours =
    mode === 'largo'
      ? 'Lun–Vie 9:00–14:00 y 16:00–20:00 · Sáb 9:00–18:00 · Dom cerrado'
      : giro.business.hours;
  const card = (name: string) => ({
    name,
    address: business.address,
    hours,
    directionsUrl: mapsLinkUrl(business.address),
    mapUrl: 'about:blank',
    mapTitle: `Mapa de la sucursal ${name}`,
  });
  const names =
    mode === 'largo'
      ? ['Colonia Santa María la Ribera', 'Ciudad Satélite, Naucalpan']
      : [giro.business.branch, 'Centro'];
  if (slot === 'navbar') return { links };
  if (slot === 'footer')
    return {
      links,
      branches: names.map((n) => ({
        name: n,
        address: business.address,
        hours,
      })),
    };
  if (slot === 'locations')
    return { branch: card(names[0]), branches: names.map(card) };
  return {};
}

/** First giro (barbería first) whose copy, plus the variant's sample, has every key it reads. */
export function copySource(slot: string, meta: SectionMeta): GiroDefinition {
  const order = [
    'barberia',
    ...Object.keys(GIROS).filter((g) => g !== 'barberia'),
  ];
  for (const id of order) {
    const data = { ...(GIROS[id].copy[slot] ?? {}), ...(meta.sample ?? {}) };
    if (meta.contentKeys.every((k) => missingPaths(data, k).length === 0))
      return GIROS[id];
  }
  return GIROS.barberia;
}

function pad(text: string, target: number): string {
  let out = text.trim();
  let i = 0;
  while (out.replace(/<[^>]*>/g, '').length < target)
    out += ` ${FILLER[i++ % FILLER.length]}`;
  const visible = out.replace(/<[^>]*>/g, '');
  if (visible.length <= target || /<[^>]*>/.test(out)) return out;
  return out.slice(
    0,
    out.lastIndexOf(' ', target) > 0 ? out.lastIndexOf(' ', target) : target,
  );
}

/** Short copy: 3 items per list, two words per plain string. Long: 8 items, strings at their limit. */
function stress(
  value: ContentValue,
  path: string,
  mode: CopyMode,
): ContentValue {
  const key = path.split('.').at(-1)?.replace('[]', '') ?? '';
  if (Array.isArray(value)) {
    if (value.length === 0) return value;
    const n = key === 'links' ? value.length : mode === 'corto' ? 3 : 8;
    const list = Array.from({ length: n }, (_, i) =>
      clone(value[i % value.length]),
    );
    return list.map((v) => stress(v, `${path}[]`, mode));
  }
  if (isObject(value))
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        stress(v, path ? `${path}.${k}` : k, mode),
      ]),
    );
  if (
    typeof value !== 'string' ||
    SKIP.has(key) ||
    /^https?:|^#|\.(jpe?g|png|webp)$/.test(value)
  )
    return value;
  if (mode === 'corto')
    return /<[^>]*>/.test(value)
      ? value
      : value.split(/\s+/).slice(0, 2).join(' ');
  const limit = COPY_LIMITS[path] ?? Math.round(value.length * 1.25);
  return pad(value, limit);
}

export function sectionData(
  slot: string,
  giro: GiroDefinition,
  business: Business,
  mode: CopyMode,
  sample: ContentObject = {},
): ContentObject {
  const base = clone({ ...(giro.copy[slot] ?? {}), ...sample });
  const data =
    mode === 'demo' || mode === 'sin-imagen'
      ? base
      : (stress(base, slot, mode) as ContentObject);
  return { ...data, ...derived(slot, giro, business, mode) };
}

function pageHtml(
  theme: Theme,
  title: string,
  body: string,
  css: string,
): string {
  return `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${escapeHtml(googleFontsHref(theme))}" rel="stylesheet"><style>${css}</style></head><body>${body}</body></html>\n`;
}

async function open(page: Page, file: string): Promise<void> {
  await page
    .goto(pathToFileURL(file).href, {
      waitUntil: 'networkidle',
      timeout: 20_000,
    })
    .catch(() => page.waitForLoadState('load'));
  await page.evaluate(() => document.fonts.ready);
}

async function shoot(
  page: Page,
  file: string,
  png: (w: number) => string,
): Promise<number> {
  let n = 0;
  for (const width of GALLERY_WIDTHS) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await open(page, file);
    await page.screenshot({ path: png(width), fullPage: true });
    n += 1;
  }
  return n;
}

const SHEET_CSS = `
body{margin:0;font:15px/1.5 system-ui,sans-serif;background:#f3f3f1;color:#161616}
header{padding:24px 32px;background:#161616;color:#fafafa}header a{color:#fafafa}
h1{margin:0 0 4px;font-size:22px}h2{margin:40px 32px 8px;font-size:18px}
p.note{margin:0 32px 16px;color:#555;max-width:90ch}
.row{display:grid;grid-template-columns:160px 300px 1fr;gap:16px;align-items:start;padding:16px 32px;border-top:1px solid #ddd}
.row img{width:100%;border:1px solid #ccc;background:#fff}
.meta{font-size:13px;color:#444}.meta b{display:block;color:#161616}
nav.toc{padding:12px 32px;display:flex;flex-wrap:wrap;gap:8px 16px}
table{border-collapse:collapse;margin:0 32px 32px}td,th{padding:4px 8px;border-bottom:1px solid #ddd;text-align:left;font-size:13px}
.pass{color:#0a6b2d;font-weight:600}.fail{color:#b00020;font-weight:600}
`;

function sheet(title: string, intro: string, body: string): string {
  return `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>${SHEET_CSS}</style></head><body><header><h1>${escapeHtml(title)}</h1><a href="../index.html">← galería</a></header><p class="note">${intro}</p>${body}</body></html>\n`;
}

function variantsOf(slot: string, extendedOnly = false): string[] {
  const dir = resolve(paths.sections, slot);
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((v) => !extendedOnly || !isLegacyVariant(slot, v))
    .sort();
}

async function sectionSheets(
  page: Page,
  out: string,
  opts: Required<Pick<GalleryOptions, 'themes' | 'noImage'>> & {
    slots: string[];
    extendedOnly: boolean;
    log: (l: string) => void;
  },
): Promise<{ pages: string[]; shots: number }> {
  const core = readFileSync(paths.core, 'utf8');
  const themes = opts.themes.map((t) => loadTheme(t));
  const modes: CopyMode[] = [
    'demo',
    'corto',
    'largo',
    ...(opts.noImage ? (['sin-imagen'] as const) : []),
  ];
  const pages: string[] = [];
  let shots = 0;
  for (const slot of opts.slots) {
    const rows: string[] = [];
    const variants = variantsOf(slot, opts.extendedOnly);
    if (variants.length === 0) continue;
    for (const variant of variants) {
      const meta = await loadSectionMeta(slot, variant);
      const giro = copySource(slot, meta);
      const css = readFileSync(
        resolve(sectionDir(slot, variant), 'section.css'),
        'utf8',
      );
      const html = readFileSync(
        resolve(sectionDir(slot, variant), 'section.html'),
        'utf8',
      );
      for (const theme of themes) {
        for (const mode of modes) {
          const business = businessFor(giro, mode);
          const data = sectionData(slot, giro, business, mode, meta.sample);
          const dir = resolve(out, 'sections', slot, variant);
          mkdirSync(dir, { recursive: true });
          const root = renderSection(html, data, {
            business,
            index: '02',
            source: `sections/${slot}/${variant}/section.html`,
          });
          for (const img of Array.from(root.querySelectorAll('img[src]'))) {
            const src = img.getAttribute('src') ?? '';
            if (/^([a-z]+:|\/|#)/i.test(src)) continue;
            const name = src.split('/').at(-1) as string;
            const file = resolve(out, 'assets', giro.id, theme.name, name);
            if (mode === 'sin-imagen') {
              img.setAttribute('src', 'falta.jpg');
              continue;
            }
            const size = meta.placeholder ?? { width: 1200, height: 800 };
            await ensurePlaceholder(
              file,
              size.width,
              size.height,
              theme,
              giro.id,
            );
            img.setAttribute('src', relative(dir, file));
          }
          const tier = meta.tiers
            ? meta.tiers.includes('pro')
              ? 'pro'
              : 'basic'
            : ['brief', 'single'].includes(variant)
              ? 'basic'
              : 'pro';
          const section = root.outerHTML;
          const body =
            meta.region === 'main'
              ? `<div class="lz-page lz-page--${tier}"><main>${section}</main></div>`
              : `<div class="lz-page lz-page--${tier}">${section}<main></main></div>`;
          const file = resolve(dir, `${theme.name}--${mode}.html`);
          writeFileSync(
            file,
            pageHtml(
              theme,
              `${slot}/${variant} · ${theme.name} · ${mode}`,
              body,
              `${themeRootCss(theme)}\n${core}\n${css}`,
            ),
          );
          const png = (w: number) =>
            resolve(dir, `${theme.name}--${mode}--${w}.png`);
          shots += await shoot(page, file, png);
          rows.push(
            `<div class="row"><div class="meta"><b>${variant}</b>${theme.name} · ${mode}<br>copy de ${giro.id}<br><a href="${relative(resolve(out, 'sections'), file)}">abrir</a></div><img loading="lazy" src="${relative(resolve(out, 'sections'), png(390))}" alt="${slot}/${variant} a 390"><img loading="lazy" src="${relative(resolve(out, 'sections'), png(1440))}" alt="${slot}/${variant} a 1440"></div>`,
          );
        }
      }
      opts.log(`  ✓ ${slot}/${variant}`);
    }
    const page_ = resolve(out, 'sections', `${slot}.html`);
    writeFileSync(
      page_,
      sheet(
        `Sección ${slot}`,
        `Cada variante con el CSS real del kit en ${opts.themes.join(' y ')}: copy demo, corto (3 elementos, dos palabras) y largo (8 elementos, textos al límite de COPY_LIMITS, nombre y correo largos). Columnas: 390 px y 1440 px, página completa.`,
        rows.join('\n'),
      ),
    );
    pages.push(page_);
  }
  return { pages, shots };
}

function probe(p: GiroPalette): Theme {
  return composeTheme({
    name: 'probe',
    label: 'probe',
    tier: 'pro',
    palette: p,
    fontPair: { id: 'probe', fonts: FONT_PAIRS['playfair-display+inter'] },
    shape: {
      label: 'probe',
      radiusCard: '8px',
      radiusPill: '999px',
      border: '1px',
      shadow: 'none',
      density: 'regular',
      archetype: 'editorial-atelier',
    },
    brand: {},
  });
}

export const CONTRAST_PAIRS: [string, string, number][] = [
  ['text', 'bg', 4.5],
  ['muted', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['on-accent', 'accent', 4.5],
  ['accent-text', 'bg', 3],
];

export function paletteContrast(
  p: GiroPalette,
): { pair: string; ratio: number; min: number }[] {
  const theme = probe(p);
  return CONTRAST_PAIRS.map(([fg, bg, min]) => {
    const a = tokenColor(theme, fg as never);
    const b = tokenColor(theme, bg as never);
    return {
      pair: `${fg}/${bg}`,
      ratio: a && b ? Math.round(contrastRatio(a, b) * 100) / 100 : 0,
      min,
    };
  });
}

export function allPalettes(): {
  id: string;
  source: string;
  palette: GiroPalette;
  mode: string;
  mood: string[];
}[] {
  const out: {
    id: string;
    source: string;
    palette: GiroPalette;
    mode: string;
    mood: string[];
  }[] = [];
  for (const giro of Object.values(GIROS))
    for (const [id, palette] of Object.entries(giro.palettes))
      out.push({
        id: `${giro.id}:${id}`,
        source: `giro ${giro.id}`,
        palette,
        mode: palette.scheme,
        mood: [],
      });
  for (const [id, palette] of Object.entries(EXTENDED_PALETTES))
    out.push({
      id,
      source: `biblioteca (afinidad: ${palette.affinity.join(', ')})`,
      palette,
      mode: palette.mode,
      mood: palette.mood,
    });
  return out;
}

async function paletteSheet(
  page: Page,
  out: string,
): Promise<{ page: string; shots: number }> {
  const cards = allPalettes().map(({ id, source, palette, mode, mood }) => {
    const theme = probe(palette);
    const vars = [...themeResolverEntries(theme)]
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
    const findings = paletteFindings(palette);
    const accent = parseColor(palette.colors.accent);
    const hue = accent ? hueOf(accent) : null;
    const rows = paletteContrast(palette)
      .map(
        (r) =>
          `<tr><td>${r.pair}</td><td>${r.ratio.toFixed(2)}:1</td><td class="${r.ratio >= r.min ? 'pass' : 'fail'}">${r.ratio >= r.min ? 'PASS' : 'FAIL'} (≥ ${r.min})</td></tr>`,
      )
      .join('');
    return `<article class="pal" data-id="${escapeHtml(id)}"><div class="swatch" style="${escapeHtml(vars)}"><p class="k">${escapeHtml(mode)}${mood.length ? ` · ${escapeHtml(mood.join(', '))}` : ''}</p><h3>${escapeHtml(palette.label)}</h3><p>Texto de cuerpo sobre el fondo, con <a href="#">un enlace</a> y <span class="m">texto secundario</span>.</p><div class="card"><b>Tarjeta</b><span class="m">Desde $350</span></div><span class="btn">Reservar</span><span class="line"></span></div><div class="info"><b>${escapeHtml(id)}</b> <span class="${findings.length ? 'fail' : 'pass'}">${findings.length ? 'FAIL' : 'PASS AA'}</span><br><small>${escapeHtml(source)} · acento ${escapeHtml(palette.colors.accent)} ${hue && hue.chroma > 0.08 ? `${Math.round(hue.hue)}°` : 'gris'}</small><table>${rows}</table>${findings.length ? `<p class="fail">${escapeHtml(findings.join('; '))}</p>` : ''}</div></article>`;
  });
  const css = `${SHEET_CSS}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;padding:24px 32px}
.pal{background:#fff;border:1px solid #ddd}
.swatch{background:var(--lz-color-bg);color:var(--lz-color-text);padding:20px;font-family:Georgia,serif;min-height:220px}
.swatch h3{margin:0 0 6px;font-size:20px}.swatch .k{margin:0;font:600 11px/1.4 system-ui;text-transform:uppercase;letter-spacing:.08em;color:var(--lz-color-muted)}
.swatch a{color:var(--lz-color-accent-text)}.swatch .m{color:var(--lz-color-muted)}
.swatch .card{display:flex;justify-content:space-between;background:var(--lz-color-surface);border:1px solid var(--lz-color-line);padding:12px;margin:12px 0}
.swatch .btn{display:inline-block;background:var(--lz-color-accent);color:var(--lz-color-on-accent);padding:10px 18px;border-radius:999px;font:600 14px system-ui}
.swatch .line{display:block;height:1px;background:var(--lz-color-line-strong);margin-top:16px}
.info{padding:12px 16px}.info table{margin:8px 0 0}`;
  const html = `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><title>Paletas</title><style>${css}</style></head><body><header><h1>Paletas (${cards.length})</h1><a href="index.html">← galería</a></header><p class="note">Cada paleta como mini página: fondo, superficie, texto, secundario, acento como botón y como enlace, filete. Contraste con las reglas de kit:validate (AA 4.5:1 texto, 3:1 acento como texto). PASS AA = sin hallazgos de kit:validate.</p><div class="grid">${cards.join('')}</div></body></html>\n`;
  const file = resolve(out, 'palettes.html');
  writeFileSync(file, html);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, file);
  await page.screenshot({ path: resolve(out, 'palettes.png'), fullPage: true });
  return { page: file, shots: 1 };
}

function themeResolverEntries(theme: Theme): Map<string, string> {
  const resolve_ = themeResolver(theme);
  const out = new Map<string, string>();
  for (const t of Object.keys(theme.colors)) {
    const v = resolve_(`--lz-color-${t}`);
    if (v) out.set(`--lz-color-${t}`, v);
  }
  return out;
}

export function allFontPairs(): {
  id: string;
  pair: FontPairPreset;
  extended: boolean;
  mood: string[];
}[] {
  return [
    ...Object.entries(FONT_PAIRS).map(([id, pair]) => ({
      id,
      pair,
      extended: false,
      mood: [] as string[],
    })),
    ...Object.entries(EXTENDED_FONT_PAIRS).map(([id, pair]) => ({
      id,
      pair,
      extended: true,
      mood: pair.mood,
    })),
  ];
}

async function fontSheet(
  page: Page,
  out: string,
): Promise<{ page: string; shots: number }> {
  const pairs = allFontPairs();
  const links = [
    ...new Set(
      pairs.map(
        (p) =>
          `https://fonts.googleapis.com/css2?${p.pair.googleFonts}&display=swap`,
      ),
    ),
  ]
    .map((href) => `<link href="${escapeHtml(href)}" rel="stylesheet">`)
    .join('');
  const cards = pairs.map(({ id, pair, extended, mood }) => {
    const scale = Number(pair.displayScale ?? '1');
    const style = [
      `--d:${pair.display}`,
      `--s:${pair.serif}`,
      `--b:${pair.body}`,
      `--m:${pair.mono ?? pair.body}`,
      `--tt:${pair.displayTransform}`,
      `--lh:${pair.displayLeading}`,
      `--w:${pair.displayWeight}`,
      `--sc:${scale}`,
      `--as:${pair.accentStyle}`,
      `--at:${pair.accentTransform}`,
    ].join(';');
    return `<article class="fp" style="${escapeHtml(style)}"><p class="k">${escapeHtml(id)}${extended ? ' · nuevo' : ''}${mood.length ? ` · ${escapeHtml(mood.join(', '))}` : ''} · escala ${scale}</p><p class="d">Corte clásico, <span class="a">sin prisa</span></p><p class="h">Agenda tu cita en Coyoacán</p><p class="b">Atendemos de martes a sábado. Pregunta por el diseño de barba con toalla caliente y el corte infantil; los precios incluyen IVA.</p><p class="g d2">${GLYPHS}</p><p class="g">${GLYPHS}</p><p class="mono">10:00–20:00 · $350 · 01</p></article>`;
  });
  const css = `${SHEET_CSS}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:20px;padding:24px 32px}
.fp{background:#fff;border:1px solid #ddd;padding:20px 24px}
.fp .k{margin:0 0 8px;font:600 11px/1.4 system-ui;text-transform:uppercase;letter-spacing:.06em;color:#666}
.fp .d,.fp .d2{font-family:var(--d);font-weight:var(--w);line-height:var(--lh);text-transform:var(--tt);font-size:calc(56px * var(--sc));margin:0 0 12px;letter-spacing:-.01em}
.fp .d2{font-size:calc(28px * var(--sc))}
.fp .a{font-family:var(--s);font-style:var(--as);font-weight:400;text-transform:var(--at)}
.fp .h{font-family:var(--d);font-weight:var(--w);text-transform:var(--tt);font-size:calc(28px * var(--sc));line-height:1.1;margin:0 0 10px}
.fp .b{font-family:var(--b);font-size:17px;line-height:1.6;max-width:60ch;margin:0 0 10px}
.fp .g{font-family:var(--b);font-size:16px;margin:0 0 8px}
.fp .mono{font-family:var(--m);font-size:13px;letter-spacing:.06em;margin:0}`;
  const html = `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><title>Pares tipográficos</title>${links}<style>${css}</style></head><body><header><h1>Pares tipográficos (${pairs.length})</h1><a href="index.html">← galería</a></header><p class="note">Display, encabezado, cuerpo y acento con la escala real del par (displayScale) y prueba de glifos en español (en display y en cuerpo).</p><div class="grid">${cards.join('')}</div></body></html>\n`;
  const file = resolve(out, 'fonts.html');
  writeFileSync(file, html);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, file);
  await page.screenshot({ path: resolve(out, 'fonts.png'), fullPage: true });
  return { page: file, shots: 1 };
}

export async function kitGallery(
  opts: GalleryOptions = {},
): Promise<GalleryResult> {
  const started = Date.now();
  const out = opts.out ?? GALLERY_DIR;
  const log = opts.log ?? (() => {});
  const any =
    opts.sections ||
    opts.palettes ||
    opts.fonts ||
    opts.tokens ||
    opts.primitives ||
    opts.directions ||
    (opts.slots?.length ?? 0) > 0;
  const want = {
    sections: any ? Boolean(opts.sections || opts.slots?.length) : true,
    palettes: any ? Boolean(opts.palettes) : true,
    fonts: any ? Boolean(opts.fonts) : true,
    tokens: any ? Boolean(opts.tokens) : true,
    primitives: any ? Boolean(opts.primitives) : true,
    // Builds twelve specs: only when asked for.
    directions: Boolean(opts.directions),
  };
  const slots = opts.slots?.length
    ? opts.slots
    : readdirSync(paths.sections, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();
  for (const s of slots)
    if (!existsSync(resolve(paths.sections, s)))
      throw new Error(`no existe el slot "${s}"`);
  mkdirSync(out, { recursive: true });
  if (want.sections)
    for (const s of slots)
      rmSync(resolve(out, 'sections', s), { recursive: true, force: true });
  const pages: string[] = [];
  let shots = 0;
  const browser = await launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    if (want.sections) {
      log('Secciones');
      const r = await sectionSheets(page, out, {
        slots,
        extendedOnly: Boolean(opts.extendedOnly),
        themes: opts.themes ?? DEFAULT_THEMES,
        noImage: Boolean(opts.noImage),
        log,
      });
      pages.push(...r.pages);
      shots += r.shots;
    }
    if (want.palettes) {
      const r = await paletteSheet(page, out);
      pages.push(r.page);
      shots += r.shots;
      log('  ✓ paletas');
    }
    if (want.tokens) {
      const r = await styleSheet(page, out);
      pages.push(r.page);
      shots += r.shots;
      log('  ✓ tokens de estilo');
    }
    if (want.primitives) {
      const r = await primitiveSheet(page, out);
      pages.push(r.page);
      shots += r.shots;
      log('  ✓ primitivos');
    }
    if (want.directions) {
      log('Direcciones de arte');
      const r = await directionSheet(page, out, log);
      pages.push(r.page);
      shots += r.shots;
      log(`  ✓ direcciones (${r.proofs.filter((p) => p.ok).length}/${r.proofs.length} pruebas construidas)`);
    }
    if (want.fonts) {
      const r = await fontSheet(page, out);
      pages.push(r.page);
      shots += r.shots;
      log('  ✓ pares tipográficos');
    }
  } finally {
    await browser.close();
  }
  const index = resolve(out, 'index.html');
  const sheets = existsSync(resolve(out, 'sections'))
    ? readdirSync(resolve(out, 'sections'))
        .filter((f) => f.endsWith('.html'))
        .sort()
    : [];
  writeFileSync(
    index,
    `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><title>Galería del kit</title><style>${SHEET_CSS} li{margin:6px 0}</style></head><body><header><h1>Galería del kit</h1>${escapeHtml(relative(REPO_ROOT, out))} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}</header><ul style="margin:24px 32px">${sheets.map((f) => `<li><a href="sections/${f}">Sección ${f.replace('.html', '')}</a></li>`).join('')}${existsSync(resolve(out, 'palettes.html')) ? '<li><a href="palettes.html">Paletas</a> · <a href="palettes.png">PNG</a></li>' : ''}${existsSync(resolve(out, 'fonts.html')) ? '<li><a href="fonts.html">Pares tipográficos</a> · <a href="fonts.png">PNG</a></li>' : ''}${existsSync(resolve(out, 'tokens.html')) ? '<li><a href="tokens.html">Tokens de estilo (antes / después)</a></li>' : ''}${existsSync(resolve(out, 'primitives.html')) ? '<li><a href="primitives.html">Primitivos</a></li>' : ''}${existsSync(resolve(out, 'directions.html')) ? '<li><a href="directions.html">Direcciones de arte (pruebas)</a></li>' : ''}${existsSync(resolve(out, 'archetypes.html')) ? '<li><a href="archetypes.html">Arquetipos de página (lattiz kit archetypes)</a></li>' : ''}</ul><p class="note">Generada con <code>pnpm lattiz kit gallery</code> (o <code>kit:gallery</code>). Reglas para criticar: docs/template-kit-design-principles.md.</p></body></html>\n`,
  );
  return { out, index, pages, shots, ms: Date.now() - started };
}
