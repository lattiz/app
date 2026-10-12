import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';
import type { Browser, Page } from 'playwright';
import { open, primeLazyContent } from '../../../template-kit/src/lib/shoot';
import { audit, type LayoutIssue } from '../../../template-kit/src/lib/shots';
import { browserPath, launchBrowser } from '../lib/browser';
import { bool, type Command } from '../lib/command';
import { EXIT, type ExitCode } from '../lib/errors';
import { REPO_ROOT, shotsDir } from '../lib/paths';
import { renderPreview } from '../lib/preview';
import { startPreviewServer } from '../lib/preview-server';
import { type CheckSummary, writeState } from '../lib/state';
import {
  assertTemplate,
  cleanOutput,
  compile,
  readDist,
  tierLabel,
  validate,
} from '../lib/templates';
import {
  badge,
  c,
  duration,
  isQuiet,
  log,
  setQuiet,
  type Status,
  table,
} from '../lib/ui';
import { motionReport } from './motion';

export const CHECK_VIEWPORTS = [
  { label: '360', w: 360, h: 780 },
  { label: '390', w: 390, h: 844 },
  { label: '768', w: 768, h: 1024 },
  { label: '1024', w: 1024, h: 768 },
  { label: '1440', w: 1440, h: 900 },
  { label: '1366×768', w: 1366, h: 768 },
  { label: '844×390', w: 844, h: 390 },
] as const;
type Viewport = (typeof CHECK_VIEWPORTS)[number];

const MIN_FONT = 14;
/** kit:shots' floor; called out separately but, like there, it doesn't block. */
const HARD_MIN_FONT = 12;
const MIN_TAP = 44;
const MAX_IMAGE_BYTES = 300 * 1024;
const MAX_IMAGE_PX = 2000;
const FIT_SHARE = 0.9;

const RULES = {
  kit: 'kit:validate',
  head: '<title> + description',
  tokens: 'tokens {{lz:*}}',
  overflow: 'overflow horizontal',
  tap: `tap targets ≥ ${MIN_TAP} px`,
  font: `texto ≥ ${MIN_FONT} px`,
  contrast: 'contraste (axe)',
  alt: 'alt en <img>',
  images: `imágenes ≤ 300 KB / ${MAX_IMAGE_PX} px`,
  fit: 'viewport-fit (--lz-fit)',
  motion: 'Motion: cobertura',
  nojs: 'sin JS: contenido visible',
  lighthouse: 'Lighthouse',
} as const;
type RuleId = keyof typeof RULES;

interface RuleResult {
  rule: RuleId;
  viewport: string;
  status: Status;
  detail: string;
  items: string[];
}

const GLOBAL = 'global';

function result(
  rule: RuleId,
  viewport: string,
  status: Status,
  detail: string,
  items: string[] = [],
): RuleResult {
  return { rule, viewport, status, detail, items };
}

function worst(statuses: Status[]): Status {
  for (const s of ['FAIL', 'WARN', 'PASS', 'INFO'] as Status[])
    if (statuses.includes(s)) return s;
  return 'N/A';
}

/** Peak RSS of this process plus every Chromium process, sampled once a second (Linux/macOS `ps`). */
function memorySampler(): { stop(): number } {
  let peak = 0;
  const sample = () => {
    let chrome = 0;
    const ps = spawnSync('ps', ['-A', '-o', 'rss=,comm='], {
      encoding: 'utf8',
    });
    for (const line of (ps.stdout ?? '').split('\n')) {
      const m = /^\s*(\d+)\s+(.*)$/.exec(line);
      if (m && /chrom|headless_shell/i.test(m[2]))
        chrome += Number(m[1]) * 1024;
    }
    peak = Math.max(peak, process.memoryUsage().rss + chrome);
  };
  sample();
  const timer = setInterval(sample, 1000);
  return {
    stop() {
      clearInterval(timer);
      sample();
      return peak;
    },
  };
}

