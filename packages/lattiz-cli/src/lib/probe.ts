import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser, Page } from 'playwright';
import { EXTENDED_PALETTES } from '../../../template-kit/palettes';
import {
  compileManifest,
  writeCompiled,
} from '../../../template-kit/src/lib/compile';
import {
  businessFor,
  copySource,
  sectionData,
  type CopyMode,
} from '../../../template-kit/src/lib/gallery';
import {
  loadBlueprint,
  loadSectionMeta,
  loadTheme,
} from '../../../template-kit/src/lib/load';
import { paths } from '../../../template-kit/src/lib/paths';
import { open, primeLazyContent } from '../../../template-kit/src/lib/shoot';
import {
  audit,
  measureFit,
  type LayoutIssue,
} from '../../../template-kit/src/lib/shots';
import { targetFromCompiled } from '../../../template-kit/src/lib/targets';
import { validateTarget } from '../../../template-kit/src/lib/validate';
import { isLegacyVariant } from '../../../template-kit/src/spec/catalog';
import { SHAPES } from '../../../template-kit/src/spec/presets';
import {
  composeTheme,
  resolveFontPair,
} from '../../../template-kit/src/spec/theme';
import type { Tier } from '../../../template-kit/src/tiers';
import type {
  Blueprint,
  BlueprintRole,
  ContentObject,
  ContentPack,
  Manifest,
  ManifestSection,
  SectionMeta,
  Theme,
} from '../../../template-kit/src/types';
import { launchBrowser } from './browser';
import { REPO_ROOT } from './paths';

/**
 * `lattiz kit probe`: each section variant inside a whole page (Básico and/or Pro, a light, a dark
 * and a styled theme, demo and long copy), compiled by the real compiler, through `kit:validate`
 * and then Chromium: overflow, text < 14 px, tap targets < 44 px, axe contrast and, for portadas,
 * the viewport fit. Only the probed section is judged; the rest of the page is context.
 * Writes .lattiz/probe/ (untracked). Nothing remote.
 */

export const PROBE_DIR = resolve(REPO_ROOT, '.lattiz/probe');

export type ProbeStatus = 'PASS' | 'WARN' | 'FAIL';

export interface ProbeIssue {
  rule:
    | 'validate'
    | 'overflow'
    | 'small-text'
    | 'tap-target'
    | 'contrast'
    | 'fit'
    | 'fold';
  status: ProbeStatus;
  viewport: string;
  detail: string;
}

export interface ProbeCase {
  slot: string;
  variant: string;
  tier: Tier;
  theme: string;
  mode: CopyMode;
  dir: string;
  status: ProbeStatus;
  issues: ProbeIssue[];
  /** Section screenshots at 390 and 1440. */
  shots: string[];
}

export interface ProbeOptions {
  /** `slot/variant` ids; default every variant outside the legacy catalog. */
  variants?: string[];
  themes?: string[];
  modes?: CopyMode[];
  log?: (line: string) => void;
}

const VIEWPORTS: { label: string; width: number; height: number }[] = [
  { label: '360', width: 360, height: 780 },
  { label: '390', width: 390, height: 844 },
  { label: '768', width: 768, height: 1024 },
  { label: '1024', width: 1024, height: 768 },
  { label: '1440', width: 1440, height: 900 },
  { label: '1366×768', width: 1366, height: 768 },
  { label: '844×390', width: 844, height: 390 },
];

const ANCHORS: Record<string, string> = {
  about: 'nosotros',
  services: 'servicios',
  team: 'equipo',
  gallery: 'galeria',
  testimonials: 'resenas',
  faq: 'preguntas',
};

const BASE: Record<Tier, [string, string][]> = {
  pro: [
    ['navbar', 'inline'],
    ['hero', 'split'],
    ['about', 'text-image-offset'],
    ['services', 'price-list'],
    ['gallery', 'grid'],
    ['testimonials', 'cards'],
    ['faq', 'list'],
    ['locations', 'with-contact'],
    ['floating-whatsapp', 'bubble'],
    ['footer', 'columns'],
  ],
  basic: [
    ['navbar', 'inline'],
    ['hero', 'centered-arch'],
    ['about', 'brief'],
    ['services', 'price-list'],
    ['faq', 'list'],
    ['locations', 'single'],
    ['floating-whatsapp', 'bubble'],
    ['footer', 'columns'],
  ],
};

