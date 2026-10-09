/**
 * compile → validate → shoot, then prints the review screenshots and the seed command.
 *
 *   pnpm --filter @lattiz/template-kit kit:build [templates/<id>.ts …]   (no args = every manifest)
 *
 * Screenshots are taken even when validation fails, so the problems can be seen; the exit code is 1.
 * Seeding stays a manual step: nothing here touches R2, Supabase or Vercel.
 */
import { relative, resolve } from 'node:path';
import { parseArgs, runCli } from '../lib/args';
import { compileFile, seedCommand, writeCompiled } from '../lib/compile';
import { listManifestFiles } from '../lib/load';
import { REPO_ROOT } from '../lib/paths';
import { printReport } from '../lib/report';
import { shootDist } from '../lib/shoot';
import { libraryFingerprints, targetFromCompiled } from '../lib/targets';
import { validateTarget } from '../lib/validate';

async function main(): Promise<void> {
  const { positional } = parseArgs(process.argv.slice(2));
  const files =
    positional.length > 0
      ? positional.map((p) => resolve(process.cwd(), p))
      : listManifestFiles();
  const others = await libraryFingerprints();
  const seeds: string[] = [];
  let ok = true;
  for (const file of files) {
    const compiled = await compileFile(file);
    writeCompiled(compiled);
    console.log(`\n▶ ${compiled.manifest.id}`);
    console.log(`✓ compile → ${relative(process.cwd(), compiled.outDir)}`);
    const passed = printReport(
      compiled.manifest.id,
      validateTarget(targetFromCompiled(compiled), others),
    );
    ok = passed && ok;
    const shots = await shootDist(compiled.outDir);
    console.log('✓ shoot');
    for (const shot of [shots.thumbnail, ...shots.review])
      console.log(`    ${relative(process.cwd(), shot)}`);
    if (passed) seeds.push(seedCommand(compiled));
  }
  if (seeds.length > 0) {
    console.log(
      `\nReview the screenshots, then seed from the repo root (${relative(process.cwd(), REPO_ROOT) || '.'}):`,
    );
    for (const cmd of seeds) console.log(`\n  ${cmd}`);
  }
  if (!ok) {
    console.error(
      '\n✗ Validation failed — fix the findings above before seeding.',
    );
    process.exit(1);
  }
}

runCli(main);
