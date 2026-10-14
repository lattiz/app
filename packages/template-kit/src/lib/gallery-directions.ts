import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Page } from 'playwright';
import { DIRECTIONS } from '../../directions';
import { buildSpec } from '../spec/build';
import { escapeHtml } from './dom';

/**
 * Art-direction proofs (kit gallery --directions): for each direction, a Básico + Pro twin in its two
 * best-fit giros, built from a real spec with `layout.direction` into a scratch root (never into the
 * kit), then shot above the fold and full page at 390 and 1440. Each root also works with
 * `lattiz check <id> --root <root>`.
 */

/** Fictional businesses per giro (no real names). */
const NAMES: Record<string, string[]> = {
  barberia: [
    'Barbería Los Mezquites',
    'Navaja del Bajío',
    'Barbería Cerro Verde',
  ],
  clinica: [
    'Consultorio Ceiba',
    'Centro Médico Arroyo Seco',
    'Clínica Palo Dulce',
  ],
  dental: [
    'Dental Bugambilia',
    'Clínica Dental Tres Picos',
    'Sonrisa del Parque',
  ],
  despacho: [
    'Despacho Olvera Ruiz',
    'Cuentas del Norte',
    'Despacho Sabino Martel',
  ],
  estetica: ['Estética Azahar', 'Salón Nube de Algodón', 'Estudio Magnolia'],
  floreria: ['Florería Jacaranda', 'Flores de la Loma', 'Florería Tres Lunas'],
  gimnasio: [
    'Estudio Ritmo Sur',
    'Gimnasio La Fragua',
    'Centro Atlético Mirador',
  ],
  restaurante: ['Fonda Doña Licha', 'Cocina del Portal', 'Cenaduría Los Arcos'],
  tienda: ['Tienda Hilo y Barro', 'Bazar Altamira', 'Tienda Pájaro Azul'],
  veterinaria: [
    'Veterinaria Huellas del Valle',
    'Clínica Animal El Fresno',
    'Veterinaria Nogal Alto',
  ],
};

export interface DirectionProof {
  direction: string;
  giro: string;
  root: string;
  ids: string[];
  ok: boolean;
  message: string;
  choices: Record<string, string[]>;
}

export const proofRoot = (out: string, direction: string, giro: string) =>
  resolve(out, 'directions', `${direction}--${giro}`);

export async function buildDirectionProofs(
  out: string,
  log: (line: string) => void = () => {},
): Promise<DirectionProof[]> {
  const used = new Map<string, number>();
  const proofs: DirectionProof[] = [];
  for (const d of Object.values(DIRECTIONS)) {
    for (const giro of d.giros.slice(0, 2)) {
      const n = used.get(giro) ?? 0;
      used.set(giro, n + 1);
      const root = proofRoot(out, d.id, giro);
      rmSync(root, { recursive: true, force: true });
      mkdirSync(resolve(root, 'specs'), { recursive: true });
      const short = d.id.split('-')[0];
      const spec = {
        specVersion: 1,
        idBase: `${giro}-${short}-prueba`,
        twin: true,
        giro,
        business: { name: NAMES[giro]?.[n % 3] ?? `Negocio ${short}` },
        brand: { catalog: 'extended' },
        layout: { direction: d.id },
      };
      const file = resolve(root, 'specs', `${spec.idBase}.spec.json`);
      writeFileSync(file, `${JSON.stringify(spec, null, 2)}\n`);
      const report = await buildSpec({ spec: file, out: root });
      proofs.push({
        direction: d.id,
        giro,
        root,
        ids: report.ids,
        ok: report.ok,
        message: report.ok
          ? 'ok'
          : [
              report.message,
              ...report.problems
                .filter((p) => p.level === 'error')
                .map((p) => `${p.path}: ${p.message}`),
              ...report.tiers.flatMap((t) =>
                t.findings.map((f) => `${t.id} ${f.rule}: ${f.message}`),
              ),
            ]
              .filter(Boolean)
              .join(' · '),
        choices: Object.fromEntries(report.tiers.map((t) => [t.id, t.choices])),
      });
      log(
        `  ${report.ok ? '✓' : '✗'} ${d.id} · ${giro} (${report.ids.join(' + ')})`,
      );
    }
  }
  return proofs;
}

