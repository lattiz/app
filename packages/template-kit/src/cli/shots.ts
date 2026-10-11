/**
 * Compiles one template and screenshots it at 360/390/768/1024/1440 into dist/<id>/shots/
 * (gitignored), with a report of horizontal overflow, text under 12 px and tap targets under 44 px.
 *
 *   pnpm template:shots <id>        (repo root)
 *   pnpm --filter @lattiz/template-kit kit:shots <id | templates/<id>.ts>
 */
import { basename, relative, resolve } from 'node:path';
import { KitError, parseArgs, runCli } from '../lib/args';
import { compileFile, writeCompiled } from '../lib/compile';
import { paths } from '../lib/paths';
import { MIN_FONT_PX, MIN_TAP_PX, shootWidths } from '../lib/shots';

async function main(): Promise<void> {
  const { positional } = parseArgs(process.argv.slice(2).filter((a) => a !== '--'));
  const [arg] = positional;
  if (!arg) throw new KitError('Usage: kit:shots <template-id>');
  const id = basename(arg, '.ts');
  const compiled = await compileFile(resolve(paths.templates, `${id}.ts`));
  writeCompiled(compiled);
  const outDir = resolve(compiled.outDir, 'shots');
  const reports = await shootWidths(compiled.outDir, outDir);
  console.log(`📸 ${id} → ${relative(process.cwd(), outDir)}`);
  for (const r of reports) {
    const counts = ['overflow', 'small-text', 'tap-target'].map(
      (kind) => r.issues.filter((i) => i.kind === kind).length,
    );
    console.log(
      `  ${String(r.width).padStart(4)} px  overflow ${counts[0]}  text<${MIN_FONT_PX}px ${counts[1]}  tap<${MIN_TAP_PX}px ${counts[2]}`,
    );
    for (const i of r.issues) console.log(`         ${i.kind.padEnd(10)} ${i.selector} — ${i.detail}`);
  }
  console.log(`  report: ${relative(process.cwd(), resolve(outDir, 'report.json'))}`);
}

runCli(main);
