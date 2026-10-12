import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { GIROS } from '../../../template-kit/giros';
import type { BuildReport } from '../../../template-kit/src/spec/build';
import { readSpecFile } from '../../../template-kit/src/spec/build';
import {
  specHash,
  specStem,
  specTargets,
} from '../../../template-kit/src/spec/compile';
import {
  type FileKind,
  readExisting,
} from '../../../template-kit/src/spec/files';
import type { Spec, SpecProblem } from '../../../template-kit/src/spec/schema';
import { usage } from './errors';
import { KIT, manifestFile, REPO_ROOT } from './paths';
import { badge, c, log } from './ui';

export const SPECS_DIR = resolve(KIT, 'specs');
export const specFile = (stem: string) =>
  resolve(SPECS_DIR, `${stem}.spec.json`);

export function listSpecFiles(): string[] {
  if (!existsSync(SPECS_DIR)) return [];
  return readdirSync(SPECS_DIR)
    .filter((f) => f.endsWith('.spec.json'))
    .sort()
    .map((f) => resolve(SPECS_DIR, f));
}

/** Specs that generate `id` (by stem or by derived id). */
export function specFor(id: string): string | undefined {
  for (const file of listSpecFiles()) {
    const { spec } = readSpecFile(file);
    if (!spec) continue;
    if (specStem(spec) === id || specTargets(spec).some((t) => t.id === id))
      return file;
  }
  return undefined;
}

/** A spec path, or an id/stem whose spec lives in packages/template-kit/specs. */
export function resolveSpecArg(arg: string | undefined): string {
  if (!arg)
    throw usage(
      'Falta el spec o el id.',
      'Ejemplo: pnpm lattiz build floreria-lupita (o la ruta a un .spec.json)',
    );
  const asPath = resolve(process.cwd(), arg);
  if (arg.endsWith('.json') || existsSync(asPath)) {
    if (!existsSync(asPath)) throw usage(`No existe ${arg}.`);
    return asPath;
  }
  const found = specFor(arg);
  if (!found)
    throw usage(
      `No hay spec para "${arg}" en packages/template-kit/specs.`,
      `Crea uno con \`pnpm lattiz spec init --giro <giro> --nombre "<nombre>" --twin\`.`,
    );
  return found;
}

export function rel(path: string): string {
  return relative(REPO_ROOT, path);
}

export function printProblems(problems: SpecProblem[]): void {
  for (const p of problems) {
    const mark = p.level === 'error' ? c.red('✗') : c.yellow('!');
    log.plain(`  ${mark} ${c.bold(p.path)}: ${p.message}`);
    if (p.hint) log.hint(p.hint);
  }
}

export type Origin = 'spec' | 'generated' | 'frozen' | 'clone' | 'manual';

export interface OriginInfo {
  origin: Origin;
  spec?: string;
  /** Hand edits on a generated file, spec changed since the build, or a frozen file that the spec no longer matches. */
  drift: string[];
}

/** Where a template comes from and whether its generated files drifted. */
export async function originOf(id: string): Promise<OriginInfo> {
  const file = manifestFile(id);
  if (!existsSync(file)) return { origin: 'spec', drift: [] };
  const first = readFileSync(file, 'utf8').slice(0, 400);
  const existing = await readExisting(file, 'manifest').catch(() => null);
  if (existing?.marker) {
    const drift: string[] = [];
    const m = existing.value as { theme?: string; content?: string };
    const owned: [string, FileKind, string][] = [
      [file, 'manifest', 'manifiesto'],
      [resolve(KIT, 'themes', `${m.theme}.json`), 'theme', 'tema'],
      [resolve(KIT, 'demo-profiles', `${id}.json`), 'demo', 'perfil demo'],
      [resolve(KIT, 'content', `${m.content}.ts`), 'pack', 'copy'],
    ];
    for (const [path, kind, label] of owned) {
      const f =
        path === file
          ? existing
          : await readExisting(path, kind).catch(() => null);
      if (f?.state === 'generated' && f.actualHash !== f.marker?.fileHash)
        drift.push(`${label} editado a mano (${rel(path)})`);
    }
    const specPath = resolve(KIT, existing.marker.spec);
    const { spec } = existsSync(specPath)
      ? readSpecFile(specPath)
      : { spec: undefined };
    if (!spec) drift.push('spec no encontrado');
    else if (specHash(spec) !== existing.marker.specHash)
      drift.push(
        existing.state === 'frozen'
          ? 'el spec cambió desde que se congeló'
          : 'el spec cambió: falta `lattiz build`',
      );
    return {
      origin: existing.state === 'frozen' ? 'frozen' : 'generated',
      spec: existing.marker.spec,
      drift,
    };
  }
  if (/Cloned from \S+ by `pnpm lattiz new`/.test(first))
    return { origin: 'clone', drift: [] };
  return { origin: 'manual', drift: [] };
}