/** Every variant folder outside the legacy catalog, as `slot/variant`. */
export function extendedVariants(): string[] {
  const out: string[] = [];
  for (const slot of readdirSync(paths.sections, { withFileTypes: true })) {
    if (!slot.isDirectory()) continue;
    for (const v of readdirSync(resolve(paths.sections, slot.name), {
      withFileTypes: true,
    }))
      if (v.isDirectory() && !isLegacyVariant(slot.name, v.name))
        out.push(`${slot.name}/${v.name}`);
  }
  return out.sort();
}

/** Light legacy theme, dark legacy theme, and one composed with every style preset (extended). */
export const PROBE_THEMES = ['claro', 'oscuro', 'estilo'] as const;

function probeTheme(name: string, tier: Tier): Theme {
  if (name === 'claro') return { ...loadTheme('norte-atelier'), tier };
  if (name === 'oscuro') return { ...loadTheme('oxido'), tier };
  if (name === 'estilo') {
    const fontPair = resolveFontPair('outfit+literata');
    if (!fontPair) throw new Error('falta el par outfit+literata');
    return composeTheme({
      name: 'probe-estilo',
      label: 'Sonda con estilos',
      tier,
      palette: EXTENDED_PALETTES['pal-cielo-marino'],
      fontPair,
      shape: SHAPES.suave,
      brand: {
        catalog: 'extended',
        style: {
          shape: 'round',
          surface: 'elevated',
          density: 'cozy',
          divider: 'hairline',
          imageTreatment: 'arch',
          typeScale: 'expressive',
          tracking: 'tight',
        },
      },
    });
  }
  return { ...loadTheme(name), tier };
}

/** The tier's real blueprint without variant lists, plus a `cta` role for the new CTA band. */
async function probeBlueprint(tier: Tier): Promise<Blueprint> {
  const real = await loadBlueprint('service-landing', tier);
  const roles: Record<string, BlueprintRole> = Object.fromEntries(
    Object.entries(real.roles).map(([role, spec]) => [
      role,
      { ...spec, variants: undefined },
    ]),
  );
  roles.cta = { region: 'main', purpose: 'Franja de CTA (sonda)' };
  const verticals = Object.fromEntries(
    Object.entries(real.verticals).map(([v, def]) => [
      v,
      { ...def, slots: { ...def.slots, cta: 'cta' } },
    ]),
  );
  return { ...real, roles, verticals } as unknown as Blueprint;
}

function sectionsFor(
  tier: Tier,
  slot: string,
  variant: string,
): [string, string][] {
  const base = BASE[tier].map((s) => [...s] as [string, string]);
  const at = base.findIndex(([s]) => s === slot);
  if (at >= 0) {
    base[at][1] = variant;
    return base;
  }
  // A slot the base page doesn't have (cta): before the FAQ; Básico drops about to stay at 7.
  const list = tier === 'basic' ? base.filter(([s]) => s !== 'about') : base;
  const faq = list.findIndex(([s]) => s === 'faq');
  list.splice(faq, 0, [slot, variant]);
  return list;
}

async function probePage(
  tier: Tier,
  slot: string,
  variant: string,
  meta: SectionMeta,
  themeName: string,
  mode: CopyMode,
  dir: string,
): Promise<{
  manifest: Manifest;
  compiled: Awaited<ReturnType<typeof compileManifest>>;
}> {
  const giro = copySource(slot, meta);
  const business = businessFor(giro, mode);
  const sections = sectionsFor(tier, slot, variant);
  const present = new Set(sections.map(([s]) => s));
  const links = Object.entries(ANCHORS)
    .filter(([s]) => present.has(s))
    .map(([s, id]) => ({ label: giro.navLabels[s] ?? s, href: `#${id}` }))
    .concat([
      {
        label: giro.navLabels.locations ?? 'Visítanos',
        href: tier === 'pro' ? '#sucursales' : '#ubicacion',
      },
    ]);
  const packSections: Record<string, ContentObject> = {};
  for (const [s, v] of sections) {
    const m = s === slot ? meta : await loadSectionMeta(s, v);
    const data = sectionData(s, giro, business, mode, m.sample);
    if (s === 'navbar' || s === 'footer') data.links = links;
    packSections[s] = data;
  }
  const pack: ContentPack = {
    vertical: giro.id,
    locale: 'es-MX',
    business,
    head: {
      title: `${slot}/${variant} · sonda`,
      description: `Sonda de la variante ${slot}/${variant} en una página ${tier}.`,
    },
    sections: packSections,
  };
  const id = `probe-${slot}-${variant}`.slice(0, 60);
  const manifest: Manifest = {
    id,
    name: `Sonda ${slot}/${variant}`,
    category: giro.category,
    description: 'Sonda local de una variante',
    family: 'service-landing',
    tier,
    vertical: giro.id,
    archetype: tier === 'basic' ? 'essential' : 'editorial-atelier',
    theme: 'probe',
    content: 'probe',
    sections: sections.map(
      ([s, v]): ManifestSection => ({ slot: s, variant: v }),
    ),
  };
  const compiled = await compileManifest(manifest, null, {
    theme: probeTheme(themeName, tier),
    pack,
    blueprint: await probeBlueprint(tier),
    assetsRoot: resolve(PROBE_DIR, '_assets'),
    outDir: dir,
  });
  writeCompiled(compiled);
  return { manifest, compiled };
}

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

