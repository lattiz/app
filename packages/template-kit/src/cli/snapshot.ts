/**
 * Golden snapshot: every existing template must keep compiling byte for byte, and every spec must
 * keep resolving to the same choices, while the kit grows (extend, never mutate).
 *
 *   pnpm --filter @lattiz/template-kit kit:snapshot          (rewrites golden/snapshot.json)
 *   pnpm --filter @lattiz/template-kit kit:verify-snapshot   (exit 1 on any difference)
 *     [--only <id|spec stem>…]
 *
 * Templates compile in memory against a scratch copy of assets/ (nothing in the kit is written).
 * Specs are planned in memory (the values `lattiz build` would write), not built.
 */
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { parseArgs, runCli } from '../lib/args';
import { compileManifest } from '../lib/compile';
import { listManifestFiles, loadContentPack, loadManifest } from '../lib/load';
import { KIT_ROOT, paths } from '../lib/paths';
import { libraryFingerprints } from '../lib/targets';
import { readSpecFile } from '../spec/build';
import { canonicalJson, planSpec, specHash } from '../spec/compile';
import { valueHash } from '../spec/files';

export const GOLDEN_FILE = resolve(KIT_ROOT, 'golden/snapshot.json');

const hash = (text: string | Buffer) =>
  createHash('sha256').update(text).digest('hex').slice(0, 16);

interface Size {
  raw: number;
  gzip: number;
}
const size = (text: string): Size => ({
  raw: Buffer.byteLength(text),
  gzip: gzipSync(text, { level: 9 }).length,
});

export interface TemplateEntry {
  manifest: string;
  /** One hash per output; any change is a regression unless the commit explains it. */
  hashes: {
    project: string;
    html: string;
    css: string;
    rootCss: string;
    theme: string;
    pack: string;
    meta: string;
    assets: string;
  };
  assets: number;
  /** Size baseline: compiled CSS, editor HTML (no inline style) and the preview index.html. */
  size: { css: Size; html: Size; index: Size };
}

export interface SpecEntry {
  ids: string[];
  specHash: string;
  /** valueHash of every file the build would write (the marker's `file` hash). */
  files: Record<string, string>;
  choices: Record<string, string[]>;
}

export interface Golden {
  $comment: string;
  version: 1;
  templates: Record<string, TemplateEntry>;
  specs: Record<string, SpecEntry>;
}

async function templateEntries(
  only: Set<string>,
  scratch: string,
): Promise<Record<string, TemplateEntry>> {
  const assetsRoot = resolve(scratch, 'assets');
  cpSync(paths.assets, assetsRoot, { recursive: true });
  const out: Record<string, TemplateEntry> = {};
  for (const file of listManifestFiles()) {
    const manifest = await loadManifest(file);
    if (only.size > 0 && !only.has(manifest.id)) continue;
    const pack = await loadContentPack(manifest.content);
    const compiled = await compileManifest(manifest, file, {
      assetsRoot,
      outDir: resolve(scratch, 'dist', manifest.id),
    });
    const assetHashes = compiled.assets
      .map((a) => `${a.name}:${hash(readFileSync(a.source))}`)
      .sort();
    out[manifest.id] = {
      manifest: relative(KIT_ROOT, file),
      hashes: {
        project: hash(JSON.stringify(compiled.project)),
        html: hash(compiled.previewHtml),
        css: hash(compiled.css),
        rootCss: hash(compiled.rootCss),
        theme: hash(canonicalJson(compiled.theme)),
        pack: hash(canonicalJson(pack)),
        meta: hash(canonicalJson(compiled.meta)),
        assets: hash(assetHashes.join('\n')),
      },
      assets: assetHashes.length,
      size: {
        css: size(compiled.css),
        html: size(compiled.html),
        index: size(compiled.previewHtml),
      },
    };
  }
  return out;
}

function specFiles(): string[] {
  const dirs = [
    resolve(KIT_ROOT, 'specs'),
    resolve(KIT_ROOT, 'fixtures/spec'),
    resolve(KIT_ROOT, 'fixtures/spec/skill-eval'),
  ];
  return dirs
    .filter((d) => existsSync(d))
    .flatMap((d) =>
      readdirSync(d)
        .filter((f) => f.endsWith('.spec.json'))
        .sort()
        .map((f) => resolve(d, f)),
    );
}

async function specEntries(
  only: Set<string>,
): Promise<Record<string, SpecEntry>> {
  const library = await libraryFingerprints();
  const out: Record<string, SpecEntry> = {};
  for (const file of specFiles()) {
    const key = relative(KIT_ROOT, file);
    const stem =
      key
        .split('/')
        .at(-1)
        ?.replace(/\.spec\.json$/, '') ?? key;
    if (only.size > 0 && !only.has(stem)) continue;
    const { spec, problems } = readSpecFile(file);
    if (!spec)
      throw new Error(
        `${key}: ${problems.map((p) => `${p.path} ${p.message}`).join('; ')}`,
      );
    const plan = await planSpec(spec, library);
    if (!('tiers' in plan)) {
      out[key] = {
        ids: [],
        specHash: specHash(spec),
        files: {},
        choices: {
          error: plan.problems.map((p) => `${p.path}: ${p.message}`),
        },
      };
      continue;
    }
    const files: Record<string, string> = {};
    const choices: Record<string, string[]> = {};
    for (const t of plan.tiers) {
      files[`templates/${t.id}.ts`] = valueHash(t.manifest);
      files[`themes/${t.theme.name}.json`] = valueHash(t.theme);
      files[`demo-profiles/${t.id}.json`] = valueHash(t.demoProfile);
      choices[t.id] = t.choices;
    }
    files[`content/${plan.contentName}.ts`] = valueHash(plan.pack);
    const errors = plan.problems.filter((p) => p.level === 'error');
    if (errors.length > 0)
      choices.error = errors.map((p) => `${p.path}: ${p.message}`);
    out[key] = {
      ids: plan.tiers.map((t) => t.id),
      specHash: plan.hash,
      files,
      choices,
    };
  }
  return out;
}