function headAndTokens(
  html: string,
  sourceTokens: number,
  profile: string | null,
): RuleResult[] {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim();
  const description =
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
      .exec(html)?.[1]
      ?.trim();
  const missing = [
    !title && '<title>',
    !description && 'meta description',
  ].filter(Boolean) as string[];
  const raw =
    html.match(/\{\{\s*lz:[a-z_]*\s*\}\}|%7B%7B\s*lz:[a-z_]*\s*%7D%7D/gi) ?? [];
  return [
    missing.length
      ? result('head', GLOBAL, 'FAIL', `falta ${missing.join(' y ')}`)
      : result('head', GLOBAL, 'PASS', `"${title?.slice(0, 40)}"`),
    raw.length
      ? result(
          'tokens',
          GLOBAL,
          'FAIL',
          `${raw.length} token(s) sin resolver en el HTML servido`,
          [...new Set(raw)],
        )
      : result(
          'tokens',
          GLOBAL,
          'PASS',
          sourceTokens === 0
            ? 'la plantilla no usa tokens'
            : `${sourceTokens} token(s) ${profile ? `resueltos con ${profile}` : 'vacíos (sin perfil demo)'}`,
        ),
  ];
}

function layoutResults(vp: string, issues: LayoutIssue[]): RuleResult[] {
  const of = (kind: LayoutIssue['kind']) =>
    issues.filter((i) => i.kind === kind);
  const line = (i: LayoutIssue) => `${i.selector} — ${i.detail}`;
  const overflow = of('overflow');
  const text = of('small-text');
  const hardText = text.filter((i) => parseFloat(i.detail) < HARD_MIN_FONT);
  const tap = of('tap-target');
  return [
    overflow.length
      ? result(
          'overflow',
          vp,
          'FAIL',
          `${overflow.length} elemento(s) más anchos que la pantalla`,
          overflow.map(line),
        )
      : result('overflow', vp, 'PASS', ''),
    hardText.length
      ? result(
          'font',
          vp,
          'WARN',
          `${text.length} texto(s) < ${MIN_FONT} px, ${hardText.length} de ellos < ${HARD_MIN_FONT} px`,
          [
            ...hardText.map(line),
            ...text.filter((i) => !hardText.includes(i)).map(line),
          ],
        )
      : text.length
        ? result(
            'font',
            vp,
            'WARN',
            `${text.length} texto(s) < ${MIN_FONT} px`,
            text.map(line),
          )
        : result('font', vp, 'PASS', ''),
    tap.length
      ? result(
          'tap',
          vp,
          'WARN',
          `${tap.length} objetivo(s) < ${MIN_TAP} px`,
          tap.map(line),
        )
      : result('tap', vp, 'PASS', ''),
  ];
}

interface PageFacts {
  noAlt: string[];
  bigPx: string[];
  fit: { slot: string; height: number; available: number }[];
  sections: number;
  runtime: boolean;
}

/** Runs in the page. */
function facts(maxPx: number): PageFacts {
  const name = (el: Element) => {
    const slot = el.closest('[data-lz-slot]')?.getAttribute('data-lz-slot');
    return `${slot ? `${slot} › ` : ''}${(el.getAttribute('src') ?? '').split('/').pop()}`;
  };
  const imgs = Array.from(document.querySelectorAll('img'));
  const fitSections = Array.from(
    document.querySelectorAll('[data-lz-slot]'),
  ).filter((el) => {
    const v = getComputedStyle(el).getPropertyValue('--lz-fit').trim();
    return v !== '' && v !== 'none' && v !== '0';
  });
  return {
    noAlt: imgs.filter((i) => !i.hasAttribute('alt')).map(name),
    bigPx: imgs
      .filter((i) => i.naturalWidth > maxPx)
      .map((i) => `${name(i)} — ${i.naturalWidth} px`),
    fit: fitSections.map((el) => ({
      slot: el.getAttribute('data-lz-slot') ?? '?',
      height: Math.round(el.getBoundingClientRect().height),
      available: window.innerHeight,
    })),
    sections: document.querySelectorAll('[data-lz-section]').length,
    runtime: Boolean(document.getElementById('lz-motion')),
  };
}

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