async function contrastIn(page: Page, selector: string): Promise<string[]> {
  await page.addScriptTag({ path: axePath });
  return page.evaluate(async (sel) => {
    const axe = (
      window as unknown as {
        axe: {
          run(
            ctx: unknown,
            opts: unknown,
          ): Promise<{
            violations: {
              nodes: { target: string[]; any: { message: string }[] }[];
            }[];
          }>;
        };
      }
    ).axe;
    const res = await axe.run(
      { include: [[sel]] },
      {
        runOnly: { type: 'rule', values: ['color-contrast'] },
        resultTypes: ['violations'],
      },
    );
    return res.violations.flatMap((v) =>
      v.nodes.map((n) => `${n.target.join(' ')} — ${n.any[0]?.message ?? ''}`),
    );
  }, selector);
}

const MIN_FONT = 14;
const MIN_TAP = 44;

function layoutIssues(
  vp: string,
  slot: string,
  found: LayoutIssue[],
): ProbeIssue[] {
  return found
    .filter((i) => i.selector.startsWith(`${slot} ›`))
    .map((i) => ({
      rule: i.kind,
      status: 'FAIL' as const,
      viewport: vp,
      detail: `${i.selector} — ${i.detail}`,
    }));
}

async function inspect(
  browser: Browser,
  file: string,
  slot: string,
  shotsDir: string,
): Promise<{ issues: ProbeIssue[]; shots: string[] }> {
  const url = pathToFileURL(file).href;
  const selector = `[data-lz-slot="${slot}"]`;
  const issues: ProbeIssue[] = [];
  const shots: string[] = [];
  // One page, resized per viewport: the layout and the svh units follow the window without a reload.
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  try {
    await open(page, url);
    await primeLazyContent(page);
    await page.evaluate('window.__name = (fn) => fn');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(80);
      if (slot === 'hero' && vp.height > 560) {
        for (const m of await page.evaluate(measureFit)) {
          if (m.slot !== 'hero') continue;
          const fits =
            m.content <= m.fit ||
            (m.text !== null && m.text <= m.fit && m.ctaVisible);
          if (!fits)
            issues.push({
              rule: 'fit',
              status: 'FAIL',
              viewport: vp.label,
              detail: `contenido ${m.content} px > ${m.fit} px (90 % de alto − header ${m.header})`,
            });
        }
        // Every portada, with or without data-lz-fit: the primary CTA is visible without scrolling.
        const cta = await page.evaluate(() => {
          const hero = document.querySelector('[data-lz-slot="hero"]');
          const a = hero?.querySelector(
            'a[class*="button"], a[class*="btn"], a[class*="cta"]',
          );
          return a ? Math.round(a.getBoundingClientRect().bottom) : null;
        });
        if (cta !== null && cta > vp.height)
          issues.push({
            rule: 'fold',
            status: 'FAIL',
            viewport: vp.label,
            detail: `el CTA principal termina en ${cta} px, la pantalla mide ${vp.height}`,
          });
      }
      issues.push(
        ...layoutIssues(
          vp.label,
          slot,
          await page.evaluate(audit, { minFont: MIN_FONT, minTap: MIN_TAP }),
        ),
      );
      if (vp.label === '390' || vp.label === '1440' || vp.label === '1024') {
        for (const c of await contrastIn(page, selector))
          issues.push({
            rule: 'contrast',
            status: 'FAIL',
            viewport: vp.label,
            detail: c,
          });
      }
      if (vp.label === '390' || vp.label === '1440') {
        const png = resolve(shotsDir, `${vp.label}.png`);
        // Fixed or sticky blocks (navbar, floating button) are shot with the first screen.
        if (slot === 'navbar' || slot === 'floating-whatsapp')
          await page.screenshot({ path: png });
        else await page.locator(selector).first().screenshot({ path: png });
        shots.push(png);
      }
    }
  } finally {
    await context.close();
  }
  return { issues, shots };
}

