import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import type { ProjectData } from 'grapesjs';
import type {
  Blueprint,
  Business,
  ContentObject,
  HeadContent,
  Manifest,
  SectionMeta,
  Theme,
} from '../types';
import { KitError } from './args';
import { interpolate, renderSection } from './content';
import { escapeHtml } from './dom';
import { buildProject } from './grapes';
import {
  loadBlueprint,
  loadContentPack,
  loadManifest,
  loadSectionMeta,
  loadTheme,
} from './load';
import { KIT_ROOT, distDir, paths, sectionDir } from './paths';
import { ensurePlaceholder } from './placeholders';
import { googleFontsHref, themeRootCss } from './theme';

export interface CompiledSection {
  slot: string;
  variant: string;
  meta: SectionMeta;
  htmlFile: string;
  cssFile: string;
  /** The fragment after content was applied (before GrapesJS). */
  rendered: string;
  css: string;
}

export interface CompiledAsset {
  source: string;
  name: string;
  generated: boolean;
}

export interface CompiledTemplate {
  manifest: Manifest;
  manifestFile: string | null;
  theme: Theme;
  business: Business;
  head: HeadContent;
  sections: CompiledSection[];
  core: string;
  rootCss: string;
  /** Composed document and stylesheet handed to GrapesJS. */
  sourceHtml: string;
  sourceCss: string;
  project: ProjectData;
  /** What the editor exports for this project. */
  html: string;
  css: string;
  previewHtml: string;
  assets: CompiledAsset[];
  outDir: string;
}

const REGION_ORDER = { header: 0, main: 1, footer: 2 } as const;

function checkAgainstBlueprint(
  manifest: Manifest,
  metas: SectionMeta[],
  blueprint: Blueprint,
): void {
  const problems: string[] = [];
  const slots = manifest.sections.map((s) => s.slot);
  slots.forEach((slot, i) => {
    if (slots.indexOf(slot) !== i)
      problems.push(`slot "${slot}" appears twice`);
    const spec = blueprint.slots[slot];
    if (!spec)
      problems.push(
        `slot "${slot}" is not part of the ${blueprint.family} blueprint`,
      );
    else if (spec.region !== metas[i].region)
      problems.push(`slot "${slot}" must live in <${spec.region}>`);
  });
  for (const [slot, spec] of Object.entries(blueprint.slots)) {
    if (spec.required && !slots.includes(slot))
      problems.push(`required slot "${slot}" is missing`);
  }
  metas.forEach((meta, i) => {
    const prev = metas[i - 1];
    if (prev && REGION_ORDER[prev.region] > REGION_ORDER[meta.region]) {
      problems.push(
        `"${meta.slot}" (${meta.region}) cannot come after "${prev.slot}" (${prev.region})`,
      );
    }
  });
  for (const region of ['header', 'main', 'footer'] as const) {
    const inRegion = metas
      .filter((m) => m.region === region)
      .map((m) => m.slot);
    inRegion.forEach((slot, i) => {
      const position = blueprint.slots[slot]?.position;
      if (position === 'first' && i !== 0)
        problems.push(`"${slot}" must be first in <${region}>`);
      if (position === 'last' && i !== inRegion.length - 1)
        problems.push(`"${slot}" must be last in <${region}>`);
    });
  }
  if (problems.length > 0)
    throw new KitError(
      `Manifest ${manifest.id} breaks the blueprint:\n  ${problems.join('\n  ')}`,
    );
}

