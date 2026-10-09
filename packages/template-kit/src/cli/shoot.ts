/**
 * Screenshots dist/<id>/index.html: thumbnail.jpg (1280×800) + review/{desktop-full,mobile-390,mobile-390-full}.png.
 *
 *   pnpm --filter @lattiz/template-kit kit:shoot [dist/<id> | templates/<id>.ts …]   (no args = every dist folder)
 */
import { existsSync, readdirSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import { parseArgs, runCli } from '../lib/args';
import { distDir, paths } from '../lib/paths';
import { shootDist } from '../lib/shoot';

function toDistDir(arg: string): string {
  return arg.endsWith('.ts')
    ? distDir(basename(arg, '.ts'))
    : resolve(process.cwd(), arg);
}

async function main(): Promise<void> {
  const { positional } = parseArgs(process.argv.slice(2));
  const dirs =
    positional.length > 0
      ? positional.map(toDistDir)
      : existsSync(paths.dist)
        ? readdirSync(paths.dist).map((d) => resolve(paths.dist, d))
        : [];
  for (const dir of dirs) {
    const shots = await shootDist(dir);
    console.log(`📸 ${basename(dir)}`);
    for (const file of [shots.thumbnail, ...shots.review])
      console.log(`    ${relative(process.cwd(), file)}`);
  }
}

runCli(main);
