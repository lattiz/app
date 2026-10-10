/**
 * One command from a designer's GrapesJS export to a live, active template:
 * validate → collect assets → migrate them to R2 → rewrite URLs → write the static
 * preview → upsert `public.templates` → deploy previews → thumbnail → activate.
 * Every stage is idempotent, so re-running the same command resumes cleanly.
 *
 *   pnpm tsx scripts/parse-and-seed-template.ts \
 *     (--file ./x.grapesjs --html ./x-export/index.html | --dir packages/template-kit/dist/<id>) \
 *     --id restaurante-moderno-v1 --name "Restaurante Moderno" --category restaurantes \
 *     [--description ".."] [--sort-order 10] [--tier basic|pro] \
 *     [--dry-run] [--no-deploy] [--no-thumbnail] [--no-preview]
 *
 * --dir reads <dir>/<id>.grapesjs + <dir>/index.html (packages/template-kit output) and uploads the
 * local `assets/…` files they reference the same way as cdn.grapesjs.com assets.
 * --tier defaults to `tier` in <dir>/template.meta.json; one of the two is required.
 * Env: see the root .env.example (read from ./.env, then apps/api/.env for the shared keys).
 * Workflow: docs/adding-templates.md
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ObjectStoragePort } from '../apps/api/src/modules/storage/domain/object-storage.port';
import {
  createObjectStorage,
  resolveStorageProvider,
} from '../apps/api/src/modules/storage/infrastructure/storage-provider.factory';
import { TEMPLATE_PREVIEWS_DIR, vercel } from './lib/vercel-cli';

const REPO_ROOT = resolve(__dirname, '..');
const ID_RE = /^[a-z0-9-]{3,60}$/;
// Stops at whitespace, quotes, escapes, parens, tags and HTML-entity/CSS delimiters.
const URL_TAIL = String.raw`[^\s"'\\()<>&;]+`;
const SOURCE_URL_RES = [
  new RegExp(
    String.raw`https://cdn\.grapesjs\.com/workspaces/${URL_TAIL}`,
    'g',
  ),
  new RegExp(
    String.raw`https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/${URL_TAIL}`,
    'g',
  ),
];
// template-kit output: relative `assets/<file>` refs, never part of a longer URL or path.
const LOCAL_ASSET_RE =
  /(?<![\w/.:-])(?:\.\/)?assets\/[A-Za-z0-9._-]+\.(?:jpe?g|png|webp|avif|gif|svg|mp4|webm|woff2?|ttf|otf)\b/g;
const MAX_ASSET_BYTES = 15 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 30_000;
const DOWNLOAD_ATTEMPTS = 3;
const PREVIEW_POLL_MS = 90_000;
const ALLOWED_TYPE_RE = /^(image|video|font)\//;

const EXT_BY_TYPE: Record<string, string> = {
  'image/webp': 'webp',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'font/woff': 'woff',
  'font/woff2': 'woff2',
  'font/ttf': 'ttf',
  'font/otf': 'otf',
};
const TYPE_BY_EXT: Record<string, string> = {
  ...Object.fromEntries(Object.entries(EXT_BY_TYPE).map(([t, e]) => [e, t])),
  jpeg: 'image/jpeg',
};

interface CliArgs {
  file: string;
  html?: string;
  /** Directory local `assets/…` refs resolve against. */
  assetsBase: string;
  id: string;
  name: string;
  category: string;
  description?: string;
  sortOrder?: number;
  tier: TemplateTier;
  dryRun: boolean;
  deploy: boolean;
  thumbnail: boolean;
  preview: boolean;
}

interface GrapesProject {
  pages?: unknown[];
  styles?: unknown[];
  assets?: unknown[];
  custom?: {
    projectType?: string;
    plugins?: { id?: string; version?: string }[];
  };
  [key: string]: unknown;
}

interface DownloadedAsset {
  url: string;
  body: Buffer;
  contentType: string;
  key: string;
}

type StageStatus = '✓' | '✗' | '–';
const summary: { stage: string; status: StageStatus; detail: string }[] = [];

function record(stage: string, status: StageStatus, detail: string): void {
  summary.push({ stage, status, detail });
  const line = `${status} ${stage}${detail ? ` — ${detail}` : ''}`;
  if (status === '✗') console.error(line);
  else console.log(line);
}

