import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { DIRECTIONS } from '../../directions';
import { measureBudget } from '../lib/budget';
import { directionFindings } from './direction';
import { compileManifest, writeCompiled } from '../lib/compile';
import { KIT_ROOT } from '../lib/paths';
import { libraryFingerprints, targetFromCompiled } from '../lib/targets';
import { validateTarget, type Finding } from '../lib/validate';
import { planSpec, type SpecPlan } from './compile';
import {
  lockChoices,
  lockFromPlan,
  lockPathFor,
  readLock,
  renderLock,
} from './lock';
import {
  readExisting,
  renderFile,
  unifiedDiff,
  valueHash,
  writeAtomic,
  type FileKind,
  type GeneratedFile,
} from './files';
import {
  CREDITS_FILE,
  sourceImages,
  type ImageCredit,
  type ImageMode,
} from './images';
import { parseSpec, type Spec, type SpecProblem } from './schema';
import { validateSpec } from './validate';

export interface BuildOptions {
  /** Path to the spec file. */
  spec: string;
  dryRun?: boolean;
  /** Include unified diffs against the current files. */
  diff?: boolean;
  images?: ImageMode;
  /** Write despite kit:validate findings or hand edits (never over a frozen file). */
  force?: boolean;
  /** Write sources and dist under this folder instead of the kit (reproduction checks). */
  out?: string;
}

export type FileAction =
  | 'create'
  | 'update'
  | 'unchanged'
  | 'frozen'
  | 'edited'
  | 'foreign'
  | 'other-spec';

export interface FileReport {
  /** Kit-relative (or --out-relative) path. */
  path: string;
  kind: FileKind;
  ids: string[];
  action: FileAction;
  /** Hash of the generated value (the marker's `file` hash). */
  hash: string;
  diff?: string;
}

export interface TierReport {
  id: string;
  tier: 'pro' | 'basico';
  theme: string;
  choices: string[];
  findings: Finding[];
  similarity: { other: string; score: number }[];
  similarityLimit: number;
  images: ImageCredit[];
  imageNotes: string[];
}

export interface BuildReport {
  ok: boolean;
  /** 0 ok · 1 gate (validation, uniqueness, drift, frozen) · 2 the spec itself is unusable. */
  code: 0 | 1 | 2;
  spec: string;
  hash?: string;
  giro?: string;
  ids: string[];
  dryRun: boolean;
  written: boolean;
  forced: boolean;
  tiers: TierReport[];
  files: FileReport[];
  problems: SpecProblem[];
  /** specs/<stem>.lock.json: whether the build reused it and what it did with it. */
  lock?: {
    path: string;
    used: boolean;
    action: 'create' | 'update' | 'unchanged' | 'skipped';
  };
  message?: string;
  ms: number;
}

const CONFLICTS: FileAction[] = ['frozen', 'edited', 'foreign', 'other-spec'];

export function readSpecFile(path: string): {
  spec?: Spec;
  problems: SpecProblem[];
} {
  if (!existsSync(path))
    return {
      problems: [
        { level: 'error', path: '(archivo)', message: `no existe ${path}` },
      ],
    };
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    return {
      problems: [
        {
          level: 'error',
          path: '(archivo)',
          message: `JSON inválido: ${(error as Error).message}`,
        },
      ],
    };
  }
  const parsed = parseSpec(raw);
  return parsed.ok
    ? { spec: parsed.spec, problems: [] }
    : { problems: parsed.problems };
}

/** Where each generated file lives (under the kit, or under --out). */
function targets(plan: SpecPlan, root: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const ids = plan.tiers.map((t) => t.id);
  for (const t of plan.tiers) {
    files.push({
      kind: 'manifest',
      path: resolve(root, 'templates', `${t.id}.ts`),
      ids: [t.id],
      value: t.manifest,
      hash: valueHash(t.manifest),
    });
    files.push({
      kind: 'theme',
      path: resolve(root, 'themes', `${t.theme.name}.json`),
      ids: [t.id],
      value: t.theme,
      hash: valueHash(t.theme),
    });
    files.push({
      kind: 'demo',
      path: resolve(root, 'demo-profiles', `${t.id}.json`),
      ids: [t.id],
      value: t.demoProfile,
      hash: valueHash(t.demoProfile),
    });
  }
  files.push({
    kind: 'pack',
    path: resolve(root, 'content', `${plan.contentName}.ts`),
    ids,
    value: plan.pack,
    hash: valueHash(plan.pack),
  });
  return files;
}

function imageSize(
  compiled: Awaited<ReturnType<typeof compileManifest>>,
  name: string,
): { width: number; height: number } {
  const section = compiled.sections.find((s) =>
    s.rendered.includes(`assets/${name}`),
  );
  return section?.meta.placeholder ?? { width: 1200, height: 800 };
}