export const ORIGIN_LABEL: Record<Origin, string> = {
  spec: 'spec (sin build)',
  generated: 'generada',
  frozen: 'congelada',
  clone: 'clon',
  manual: 'a mano',
};

const ACTION_LABEL: Record<string, string> = {
  create: c.green('crear'),
  update: c.yellow('actualizar'),
  unchanged: c.gray('sin cambios'),
  frozen: c.red('congelado'),
  edited: c.red('editado a mano'),
  foreign: c.red('no generado'),
  'other-spec': c.red('de otro spec'),
};

export function printBuild(report: BuildReport): void {
  if (report.problems.length > 0) {
    log.plain(c.bold('\nSpec:'));
    printProblems(report.problems);
  }
  for (const t of report.tiers) {
    const label = t.tier === 'pro' ? 'Pro' : 'Básico';
    log.plain(
      `\n${c.bold(t.id)} ${c.gray(`(${label} · tema ${t.theme})`)} ${t.findings.length ? badge('FAIL') : badge('PASS')}`,
    );
    for (const choice of t.choices) log.info(choice);
    for (const f of t.findings)
      log.plain(
        `  ${c.red('✗')} [${f.rule}] ${f.file}${f.line ? `:${f.line}` : ''} ${f.message}`,
      );
    for (const s of t.similarity)
      log.plain(
        c.gray(
          `  similitud vs ${s.other}: ${s.score} (límite ${t.similarityLimit})`,
        ),
      );
    const photos = t.images.filter((i) => i.source === 'pexels').length;
    const files = t.images.filter((i) => i.source === 'file').length;
    const placeholders = t.images.filter(
      (i) => i.source === 'placeholder',
    ).length;
    log.plain(
      c.gray(
        `  imágenes: ${placeholders} placeholder(s)${photos ? `, ${photos} de Pexels` : ''}${files ? `, ${files} archivo(s)` : ''}`,
      ),
    );
    for (const n of t.imageNotes) log.info(n);
  }
  if (report.files.length > 0) {
    log.plain(c.bold('\nArchivos:'));
    for (const f of report.files) {
      log.plain(
        `  ${(ACTION_LABEL[f.action] ?? f.action).padEnd(22)} packages/template-kit/${f.path}`,
      );
      if (f.diff)
        log.plain(
          f.diff
            .split('\n')
            .map((l) =>
              l.startsWith('+')
                ? c.green(`      ${l}`)
                : l.startsWith('-')
                  ? c.red(`      ${l}`)
                  : c.gray(`      ${l}`),
            )
            .join('\n'),
        );
    }
  }
}

/** Ids a spec generates, for hints. */
export function idsOf(spec: Spec): string[] {
  return specTargets(spec).map((t) => t.id);
}

export { GIROS };

/** What to run after a build, in order (`--json` callers such as the Claude Code skill follow it). */
export function nextCommands(report: BuildReport): string[] {
  const stem = report.spec.replace(/^.*\//, '').replace(/\.spec\.json$/, '');
  if (report.code === 2)
    return [`pnpm lattiz spec validate ${stem} --strict --json`];
  if (!report.ok)
    return [
      `pnpm lattiz build ${stem} --dry-run --diff --json`,
      `pnpm lattiz spec validate ${stem} --strict --json`,
    ];
  if (report.dryRun) return [`pnpm lattiz build ${stem} --json`];
  const basico = report.tiers.find((t) => t.tier === 'basico')?.id;
  const pro = report.tiers.find((t) => t.tier === 'pro')?.id;
  return [
    ...report.ids.map((id) => `pnpm lattiz check ${id} --json`),
    ...report.ids.map((id) => `pnpm lattiz review ${id}`),
    ...report.ids.map((id) => `pnpm lattiz dev ${id}`),
    `pnpm lattiz ship ${[basico, pro].filter(Boolean).join(' ')}  # solo con aprobación humana explícita`,
  ];
}