async function contrast(page: Page): Promise<string[]> {
  await page.addScriptTag({ path: axePath });
  return page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: {
          run(
            ctx: Document,
            opts: unknown,
          ): Promise<{
            violations: {
              nodes: { target: string[]; any: { message: string }[] }[];
            }[];
          }>;
        };
      }
    ).axe;
    const res = await axe.run(document, {
      runOnly: { type: 'rule', values: ['color-contrast'] },
      resultTypes: ['violations'],
    });
    return res.violations.flatMap((v) =>
      v.nodes.map((n) => `${n.target.join(' ')} — ${n.any[0]?.message ?? ''}`),
    );
  });
}

async function checkViewport(
  browser: Browser,
  vp: Viewport,
  url: string,
  outDir: string,
  imageBytes: Map<string, number>,
): Promise<RuleResult[]> {
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    page.on('response', (res) => {
      if (res.request().resourceType() !== 'image') return;
      const len = Number(res.headers()['content-length'] ?? 0);
      if (len) imageBytes.set(new URL(res.url()).pathname, len);
    });
    await open(page, url);
    await primeLazyContent(page);
    const file = resolve(outDir, `${vp.label.replace('×', 'x')}.png`);
    // Screen-height modes capture what fits above the fold; width modes the whole page.
    await page.screenshot({ path: file, fullPage: !vp.label.includes('×') });
    // tsx keeps function names with a __name() helper that doesn't exist in the page.
    await page.evaluate('window.__name = (fn) => fn');
    const issues = await page.evaluate(audit, {
      minFont: MIN_FONT,
      minTap: MIN_TAP,
    });
    const f = await page.evaluate(facts, MAX_IMAGE_PX);
    const lowContrast = await contrast(page);
    const heavy = [...imageBytes]
      .filter(([, b]) => b > MAX_IMAGE_BYTES)
      .map(([p, b]) => `${p.split('/').pop()} — ${Math.round(b / 1024)} KB`);
    const imageItems = [...heavy, ...f.bigPx];
    const fitOver = f.fit.filter((s) => s.height > FIT_SHARE * s.available);
    return [
      ...layoutResults(vp.label, issues),
      lowContrast.length
        ? result(
            'contrast',
            vp.label,
            'FAIL',
            `${lowContrast.length} texto(s) sin contraste AA`,
            lowContrast,
          )
        : result('contrast', vp.label, 'PASS', ''),
      f.noAlt.length
        ? result(
            'alt',
            vp.label,
            'FAIL',
            `${f.noAlt.length} <img> sin alt`,
            f.noAlt,
          )
        : result('alt', vp.label, 'PASS', ''),
      imageItems.length
        ? result(
            'images',
            vp.label,
            'WARN',
            `${imageItems.length} imagen(es) pesadas o > ${MAX_IMAGE_PX} px (el seed las pasa a WebP ≤ 2000 px)`,
            imageItems,
          )
        : result('images', vp.label, 'PASS', ''),
      f.fit.length === 0
        ? result('fit', vp.label, 'N/A', 'N/A (no viewport-fit tokens)')
        : fitOver.length
          ? result(
              'fit',
              vp.label,
              'WARN',
              `${fitOver.length}/${f.fit.length} sección(es) fit > ${FIT_SHARE * 100}% del alto`,
              fitOver.map(
                (s) =>
                  `${s.slot} — contentHeight ${s.height} px vs ${Math.round(FIT_SHARE * s.available)} px (0.9 × ${s.available})`,
              ),
            )
          : result(
              'fit',
              vp.label,
              'PASS',
              `${f.fit.length} sección(es) fit caben`,
            ),
    ];
  } finally {
    await context.close();
  }
}

