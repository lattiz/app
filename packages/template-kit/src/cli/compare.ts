/**
 * Equivalence report between a reference page (e.g. the Studio fixture) and a compiled template.
 *
 *   pnpm --filter @lattiz/template-kit kit:compare [reference.html] [dist/<id>/index.html]
 *
 * Defaults to fixtures/oxido/index.html vs dist/barberia-oxido-v1/index.html. Compares every element's
 * computed style, own text and attributes at 1280px and 390px; network is blocked on both sides.
 */
import { resolve } from 'node:path';
import { parseArgs, runCli } from '../lib/args';
import { comparePages, type Difference } from '../lib/compare';
import { KIT_ROOT, distDir } from '../lib/paths';

function summarize(diffs: Difference[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const d of diffs) {
    const key = `${d.kind}  ${d.detail}`;
    const list = groups.get(key) ?? [];
    list.push(d.path);
    groups.set(key, list);
  }
  return groups;
}

async function main(): Promise<void> {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const expected = resolve(
    process.cwd(),
    positional[0] ?? resolve(KIT_ROOT, 'fixtures/oxido/index.html'),
  );
  const actual = resolve(
    process.cwd(),
    positional[1] ?? resolve(distDir('barberia-oxido-v1'), 'index.html'),
  );
  const limit = Number(flags.get('limit') ?? 40);
  for (const width of [1280, 390]) {
    const diffs = await comparePages(expected, actual, width);
    const groups = summarize(diffs);
    console.log(
      `\n── ${width}px: ${diffs.length} difference(s) in ${groups.size} group(s)`,
    );
    for (const [key, list] of [...groups].slice(0, limit)) {
      console.log(`  ${key}\n      ×${list.length}  e.g. ${list[0]}`);
    }
  }
}

runCli(main);