class StageError extends Error {}

// ── CLI & env ────────────────────────────────────────────────────────────────

type TemplateTier = 'basic' | 'pro';
const TIERS: readonly TemplateTier[] = ['basic', 'pro'];

function isTier(value: unknown): value is TemplateTier {
  return (TIERS as readonly unknown[]).includes(value);
}

/** --tier wins; otherwise the kit's template.meta.json next to the project. */
function resolveTier(flag: string | undefined, dir: string | undefined): TemplateTier {
  if (flag !== undefined) {
    if (!isTier(flag)) throw new StageError(`--tier must be one of ${TIERS.join(' | ')}.`);
    return flag;
  }
  const meta = dir && dir !== 'true' ? join(dir, 'template.meta.json') : null;
  if (meta && existsSync(meta)) {
    const tier: unknown = (JSON.parse(readFileSync(meta, 'utf8')) as { tier?: unknown }).tier;
    if (isTier(tier)) return tier;
    throw new StageError(`${meta} has no valid "tier" (${TIERS.join(' | ')}).`);
  }
  throw new StageError(
    'Pass --tier basic|pro (or --dir with a template.meta.json from packages/template-kit).',
  );
}

function parseArgs(argv: string[]): CliArgs {
  const raw = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const eq = token.indexOf('=');
    if (eq !== -1) {
      raw.set(token.slice(2, eq), token.slice(eq + 1));
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      raw.set(token.slice(2), next);
      i += 1;
    } else {
      raw.set(token.slice(2), 'true');
    }
  }

  const preview = !raw.has('no-preview');
  const dir = raw.get('dir');
  if (dir && dir !== 'true') {
    raw.set(
      'file',
      raw.get('file') ??
        join(dir, `${raw.get('id') ?? basename(dir)}.grapesjs`),
    );
    if (preview) raw.set('html', raw.get('html') ?? join(dir, 'index.html'));
  }
  const required = ['file', 'id', 'name', ...(preview ? ['html'] : [])];
  const missing = required.filter(
    (key) => !raw.get(key) || raw.get(key) === 'true',
  );
  if (missing.length > 0) {
    throw new StageError(
      `Missing required flag(s): ${missing.map((k) => `--${k}`).join(', ')}`,
    );
  }

  const sortRaw = raw.get('sort-order');
  const sortOrder = sortRaw === undefined ? undefined : Number(sortRaw);
  if (sortOrder !== undefined && !Number.isInteger(sortOrder)) {
    throw new StageError('--sort-order must be an integer.');
  }

  const file = raw.get('file') as string;
  const tier = resolveTier(raw.get('tier'), dir);
  return {
    file,
    html: raw.get('html'),
    assetsBase: resolve(
      process.cwd(),
      dir && dir !== 'true' ? dir : dirname(file),
    ),
    id: raw.get('id') as string,
    name: raw.get('name') as string,
    category: raw.get('category') ?? 'general',
    description: raw.get('description'),
    sortOrder,
    tier,
    dryRun: raw.has('dry-run'),
    deploy: !raw.has('no-deploy'),
    thumbnail: !raw.has('no-thumbnail'),
    preview,
  };
}

/** Root .env first; apps/api/.env fills only the keys the script shares with the API (Supabase, R2). */
function loadEnv(): void {
  const root = join(REPO_ROOT, '.env');
  if (existsSync(root)) process.loadEnvFile(root);

  // Never import the API's VERCEL_* (tenant-sites project/token) — the CLI would deploy there.
  const api = join(REPO_ROOT, 'apps/api/.env');
  if (!existsSync(api)) return;
  const shared = parseEnv(readFileSync(api, 'utf8'));
  for (const [key, value] of Object.entries(shared)) {
    if (
      /^(SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|STORAGE_PROVIDER|R2_[A-Z_]+)$/.test(
        key,
      )
    ) {
      process.env[key] ??= value;
    }
  }
}

function requireEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value)
    throw new StageError(
      `Environment variable ${key} is required (see .env.example).`,
    );
  return value;
}

// ── Stage 1–2: validate & collect ───────────────────────────────────────────

