import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Page } from 'playwright';
import { GIROS } from '../../giros';
import { FONT_PAIRS, SHAPES } from '../spec/presets';
import { composeTheme } from '../spec/theme';
import type { Theme } from '../types';
import { escapeHtml } from './dom';
import { paths } from './paths';
import { ensurePlaceholder } from './placeholders';
import {
  STYLE_OPTIONS,
  styleVariables,
  type StyleKey,
  type ThemeStyle,
} from './style';
import { googleFontsHref, themeRootCss } from './theme';

/**
 * Before/after specimen of every style preset: one small demo block (photo, two cards, a button,
 * a section divider) that reads the new tokens exactly as a new variant would, with fallbacks.
 */

/** The token contract a new variant follows, shown working: every var() has today's look as fallback. */
export const TOKEN_DEMO_CSS = `
.tk-prev{height:48px;background:var(--lz-color-bg)}
.tk{border-top:var(--lz-divider,none);padding:calc(56px * var(--lz-space)) 0;background:var(--lz-color-bg);color:var(--lz-color-text);font-family:var(--lz-font-body)}
.tk__in{max-width:var(--lz-container);margin:0 auto;padding:0 var(--lz-gutter)}
.tk__kicker{margin:0;font:600 calc(12px * var(--lz-text-scale))/1.4 var(--lz-font-body);letter-spacing:.08em;text-transform:uppercase;color:var(--lz-color-muted)}
.tk__title{margin:.2em 0 .7em;font-family:var(--lz-font-display);font-weight:var(--lz-display-weight);line-height:var(--lz-display-leading);text-transform:var(--lz-display-transform);letter-spacing:var(--lz-display-tracking,0em);font-size:calc(clamp(32px,4vw,56px) * var(--lz-display-scale));text-wrap:balance}
.tk__grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(0,1fr);gap:var(--lz-gap,24px);align-items:start}
.tk__figure{position:relative;margin:0;padding:var(--lz-img-pad,0px);background:var(--lz-img-frame,transparent);border:var(--lz-img-ring,none);border-radius:var(--lz-img-shape,var(--lz-radius-card))}
.tk__figure::before{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--lz-img-offset-bg,transparent);transform:translate(var(--lz-img-offset,0px),var(--lz-img-offset,0px))}
.tk__img{position:relative;display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:var(--lz-img-shape,var(--lz-radius-card));background:var(--lz-color-surface-2);filter:var(--lz-photo-filter)}
.tk__figure::after{content:"";position:absolute;inset:var(--lz-img-pad,0px);border-radius:var(--lz-img-shape,var(--lz-radius-card));background:var(--lz-img-overlay,transparent);mix-blend-mode:var(--lz-img-blend,normal);pointer-events:none}
.tk__card{display:grid;gap:calc(10px * var(--lz-space));background:var(--lz-card-bg,var(--lz-color-surface));border:var(--lz-card-border,var(--lz-border-width) solid var(--lz-color-line));box-shadow:var(--lz-card-shadow,none);border-radius:var(--lz-radius-card);padding:var(--lz-card-pad,calc(24px * var(--lz-space)))}
.tk__name{margin:0;font-family:var(--lz-font-display);font-weight:var(--lz-display-weight);font-size:calc(26px * var(--lz-heading-scale,1));line-height:1.1;text-transform:var(--lz-display-transform);letter-spacing:var(--lz-display-tracking,0em)}
.tk__text{margin:0;font-size:calc(16px * var(--lz-text-scale));line-height:1.55;color:var(--lz-color-muted);max-width:60ch}
.tk__price{font-variant-numeric:tabular-nums;font-weight:600}
.tk__btn{justify-self:start;display:inline-flex;align-items:center;min-height:44px;padding:0 calc(20px * var(--lz-space));border-radius:var(--lz-radius-pill);background:var(--lz-color-accent);color:var(--lz-color-on-accent);font-weight:600;text-decoration:none;touch-action:manipulation;transition:transform var(--lz-dur-press,120ms) var(--lz-ease-out,cubic-bezier(.23,1,.32,1))}
.tk__btn:active{transform:scale(var(--lz-press-scale,.97))}
.tk__btn:focus-visible{outline:2px solid var(--lz-color-text);outline-offset:3px}
@media (hover:hover) and (pointer:fine){.tk__btn{transition:transform var(--lz-dur-press,120ms) var(--lz-ease-out,cubic-bezier(.23,1,.32,1)),opacity var(--lz-dur-ui,160ms) ease}.tk__btn:hover{opacity:.88}}
@media (prefers-reduced-motion:reduce){.tk__btn{transition:none}.tk__btn:active{transform:none}}
@media (max-width:992px){.tk__grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.tk__figure{grid-column:1/-1}}
@media (max-width:480px){.tk__grid{grid-template-columns:minmax(0,1fr)}}
`;

function demoTheme(style: ThemeStyle | undefined, dark = false): Theme {
  const palette = dark
    ? GIROS.barberia.palettes.oxido
    : GIROS.barberia.palettes['norte-atelier'];
  return composeTheme({
    name: 'demo',
    label: 'demo',
    tier: 'pro',
    palette,
    fontPair: {
      id: 'playfair-display+inter',
      fonts: FONT_PAIRS['playfair-display+inter'],
    },
    shape: SHAPES.sutil,
    brand: style ? { style } : {},
  });
}

