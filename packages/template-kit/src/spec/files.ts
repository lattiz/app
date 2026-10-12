import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as prettier from 'prettier';
import { KIT_ROOT, REPO_ROOT } from '../lib/paths';
import { canonicalJson, shortHash } from './compile';

/**
 * Generated files carry a marker: a first-line comment in TS, a `$lattiz` key in JSON. It names the
 * spec, the spec hash and the hash of the file's value, so a hand edit (hash mismatch) and a freeze
 * (FROZEN) can be told apart from a stale build. Hashes are over the parsed value, not the text,
 * so reformatting (prettier) is not drift.
 */

export type FileKind = 'manifest' | 'theme' | 'pack' | 'demo' | 'credits';
export type MarkerState = 'GENERATED' | 'FROZEN';

export interface Marker {
  state: MarkerState;
  spec: string;
  specHash: string;
  fileHash: string;
}

const MARKER_RE =
  /^(GENERATED|FROZEN) from (\S+) \(spec ([0-9a-f]{12}), file ([0-9a-f]{12})\)/;

export function markerText(m: Marker, ids: string[]): string {
  const head = `${m.state} from ${m.spec} (spec ${m.specHash}, file ${m.fileHash})`;
  return m.state === 'GENERATED'
    ? `${head}. Do not edit: use the spec, or freeze.`
    : `${head}. Hand-owned: lattiz build won't overwrite it; \`pnpm lattiz unfreeze ${ids[0]}\` gives it back to the spec.`;
}

export function parseMarker(text: string): Marker | null {
  const m = MARKER_RE.exec(text);
  return m
    ? {
        state: m[1] as MarkerState,
        spec: m[2],
        specHash: m[3],
        fileHash: m[4],
      }
    : null;
}

export const valueHash = (value: unknown) => shortHash(canonicalJson(value));

const TS_TYPES: Partial<Record<FileKind, string>> = {
  manifest: 'Manifest',
  pack: 'ContentPack',
};

let prettierConfig: prettier.Options | null | undefined;
async function format(text: string, parser: 'typescript' | 'json') {
  prettierConfig ??= await prettier.resolveConfig(resolve(REPO_ROOT, 'x.ts'));
  return prettier.format(text, { ...(prettierConfig ?? {}), parser });
}

export interface GeneratedFile {
  kind: FileKind;
  /** Absolute path. */
  path: string;
  /** Template ids this file belongs to (the shared pack belongs to both of a twin). */
  ids: string[];
  value: unknown;
  hash: string;
}

export function isTs(kind: FileKind): boolean {
  return kind === 'manifest' || kind === 'pack';
}

export async function renderFile(
  file: GeneratedFile,
  marker: Marker,
): Promise<string> {
  const text = markerText(marker, file.ids);
  if (isTs(file.kind)) {
    const type = TS_TYPES[file.kind] as string;
    return format(
      `// ${text}\nimport type { ${type} } from '../src/types';\n\nexport default ${JSON.stringify(file.value, null, 2)} satisfies ${type};\n`,
      'typescript',
    );
  }
  return format(
    `${JSON.stringify({ $lattiz: text, ...(file.value as object) }, null, 2)}\n`,
    'json',
  );
}

export interface Existing {
  state: 'none' | 'generated' | 'frozen' | 'foreign';
  marker?: Marker;
  /** Hash of the value on disk (what the marker's fileHash should be). */
  actualHash?: string;
  value?: unknown;
  text?: string;
}

/** Reads a TS module's default export fresh (tsx compiles it; the query defeats the module cache). */
async function importFresh(path: string): Promise<unknown> {
  const mod = (await import(
    `${pathToFileURL(path).href}?lattiz=${Date.now()}-${Math.random()}`
  )) as { default?: unknown };
  return mod.default;
}

export async function readExisting(
  path: string,
  kind: FileKind,
): Promise<Existing> {
  if (!existsSync(path)) return { state: 'none' };
  const text = readFileSync(path, 'utf8');
  let marker: Marker | null;
  let value: unknown;
  try {
    if (isTs(kind)) {
      marker = parseMarker(text.split('\n')[0].replace(/^\/\/\s*/, ''));
      value = marker ? await importFresh(path) : undefined;
    } else {
      const json = JSON.parse(text) as Record<string, unknown>;
      marker =
        typeof json.$lattiz === 'string' ? parseMarker(json.$lattiz) : null;
      const { $lattiz: _m, ...rest } = json;
      void _m;
      value = rest;
    }
  } catch {
    return { state: 'foreign', text };
  }
  if (!marker) return { state: 'foreign', text };
  return {
    state: marker.state === 'FROZEN' ? 'frozen' : 'generated',
    marker,
    actualHash: valueHash(value),
    value,
    text,
  };
}

export function writeAtomic(path: string, content: string | Buffer): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.lattiz-tmp`;
  writeFileSync(tmp, content);
  renameSync(tmp, path);
}

/** Unified diff of two texts (git diff --no-index), labelled with the kit-relative path. */
export function unifiedDiff(
  path: string,
  before: string,
  after: string,
  scratch: string,
): string {
  const a = resolve(scratch, 'diff-a');
  const b = resolve(scratch, 'diff-b');
  writeFileSync(a, before);
  writeFileSync(b, after);
  const out = spawnSync(
    'git',
    ['diff', '--no-index', '--no-color', '--minimal', '--', a, b],
    { encoding: 'utf8' },
  ).stdout;
  const label = relative(KIT_ROOT, path);
  return (out ?? '')
    .split('\n')
    .filter((l) => !/^(diff --git|index )/.test(l))
    .map((l) =>
      l.startsWith('--- ')
        ? `--- ${label} (actual)`
        : l.startsWith('+++ ')
          ? `+++ ${label} (spec)`
          : l,
    )
    .join('\n')
    .trim();
}

/** Rewrites only the marker (FROZEN ⇄ GENERATED), keeping the rest of the file byte for byte. */
export function setMarkerState(
  path: string,
  kind: FileKind,
  state: MarkerState,
  ids: string[],
  fileHash?: string,
): boolean {
  const text = readFileSync(path, 'utf8');
  const find = isTs(kind)
    ? /^\/\/ ((?:GENERATED|FROZEN) from [^\n]*)/
    : /"\$lattiz": "((?:GENERATED|FROZEN) from [^"\n]*(?:\\"[^"\n]*)*)"/;
  const m = find.exec(text);
  const marker = m ? parseMarker(m[1]) : null;
  if (!m || !marker) return false;
  const next = markerText(
    { ...marker, state, fileHash: fileHash ?? marker.fileHash },
    ids,
  );
  writeAtomic(
    path,
    text.replace(m[0], () =>
      isTs(kind) ? `// ${next}` : `"$lattiz": ${JSON.stringify(next)}`,
    ),
  );
  return true;
}