function validateProject(path: string, args: CliArgs): GrapesProject {
  if (!ID_RE.test(args.id)) {
    throw new StageError(
      `--id "${args.id}" must match ${ID_RE} (it becomes a URL segment and an object key).`,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new StageError(
      `${path} is not valid JSON: ${(error as Error).message}`,
    );
  }
  const project = parsed as GrapesProject;
  const problems: string[] = [];
  for (const key of ['pages', 'styles', 'assets'] as const) {
    if (!Array.isArray(project[key])) problems.push(`missing "${key}" array`);
  }
  if (project.custom?.projectType !== 'web') {
    problems.push(
      `custom.projectType is "${project.custom?.projectType ?? 'unset'}", expected "web"`,
    );
  }
  if (Array.isArray(project.pages) && project.pages.length !== 1) {
    problems.push(
      `has ${project.pages.length} pages; Lattiz templates are single-page`,
    );
  }
  if (problems.length > 0)
    throw new StageError(`Invalid project: ${problems.join('; ')}.`);
  return project;
}

/** Inlines the export's relative stylesheets/scripts so the preview is one self-contained file. */
function loadExportHtml(htmlPath: string): string {
  const baseDir = dirname(htmlPath);
  const html = readFileSync(htmlPath, 'utf8');
  const readLocal = (ref: string): string => {
    const target = resolve(baseDir, ref.split(/[?#]/)[0]);
    if (relative(baseDir, target).startsWith('..') || !existsSync(target)) {
      throw new StageError(
        `The export references "${ref}", which is not next to ${htmlPath}.`,
      );
    }
    return readFileSync(target, 'utf8');
  };
  const isLocal = (ref: string): boolean =>
    !/^([a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(ref);

  const seen = new Set<string>();
  return html
    .replace(/<link\b[^>]*>/gi, (tag) => {
      const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
      if (!/\brel\s*=\s*["']?stylesheet/i.test(tag) || !href || !isLocal(href))
        return tag;
      const key = resolve(baseDir, href);
      if (seen.has(key)) return '';
      seen.add(key);
      return `<style>\n${readLocal(href)}\n</style>`;
    })
    .replace(
      /<script\b([^>]*)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
      (tag, before: string, src: string, after: string) =>
        isLocal(src)
          ? `<script${before}${after}>\n${readLocal(src)}\n</script>`
          : tag,
    );
}

function collectSourceUrls(...texts: string[]): string[] {
  const urls = new Set<string>();
  for (const text of texts) {
    for (const re of SOURCE_URL_RES) {
      for (const match of text.matchAll(re)) urls.add(match[0]);
    }
  }
  return [...urls].sort();
}

function collectLocalAssets(...texts: string[]): string[] {
  const refs = new Set<string>();
  for (const text of texts) {
    for (const match of text.matchAll(LOCAL_ASSET_RE)) refs.add(match[0]);
  }
  return [...refs].sort();
}

// ── Stage 3: migrate assets ──────────────────────────────────────────────────

function extensionOf(url: string): string | undefined {
  return /\.([a-z0-9]{2,5})$/i.exec(new URL(url).pathname)?.[1]?.toLowerCase();
}

function effectiveType(url: string, header: string | null): string {
  const type = (header ?? '').split(';')[0].trim().toLowerCase();
  if (
    type &&
    type !== 'application/octet-stream' &&
    type !== 'binary/octet-stream'
  )
    return type;
  return TYPE_BY_EXT[extensionOf(url) ?? ''] ?? type;
}

async function download(
  url: string,
  templateId: string,
): Promise<DownloadedAsset> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= DOWNLOAD_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const declared = Number(res.headers.get('content-length') ?? 0);
      if (declared > MAX_ASSET_BYTES)
        throw new StageError(`${declared} bytes exceeds the 15 MB limit`);
      const contentType = effectiveType(url, res.headers.get('content-type'));
      if (!ALLOWED_TYPE_RE.test(contentType)) {
        throw new StageError(
          `content type "${contentType || 'unknown'}" is not image/*, video/* or font/*`,
        );
      }
      const body = Buffer.from(await res.arrayBuffer());
      if (body.length > MAX_ASSET_BYTES)
        throw new StageError(`${body.length} bytes exceeds the 15 MB limit`);
      const hash = createHash('sha256').update(body).digest('hex').slice(0, 16);
      const ext = EXT_BY_TYPE[contentType] ?? extensionOf(url) ?? 'bin';
      return {
        url,
        body,
        contentType,
        key: `templates/${templateId}/${hash}.${ext}`,
      };
    } catch (error) {
      lastError = error;
      // A disallowed type or size won't change on retry.
      if (error instanceof StageError || attempt === DOWNLOAD_ATTEMPTS) break;
      await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
    }
  }
  throw new StageError(
    `${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

/** Content-addressed keys never change, so an object that answers 200 is already the right bytes. */
async function existsPublicly(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Reads a template-kit asset from disk; `url` keeps the ref as written so it can be rewritten. */
function readLocal(
  ref: string,
  baseDir: string,
  templateId: string,
): DownloadedAsset {
  const path = resolve(baseDir, ref);
  if (relative(baseDir, path).startsWith('..') || !existsSync(path)) {
    throw new StageError(`${ref}: not found under ${baseDir}`);
  }
  const body = readFileSync(path);
  if (body.length > MAX_ASSET_BYTES)
    throw new StageError(
      `${ref}: ${body.length} bytes exceeds the 15 MB limit`,
    );
  const ext = (/\.([a-z0-9]+)$/i.exec(ref)?.[1] ?? '').toLowerCase();
  const contentType = TYPE_BY_EXT[ext];
  if (!contentType) throw new StageError(`${ref}: unsupported extension`);
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 16);
  return {
    url: ref,
    body,
    contentType,
    key: `templates/${templateId}/${hash}.${EXT_BY_TYPE[contentType] ?? ext}`,
  };
}

async function migrateAssets(
  storage: ObjectStoragePort,
  urls: string[],
  localRefs: string[],
  baseDir: string,
  templateId: string,
): Promise<Map<string, string>> {
  // All-or-nothing: every download must succeed before anything is uploaded or written.
  const settled = await Promise.allSettled([
    ...urls.map((url) => download(url, templateId)),
    ...localRefs.map(async (ref) => readLocal(ref, baseDir, templateId)),
  ]);
  const failures = settled.flatMap((r) =>
    r.status === 'rejected' ? [String((r.reason as Error).message)] : [],
  );
  if (failures.length > 0) {
    throw new StageError(
      `${failures.length} asset(s) failed to download:\n    ${failures.join('\n    ')}`,
    );
  }
  const assets = settled.map(
    (r) => (r as PromiseFulfilledResult<DownloadedAsset>).value,
  );

  const replacements = new Map<string, string>();
  let uploaded = 0;
  for (const asset of assets) {
    const publicUrl = storage.publicUrl(asset.key);
    if (!(await existsPublicly(publicUrl))) {
      await storage.uploadPublic(asset.key, asset.body, asset.contentType);
      uploaded += 1;
    }
    replacements.set(asset.url, publicUrl);
  }
  console.log(
    `    ${uploaded} uploaded, ${assets.length - uploaded} already in R2`,
  );
  return replacements;
}

function rewriteUrls(text: string, replacements: Map<string, string>): string {
  // Local refs are swapped only where LOCAL_ASSET_RE matches, never inside a longer URL.
  const local = text.replace(
    LOCAL_ASSET_RE,
    (ref) => replacements.get(ref) ?? ref,
  );
  // Longest first so a URL that prefixes another is never replaced inside it.
  const ordered = [...replacements.keys()]
    .filter((key) => /^https?:/.test(key))
    .sort((a, b) => b.length - a.length);
  return ordered.reduce(
    (out, from) => out.split(from).join(replacements.get(from) as string),
    local,
  );
}

// ── Stage 5: preview ─────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"]/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );
}

/** Only ensures a <title> and a noindex robots meta; the export is otherwise untouched. */
function finalizePreviewHtml(html: string, name: string): string {
  let out = html;
  const headOpen = /<head\b[^>]*>/i;
  if (!headOpen.test(out))
    throw new StageError('The HTML export has no <head>.');
  if (!/<title\b[^>]*>[^<]*\S[^<]*<\/title>/i.test(out)) {
    out = out.replace(/<title\b[^>]*>\s*<\/title>/i, '');
    out = out.replace(
      headOpen,
      (tag) => `${tag}\n    <title>${escapeHtml(name)}</title>`,
    );
  }
  const robots = '<meta name="robots" content="noindex, nofollow"/>';
  out = /<meta\s+name=["']robots["'][^>]*>/i.test(out)
    ? out.replace(/<meta\s+name=["']robots["'][^>]*>/i, robots)
    : out.replace(headOpen, (tag) => `${tag}\n  ${robots}`);
  return out;
}

// ── Stage 6: database ────────────────────────────────────────────────────────

interface TemplateRow {
  id: string;
  is_active: boolean;
  tier: string;
}

/** Read-only: how many tenants' sites use this template today. */
async function countTenantsUsing(
  supabase: SupabaseClient,
  templateId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('site_schemas')
    .select('tenant_id', { count: 'exact', head: true })
    .eq('template_id', templateId);
  if (error) throw new StageError(error.message);
  return count ?? 0;
}

async function upsertTemplate(
  supabase: SupabaseClient,
  args: CliArgs,
  grapesjsJson: unknown,
  previewUrl: string | null,
): Promise<{ created: boolean; wasActive: boolean }> {
  const { data: existing, error: readError } = await supabase
    .from('templates')
    .select('id, is_active, tier')
    .eq('id', args.id)
    .maybeSingle<TemplateRow>();
  if (readError) throw new StageError(readError.message);

  if (existing && existing.tier !== args.tier) {
    const inUse = await countTenantsUsing(supabase, args.id);
    console.warn(
      `\n  ⚠ Tier change ${existing.tier} → ${args.tier} for ${args.id}: ${inUse} tenant site(s) use it.` +
        (args.tier === 'pro' && inUse > 0
          ? ' Básico tenants among them will be locked out of editing until they switch or upgrade —' +
            ' run supabase/tests/template_access/precheck_pro_templates.sql first and decide (grandfather or move).'
          : '') +
        '\n',
    );
  }

  const fields = {
    name: args.name,
    category: args.category,
    tier: args.tier,
    grapesjs_json: grapesjsJson,
    ...(previewUrl ? { preview_url: previewUrl } : {}),
    ...(args.description !== undefined
      ? { description: args.description }
      : {}),
    ...(args.sortOrder !== undefined ? { sort_order: args.sortOrder } : {}),
  };

  if (existing) {
    const { error } = await supabase
      .from('templates')
      .update(fields)
      .eq('id', args.id);
    if (error) throw new StageError(error.message);
    return { created: false, wasActive: existing.is_active };
  }
  // New templates stay hidden until the preview and thumbnail are confirmed.
  const { error } = await supabase
    .from('templates')
    .insert({ id: args.id, ...fields, is_active: false });
  if (error) throw new StageError(error.message);
  return { created: true, wasActive: false };
}

// ── Stage 7–8: deploy, thumbnail ─────────────────────────────────────────────

async function waitForPreview(url: string): Promise<void> {
  const deadline = Date.now() + PREVIEW_POLL_MS;
  let last = '';
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10_000),
        cache: 'no-store',
      });
      if (res.ok) return;
      last = `HTTP ${res.status}`;
    } catch (error) {
      last = (error as Error).message;
    }
    await new Promise((r) => setTimeout(r, 3_000));
  }
  throw new StageError(
    `${url} did not return 200 within ${PREVIEW_POLL_MS / 1000}s (${last}).`,
  );
}

interface PlaywrightLike {
  chromium: {
    launch(options?: { channel?: string }): Promise<{
      newPage(options: {
        viewport: { width: number; height: number };
      }): Promise<{
        goto(
          url: string,
          options: { waitUntil: 'networkidle'; timeout: number },
        ): Promise<unknown>;
        evaluate(fn: () => Promise<unknown>): Promise<unknown>;
        waitForTimeout(ms: number): Promise<void>;
        screenshot(options: { type: 'jpeg'; quality: number }): Promise<Buffer>;
      }>;
      close(): Promise<void>;
    }>;
  };
}

async function loadPlaywright(): Promise<PlaywrightLike | null> {
  try {
    return (await import('playwright')) as unknown as PlaywrightLike;
  } catch {
    return null;
  }
}

async function screenshot(
  playwright: PlaywrightLike,
  url: string,
): Promise<Buffer> {
  // Fall back to the installed Google Chrome when `playwright install chromium` hasn't run.
  const browser = await playwright.chromium
    .launch()
    .catch(() => playwright.chromium.launch({ channel: 'chrome' }));
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.evaluate(() => document.fonts.ready);
    // Let entrance animations (typed text, sliders) settle before capturing.
    await page.waitForTimeout(1_500);
    return await page.screenshot({ type: 'jpeg', quality: 82 });
  } finally {
    await browser.close();
  }
}

// ── main ─────────────────────────────────────────────────────────────────────

function resumeCommand(argv: string[]): string {
  const quoted = argv
    .filter((a) => a !== '--dry-run' && a !== '--no-deploy')
    .map((a) => (/^[\w./=:-]+$/.test(a) ? a : `"${a.replace(/"/g, '\\"')}"`));
  return `pnpm tsx scripts/parse-and-seed-template.ts ${quoted.join(' ')}`;
}

function printSummary(): void {
  console.log('\nSummary');
  console.table(
    summary.map(({ stage, status, detail }) => ({ stage, status, detail })),
  );
}

async function run(argv: string[]): Promise<void> {
  loadEnv();
  const args = parseArgs(argv);
  const filePath = resolve(process.cwd(), args.file);
  const htmlPath = args.html ? resolve(process.cwd(), args.html) : undefined;

  // 1. Validate
  const project = validateProject(filePath, args);
  const exportHtml = htmlPath ? loadExportHtml(htmlPath) : undefined;
  const plugins = (project.custom?.plugins ?? []).map(
    (p) => `${p.id}@${p.version ?? '?'}`,
  );
  record(
    '1 validate',
    '✓',
    `1 page; tier ${args.tier}; plugins: ${plugins.join(', ') || 'none'}`,
  );

  // 2. Collect
  const json = JSON.stringify(project);
  const urls = collectSourceUrls(json, exportHtml ?? '');
  const localRefs = collectLocalAssets(json, exportHtml ?? '');
  record(
    '2 collect',
    '✓',
    `${urls.length} asset URL(s) + ${localRefs.length} local file(s) to migrate`,
  );

  if (args.dryRun) {
    let total = 0;
    for (const url of urls) {
      const res = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      }).catch(() => null);
      const size = Number(res?.headers.get('content-length') ?? 0);
      total += size;
      console.log(
        `    ${res?.ok ? '✓' : '✗'} ${(size / 1024).toFixed(0).padStart(6)} KB  ${url}`,
      );
    }
    for (const ref of localRefs) {
      const path = resolve(args.assetsBase, ref);
      const size = existsSync(path) ? readFileSync(path).length : 0;
      total += size;
      console.log(
        `    ${size ? '✓' : '✗'} ${(size / 1024).toFixed(0).padStart(6)} KB  ${ref}`,
      );
    }
    console.log(
      `\nDry run: ${urls.length + localRefs.length} asset(s), ~${(total / 1024 / 1024).toFixed(2)} MB. Nothing was written.`,
    );
    printSummary();
    return;
  }

  if (resolveStorageProvider((key) => process.env[key]) !== 'r2') {
    throw new StageError(
      'Templates live in R2: set STORAGE_PROVIDER=r2 and the R2_* variables.',
    );
  }
  const storage = createObjectStorage((key) => process.env[key]);
  const supabase = createClient(
    requireEnv('SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const baseUrl = args.preview
    ? requireEnv('TEMPLATE_PREVIEWS_BASE_URL').replace(/\/+$/, '')
    : null;
  const previewUrl = baseUrl ? `${baseUrl}/${args.id}` : null;

  // 3. Migrate
  const replacements = await migrateAssets(
    storage,
    urls,
    localRefs,
    args.assetsBase,
    args.id,
  );
  record(
    '3 migrate to R2',
    '✓',
    `${replacements.size} asset(s) under templates/${args.id}/`,
  );

  // 4. Rewrite
  const rewrittenJson = rewriteUrls(json, replacements);
  const rewrittenHtml = exportHtml
    ? rewriteUrls(exportHtml, replacements)
    : undefined;
  const leftovers = [
    ...collectSourceUrls(rewrittenJson, rewrittenHtml ?? ''),
    ...collectLocalAssets(rewrittenJson, rewrittenHtml ?? ''),
  ];
  if (leftovers.length > 0)
    throw new StageError(
      `URLs left un-migrated:\n    ${leftovers.join('\n    ')}`,
    );
  record(
    '4 rewrite URLs',
    '✓',
    'no cdn.grapesjs.com, Supabase Storage or local asset ref remains',
  );

  // 5. Preview file
  if (args.preview && rewrittenHtml) {
    const dir = join(TEMPLATE_PREVIEWS_DIR, 'public', args.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'index.html'),
      finalizePreviewHtml(rewrittenHtml, args.name),
    );
    record(
      '5 write preview',
      '✓',
      relative(REPO_ROOT, join(dir, 'index.html')),
    );
  } else {
    record('5 write preview', '–', 'skipped (--no-preview)');
  }

  // 6. Database
  const { created, wasActive } = await upsertTemplate(
    supabase,
    args,
    JSON.parse(rewrittenJson),
    previewUrl,
  );
  record(
    '6 upsert templates',
    '✓',
    created ? 'inserted (inactive)' : `updated (is_active=${wasActive} kept)`,
  );

  // 7. Deploy
  let previewLive = false;
  if (!args.preview || !previewUrl) {
    record('7 deploy previews', '–', 'skipped (--no-preview)');
  } else if (!args.deploy) {
    record(
      '7 deploy previews',
      '–',
      'skipped (--no-deploy); run `pnpm --filter @lattiz/template-previews deploy` later',
    );
  } else {
    const deploy = vercel(['deploy', '--prod', '--yes']);
    if (!deploy.ok)
      throw new StageError(
        `vercel deploy failed:\n${deploy.stderr || deploy.stdout}`,
      );
    await waitForPreview(previewUrl);
    previewLive = true;
    record('7 deploy previews', '✓', `${previewUrl} → 200`);
  }

  // 8. Thumbnail
  let thumbnailDone = false;
  if (!args.thumbnail) {
    record('8 thumbnail', '–', 'skipped (--no-thumbnail)');
  } else if (!previewLive || !previewUrl) {
    record('8 thumbnail', '–', 'needs a live preview (stage 7)');
  } else {
    const playwright = await loadPlaywright();
    if (!playwright) {
      record(
        '8 thumbnail',
        '✗',
        'Playwright unavailable — run `pnpm exec playwright install chromium`',
      );
    } else {
      const jpeg = await screenshot(playwright, previewUrl);
      const hash = createHash('sha256').update(jpeg).digest('hex').slice(0, 16);
      const thumbnailUrl = await storage.uploadPublic(
        `templates/${args.id}/thumb-${hash}.jpg`,
        jpeg,
        'image/jpeg',
      );
      const { error } = await supabase
        .from('templates')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', args.id);
      if (error) throw new StageError(error.message);
      thumbnailDone = true;
      record('8 thumbnail', '✓', thumbnailUrl);
    }
  }

  // 9. Activate
  if (previewLive && thumbnailDone) {
    const { error } = await supabase
      .from('templates')
      .update({ is_active: true })
      .eq('id', args.id);
    if (error) throw new StageError(error.message);
    record('9 activate', '✓', 'is_active=true');
  } else {
    record(
      '9 activate',
      '–',
      wasActive
        ? 'left as is (already active)'
        : 'left inactive until stages 7–8 succeed',
    );
    printSummary();
    console.log(`\nResume with:\n  ${resumeCommand(argv)}`);
    return;
  }
  printSummary();
}

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  console.log(
    readFileSync(__filename, 'utf8')
      .split('*/')[0]
      .replace(/^\/\*\*|^ \* ?/gm, ''),
  );
} else {
  run(argv).catch((error: unknown) => {
    record(
      'aborted',
      '✗',
      error instanceof Error ? error.message : String(error),
    );
    printSummary();
    console.log(
      `\nFix the problem above, then resume with:\n  ${resumeCommand(argv)}`,
    );
    process.exit(1);
  });
}
