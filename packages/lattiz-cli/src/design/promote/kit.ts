import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { gate } from '../../lib/errors';
import { KIT, REPO_ROOT } from '../../lib/paths';

export interface RunResult {
  status: number;
  out: string;
}
/** Runs a kit script; injected in tests so the gates can be exercised without a build. */
export type Runner = (args: string[]) => RunResult;

/** `pnpm --filter @lattiz/template-kit <script> …`, from the repo root. */
export const kitRunner: Runner = (args) => {
  const r = spawnSync('pnpm', ['--filter', '@lattiz/template-kit', ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  });
  return { status: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};

/** `pnpm lattiz …` (probe) from the repo root. */
export const lattizRunner: Runner = (args) => {
  const r = spawnSync('pnpm', ['lattiz', ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  });
  return { status: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};

/** LATTIZ_PROMOTE_KIT points the file writes at a copy of the kit (hermetic tests). */
export const kitFile = (...parts: string[]) =>
  resolve(process.env.LATTIZ_PROMOTE_KIT ?? KIT, ...parts);
export const tail = (out: string, lines = 12) =>
  out.trim().split('\n').slice(-lines).join('\n');

/** Files a promotion may write; always restored on failure and on --dry-run. */
export class Undo {
  private saved = new Map<string, string | null>();
  private created: string[] = [];

  /** Remember a file (or its absence) before it is touched. */
  keep(file: string): void {
    if (!this.saved.has(file))
      this.saved.set(
        file,
        existsSync(file) ? readFileSync(file, 'utf8') : null,
      );
  }
  /** Remember a path that did not exist and must be removed on undo. */
  made(dir: string): void {
    this.created.push(dir);
  }
  restore(): void {
    for (const dir of this.created)
      rmSync(dir, { recursive: true, force: true });
    for (const [file, text] of this.saved)
      if (text === null) rmSync(file, { force: true });
      else writeFileSync(file, text);
    this.created = [];
  }
}

/** Generated files `kit:manifest` rewrites for any palette or font change (hash lines). */
export const MANIFEST_FILES = [
  'catalog/catalog.manifest.json',
  '../../apps/api/src/modules/sites/plan-catalog.generated.ts',
] as const;

/** Failing lines of `kit:verify-snapshot`: the gate compares them before and after, not to zero. */
export function snapshotFailures(run: Runner): string[] {
  const r = run(['kit:verify-snapshot']);
  return r.out
    .split('\n')
    .filter((l) => /^\s*✗ /.test(l) && !/snapshot con \d+ diferencia/.test(l))
    .map((l) => l.trim())
    .sort();
}

/** Tracked files changed in the working tree, repo-relative. */
export function changedFiles(): string[] {
  const r = spawnSync('git', ['status', '--porcelain'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  return r.stdout
    .split('\n')
    .filter(Boolean)
    .map((l) => l.slice(3));
}

export class GateFailure extends Error {
  constructor(
    readonly gateName: string,
    readonly detail: string,
  ) {
    super(`Compuerta «${gateName}» no pasó`);
  }
}

export const failed = (g: GateFailure) =>
  gate(`${g.message}.`, g.detail ? `\n${g.detail}` : undefined);

/** The shared tail of every promotion: the snapshot didn't move and the manifest is regenerated. */
export function commonGates(
  run: Runner,
  undo: Undo,
  baseline: string[],
  allowed: string[],
  before: string[],
): string[] {
  const report: string[] = [];
  for (const f of MANIFEST_FILES) undo.keep(kitFile(f));
  const m = run(['kit:manifest']);
  if (m.status !== 0) throw new GateFailure('kit:manifest', tail(m.out));
  const check = run(['kit:manifest', '--check']);
  if (check.status !== 0)
    throw new GateFailure('kit:manifest --check', tail(check.out));
  report.push('kit:manifest --check');
  const after = snapshotFailures(run);
  if (JSON.stringify(after) !== JSON.stringify(baseline))
    throw new GateFailure(
      'kit:verify-snapshot',
      `Cambió el snapshot dorado.\nAntes:\n  ${baseline.join('\n  ') || '(limpio)'}\nDespués:\n  ${after.join('\n  ') || '(limpio)'}`,
    );
  report.push('kit:verify-snapshot idéntico');
  const unexpected = changedFiles().filter(
    (f) =>
      !before.includes(f) && !allowed.some((a) => f === a || f.startsWith(a)),
  );
  if (unexpected.length)
    throw new GateFailure(
      'archivos inesperados',
      `La promoción tocó: ${unexpected.join(', ')}`,
    );
  report.push('sin efectos fuera de lo previsto');
  return report;
}

export const repoRel = (file: string) => relative(REPO_ROOT, file);
