/**
 * Golden snapshot: every existing template must keep compiling byte for byte, and every spec must
 * keep resolving to the same choices, while the kit grows (extend, never mutate).
 *
 *   pnpm --filter @lattiz/template-kit kit:snapshot          (rewrites golden/snapshot.json)
 *   pnpm --filter @lattiz/template-kit kit:snapshot:add [id|spec stem…]
 *     (verifies every entry, then appends only the missing ones; existing entries stay untouched)
 *   pnpm --filter @lattiz/template-kit kit:verify-snapshot   (exit 1 on any difference)
 *     [--only <id|spec stem>…]
 *
 * Templates compile in memory against a scratch copy of assets/ (nothing in the kit is written).
 * Specs are planned in memory (the values `lattiz build` would write), not built, against the
 * templates of their giro recorded in `peers`: a new template in the giro is library growth, not a
 * kit regression, so it must not move a recorded plan (`kit capacity` reports the live state).
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
import type { Fingerprint } from '../lib/similarity';
import { readSpecFile } from '../spec/build';
import { canonicalJson, planSpec, specHash } from '../spec/compile';
import { valueHash } from '../spec/files';
import { lockPathFor, readLock } from '../spec/lock';

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
  /** Templates of the giro (other than its own) the plan ran against. Absent: the golden's templates. */
  peers?: string[];
  /** Planned with `<stem>.lock.json`, as `lattiz build` does. */
  locked?: boolean;
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

const stemOf = (key: string) =>
  key
    .split('/')
    .at(-1)
    ?.replace(/\.spec\.json$/, '') ?? key;

/**
 * Plans every spec. A spec already in the golden replays its recorded inputs (peers, lock); a new
 * one runs against the live library, with its lock when it has one, and records them.
 */