/** Pro: with JavaScript off, every Motion section shows its content (hidden states exist only under the runtime's .lz-js). */
async function noJs(browser: Browser, url: string): Promise<RuleResult> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
    const hidden = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of Array.from(
        document.querySelectorAll(
          '[data-lz-section]:not([data-lz-section="none"]) :is(h1,h2,h3,p,li,img)',
        ),
      )) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (
          cs.visibility === 'hidden' ||
          Number(cs.opacity) === 0 ||
          (r.width === 0 && r.height === 0 && cs.display !== 'none')
        )
          out.push(
            `${el.closest('[data-lz-section]')?.getAttribute('data-lz-slot')} › ${el.tagName.toLowerCase()}`,
          );
      }
      return out;
    });
    const h1 = await page
      .locator('h1')
      .first()
      .isVisible()
      .catch(() => false);
    if (!h1 || hidden.length > 0)
      return result(
        'nojs',
        GLOBAL,
        'FAIL',
        `${hidden.length} elemento(s) ocultos sin JS${h1 ? '' : ', <h1> no visible'}`,
        [...new Set(hidden)],
      );
    return result(
      'nojs',
      GLOBAL,
      'PASS',
      'todo visible con JS apagado (390 px)',
    );
  } finally {
    await context.close();
  }
}

