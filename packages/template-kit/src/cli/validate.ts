/**
 * The gate every template must pass before seeding.
 *
 *   pnpm --filter @lattiz/template-kit kit:validate [dist/<id> | templates/<id>.ts …]   (no args = every manifest)
 *
 * A manifest is compiled in memory (nothing is written); a dist folder is checked as built.
 * Exits 1 on any finding.
 */
import { resolve } from 'node:path';
import { parseArgs, runCli } from '../lib/args';
import { compileFile } from '../lib/compile';
import { listManifestFiles } from '../lib/load';
import { printReport } from '../lib/report';
import {
  libraryFingerprints,
  targetFromCompiled,
  targetFromDist,
} from '../lib/targets';
import { validateTarget } from '../lib/validate';

async function main(): Promise<void> {
  const { positional } = parseArgs(process.argv.slice(2));
  const inputs =
    positional.length > 0
      ? positional.map((p) => resolve(process.cwd(), p))
      : listManifestFiles();
  const others = await libraryFingerprints();
  let ok = true;
  for (const input of inputs) {
    const target = input.endsWith('.ts')
      ? targetFromCompiled(await compileFile(input))
      : targetFromDist(input);
    ok = printReport(target.manifest.id, validateTarget(target, others)) && ok;
  }
  if (!ok) process.exit(1);
}

runCli(main);