async function specEntries(
  only: Set<string>,
  recorded: Golden | null,
): Promise<{ entries: Record<string, SpecEntry>; failures: string[] }> {
  const library = await libraryFingerprints();
  const byId = new Map(library.map((f) => [f.id, f]));
  const goldenIds = recorded ? Object.keys(recorded.templates) : null;
  const entries: Record<string, SpecEntry> = {};
  const failures: string[] = [];
  for (const file of specFiles()) {
    const key = relative(KIT_ROOT, file);
    if (only.size > 0 && !only.has(stemOf(key))) continue;
    const { spec, problems } = readSpecFile(file);
    if (!spec)
      throw new Error(
        `${key}: ${problems.map((p) => `${p.path} ${p.message}`).join('; ')}`,
      );
    const prev = recorded?.specs[key];
    let lib: Fingerprint[] = library;
    if (prev) {
      const peerIds = prev.peers ?? goldenIds ?? [];
      const missing = peerIds.filter((id) => !byId.has(id));
      if (prev.peers && missing.length > 0)
        failures.push(
          `${key}: plantillas registradas que ya no existen: ${missing.join(', ')}`,
        );
      const keep = new Set(peerIds);
      lib = library.filter((f) => keep.has(f.id));
    }
    const locked = prev ? prev.locked === true : existsSync(lockPathFor(file));
    const lock = locked ? readLock(lockPathFor(file)) : undefined;
    if (locked && !lock)
      failures.push(`${key}: el lock ya no existe o no se puede leer`);
    const plan = await planSpec(spec, lib, lock);
    const own = new Set('tiers' in plan ? plan.tiers.map((t) => t.id) : []);
    const peers = lib
      .filter((f) => f.vertical === spec.giro && !own.has(f.id))
      .map((f) => f.id)
      .sort();
    const inputs = { peers, ...(locked ? { locked: true } : {}) };
    if (!('tiers' in plan)) {
      entries[key] = {
        ids: [],
        specHash: specHash(spec),
        files: {},
        choices: {
          error: plan.problems.map((p) => `${p.path}: ${p.message}`),
        },
        ...inputs,
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
    entries[key] = {
      ids: plan.tiers.map((t) => t.id),
      specHash: plan.hash,
      files,
      choices,
      ...inputs,
    };
  }
  return { entries, failures };
}

export async function takeSnapshot(
  only: Set<string> = new Set(),
  recorded: Golden | null = null,
) {
  const scratch = mkdtempSync(join(tmpdir(), 'lattiz-golden-'));
  try {
    const specs = await specEntries(only, recorded);
    return {
      templates: await templateEntries(only, scratch),
      specs: specs.entries,
      inputFailures: specs.failures,
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
  const failures: string[] = [...fresh.inputFailures];
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
        `${id}: plantilla nueva, no está en el snapshot (kit:snapshot:add la agrega)`,
      );
  for (const [key, want] of Object.entries(golden.specs)) {
    if (only.size > 0 && !only.has(stemOf(key))) continue;
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
      notes.push(
        `${key}: spec nuevo, no está en el snapshot (kit:snapshot:add lo agrega)`,
      );
  return { failures, notes };
}

const COMMENT =
  'Golden snapshot (kit:snapshot). kit:verify-snapshot must stay clean: existing templates compile byte for byte and specs resolve to the same files. New templates/specs enter with `kit:snapshot:add`; regenerate everything only with an explicit, explained reason.';

function readGolden(): Golden {
  if (!existsSync(GOLDEN_FILE)) {
    console.error('✗ No hay golden/snapshot.json; corre kit:snapshot.');
    process.exit(2);
  }
  return JSON.parse(readFileSync(GOLDEN_FILE, 'utf8')) as Golden;
}

function writeGolden(golden: Golden): void {
  mkdirSync(resolve(KIT_ROOT, 'golden'), { recursive: true });
  writeFileSync(GOLDEN_FILE, `${JSON.stringify(golden, null, 2)}\n`);
}

/** Existing entries keep their bytes (old spec entries only gain `peers`); new ones follow, in kit order. */
function appendEntries(
  golden: Golden,
  fresh: Awaited<ReturnType<typeof takeSnapshot>>,
  pick: Set<string>,
): { templates: string[]; specs: string[] } {
  const added = { templates: [] as string[], specs: [] as string[] };
  const templates: Record<string, TemplateEntry> = {};
  for (const [id, entry] of Object.entries(fresh.templates)) {
    if (golden.templates[id]) templates[id] = golden.templates[id];
    else if (pick.size === 0 || pick.has(id)) {
      templates[id] = entry;
      added.templates.push(id);
    }
  }
  const specs: Record<string, SpecEntry> = {};
  for (const [key, entry] of Object.entries(fresh.specs)) {
    const prev = golden.specs[key];
    if (prev) specs[key] = prev.peers ? prev : { ...prev, peers: entry.peers };
    else if (pick.size === 0 || pick.has(stemOf(key))) {
      specs[key] = entry;
      added.specs.push(key);
    }
  }
  golden.templates = templates;
  golden.specs = specs;
  golden.$comment = COMMENT;
  return added;
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
  if (command === 'write') {
    if (only.size > 0)
      throw new Error(
        'kit:snapshot reescribe todo; no acepta --only (para sumar plantillas usa `kit:snapshot:add`).',
      );
    const fresh = await takeSnapshot();
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    writeGolden({
      $comment: COMMENT,
      version: 1,
      templates: fresh.templates,
      specs: fresh.specs,
    });
    console.log(
      `✓ golden/snapshot.json: ${Object.keys(fresh.templates).length} plantillas, ${Object.keys(fresh.specs).length} specs (${secs} s)`,
    );
    return;
  }
  const golden = readGolden();
  if (command === 'add') {
    const fresh = await takeSnapshot(new Set(), golden);
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    const { failures } = compare(golden, fresh, new Set());
    if (failures.length > 0) {
      for (const f of failures) console.log(`  ✗ ${f}`);
      console.log(
        `\n✗ el snapshot ya difiere en ${failures.length} punto(s); no agregué nada (${secs} s)`,
      );
      process.exit(1);
    }
    const added = appendEntries(golden, fresh, only);
    const unknown = [...only].filter(
      (v) =>
        !added.templates.includes(v) &&
        !added.specs.some((k) => stemOf(k) === v),
    );
    if (unknown.length > 0) {
      console.error(
        `✗ ${unknown.join(', ')}: no es una plantilla ni un spec nuevo; no agregué nada.`,
      );
      process.exit(2);
    }
    writeGolden(golden);
    for (const id of added.templates) console.log(`  + ${id}`);
    for (const key of added.specs) console.log(`  + ${key}`);
    console.log(
      `✓ golden/snapshot.json: ${added.templates.length} plantilla(s) y ${added.specs.length} spec(s) agregados; ninguna entrada existente cambió (${secs} s)`,
    );
    return;
  }
  const fresh = await takeSnapshot(only, golden);
  const secs = ((Date.now() - started) / 1000).toFixed(1);
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
