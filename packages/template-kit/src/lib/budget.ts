import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { LZ_MOTION_JS } from '../../../../apps/tenant-sites/lib/lz-motion/runtime.generated';
import type { Tier } from '../tiers';
import type { CompiledTemplate } from './compile';
import { KIT_ROOT } from './paths';

/**
 * Byte budgets per tier from budgets.json: compiled CSS, the preview index.html, the page's local
 * images and (Pro) the Motion runtime. Measured, never enforced by kit:validate's findings: over
 * budget is a warning unless the caller asks for strict (--strict-budget, a new template's build).
 */

interface TierBudget {
  css: { raw: number; gzip: number };
  html: { raw: number; gzip: number };
  images: { total: number; max: number; hero?: number };
  js: { gzip: number };
}

type Budgets = Record<Tier, TierBudget>;

export const BUDGETS_FILE = resolve(KIT_ROOT, 'budgets.json');

let cached: Budgets | undefined;
export function loadBudgets(): Budgets {
  cached ??= JSON.parse(readFileSync(BUDGETS_FILE, 'utf8')) as Budgets;
  return cached;
}

export interface BudgetLine {
  metric: string;
  value: number;
  limit: number;
  over: boolean;
}

const gzip = (text: string) => gzipSync(text, { level: 9 }).length;
const kib = (n: number) => `${(n / 1024).toFixed(1)}`;

/** Bytes of the hero photo (`hero.jpg`, the LCP image of every hero variant); 0 when absent. */
function heroBytes(compiled: CompiledTemplate): number {
  const hero = compiled.assets.find((a) => a.name === 'hero.jpg');
  return hero && existsSync(hero.source) ? statSync(hero.source).size : 0;
}

/** Every budget of the template's tier, measured on the compiled output. */
export function measureBudget(compiled: CompiledTemplate): BudgetLine[] {
  const budget = loadBudgets()[compiled.manifest.tier];
  const images = compiled.assets
    .map((a) => (existsSync(a.source) ? statSync(a.source).size : 0))
    .filter((n) => n > 0);
  const lines: [string, number, number][] = [
    ['css', Buffer.byteLength(compiled.css), budget.css.raw],
    ['css gzip', gzip(compiled.css), budget.css.gzip],
    ['html', Buffer.byteLength(compiled.previewHtml), budget.html.raw],
    ['html gzip', gzip(compiled.previewHtml), budget.html.gzip],
    ['imágenes', images.reduce((n, s) => n + s, 0), budget.images.total],
    ['imagen mayor', Math.max(0, ...images), budget.images.max],
    ...(budget.images.hero !== undefined
      ? ([['imagen de portada', heroBytes(compiled), budget.images.hero]] as [
          string,
          number,
          number,
        ][])
      : []),
    [
      'js gzip',
      compiled.manifest.tier === 'pro' ? gzip(LZ_MOTION_JS) : 0,
      budget.js.gzip,
    ],
  ];
  return lines.map(([metric, value, limit]) => ({
    metric,
    value,
    limit,
    over: value > limit,
  }));
}

/** One line per template, plus one per metric over budget (KiB). */
export function formatBudget(lines: BudgetLine[], strict: boolean): string[] {
  const over = lines.filter((l) => l.over);
  const head = `    budget ${over.length === 0 ? 'ok' : strict ? 'FAIL' : 'WARN'}: ${lines
    .map((l) => `${l.metric} ${kib(l.value)}/${kib(l.limit)}`)
    .join(' · ')} KiB`;
  return [
    head,
    ...over.map(
      (l) =>
        `    ${strict ? '✗' : '!'} [budget] ${l.metric}: ${kib(l.value)} KiB > ${kib(l.limit)} KiB (budgets.json)`,
    ),
  ];
}
