import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import {
  ARCHETYPES,
  VERTICAL_MODULES,
  archetypePage,
  type Archetype,
} from '../../../template-kit/archetypes';
import { verticals } from '../../../template-kit/blueprints/service-landing.shared';
import { GIROS } from '../../../template-kit/giros';
import { EXTENDED_PALETTES } from '../../../template-kit/palettes';
import { escapeHtml } from '../../../template-kit/src/lib/dom';
import { GALLERY_DIR } from '../../../template-kit/src/lib/gallery';
import { targetFromCompiled } from '../../../template-kit/src/lib/targets';
import { validateTarget } from '../../../template-kit/src/lib/validate';
import { isLegacyVariant } from '../../../template-kit/src/spec/catalog';
import { SHAPES } from '../../../template-kit/src/spec/presets';
import {
  composeTheme,
  resolveFontPair,
} from '../../../template-kit/src/spec/theme';
import type { Role, Tier } from '../../../template-kit/src/tiers';
import type { ContentObject } from '../../../template-kit/src/types';
import { launchBrowser } from './browser';
import { REPO_ROOT } from './paths';
import {
  composePage,
  dedupe,
  inspect,
  type ProbeIssue,
  type ProbeStatus,
} from './probe';

/**
 * `lattiz kit archetypes`: one Pro and one Básico page per archetype (archetypes/), built from its
 * first variant per role, its style presets and its specimen palette + font pair, with the giro's
 * copy plus the vertical modules' copy. The whole page goes through kit:validate and the probe's
 * Chromium rules; the sheet is .lattiz/gallery/archetypes.html. Nothing remote.
 */

export interface ArchetypeCase {
  archetype: string;
  tier: Tier;
  status: ProbeStatus;
  issues: ProbeIssue[];
  shots: string[];
  sections: string[];
}

function themeFor(a: Archetype, tier: Tier) {
  const fontPair = resolveFontPair(a.specimen.fontPair);
  const palette = EXTENDED_PALETTES[a.specimen.palette];
  if (!fontPair || !palette) throw new Error(`${a.id}: el espécimen no existe`);
  return composeTheme({
    name: `arquetipo-${a.id}-${tier}`,
    label: `${a.label} · ${tier}`,
    tier,
    palette,
    fontPair,
    shape: SHAPES[a.shapes[0]],
    brand: { catalog: 'extended', style: a.style },
  });
}

function moduleCopy(giro: string): Record<string, ContentObject> {
  const out: Record<string, ContentObject> = {};
  for (const m of VERTICAL_MODULES[giro]?.modules ?? [])
    for (const [slot, copy] of Object.entries(m.copy))
      out[slot] = { ...(out[slot] ?? {}), ...copy };
  return out;
}