async function shot(
  page: Page,
  file: string,
  png: string,
  width: number,
  height: number,
  fullPage: boolean,
): Promise<void> {
  await page.setViewportSize({ width, height });
  await page
    .goto(pathToFileURL(file).href, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    })
    .catch(() => page.waitForLoadState('load'));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: png, fullPage });
}

export async function directionSheet(
  page: Page,
  out: string,
  log: (line: string) => void = () => {},
): Promise<{ page: string; shots: number; proofs: DirectionProof[] }> {
  const proofs = await buildDirectionProofs(out, log);
  let shots = 0;
  const sections: string[] = [];
  for (const d of Object.values(DIRECTIONS)) {
    const rows: string[] = [];
    for (const p of proofs.filter((x) => x.direction === d.id)) {
      if (!p.ok) {
        rows.push(
          `<div class="row"><div class="meta"><b>${escapeHtml(p.giro)}</b>✗ ${escapeHtml(p.message)}</div></div>`,
        );
        continue;
      }
      for (const id of [...p.ids].sort((a) =>
        a.includes('-base-') ? 1 : -1,
      )) {
        const index = resolve(p.root, 'dist', id, 'index.html');
        const dir = resolve(out, 'directions', '_shots', id);
        mkdirSync(dir, { recursive: true });
        const files = {
          fold1440: resolve(dir, '1440-pliegue.png'),
          fold390: resolve(dir, '390-pliegue.png'),
          full1440: resolve(dir, '1440-completa.png'),
          full390: resolve(dir, '390-completa.png'),
        };
        await shot(page, index, files.fold1440, 1440, 900, false);
        await shot(page, index, files.fold390, 390, 844, false);
        await shot(page, index, files.full1440, 1440, 900, true);
        await shot(page, index, files.full390, 390, 844, true);
        shots += 4;
        const r = (f: string) => relative(out, f);
        const choices = (p.choices[id] ?? []).filter(
          (c) => !c.startsWith('dirección'),
        );
        rows.push(
          `<div class="row"><div class="meta"><b>${escapeHtml(id)}</b>${escapeHtml(p.giro)} · ${id.includes('-base-') ? 'Básico' : 'Pro'}<br>${choices.map((c) => escapeHtml(c)).join('<br>')}<br><a href="${r(files.full1440)}">página 1440</a> · <a href="${r(files.full390)}">página 390</a><br><code>lattiz check ${escapeHtml(id)} --root ${escapeHtml(relative(resolve(out, '../..'), p.root))}</code></div><img loading="lazy" src="${r(files.fold1440)}" alt="${escapeHtml(id)} 1440"><img loading="lazy" src="${r(files.fold390)}" alt="${escapeHtml(id)} 390"></div>`,
        );
      }
    }
    sections.push(
      `<section><h2>${escapeHtml(d.name)} <small>${escapeHtml(d.id)} · V/M/D ${d.dials.variance}/${d.dials.motion}/${d.dials.density} · ${escapeHtml(d.motion)}</small></h2><p class="note">${escapeHtml(d.intent)}</p>${rows.join('\n')}</section>`,
    );
  }
  const sheet = resolve(out, 'directions.html');
  writeFileSync(
    sheet,
    `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><title>Direcciones de arte</title><style>body{margin:0;font:15px/1.5 system-ui,sans-serif;background:#f3f3f1;color:#161616}header{padding:24px 32px;background:#161616;color:#fafafa}header a{color:#fafafa}h1{margin:0 0 4px;font-size:22px}h2{margin:32px 32px 4px;font-size:20px}h2 small{font-weight:400;color:#666;font-size:13px}p.note{margin:4px 32px 12px;max-width:100ch;color:#444}.row{display:grid;grid-template-columns:240px 820px 240px;gap:16px;align-items:start;padding:16px 32px;border-top:1px solid #ddd}.row img{width:100%;border:1px solid #ccc}.meta{font-size:13px;color:#444}.meta b{display:block;color:#161616}code{font-size:11px}</style></head><body><header><h1>Direcciones de arte: pruebas (Básico + Pro en dos giros)</h1><a href="index.html">← galería</a></header><p class="note">Cada prueba sale de un spec real con <code>layout.direction</code>, construido fuera del kit (<code>lattiz build --out</code>); nada entra a <code>templates/</code>. Pliegue a 1440×900 y 390×844; página completa en los enlaces. Placeholders del kit en lugar de fotos. Reglas: docs/template-kit-design-principles.md.</p>${sections.join('\n')}</body></html>\n`,
  );
  return { page: sheet, shots, proofs };
}
