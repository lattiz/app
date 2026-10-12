/**
 * Compiles one template and screenshots it at 360/390/768/1024/1440 into dist/<id>/shots/
 * (gitignored), with a report of horizontal overflow, text under 12 px and tap targets under 44 px,
 * plus the viewport-fit report: every [data-lz-fit] section at 1440×900, 1366×768, 1280×720,
 * 1920×1080, 390×844, 360×640 and 844×390 against 0.9 × (window − header).
 *
 *   pnpm template:shots <id>        (repo root)
 *   pnpm --filter @lattiz/template-kit kit:shots <id | templates/<id>.ts>
 */
import { basename, relative, resolve } from 'node:path';
import { KitError, parseArgs, runCli } from '../lib/args';
import { compileFile, writeCompiled } from '../lib/compile';
import { paths } from '../lib/paths';
import { fitReport, MIN_FONT_PX, MIN_TAP_PX, shootWidths } from '../lib/shots';

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
  const fit = await fitReport(compiled.outDir, outDir);
  console.log('  fit ([data-lz-fit] sections, content vs 0.9 × available height):');
  for (const r of fit) {
    const text = r.text !== null ? ` text ${r.text}` : '';
    const cta = r.ctaVisible === null ? '' : r.ctaVisible ? ' CTA visible' : ' CTA below the fold';
    console.log(`    ${r.viewport.padEnd(9)} ${r.slot.padEnd(8)} header ${String(r.header).padStart(3)}  content ${String(r.content).padStart(4)} / ${String(r.fit).padStart(4)}${text}${cta}  ${r.verdict}`);
  }
  console.log(`  reports: ${relative(process.cwd(), resolve(outDir, 'report.json'))}, fit.json`);
}

runCli(main);