function dedupe(issues: ProbeIssue[]): ProbeIssue[] {
  const seen = new Map<string, ProbeIssue>();
  for (const i of issues) {
    const key = `${i.rule}|${i.detail}`;
    const prev = seen.get(key);
    if (prev) {
      if (!prev.viewport.split(',').includes(i.viewport))
        prev.viewport += `,${i.viewport}`;
    } else seen.set(key, { ...i });
  }
  return [...seen.values()];
}

export async function kitProbe(opts: ProbeOptions = {}): Promise<{
  cases: ProbeCase[];
  report: string;
  ms: number;
}> {
  const started = Date.now();
  const log = opts.log ?? (() => {});
  const variants = opts.variants?.length ? opts.variants : extendedVariants();
  const themes = opts.themes?.length ? opts.themes : [...PROBE_THEMES];
  const modes = opts.modes?.length
    ? opts.modes
    : (['demo', 'largo'] as CopyMode[]);
  mkdirSync(PROBE_DIR, { recursive: true });
  const cases: ProbeCase[] = [];
  const browser = await launchBrowser();
  try {
    for (const id of variants) {
      const [slot, variant] = id.split('/');
      const meta = await loadSectionMeta(slot, variant);
      const tiers: Tier[] =
        meta.tiers ??
        (['brief', 'single'].includes(variant) ? ['basic'] : ['pro']);
      rmSync(resolve(PROBE_DIR, slot, variant), {
        recursive: true,
        force: true,
      });
      for (const tier of tiers)
        for (const theme of themes)
          for (const mode of modes) {
            const dir = resolve(
              PROBE_DIR,
              slot,
              variant,
              `${tier}--${theme}--${mode}`,
            );
            const issues: ProbeIssue[] = [];
            let shots: string[] = [];
            try {
              const { compiled } = await probePage(
                tier,
                slot,
                variant,
                meta,
                theme,
                mode,
                dir,
              );
              const report = validateTarget(targetFromCompiled(compiled), []);
              for (const f of report.findings)
                issues.push({
                  rule: 'validate',
                  status: 'FAIL',
                  viewport: '·',
                  detail: `${f.rule}: ${f.file}${f.line ? `:${f.line}` : ''} ${f.message}`,
                });
              const seen = await inspect(
                browser,
                resolve(dir, 'index.html'),
                slot,
                dir,
              );
              issues.push(...seen.issues);
              shots = seen.shots;
            } catch (err) {
              issues.push({
                rule: 'validate',
                status: 'FAIL',
                viewport: '·',
                detail: (err as Error).message
                  .split('\n')
                  .slice(0, 6)
                  .join(' / '),
              });
            }
            const clean = dedupe(issues);
            const status: ProbeStatus = clean.some((i) => i.status === 'FAIL')
              ? 'FAIL'
              : clean.length
                ? 'WARN'
                : 'PASS';
            cases.push({
              slot,
              variant,
              tier,
              theme,
              mode,
              dir,
              status,
              issues: clean,
              shots,
            });
            log(
              `  ${status === 'PASS' ? '✓' : '✗'} ${id} · ${tier} · ${theme} · ${mode}${clean.length ? ` (${clean.length})` : ''}`,
            );
          }
    }
  } finally {
    await browser.close();
  }
  const report = resolve(PROBE_DIR, 'report.json');
  writeFileSync(
    report,
    `${JSON.stringify(
      cases.map((c) => ({
        ...c,
        dir: relative(REPO_ROOT, c.dir),
        shots: c.shots.map((s) => relative(REPO_ROOT, s)),
      })),
      null,
      2,
    )}\n`,
  );
  return { cases, report, ms: Date.now() - started };
}