/**
 * Spec → validated in a scratch folder → written to the kit only if every template passes
 * kit:validate and no generated file was hand-edited or frozen. Then the regular kit:compile writes
 * dist/<id>/ so seed, check and dev see exactly what they always see.
 */
export async function buildSpec(opts: BuildOptions): Promise<BuildReport> {
  const started = Date.now();
  const specPath = resolve(opts.spec);
  const specRel = relative(KIT_ROOT, specPath);
  const mode = opts.images ?? 'placeholder';
  const report: BuildReport = {
    ok: false,
    code: 2,
    spec: specRel,
    ids: [],
    dryRun: Boolean(opts.dryRun),
    written: false,
    forced: false,
    tiers: [],
    files: [],
    problems: [],
    ms: 0,
  };
  const done = (code: 0 | 1 | 2, message?: string): BuildReport => {
    report.code = code;
    report.ok = code === 0;
    if (message) report.message = message;
    report.ms = Date.now() - started;
    return report;
  };

  const { spec, problems } = readSpecFile(specPath);
  report.problems.push(...problems);
  if (!spec) return done(2, 'el spec no es válido');
  report.problems.push(...(await validateSpec(spec, specPath)));
  if (report.problems.some((p) => p.level === 'error'))
    return done(2, 'el spec tiene errores');

  let library;
  try {
    library = await libraryFingerprints();
  } catch (error) {
    return done(
      2,
      `no pude leer las plantillas del kit: ${(error as Error).message}`,
    );
  }
  const lockFile = lockPathFor(specPath);
  const lock = readLock(lockFile);
  const planned = await planSpec(spec, library, lock);
  report.problems.push(...planned.problems);
  if (
    !('tiers' in planned) ||
    planned.problems.some((p) => p.level === 'error')
  )
    return done(1, 'no se pudo resolver el spec sin chocar con el giro');
  const plan = planned;
  const root = opts.out ? resolve(opts.out) : KIT_ROOT;
  const lockTarget = opts.out
    ? resolve(root, 'specs', lockFile.split('/').at(-1) as string)
    : lockFile;
  const nextLock = lockFromPlan(plan, specPath);
  const lockAction = !lock
    ? 'create'
    : lockChoices(lock) === lockChoices(nextLock)
      ? 'unchanged'
      : 'update';
  report.lock = {
    path: relative(opts.out ? root : KIT_ROOT, lockTarget),
    used: Boolean(lock && lock.catalog === plan.catalog),
    action: 'skipped',
  };
  report.hash = plan.hash;
  report.giro = plan.giro.id;
  report.ids = plan.tiers.map((t) => t.id);

  const scratch = mkdtempSync(join(tmpdir(), 'lattiz-spec-'));
  try {
    const files = targets(plan, root);
    const marker = (f: GeneratedFile) => ({
      state: 'GENERATED' as const,
      spec: specRel,
      specHash: plan.hash,
      fileHash: f.hash,
    });
    const rendered = new Map<string, string>();
    for (const f of files) rendered.set(f.path, await renderFile(f, marker(f)));

    // Compile + validate every tier in the scratch folder.
    const compiledByTier = new Map<
      string,
      Awaited<ReturnType<typeof compileManifest>>
    >();
    const credits = new Map<string, ImageCredit[]>();
    const others = library.filter((f) => !report.ids.includes(f.id));
    for (const t of plan.tiers) {
      const manifestFile = resolve(scratch, 'kit/templates', `${t.id}.ts`);
      mkdirSync(dirname(manifestFile), { recursive: true });
      writeFileSync(
        manifestFile,
        rendered.get(resolve(root, 'templates', `${t.id}.ts`)) ?? '',
      );
      const assetsRoot = resolve(scratch, 'assets');
      let compiled;
      try {
        compiled = await compileManifest(t.manifest, manifestFile, {
          theme: t.theme,
          pack: plan.pack,
          assetsRoot,
          outDir: resolve(scratch, 'dist', t.id),
        });
      } catch (error) {
        report.problems.push({
          level: 'error',
          path: `sections.${t.tier}`,
          message: `el kit no pudo compilar ${t.id}: ${(error as Error).message}`,
        });
        return done(1, 'falló la compilación');
      }
      const tempDir = resolve(assetsRoot, plan.giro.id, t.theme.name);
      let images;
      try {
        images = await sourceImages({
          spec,
          specDir: dirname(specPath),
          giro: plan.giro,
          mode,
          jobs: compiled.assets.map((a) => ({
            name: a.name,
            ...imageSize(compiled, a.name),
          })),
          kitDir: resolve(root, 'assets', plan.giro.id, t.theme.name),
          tempDir,
          // LCP policy for new work: an existing template keeps its image bytes.
          ...(!existsSync(resolve(KIT_ROOT, 'templates', `${t.id}.ts`))
            ? { hero: { maxWidth: 1200, quality: 72 } }
            : {}),
        });
      } catch (error) {
        return done(2, `imágenes: ${(error as Error).message}`);
      }
      credits.set(t.id, images.credits);
      const siblings = plan.tiers
        .filter((s) => s.id !== t.id)
        .map((s) => s.fingerprint);
      const validation = validateTarget(targetFromCompiled(compiled), [
        ...others,
        ...siblings,
      ]);
      // Layout specs: the art direction's taste rules are part of the gate.
      const direction = t.layout?.direction
        ? DIRECTIONS[t.layout.direction]
        : undefined;
      if (direction)
        for (const f of directionFindings(compiled, direction))
          validation.findings.push({
            rule: 'direction',
            file: t.id,
            message: `${direction.id} › ${f.rule}: ${f.message}`,
          });
      // Byte budgets: a template that doesn't exist yet must fit; an existing one only warns.
      const isNew = !existsSync(resolve(KIT_ROOT, 'templates', `${t.id}.ts`));
      for (const b of measureBudget(compiled).filter((l) => l.over)) {
        const message = `presupuesto de bytes: ${b.metric} ${(b.value / 1024).toFixed(1)} KiB > ${(b.limit / 1024).toFixed(1)} KiB (budgets.json)`;
        if (isNew)
          validation.findings.push({ rule: 'budget', file: t.id, message });
        else
          report.problems.push({
            level: 'warn',
            path: `budget.${t.id}`,
            message,
          });
      }
      compiledByTier.set(t.id, compiled);
      report.tiers.push({
        id: t.id,
        tier: t.tier,
        theme: t.theme.name,
        choices: t.choices,
        findings: validation.findings,
        similarity: validation.similarity,
        similarityLimit: validation.similarityLimit,
        images: images.credits,
        imageNotes: images.notes,
      });
    }
    const failing = report.tiers.some((t) => t.findings.length > 0);
    if (failing && !opts.force)
      return done(
        1,
        'kit:validate encontró problemas; no se escribió nada (--force escribe de todos modos)',
      );

    // Drift and freeze.
    for (const f of files) {
      const existing = opts.out
        ? { state: 'none' as const }
        : await readExisting(f.path, f.kind);
      const text = rendered.get(f.path) as string;
      let action: FileAction;
      if (existing.state === 'none') action = 'create';
      else if (existing.state === 'foreign') action = 'foreign';
      else if (existing.marker?.spec !== specRel) action = 'other-spec';
      else if (existing.state === 'frozen')
        action = existing.actualHash === f.hash ? 'unchanged' : 'frozen';
      else if (existing.actualHash !== existing.marker?.fileHash)
        action = 'edited';
      else if (
        existing.actualHash === f.hash &&
        existing.marker?.specHash === plan.hash
      )
        action = 'unchanged';
      else action = 'update';
      const wantDiff =
        existing.state !== 'none' &&
        action !== 'unchanged' &&
        (CONFLICTS.includes(action) || opts.diff);
      report.files.push({
        path: relative(root, f.path),
        kind: f.kind,
        ids: f.ids,
        action,
        hash: f.hash,
        ...(wantDiff
          ? { diff: unifiedDiff(f.path, existing.text ?? '', text, scratch) }
          : {}),
      });
    }
    const frozen = report.files.filter((f) => f.action === 'frozen');
    const conflicts = report.files.filter(
      (f) => CONFLICTS.includes(f.action) && f.action !== 'frozen',
    );
    if (frozen.length > 0)
      return done(
        1,
        `${frozen.map((f) => f.path).join(', ')} está(n) congelado(s): no se sobrescribe. Revisa el diff; \`pnpm lattiz unfreeze <id>\` lo devuelve al spec`,
      );
    if (conflicts.length > 0 && !opts.force)
      return done(
        1,
        `${conflicts.map((f) => `${f.path} (${f.action === 'edited' ? 'editado a mano' : f.action === 'foreign' ? 'no lo generó un spec' : 'es de otro spec'})`).join(', ')}: no se sobrescribe sin --force`,
      );
    report.forced = Boolean(opts.force) && (failing || conflicts.length > 0);
    if (opts.dryRun) return done(failing ? 1 : 0);

    // Write: sources, images + credits, then dist through the regular compiler.
    for (const f of files) {
      const entry = report.files.find((r) => r.path === relative(root, f.path));
      if (entry && entry.action !== 'unchanged')
        writeAtomic(f.path, rendered.get(f.path) as string);
    }
    for (const t of plan.tiers) {
      const from = resolve(scratch, 'assets', plan.giro.id, t.theme.name);
      const to = resolve(root, 'assets', plan.giro.id, t.theme.name);
      mkdirSync(to, { recursive: true });
      const list = credits.get(t.id) ?? [];
      const compiled = compiledByTier.get(t.id);
      for (const asset of compiled?.assets ?? []) {
        const src = resolve(from, asset.name);
        if (existsSync(src)) copyFileSync(src, resolve(to, asset.name));
      }
      const creditsFile: GeneratedFile = {
        kind: 'credits',
        path: resolve(to, CREDITS_FILE),
        ids: [t.id],
        value: { images: list },
        hash: valueHash({ images: list }),
      };
      writeAtomic(
        creditsFile.path,
        await renderFile(creditsFile, marker(creditsFile)),
      );
    }
    if (opts.out || lockAction !== 'unchanged')
      writeAtomic(lockTarget, await renderLock(nextLock));
    report.lock.action = opts.out ? 'create' : lockAction;
    report.written = true;
    if (opts.out) {
      for (const t of plan.tiers) {
        const compiled = compiledByTier.get(t.id);
        if (compiled)
          writeCompiled({
            ...compiled,
            manifestFile: resolve(root, 'templates', `${t.id}.ts`),
            outDir: resolve(root, 'dist', t.id),
          });
      }
      return done(failing ? 1 : 0);
    }
    for (const t of plan.tiers) {
      const run = spawnSync(
        'pnpm',
        ['exec', 'tsx', 'src/cli/compile.ts', `templates/${t.id}.ts`],
        {
          cwd: KIT_ROOT,
          encoding: 'utf8',
        },
      );
      if (run.status !== 0)
        return done(
          1,
          `kit:compile ${t.id} falló:\n${run.stdout}${run.stderr}`,
        );
    }
    return done(failing ? 1 : 0);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

export interface LockReport {
  /** 0 lock written or already current · 1 the spec no longer reproduces its files · 2 unusable spec. */
  code: 0 | 1 | 2;
  spec: string;
  ids: string[];
  lock: string;
  action: 'create' | 'update' | 'unchanged' | 'none';
  /** Every generated file the spec owns, planned with the lock, equals what is on disk. */
  reproduces: boolean;
  files: { path: string; state: string; same: boolean }[];
  problems: SpecProblem[];
  message?: string;
}

/**
 * Writes `<stem>.lock.json` for a spec after checking that planning it (with its current lock, or
 * from scratch with `refresh`) reproduces the generated files on disk value for value.
 */
export async function lockSpec(
  specFile: string,
  opts: { refresh?: boolean; write?: boolean } = {},
): Promise<LockReport> {
  const specPath = resolve(specFile);
  const lockFile = lockPathFor(specPath);
  const report: LockReport = {
    code: 2,
    spec: relative(KIT_ROOT, specPath),
    ids: [],
    lock: relative(KIT_ROOT, lockFile),
    action: 'none',
    reproduces: false,
    files: [],
    problems: [],
  };
  const { spec, problems } = readSpecFile(specPath);
  report.problems.push(...problems);
  if (!spec) return { ...report, message: 'el spec no es válido' };
  const current = readLock(lockFile);
  const planned = await planSpec(
    spec,
    await libraryFingerprints(),
    opts.refresh ? undefined : current,
  );
  report.problems.push(...planned.problems);
  if (
    !('tiers' in planned) ||
    planned.problems.some((p) => p.level === 'error')
  )
    return { ...report, code: 1, message: 'el spec no se resuelve' };
  report.ids = planned.tiers.map((t) => t.id);
  for (const f of targets(planned, KIT_ROOT)) {
    const existing = await readExisting(f.path, f.kind);
    report.files.push({
      path: relative(KIT_ROOT, f.path),
      state: existing.state,
      same: existing.actualHash === f.hash,
    });
  }
  report.reproduces = report.files.every((f) => f.same);
  if (!report.reproduces)
    return {
      ...report,
      code: 1,
      message:
        'el spec ya no reproduce sus archivos generados (otro catálogo, una edición o un build pendiente): corre `lattiz build` primero; el lock no se escribió',
    };
  const next = lockFromPlan(planned, specPath);
  report.action = !current
    ? 'create'
    : lockChoices(current) === lockChoices(next)
      ? 'unchanged'
      : 'update';
  if (opts.write !== false && report.action !== 'unchanged')
    writeAtomic(lockFile, await renderLock(next));
  return { ...report, code: 0 };
}
