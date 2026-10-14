import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Page } from 'playwright';
import { EXTENDED_FONT_PAIRS } from '../../font-pairs';
import { GIROS } from '../../giros';
import { EXTENDED_PALETTES } from '../../palettes';
import {
  PRIMITIVE_FAMILIES,
  PRIMITIVES,
  type PrimitiveFamily,
  type PrimitiveFamilyId,
} from '../../primitives';
import { FONT_PAIRS, SHAPES } from '../spec/presets';
import { composeTheme } from '../spec/theme';
import type { Theme } from '../types';
import { escapeHtml } from './dom';
import { paths } from './paths';
import { ensurePlaceholder } from './placeholders';
import { primitiveCss } from './primitives';
import type { ThemeStyle } from './style';
import { googleFontsHref, themeRootCss } from './theme';

/**
 * Specimen sheet of every primitive style (kit gallery --primitives): each family in a light legacy
 * theme, a dark one and a theme with style presets, at 390 and 1440 px.
 */

interface Case {
  id: string;
  label: string;
  theme: Theme;
}

function cases(): Case[] {
  const light = composeTheme({
    name: 'prim-claro',
    label: 'Claro, sin style',
    tier: 'pro',
    palette: GIROS.barberia.palettes['norte-atelier'],
    fontPair: {
      id: 'playfair-display+inter',
      fonts: FONT_PAIRS['playfair-display+inter'],
    },
    shape: SHAPES.sutil,
    brand: {},
  });
  const dark = composeTheme({
    name: 'prim-oscuro',
    label: 'Oscuro, sin style',
    tier: 'pro',
    palette: GIROS.barberia.palettes.oxido,
    fontPair: {
      id: 'anton+space-grotesk',
      fonts: FONT_PAIRS['anton+space-grotesk'],
    },
    shape: SHAPES.sutil,
    brand: {},
  });
  const style: ThemeStyle = {
    shape: 'pill',
    surface: 'tinted',
    density: 'airy',
    imageTreatment: 'arch',
    typeScale: 'expressive',
  };
  const styled = composeTheme({
    name: 'prim-estilo',
    label: 'Teñido con style (pill, tinted, arch)',
    tier: 'pro',
    palette: EXTENDED_PALETTES['pal-menta-tinta'],
    fontPair: {
      id: 'fredoka+nunito',
      fonts: EXTENDED_FONT_PAIRS['fredoka+nunito'],
    },
    shape: SHAPES.sutil,
    brand: { style },
  });
  return [
    { id: 'claro', label: light.label, theme: light },
    { id: 'oscuro', label: dark.label, theme: dark },
    { id: 'estilo', label: styled.label, theme: styled },
  ];
}

const ARROW =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 5.3 20 12l-6.8 6.7-1.4-1.4 4.3-4.3H4v-2h12.1l-4.3-4.3z"/></svg>';

const label = (text: string) => `<p class="pg__label">${escapeHtml(text)}</p>`;

function specimen(id: PrimitiveFamilyId, img: string): string {
  const f: PrimitiveFamily = PRIMITIVES[id];
  const styles = Object.keys(f.styles);
  const cell = (name: string, body: string) =>
    `<div class="pg__cell">${label(name)}${body}</div>`;
  switch (id) {
    case 'button':
      return styles
        .map((s) => {
          if (s === 'icon')
            return cell(
              'icon (con solid)',
              `<a class="lz-btn lz-btn--solid lz-btn--icon" href="#">Escríbenos por WhatsApp ${ARROW}</a>`,
            );
          if (s === 'on-image')
            return cell(
              'on-image',
              `<div class="pg__photo"><img src="${img}" width="800" height="1000" alt="Foto de ejemplo"><a class="lz-btn lz-btn--on-image" href="#">Ver el menú</a></div>`,
            );
          return cell(
            s,
            `<div class="pg__row"><a class="lz-btn lz-btn--${s}" href="#">Agendar cita</a><a class="lz-btn lz-btn--secondary" href="#">Ver precios</a></div>`,
          );
        })
        .join('');
    case 'card':
      return ['(tokens)', ...styles]
        .map((s) =>
          cell(
            s,
            `<article class="lz-tile${s === '(tokens)' ? '' : ` lz-tile--${s}`}"><h3 class="pg__h">Corte y barba</h3><p class="pg__p">Tijera, máquina y toalla caliente. Unos 60 minutos.</p><span class="pg__price">Desde $480</span></article>`,
          ),
        )
        .join('');
    case 'tag':
      return styles
        .map((s) =>
          cell(
            s,
            s === 'numbered'
              ? `<p class="lz-tag lz-tag--numbered"><span class="lz-tag__num">02</span>Agenda por WhatsApp</p>`
              : `<p class="lz-tag lz-tag--${s}">Consultorio en Clavería</p>`,
          ),
        )
        .join('');
    case 'frame':
      return ['(tokens)', ...styles]
        .map((s) =>
          cell(
            s,
            `<figure class="lz-frame${s === '(tokens)' ? '' : ` lz-frame--${s}`} pg__frame"><img src="${img}" width="800" height="1000" alt="Foto de ejemplo"></figure>`,
          ),
        )
        .join('');
    case 'number':
      return styles
        .map((s) =>
          cell(
            s,
            `<div class="pg__row">${[
              '12 años|Atendiendo en el mismo local',
              '4.8|Calificación de ejemplo',
              '+3,200|Cortes al año (ejemplo)',
            ]
              .map((x) => {
                const [v, l] = x.split('|');
                return `<p class="lz-bignum lz-bignum--${s}"><span class="lz-bignum__value">${v}</span><span class="lz-bignum__label">${l}</span></p>`;
              })
              .join('')}</div>`,
          ),
        )
        .join('');
    case 'quote':
      return styles
        .map((s) =>
          cell(
            s,
            `<figure class="lz-pullquote lz-pullquote--${s}"><blockquote>Llegué por un corte rápido y me quedé con barbero de confianza.</blockquote><figcaption class="lz-pullquote__cite">Mariana Ledesma, clienta de ejemplo</figcaption></figure>`,
          ),
        )
        .join('');
    case 'divider':
      return styles
        .map((s) => cell(s, `<hr class="lz-rule lz-rule--${s}">`))
        .join('');
  }
}

