/**
 * Template specs from the kit's side (the guided version is `pnpm lattiz spec|build`).
 *
 *   pnpm --filter @lattiz/template-kit kit:spec build <specs/x.spec.json> [--dry-run] [--diff] [--images placeholder|none|pexels] [--force] [--out dir] [--json]
 *   pnpm --filter @lattiz/template-kit kit:spec validate <specs/x.spec.json>
 *   pnpm --filter @lattiz/template-kit kit:spec schema [--write]     (JSON Schema → stdout or specs/spec.schema.json)
 *   pnpm --filter @lattiz/template-kit kit:spec presets              (curated palettes: contrast and accent hues)
 *
 * Exit codes: 0 ok · 1 a gate failed (validation, uniqueness, drift, frozen) · 2 unusable spec.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GIROS } from '../../giros';
import { hueOf, parseColor } from '../lib/color';
import { KIT_ROOT } from '../lib/paths';
import { buildSpec, readSpecFile } from '../spec/build';
import type { ImageMode } from '../spec/images';
import { specJsonSchema, type SpecProblem } from '../spec/schema';
import { paletteFindings } from '../spec/theme';
import { validateSpec } from '../spec/validate';

const BOOLEAN = new Set(['dry-run', 'diff', 'force', 'json', 'write']);

function args(argv: string[]) {
  const positional: string[] = [];
  const flags = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (!t.startsWith('--')) positional.push(t);
    else if (BOOLEAN.has(t.slice(2))) flags.set(t.slice(2), 'true');
    else flags.set(t.slice(2), argv[(i += 1)] ?? '');
  }
  return { positional, flags };
}

function printProblems(problems: SpecProblem[]): void {
  for (const p of problems)
    console.log(
      `  ${p.level === 'error' ? '✗' : '!'} ${p.path}: ${p.message}${p.hint ? `\n      → ${p.hint}` : ''}`,
    );
}

async function main(): Promise<number> {
  const [command, ...rest] = process.argv.slice(2).filter((a) => a !== '--');
  const { positional, flags } = args(rest);
  if (command === 'schema') {
    const json = `${JSON.stringify(specJsonSchema(), null, 2)}\n`;
    if (flags.has('write')) {
      writeFileSync(resolve(KIT_ROOT, 'specs/spec.schema.json'), json);
      console.log('✓ specs/spec.schema.json');
    } else process.stdout.write(json);
    return 0;
  }
  if (command === 'presets') {
    let bad = 0;
    for (const giro of Object.values(GIROS)) {
      console.log(`\n${giro.label} (${giro.id})`);
      for (const [id, p] of Object.entries(giro.palettes)) {
        const accent = parseColor(p.colors.accent);
        const hue = accent ? hueOf(accent) : null;
        const findings = paletteFindings(p);
        bad += findings.length > 0 ? 1 : 0;
        console.log(
          `  ${findings.length ? '✗' : '✓'} ${id.padEnd(16)} ${p.scheme.padEnd(5)} acento ${p.colors.accent} ${hue && hue.chroma > 0.08 ? `${Math.round(hue.hue)}°` : 'gris'}${findings.length ? `  ${findings.join('; ')}` : ''}`,
        );
      }
      console.log(`  tipografías: ${giro.fontPairs.join(', ')}`);
      console.log(`  formas: ${giro.shapes.join(', ')}`);
    }
    return bad > 0 ? 1 : 0;
  }
  const file = positional[0];
  if (!file || (command !== 'build' && command !== 'validate')) {
    console.error(
      'Uso: kit:spec build|validate <specs/x.spec.json> · kit:spec schema [--write] · kit:spec presets',
    );
    return 2;
  }
  if (command === 'validate') {
    const { spec, problems } = readSpecFile(resolve(file));
    const all = spec
      ? [...problems, ...(await validateSpec(spec, resolve(file)))]
      : problems;
    printProblems(all);
    const errors = all.filter((p) => p.level === 'error').length;
    console.log(errors ? `✗ ${errors} error(es)` : '✓ spec válido');
    return errors ? 2 : 0;
  }
  const report = await buildSpec({
    spec: file,
    dryRun: flags.has('dry-run'),
    diff: flags.has('diff'),
    force: flags.has('force'),
    images: (flags.get('images') as ImageMode | undefined) ?? 'placeholder',
    out: flags.get('out'),
  });
  if (flags.has('json')) {
    console.log(JSON.stringify(report, null, 2));
    return report.code;
  }
  printProblems(report.problems);
  for (const t of report.tiers) {
    console.log(`\n▶ ${t.id} (${t.tier}) · tema ${t.theme}`);
    for (const c of t.choices) console.log(`  · ${c}`);
    for (const f of t.findings)
      console.log(
        `  ✗ [${f.rule}] ${f.file}${f.line ? `:${f.line}` : ''} ${f.message}`,
      );
    for (const s of t.similarity)
      console.log(
        `  similitud vs ${s.other}: ${s.score} (límite ${t.similarityLimit})`,
      );
    for (const n of t.imageNotes) console.log(`  · ${n}`);
  }
  for (const f of report.files) {
    console.log(`  ${f.action.padEnd(10)} ${f.path}`);
    if (f.diff) console.log(f.diff.replace(/^/gm, '      '));
  }
  console.log(
    `\n${report.ok ? '✓' : '✗'} ${report.message ?? (report.dryRun ? 'dry run: no se escribió nada' : 'listo')} (${report.ms} ms)`,
  );
  return report.code;
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(2);
  });