export async function takeSnapshot(only: Set<string> = new Set()) {
  const scratch = mkdtempSync(join(tmpdir(), 'lattiz-golden-'));
  try {
    return {
      templates: await templateEntries(only, scratch),
      specs: await specEntries(only),
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
const delta = (a: Size, b: Size) =>
  `${kb(a.raw)} → ${kb(b.raw)} (gzip ${kb(a.gzip)} → ${kb(b.gzip)})`;

function compare(
  golden: Golden,
  fresh: Awaited<ReturnType<typeof takeSnapshot>>,
  only: Set<string>,
) {
  const failures: string[] = [];
  const notes: string[] = [];
  for (const [id, want] of Object.entries(golden.templates)) {
    if (only.size > 0 && !only.has(id)) continue;
    const got = fresh.templates[id];
    if (!got) {
      failures.push(`${id}: ya no existe (${want.manifest})`);
      continue;
    }
    for (const [k, v] of Object.entries(want.hashes)) {
      const now = got.hashes[k as keyof TemplateEntry['hashes']];
      if (now !== v) {
        const extra =
          k === 'css'
            ? ` · ${delta(want.size.css, got.size.css)}`
            : k === 'html'
              ? ` · ${delta(want.size.index, got.size.index)}`
              : '';
        failures.push(`${id}: ${k} cambió (${v} → ${now})${extra}`);
      }
    }
  }
  for (const id of Object.keys(fresh.templates))
    if (!golden.templates[id])
      notes.push(
        `${id}: plantilla nueva, no está en el snapshot (kit:snapshot la agrega)`,
      );
  for (const [key, want] of Object.entries(golden.specs)) {
    const stem =
      key
        .split('/')
        .at(-1)
        ?.replace(/\.spec\.json$/, '') ?? key;
    if (only.size > 0 && !only.has(stem)) continue;
    const got = fresh.specs[key];
    if (!got) {
      failures.push(`${key}: ya no existe`);
      continue;
    }
    if (got.specHash !== want.specHash)
      failures.push(`${key}: specHash ${want.specHash} → ${got.specHash}`);
    for (const [file, v] of Object.entries(want.files))
      if (got.files[file] !== v)
        failures.push(
          `${key}: ${file} cambió (${v} → ${got.files[file] ?? 'ausente'})`,
        );
    for (const file of Object.keys(got.files))
      if (!(file in want.files))
        failures.push(`${key}: genera un archivo nuevo ${file}`);
    if (canonicalJson(got.choices) !== canonicalJson(want.choices))
      failures.push(
        `${key}: las elecciones cambiaron\n      antes:  ${canonicalJson(want.choices)}\n      ahora:  ${canonicalJson(got.choices)}`,
      );
  }
  for (const key of Object.keys(fresh.specs))
    if (!golden.specs[key])
      notes.push(`${key}: spec nuevo, no está en el snapshot`);
  return { failures, notes };
}

async function main(): Promise<void> {
  const { flags, positional } = parseArgs(
    process.argv.slice(2).filter((a) => a !== '--'),
  );
  const command = positional[0] ?? 'verify';
  const only = new Set(
    [flags.get('only'), ...positional.slice(1)].filter(
      (v): v is string => Boolean(v) && v !== 'true',
    ),
  );
  const started = Date.now();
  const fresh = await takeSnapshot(only);
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (command === 'write') {
    if (only.size > 0)
      throw new Error('kit:snapshot reescribe todo; no acepta --only.');
    const golden: Golden = {
      $comment:
        'Golden snapshot (kit:snapshot). kit:verify-snapshot must stay clean: existing templates compile byte for byte and specs resolve to the same files. Regenerate only with an explicit, explained reason.',
      version: 1,
      ...fresh,
    };
    mkdirSync(resolve(KIT_ROOT, 'golden'), { recursive: true });
    writeFileSync(GOLDEN_FILE, `${JSON.stringify(golden, null, 2)}\n`);
    console.log(
      `✓ golden/snapshot.json: ${Object.keys(fresh.templates).length} plantillas, ${Object.keys(fresh.specs).length} specs (${secs} s)`,
    );
    return;
  }
  if (!existsSync(GOLDEN_FILE)) {
    console.error('✗ No hay golden/snapshot.json; corre kit:snapshot.');
    process.exit(2);
  }
  const golden = JSON.parse(readFileSync(GOLDEN_FILE, 'utf8')) as Golden;
  const { failures, notes } = compare(golden, fresh, only);
  for (const n of notes) console.log(`  · ${n}`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  const scope = only.size > 0 ? [...only].join(', ') : 'todo';
  if (failures.length > 0) {
    console.log(
      `\n✗ snapshot con ${failures.length} diferencia(s) (${scope}, ${secs} s)`,
    );
    process.exit(1);
  }
  console.log(
    `✓ snapshot idéntico: ${Object.keys(fresh.templates).length} plantillas, ${Object.keys(fresh.specs).length} specs (${scope}, ${secs} s)`,
  );
}

runCli(main);