const SHEET_CSS = `
.pg{padding:calc(40px * var(--lz-space)) var(--lz-gutter);background:var(--lz-color-bg);color:var(--lz-color-text);font-family:var(--lz-font-body)}
.pg__title{margin:0 0 24px;font:var(--lz-display-weight) 32px/1 var(--lz-font-display);text-transform:var(--lz-display-transform)}
.pg__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;align-items:start}
.pg__cell{display:grid;gap:12px;min-width:0}
.pg__label{margin:0;font:600 13px/1.3 ui-monospace,monospace;color:var(--lz-color-muted)}
.pg__row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.pg__h{margin:0;font:var(--lz-display-weight) 22px/1.15 var(--lz-font-display)}
.pg__p{margin:0;color:var(--lz-color-muted);line-height:1.5}
.pg__price{font-weight:600;font-variant-numeric:tabular-nums}
.pg__frame{aspect-ratio:4/5}
.pg__photo{position:relative;aspect-ratio:4/3;overflow:hidden;border-radius:var(--lz-radius-card)}
.pg__photo img{width:100%;height:100%;object-fit:cover;display:block}
.pg__photo .lz-btn{position:absolute;left:16px;bottom:16px}
`;

export async function primitiveSheet(
  page: Page,
  out: string,
): Promise<{ page: string; shots: number }> {
  const dir = resolve(out, 'primitives');
  mkdirSync(dir, { recursive: true });
  const core = readFileSync(paths.core, 'utf8');
  const rows: string[] = [];
  let shots = 0;
  for (const c of cases()) {
    const imgFile = resolve(out, 'assets', 'primitives', `${c.id}.jpg`);
    await ensurePlaceholder(imgFile, 800, 1000, c.theme, 'barberia');
    for (const id of PRIMITIVE_FAMILIES) {
      const img = relative(dir, imgFile);
      const body = `<section class="pg"><h2 class="pg__title">${escapeHtml(PRIMITIVES[id].label)}</h2><div class="pg__grid">${specimen(id, img)}</div></section>`;
      const css = primitiveCss([body]).css;
      const file = resolve(dir, `${id}-${c.id}.html`);
      writeFileSync(
        file,
        `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(`${id} · ${c.label}`)}</title><link href="${escapeHtml(googleFontsHref(c.theme))}" rel="stylesheet"><style>${themeRootCss(c.theme)}\n${core}\n${css}\n${SHEET_CSS}</style></head><body><div class="lz-page lz-page--pro">${body}</div></body></html>\n`,
      );
      const pngs: string[] = [];
      for (const width of [390, 1440]) {
        const png = file.replace(/\.html$/, `-${width}.png`);
        await page.setViewportSize({ width, height: 900 });
        await page
          .goto(pathToFileURL(file).href, {
            waitUntil: 'networkidle',
            timeout: 20_000,
          })
          .catch(() => page.waitForLoadState('load'));
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: png, fullPage: true });
        pngs.push(relative(out, png));
        shots += 1;
      }
      rows.push(
        `<div class="row"><div class="meta"><b>${escapeHtml(PRIMITIVES[id].label)}</b>${escapeHtml(c.label)}<br><a href="${relative(out, file)}">abrir</a></div><img loading="lazy" src="${pngs[1]}" alt="${escapeHtml(`${id} 1440`)}"><img loading="lazy" src="${pngs[0]}" alt="${escapeHtml(`${id} 390`)}"></div>`,
      );
    }
  }
  const sheet = resolve(out, 'primitives.html');
  writeFileSync(
    sheet,
    `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><title>Primitivos</title><style>body{margin:0;font:15px/1.5 system-ui,sans-serif;background:#f3f3f1;color:#161616}header{padding:24px 32px;background:#161616;color:#fafafa}header a{color:#fafafa}h1{margin:0 0 4px;font-size:22px}p.note{margin:16px 32px;max-width:90ch;color:#444}.row{display:grid;grid-template-columns:180px 900px 260px;gap:16px;align-items:start;padding:16px 32px;border-top:1px solid #ddd}.row img{width:100%;border:1px solid #ccc}.meta{font-size:13px;color:#444}.meta b{display:block;color:#161616}</style></head><body><header><h1>Primitivos (botón, tarjeta, etiqueta, marco, cifra, cita, separador)</h1><a href="index.html">← galería</a></header><p class="note">Cada familia en tres temas (claro sin <code>style</code>, oscuro sin <code>style</code>, teñido con presets) a 1440 y 390 px. «(tokens)» = sin estilo: sigue los presets <code>surface</code> / <code>imageTreatment</code>. Presión, hover y foco no se ven en una captura. Reglas: docs/template-kit-design-principles.md.</p>${rows.join('\n')}</body></html>\n`,
  );
  return { page: sheet, shots };
}
