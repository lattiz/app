/**
 * Compiles manifests into dist/<id>/{<id>.grapesjs, index.html, manifest.json, assets/}.
 *
 *   pnpm --filter @lattiz/template-kit kit:compile [templates/<id>.ts …]   (no args = every manifest)
 */
import { relative, resolve } from 'node:path';
import { parseArgs, runCli } from '../lib/args';
import { compileFile, writeCompiled } from '../lib/compile';
import { listManifestFiles } from '../lib/load';
import { KIT_ROOT } from '../lib/paths';

async function main(): Promise<void> {
  const { positional } = parseArgs(process.argv.slice(2));
  const files =
    positional.length > 0
      ? positional.map((p) => resolve(process.cwd(), p))
      : listManifestFiles();
  for (const file of files) {
    const compiled = await compileFile(file);
    writeCompiled(compiled);
    const generated = compiled.assets
      .filter((a) => a.generated)
      .map((a) => a.name);
    console.log(
      `✓ ${compiled.manifest.id} → ${relative(process.cwd(), compiled.outDir) || '.'}`,
    );
    console.log(
      `    ${compiled.sections.length} sections, theme ${compiled.theme.name}, ${compiled.assets.length} image(s)`,
    );
    if (generated.length > 0)
      console.log(
        `    placeholders generated in ${relative(process.cwd(), resolve(KIT_ROOT, 'assets', compiled.manifest.vertical))}: ${generated.join(', ')}`,
      );
  }
}

runCli(main);
