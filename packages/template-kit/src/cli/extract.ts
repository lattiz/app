/**
 * Slices an existing page into the section library.
 *
 *   pnpm --filter @lattiz/template-kit kit:extract <file.grapesjs | index.html [style.css]> \
 *     --vertical barberia --variant urban-luxe [--out <dir>] [--force]
 *
 * Writes <out>/sections/<slot>/<variant>/{section.html,section.css,meta.ts}, <out>/core.css and a
 * theme draft <out>/themes/<variant>-extracted.json, then lists the color literals left to tokenize.
 * <out> defaults to a scratch folder (extracted/<vertical>-<variant>) so the curated library is never clobbered.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import type { ProjectData } from 'grapesjs';
import { KitError, parseArgs, runCli } from '../lib/args';
import {
  extractFromHtml,
  extractFromProject,
  type ExtractResult,
} from '../lib/extract';
import { KIT_ROOT } from '../lib/paths';

function linkedStylesheet(htmlPath: string, html: string): string {
  const href =
    /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](\.?\/?[^"':]+\.css)["']/i.exec(
      html,
    )?.[1] ??
    /<link\b[^>]*href=["'](\.?\/?[^"':]+\.css)["'][^>]*rel=["']stylesheet["']/i.exec(
      html,
    )?.[1];
  if (!href)
    throw new KitError(
      `${htmlPath} links no local stylesheet; pass the CSS file as the second argument.`,
    );
  return resolve(dirname(htmlPath), href);
}

function write(file: string, content: string, force: boolean): void {
  if (existsSync(file) && !force)
    throw new KitError(`${file} exists; pass --force to overwrite.`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

async function main(): Promise<void> {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const vertical = flags.get('vertical');
  const variant = flags.get('variant');
  const [source, cssArg] = positional;
  if (!source || !vertical || !variant) {
    throw new KitError(
      'Usage: kit:extract <file.grapesjs | index.html [style.css]> --vertical <v> --variant <name>',
    );
  }
  const sourcePath = resolve(process.cwd(), source);
  const out = resolve(
    process.cwd(),
    flags.get('out') ??
      resolve(KIT_ROOT, 'extracted', `${vertical}-${variant}`),
  );
  const force = flags.has('force');

  let result: ExtractResult;
  if (sourcePath.endsWith('.grapesjs') || sourcePath.endsWith('.json')) {
    const project = JSON.parse(readFileSync(sourcePath, 'utf8')) as ProjectData;
    result = await extractFromProject(project, variant);
  } else {
    const html = readFileSync(sourcePath, 'utf8');
    const cssPath = cssArg
      ? resolve(process.cwd(), cssArg)
      : linkedStylesheet(sourcePath, html);
    result = extractFromHtml({
      html,
      css: readFileSync(cssPath, 'utf8'),
      fallbackVariant: variant,
    });
  }

  for (const s of result.sections) {
    const dir = resolve(out, 'sections', s.slot, s.variant);
    write(resolve(dir, 'section.html'), s.html, force);
    write(resolve(dir, 'section.css'), s.css, force);
    write(resolve(dir, 'meta.ts'), s.meta, force);
  }
  write(resolve(out, 'core.css'), result.core, force);
  const themeFile = resolve(out, 'themes', `${result.themeDraft.name}.json`);
  write(themeFile, `${JSON.stringify(result.themeDraft, null, 2)}\n`, force);

  console.log(
    `Extracted ${result.sections.length} sections (${vertical}) → ${relative(process.cwd(), out) || '.'}`,
  );
  for (const s of result.sections) {
    console.log(
      `  ${s.region.padEnd(6)} ${s.slot}/${s.variant}  (${s.css.split('\n').filter((l) => l.endsWith('{')).length} rules)`,
    );
  }
  const literals = [
    ...result.coreLiterals.map((l) => `core.css  ${l}`),
    ...result.sections.flatMap((s) =>
      s.literals.map((l) => `${s.slot}/${s.variant}  ${l}`),
    ),
  ];
  console.log(
    `\nTheme draft: ${relative(process.cwd(), themeFile)} (fill every "TODO").`,
  );
  if (literals.length > 0) {
    console.log(
      `\n${literals.length} color literal(s) outside :root to turn into tokens:`,
    );
    for (const l of literals) console.log(`  - ${l}`);
  }
}

runCli(main);