function lighthouse(url: string): Promise<RuleResult> {
  return new Promise((done) => {
    const child = spawn(
      'npx',
      [
        '--yes',
        'lighthouse@12',
        url,
        '--quiet',
        '--output=json',
        '--output-path=stdout',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--chrome-flags=--headless=new --no-sandbox',
      ],
      {
        cwd: REPO_ROOT,
        env: { ...process.env, CHROME_PATH: browserPath()?.path ?? '' },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let out = '';
    let err = '';
    child.stdout.on('data', (d: Buffer) => (out += d));
    child.stderr.on('data', (d: Buffer) => (err += d));
    child.on('close', (code) => {
      try {
        const report = JSON.parse(out) as {
          categories: Record<string, { title: string; score: number | null }>;
        };
        const scores = Object.values(report.categories).map(
          (cat) => `${cat.title} ${Math.round((cat.score ?? 0) * 100)}`,
        );
        const low = Object.values(report.categories).some(
          (cat) => (cat.score ?? 0) < 0.8,
        );
        done(
          result(
            'lighthouse',
            GLOBAL,
            low ? 'WARN' : 'PASS',
            scores.join(' · '),
          ),
        );
      } catch {
        done(
          result(
            'lighthouse',
            GLOBAL,
            'WARN',
            `no corrió (código ${code}): ${err.trim().split('\n').pop() ?? ''}`,
          ),
        );
      }
    });
  });
}

export interface CheckOutcome {
  id: string;
  tier: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  results: RuleResult[];
  ms: number;
  peakBytes: number;
  shots: string;
}

/** Runs every rule; shared by `check`, `publish` and `ship`. */
export async function runCheck(
  id: string,
  opts: { lighthouse: boolean },
): Promise<CheckOutcome> {
  const started = Date.now();
  const memory = memorySampler();
  const results: RuleResult[] = [];
  const outDir = shotsDir(id);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const built = await compile(id);
  if (built.code !== 0) {
    results.push(
      result(
        'kit',
        GLOBAL,
        'FAIL',
        'kit:compile falló',
        cleanOutput(built.output).split('\n').slice(-15),
      ),
    );
    return finish();
  }
  const valid = await validate(id);
  const findings = cleanOutput(valid.output)
    .split('\n')
    .filter((l) => l.trim() && !/^\$ |^> /.test(l));
  results.push(
    valid.code === 0
      ? result('kit', GLOBAL, 'PASS', 'sin hallazgos')
      : result(
          'kit',
          GLOBAL,
          'FAIL',
          'reglas del kit (tema/titular únicos, similitud, contraste de tokens…)',
          findings.slice(0, 30),
        ),
  );

  const dist = readDist(id);
  const tier = dist.meta.tier;
  const sourceTokens = (dist.html.match(/\{\{\s*lz:/g) ?? []).length;
  const server = await startPreviewServer({
    id,
    port: 0,
    render: (params) =>
      renderPreview(id, {
        origin: 'http://localhost',
        motion: params.get('motion') !== 'off',
      }).html,
  });
  let browser: Browser | null = null;
  try {
    const preview = renderPreview(id, { origin: server.url, motion: true });
    results.push(
      ...headAndTokens(preview.html, sourceTokens, preview.profileSource),
    );
    browser = await launchBrowser();
    const imageBytes = new Map<string, number>();
    for (const vp of CHECK_VIEWPORTS) {
      if (!isQuiet()) process.stdout.write(c.gray(`  ${vp.label}…`));
      const t = Date.now();
      results.push(
        ...(await checkViewport(
          browser,
          vp,
          `${server.url}/site`,
          outDir,
          imageBytes,
        )),
      );
      if (!isQuiet())
        process.stdout.write(c.gray(` ${duration(Date.now() - t)}\n`));
    }
    if (tier === 'pro') {
      const report = motionReport(id);
      const typed = report.rows.filter((r) => r.type !== 'skip').length;
      results.push(
        report.untyped > 0
          ? result(
              'motion',
              GLOBAL,
              'WARN',
              `${report.untyped}/${typed} sección(es) sin tipo animable · ${report.groups} grupo(s) · preset ${report.preset}`,
            )
          : result(
              'motion',
              GLOBAL,
              'PASS',
              `${typed} sección(es) con tipo · ${report.groups} grupo(s) · preset ${report.preset}`,
            ),
      );
      results.push(await noJs(browser, `${server.url}/site`));
    }
  } finally {
    await browser?.close();
    if (opts.lighthouse) results.push(await lighthouse(`${server.url}/site`));
    await server.close();
  }
  return finish(tier);

  function finish(tier = '?'): CheckOutcome {
    const statuses = results.map((r) => r.status);
    return {
      id,
      tier,
      status: statuses.includes('FAIL')
        ? 'FAIL'
        : statuses.includes('WARN')
          ? 'WARN'
          : 'PASS',
      results,
      ms: Date.now() - started,
      peakBytes: memory.stop(),
      shots: relative(REPO_ROOT, outDir),
    };
  }
}

export function printCheck(outcome: CheckOutcome): void {
  const rules = [...new Set(outcome.results.map((r) => r.rule))];
  const cols = [GLOBAL, ...CHECK_VIEWPORTS.map((v) => v.label)];
  const cell = (rule: RuleId, col: string) => {
    const hits = outcome.results.filter(
      (r) => r.rule === rule && r.viewport === col,
    );
    return hits.length ? badge(worst(hits.map((h) => h.status))) : c.gray('·');
  };
  console.log(
    table(
      ['Regla', 'Global', ...CHECK_VIEWPORTS.map((v) => v.label)],
      rules.map((rule) => [RULES[rule], ...cols.map((col) => cell(rule, col))]),
    ),
  );
  const notable = outcome.results.filter(
    (r) => r.status === 'FAIL' || r.status === 'WARN',
  );
  if (notable.length > 0) {
    log.plain(`\n${c.bold('Detalle:')}`);
    for (const rule of rules) {
      const hits = notable.filter((r) => r.rule === rule);
      if (hits.length === 0) continue;
      log.plain(
        `  ${badge(worst(hits.map((h) => h.status)))} ${c.bold(RULES[rule])}`,
      );
      for (const h of hits) {
        log.plain(
          `    ${c.gray(h.viewport === GLOBAL ? '' : `[${h.viewport}] `)}${h.detail}`,
        );
        for (const item of h.items.slice(0, 6))
          log.plain(`      ${c.gray('·')} ${item}`);
        if (h.items.length > 6)
          log.plain(c.gray(`      … y ${h.items.length - 6} más`));
      }
    }
  }
  const info = outcome.results.filter(
    (r) =>
      (r.status === 'PASS' || r.status === 'N/A') &&
      r.viewport === GLOBAL &&
      r.detail,
  );
  for (const r of info) log.plain(c.gray(`  ${RULES[r.rule]}: ${r.detail}`));
  const fit = outcome.results.find((r) => r.rule === 'fit');
  if (fit?.status === 'N/A')
    log.plain(c.gray(`  ${RULES.fit}: N/A (no viewport-fit tokens)`));
}

export function saveCheck(outcome: CheckOutcome, forced = false): CheckSummary {
  const summary: CheckSummary = {
    at: new Date().toISOString(),
    result: outcome.status,
    fail: outcome.results.filter((r) => r.status === 'FAIL').length,
    warn: outcome.results.filter((r) => r.status === 'WARN').length,
    ms: outcome.ms,
    forced: forced || undefined,
    shots: outcome.shots,
    rules: outcome.results.map(({ rule, viewport, status, detail }) => ({
      rule,
      viewport,
      status,
      detail,
    })),
  };
  writeState(outcome.id, { lastCheck: summary });
  return summary;
}

export const check: Command = {
  name: 'check',
  summary:
    'Revisión con Playwright en 7 tamaños: overflow, toques, letra, contraste, alt, SEO, tokens, imágenes, Motion',
  usage: 'check <id> [--lighthouse] [--json]',
  help: [
    `Viewports: ${CHECK_VIEWPORTS.map((v) => (v.label.includes('×') ? v.label : `${v.w}×${v.h}`)).join(', ')}.`,
    'Un solo navegador, un contexto a la vez, siempre cerrado al final. Renderiza con el mismo',
    'pipeline que producción. Capturas en .lattiz/shots/<id>/ y resultado en .lattiz/state/<id>.json.',
    '',
    'FAIL (sale con 1): kit:validate, overflow, contraste AA (axe), <img> sin alt, falta',
    '<title>/description, tokens {{lz:*}} crudos, Pro: contenido de Motion oculto sin JS.',
    'WARN (no bloquea): texto < 14 px (se marca < 12 px), toques < 44 px, imágenes > 300 KB o',
    '> 2000 px, sección fit > 90 % del alto, Pro: secciones sin tipo de Motion.',
    '',
    '  --lighthouse   además corre Lighthouse (npx lighthouse@12, se instala al vuelo; usa memoria)',
    '  --json         imprime solo el resultado en JSON',
  ],
  options: { lighthouse: { type: 'boolean' }, json: { type: 'boolean' } },
  async run(ctx): Promise<ExitCode> {
    const id = assertTemplate(ctx.positionals[0]);
    const json = bool(ctx.flags, 'json');
    setQuiet(json);
    log.title(`lattiz check ${id}`);
    const outcome = await runCheck(id, {
      lighthouse: bool(ctx.flags, 'lighthouse'),
    });
    saveCheck(outcome);
    if (json) {
      setQuiet(false);
      console.log(JSON.stringify(outcome, null, 2));
      return outcome.status === 'FAIL' ? EXIT.GATE : EXIT.OK;
    }
    log.plain();
    printCheck(outcome);
    log.plain();
    log.info(
      `${tierLabel(outcome.tier)} · ${duration(outcome.ms)} · memoria pico ~${Math.round(outcome.peakBytes / 1024 / 1024)} MiB (Node + Chromium) · capturas en ${outcome.shots}/`,
    );
    if (outcome.status === 'FAIL') {
      log.fail(
        'Hay FAIL: arréglalos antes de publicar (o `publish --force`, que queda registrado).',
      );
      return EXIT.GATE;
    }
    if (outcome.status === 'WARN')
      log.warn('Solo WARN: no bloquea la publicación.');
    else log.ok('Todo PASS.');
    return EXIT.OK;
  },
};
