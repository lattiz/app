/**
 * Visual QA gallery: section sheets, palette and font pair specimens in .lattiz/gallery/.
 *
 *   pnpm --filter @lattiz/template-kit kit:gallery [--slot hero[,footer]] [--palettes] [--fonts]
 *     [--themes norte-atelier,oxido] [--sin-imagen]
 */
import { relative } from 'node:path';
import { parseArgs, runCli } from '../lib/args';
import { kitGallery } from '../lib/gallery';

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2).filter((a) => a !== '--'));
  const list = (k: string) =>
    flags.get(k) && flags.get(k) !== 'true'
      ? (flags.get(k) as string)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
  const result = await kitGallery({
    slots: list('slot'),
    palettes: flags.has('palettes'),
    fonts: flags.has('fonts'),
    themes: list('themes'),
    noImage: flags.has('sin-imagen'),
    log: (line) => console.log(line),
  });
  console.log(
    `\n✓ ${relative(process.cwd(), result.index)} (${result.shots} capturas, ${(result.ms / 1000).toFixed(1)} s)`,
  );
}

runCli(main);
