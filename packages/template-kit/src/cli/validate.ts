/**
 * The gate every template must pass before seeding.
 *
 *   pnpm --filter @lattiz/template-kit kit:validate [dist/<id> | templates/<id>.ts …] [--strict-budget]
 *   (no args = every manifest)
 *
 * A manifest is compiled in memory (nothing is written); a dist folder is checked as built.
 * Exits 1 on any finding. Byte budgets (budgets.json) are measured on compiled manifests: over
 * budget warns, and fails only with --strict-budget.
 */
import { resolve } from 'node:path';
import { parseArgs, runCli } from '../lib/args';
import { formatBudget, measureBudget } from '../lib/budget';
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
  const { flags, positional } = parseArgs(
    process.argv.slice(2).filter((a) => a !== '--'),
  );
  const strictBudget = flags.has('strict-budget');
  const inputs =
    positional.length > 0
      ? positional.map((p) => resolve(process.cwd(), p))
      : listManifestFiles();
  const others = await libraryFingerprints();
  let ok = true;
  for (const input of inputs) {
    const compiled = input.endsWith('.ts') ? await compileFile(input) : null;
    const target = compiled
      ? targetFromCompiled(compiled)
      : targetFromDist(input);
    ok = printReport(target.manifest.id, validateTarget(target, others)) && ok;
    if (!compiled) continue;
    const budget = measureBudget(compiled);
    for (const line of formatBudget(budget, strictBudget)) console.log(line);
    if (strictBudget && budget.some((b) => b.over)) ok = false;
  }
  if (!ok) process.exit(1);
}

runCli(main);