export async function kitArchetypes(
  opts: { only?: string[]; log?: (l: string) => void } = {},
): Promise<{ cases: ArchetypeCase[]; sheet: string; ms: number }> {
  const started = Date.now();
  const log = opts.log ?? (() => {});
  const list = Object.values(ARCHETYPES).filter(
    (a) => !opts.only?.length || opts.only.includes(a.id),
  );
  const root = resolve(GALLERY_DIR, 'archetypes');
  mkdirSync(root, { recursive: true });
  const cases: ArchetypeCase[] = [];
  const browser = await launchBrowser();
  try {
    for (const a of list)
      for (const tier of ['pro', 'basic'] as Tier[]) {
        const giro = GIROS[a.specimen.giro];
        const slots = verticals[giro.id].slots;
        const sections = archetypePage(a, tier).map(
          ({ role, variant }) =>
            [
              role === 'cta' ? 'cta' : (slots[role as Role] ?? role),
              variant,
            ] as [string, string],
        );
        const dir = resolve(root, `${a.id}--${tier}`);
        rmSync(dir, { recursive: true, force: true });
        const issues: ProbeIssue[] = [];
        let shots: string[] = [];
        try {
          const compiled = await composePage({
            id: `arquetipo-${a.id}-${tier}`,
            name: `${a.label} (${tier === 'pro' ? 'Pro' : 'Básico'})`,
            tier,
            sections,
            giro,
            theme: themeFor(a, tier),
            mode: 'demo',
            dir,
            extra: moduleCopy(giro.id),
            archetype: tier === 'basic' ? 'essential' : a.blueprintArchetype,
          });
          for (const f of validateTarget(targetFromCompiled(compiled), [])
            .findings)
            issues.push({
              rule: 'validate',
              status: 'FAIL',
              viewport: '·',
              detail: `${f.rule}: ${f.file}${f.line ? `:${f.line}` : ''} ${f.message}`,
            });
          const seen = await inspect(
            browser,
            resolve(dir, 'index.html'),
            null,
            dir,
          );
          // The page judges every section; what a legacy variant already does (12 px labels,
          // 32 px footer links: lattiz check WARNs) stays a WARN, a new variant's issue a FAIL.
          const variantOf = new Map(sections);
          const legacy = (detail: string) => {
            const slot = detail.split(' › ')[0];
            const variant = variantOf.get(slot);
            return variant !== undefined && isLegacyVariant(slot, variant);
          };
          issues.push(
            ...seen.issues.map((i) =>
              ['small-text', 'tap-target'].includes(i.rule) && legacy(i.detail)
                ? { ...i, status: 'WARN' as const }
                : i,
            ),
          );
          shots = seen.shots;
        } catch (err) {
          issues.push({
            rule: 'validate',
            status: 'FAIL',
            viewport: '·',
            detail: (err as Error).message.split('\n').slice(0, 6).join(' / '),
          });
        }
        const clean = dedupe(issues);
        const status: ProbeStatus = clean.some((i) => i.status === 'FAIL')
          ? 'FAIL'
          : clean.length
            ? 'WARN'
            : 'PASS';
        cases.push({
          archetype: a.id,
          tier,
          status,
          issues: clean,
          shots,
          sections: sections.map(([s, v]) => `${s}/${v}`),
        });
        log(
          `  ${status === 'FAIL' ? '✗' : '✓'} ${a.id} · ${tier}${clean.length ? ` (${clean.length})` : ''}`,
        );
      }
  } finally {
    await browser.close();
  }
  const sheet = resolve(GALLERY_DIR, 'archetypes.html');
  const rows = cases
    .map((c) => {
      const a = ARCHETYPES[c.archetype as keyof typeof ARCHETYPES];
      const img = (s: string) =>
        `<a href="${relative(GALLERY_DIR, s)}"><img loading="lazy" src="${relative(GALLERY_DIR, s)}" alt="${escapeHtml(`${a.label} ${c.tier}`)}"></a>`;
      return `<section class="row"><div class="meta"><b>${escapeHtml(a.label)} · ${c.tier === 'pro' ? 'Pro' : 'Básico'}</b>${escapeHtml(a.intent)}<br>V/M/D ${a.dials.variance}/${a.dials.motion}/${a.dials.density} · Motion ${c.tier === 'pro' ? a.motion : 'no'}<br>${escapeHtml(a.specimen.giro)} · ${escapeHtml(a.specimen.palette)} · ${escapeHtml(a.specimen.fontPair)}<br><small>${c.sections.map(escapeHtml).join('<br>')}</small><br><b class="${c.status === 'FAIL' ? 'fail' : 'pass'}">${c.status}</b>${c.issues.length ? `<small><br>${c.issues.map((i) => escapeHtml(`${i.status} ${i.rule} [${i.viewport}] ${i.detail}`)).join('<br>')}</small>` : ''}</div>${c.shots.map(img).join('')}</section>`;
    })
    .join('\n');
  writeFileSync(
    sheet,
    `<!DOCTYPE html><html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Arquetipos</title><style>body{margin:0;font:15px/1.5 system-ui,sans-serif;background:#f3f3f1;color:#161616}header{padding:24px 32px;background:#161616;color:#fafafa}header a{color:#fafafa}.row{display:grid;grid-template-columns:300px 240px 1fr;gap:16px;align-items:start;padding:16px 32px;border-top:1px solid #ddd}.row img{width:100%;border:1px solid #ccc;background:#fff}.meta{font-size:13px;color:#444}.meta b{display:block;color:#161616}.pass{color:#0a6b2d}.fail{color:#b00020}</style></head><body><header><h1>Arquetipos de página</h1><a href="index.html">← galería</a> · archetypes/ (WP7) · página completa a 390 y 1440 px</header>${rows}</body></html>\n`,
  );
  writeFileSync(
    resolve(root, 'report.json'),
    `${JSON.stringify(
      cases.map((c) => ({
        ...c,
        shots: c.shots.map((s) => relative(REPO_ROOT, s)),
      })),
      null,
      2,
    )}\n`,
  );
  return { cases, sheet, ms: Date.now() - started };
}