function block(img: string): string {
  return `<section class="tk"><div class="tk__in"><p class="tk__kicker">Servicios</p><h2 class="tk__title">Corte, barba y <span class="lz-title__serif">calma</span></h2><div class="tk__grid"><figure class="tk__figure"><img class="tk__img" src="${img}" width="800" height="1000" alt="Barbero recortando una barba"></figure><article class="tk__card"><h3 class="tk__name">Corte clásico</h3><p class="tk__text">Tijera y máquina, lavado y peinado. Unos 45 minutos.</p><span class="tk__price">Desde $350</span><a class="tk__btn" href="#">Reservar</a></article><article class="tk__card"><h3 class="tk__name">Barba con toalla caliente</h3><p class="tk__text">Perfilado a navaja y aceite. Unos 30 minutos.</p><span class="tk__price">Desde $280</span><a class="tk__btn" href="#">Reservar</a></article></div></div></section>`;
}

export async function styleSheet(
  page: Page,
  out: string,
): Promise<{ page: string; shots: number }> {
  const dir = resolve(out, 'tokens');
  mkdirSync(dir, { recursive: true });
  const core = readFileSync(paths.core, 'utf8');
  const cases: {
    key: StyleKey | 'base';
    value: string;
    style?: ThemeStyle;
    dark?: boolean;
  }[] = [
    { key: 'base', value: 'sin style (legacy)' },
    { key: 'base', value: 'sin style, oscuro', dark: true },
  ];
  for (const key of Object.keys(STYLE_OPTIONS) as StyleKey[])
    for (const value of STYLE_OPTIONS[key])
      cases.push({ key, value, style: { [key]: value } as ThemeStyle });
  cases.push({
    key: 'surface',
    value: 'elevated, oscuro',
    style: { surface: 'elevated' },
    dark: true,
  });
  cases.push({
    key: 'imageTreatment',
    value: 'duotone-overlay, oscuro',
    style: { imageTreatment: 'duotone-overlay' },
    dark: true,
  });
  const rows: string[] = [];
  let shots = 0;
  for (const [i, c] of cases.entries()) {
    const theme = demoTheme(c.style, c.dark);
    const imgFile = resolve(
      out,
      'assets',
      'tokens',
      c.dark ? 'oscuro.jpg' : 'claro.jpg',
    );
    await ensurePlaceholder(imgFile, 800, 1000, theme, 'barberia');
    const file = resolve(
      dir,
      `${String(i).padStart(2, '0')}-${c.key}-${c.value.replace(/[^a-z0-9]+/gi, '-')}.html`,
    );
    writeFileSync(
      file,
      `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(`${c.key}: ${c.value}`)}</title><link href="${escapeHtml(googleFontsHref(theme))}" rel="stylesheet"><style>${themeRootCss(theme)}\n${core}\n${TOKEN_DEMO_CSS}</style></head><body><div class="lz-page lz-page--pro"><main><div class="tk-prev"></div>${block(relative(dir, imgFile))}</main></div></body></html>\n`,
    );
    const png = file.replace(/\.html$/, '.png');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page
      .goto(pathToFileURL(file).href, {
        waitUntil: 'networkidle',
        timeout: 20_000,
      })
      .catch(() => page.waitForLoadState('load'));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: png, fullPage: true });
    shots += 1;
    const tokens = c.style
      ? styleVariables(c.style).filter(
          ([k]) =>
            !k.startsWith('--lz-ease') &&
            !k.startsWith('--lz-dur') &&
            k !== '--lz-press-scale',
        )
      : [];
    rows.push(
      `<div class="row"><div class="meta"><b>${escapeHtml(c.key === 'base' ? 'Línea base' : c.key)}</b>${escapeHtml(c.value)}<br><a href="tokens/${relative(dir, file)}">abrir</a></div><img loading="lazy" src="tokens/${relative(dir, png)}" alt="${escapeHtml(`${c.key} ${c.value}`)}"><div class="meta">${tokens.length ? `<code>${tokens.map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(v)}`).join('<br>')}</code>` : 'ningún token nuevo en :root'}</div></div>`,
    );
  }
  const sheet = resolve(out, 'tokens.html');
  writeFileSync(
    sheet,
    `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><title>Tokens de estilo</title><style>body{margin:0;font:15px/1.5 system-ui,sans-serif;background:#f3f3f1;color:#161616}header{padding:24px 32px;background:#161616;color:#fafafa}header a{color:#fafafa}h1{margin:0 0 4px;font-size:22px}p.note{margin:16px 32px;max-width:90ch;color:#444}.row{display:grid;grid-template-columns:180px 760px 1fr;gap:16px;align-items:start;padding:16px 32px;border-top:1px solid #ddd}.row img{width:100%;border:1px solid #ccc}.meta{font-size:13px;color:#444}.meta b{display:block;color:#161616}code{font-size:11px}</style></head><body><header><h1>Tokens de estilo (antes / después)</h1><a href="index.html">← galería</a></header><p class="note">Un bloque de demostración (foto, dos tarjetas, botón, separador) que lee los tokens nuevos como lo hará una variante nueva: cada <code>var()</code> trae de respaldo el look de hoy. Primera fila: tema sin <code>style</code> (lo que ven las plantillas legacy). Cada fila siguiente activa un solo preset. Interacción (presión, hover, foco) con <code>--lz-ease-out</code>, <code>--lz-dur-press</code>, <code>--lz-press-scale</code>: no se ve en una captura.</p>${rows.join('\n')}</body></html>\n`,
  );
  return { page: sheet, shots };
}