function isRelativeAsset(src: string): boolean {
  return src !== '' && !/^([a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(src);
}

/** Points relative image refs at assets/<vertical>/, generating placeholders for missing files. */
async function resolveImages(
  root: Element,
  vertical: string,
  meta: SectionMeta,
  assets: Map<string, CompiledAsset>,
): Promise<void> {
  const refs: { el: Element; attr: string }[] = [];
  for (const el of Array.from(
    root.querySelectorAll('img[src], source[src], video[poster]'),
  )) {
    refs.push({ el, attr: el.localName === 'video' ? 'poster' : 'src' });
  }
  for (const { el, attr } of refs) {
    const src = el.getAttribute(attr) ?? '';
    if (!isRelativeAsset(src)) continue;
    const name = basename(src);
    const source = resolve(paths.assets, vertical, name);
    if (!assets.has(name)) {
      const size = meta.placeholder ?? { width: 1200, height: 800 };
      const generated = await ensurePlaceholder(
        source,
        size.width,
        size.height,
      );
      assets.set(name, { source, name, generated });
    }
    el.setAttribute(attr, `assets/${name}`);
  }
}

function headHtml(head: HeadContent, theme: Theme): string {
  return [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<title>${escapeHtml(head.title)}</title>`,
    `<meta name="description" content="${escapeHtml(head.description)}">`,
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link href="${escapeHtml(googleFontsHref(theme))}" rel="stylesheet">`,
  ].join('');
}

export async function compileManifest(
  manifest: Manifest,
  manifestFile: string | null = null,
): Promise<CompiledTemplate> {
  const blueprint = await loadBlueprint(manifest.family);
  const theme = loadTheme(manifest.theme);
  const pack = await loadContentPack(manifest.content);
  if (pack.vertical !== manifest.vertical) {
    throw new KitError(
      `Content pack ${manifest.content} is for "${pack.vertical}", the manifest is "${manifest.vertical}".`,
    );
  }
  const business: Business = { ...pack.business, ...manifest.business };

  const metas = await Promise.all(
    manifest.sections.map((s) => loadSectionMeta(s.slot, s.variant)),
  );
  checkAgainstBlueprint(manifest, metas, blueprint);

  const assets = new Map<string, CompiledAsset>();
  const sections: CompiledSection[] = [];
  let numbered = 0;
  for (const [i, entry] of manifest.sections.entries()) {
    const meta = metas[i];
    const dir = sectionDir(entry.slot, entry.variant);
    const htmlFile = resolve(dir, 'section.html');
    const cssFile = resolve(dir, 'section.css');
    const data: ContentObject = {
      ...(pack.sections[entry.slot] ?? {}),
      ...entry.props,
    };
    const index = meta.numbered
      ? String((numbered += 1)).padStart(2, '0')
      : undefined;
    const root = renderSection(readFileSync(htmlFile, 'utf8'), data, {
      business,
      index,
      source: relative(KIT_ROOT, htmlFile),
    });
    if (
      root.getAttribute('data-lz-slot') !== entry.slot ||
      root.getAttribute('data-lz-variant') !== entry.variant
    ) {
      throw new KitError(
        `${relative(KIT_ROOT, htmlFile)}: root must carry data-lz-slot="${entry.slot}" data-lz-variant="${entry.variant}".`,
      );
    }
    await resolveImages(root, manifest.vertical, meta, assets);
    sections.push({
      slot: entry.slot,
      variant: entry.variant,
      meta,
      htmlFile,
      cssFile,
      rendered: root.outerHTML,
      css: existsSync(cssFile) ? readFileSync(cssFile, 'utf8') : '',
    });
  }

  const ctx = { business, source: `content/${manifest.content}.ts (head)` };
  const head: HeadContent = {
    title: interpolate(manifest.head?.title ?? pack.head.title, ctx),
    description: interpolate(
      manifest.head?.description ?? pack.head.description,
      ctx,
    ),
  };
  const region = (r: SectionMeta['region']) =>
    sections
      .filter((s) => s.meta.region === r)
      .map((s) => s.rendered)
      .join('');
  const sourceHtml =
    `<!DOCTYPE html><html lang="${pack.locale}"><head>${headHtml(head, theme)}</head>` +
    `<body><div class="lz-page" data-lz-name="Página">${region('header')}` +
    `<main data-lz-name="Contenido">${region('main')}</main>${region('footer')}</div></body></html>`;

  const core = readFileSync(paths.core, 'utf8');
  const rootCss = themeRootCss(theme);
  const sourceCss = [rootCss, core, ...sections.map((s) => s.css)].join('\n');

  const build = await buildProject({
    documentHtml: sourceHtml,
    css: sourceCss,
    templateId: manifest.id,
    pageName: manifest.name,
    slotNames: Object.fromEntries(sections.map((s) => [s.slot, s.meta.label])),
  });
  const previewHtml = build.html.replace(
    '</head>',
    `<style>${build.css}</style></head>`,
  );

  return {
    manifest,
    manifestFile,
    theme,
    business,
    head,
    sections,
    core,
    rootCss,
    sourceHtml,
    sourceCss,
    project: build.project,
    html: build.html,
    css: build.css,
    previewHtml: `${previewHtml}\n`,
    assets: [...assets.values()],
    outDir: distDir(manifest.id),
  };
}

export async function compileFile(file: string): Promise<CompiledTemplate> {
  return compileManifest(await loadManifest(file), resolve(file));
}

/** Resolved inputs, so `kit:validate <dist dir>` can re-check sources without the manifest module. */
export interface DistSnapshot {
  manifest: Manifest;
  manifestFile: string | null;
  theme: Theme;
  sections: {
    slot: string;
    variant: string;
    html: string;
    css: string;
    rendered: string;
  }[];
  core: string;
}

export function writeCompiled(t: CompiledTemplate): string[] {
  rmSync(t.outDir, { recursive: true, force: true });
  mkdirSync(resolve(t.outDir, 'assets'), { recursive: true });
  const written: string[] = [];
  const out = (name: string, content: string) => {
    const file = resolve(t.outDir, name);
    writeFileSync(file, content);
    written.push(file);
  };
  out(`${t.manifest.id}.grapesjs`, JSON.stringify(t.project));
  out('index.html', t.previewHtml);
  const snapshot: DistSnapshot = {
    manifest: t.manifest,
    manifestFile: t.manifestFile ? relative(KIT_ROOT, t.manifestFile) : null,
    theme: t.theme,
    sections: t.sections.map((s) => ({
      slot: s.slot,
      variant: s.variant,
      html: relative(KIT_ROOT, s.htmlFile),
      css: relative(KIT_ROOT, s.cssFile),
      rendered: s.rendered,
    })),
    core: relative(KIT_ROOT, paths.core),
  };
  out('manifest.json', `${JSON.stringify(snapshot, null, 2)}\n`);
  for (const asset of t.assets) {
    const target = resolve(t.outDir, 'assets', asset.name);
    copyFileSync(asset.source, target);
    written.push(target);
  }
  return written;
}

export function seedCommand(t: CompiledTemplate): string {
  const q = (v: string) => `"${v.replace(/(["\\$`])/g, '\\$1')}"`;
  return [
    'pnpm tsx scripts/parse-and-seed-template.ts',
    `--dir ${relative(resolve(KIT_ROOT, '../..'), t.outDir)}`,
    `--id ${t.manifest.id}`,
    `--name ${q(t.manifest.name)}`,
    `--category ${t.manifest.category}`,
    `--description ${q(t.manifest.description)}`,
  ].join(' \\\n    ');
}
