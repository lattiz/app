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
import {
  TIERS,
  UNCOUNTED_SLOTS,
  type EditableToken,
  type Role,
  type SeoProfile,
  type Tier,
} from '../tiers';
import type {
  Blueprint,
  Business,
  ContentObject,
  ContentPack,
  HeadContent,
  Manifest,
  ManifestMotion,
  SectionMeta,
  Theme,
} from '../types';
import { KitError } from './args';
import { interpolate, renderSection } from './content';
import { applyPrimitiveStyles, primitiveCss } from './primitives';
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
import { bindDemoTokens } from './profile';
import { slotRoles } from './roles';
import { googleFontsHref, themeRootCss } from './theme';

export interface CompiledSection {
  slot: string;
  variant: string;
  role: Role;
  meta: SectionMeta;
  htmlFile: string;
  cssFile: string;
  /** The fragment after content was applied (before GrapesJS), with the demo contact data. */
  rendered: string;
  /** Same fragment with `{{lz:*}}` contact tokens: what the .grapesjs project carries. */
  tokenized: string;
  css: string;
}

export interface CompiledAsset {
  source: string;
  name: string;
  generated: boolean;
}

/** dist/<id>/template.meta.json: what gating, the gallery and the publisher need to know about a template. */
export interface TemplateMeta {
  id: string;
  tier: Tier;
  family: string;
  vertical: string;
  archetype: string;
  exclusive: boolean;
  seoProfile: SeoProfile;
  schemaType: string;
  editableTokens: EditableToken[];
  slots: { slot: string; variant: string; role: Role; counted: boolean }[];
  motion?: ManifestMotion;
}

export interface CompiledTemplate {
  manifest: Manifest;
  meta: TemplateMeta;
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
  /** Primitive CSS files the markup pulled in (kit-relative) and the styles used per family. */
  primitives: { files: string[]; used: Record<string, string[]> };
  outDir: string;
}

const REGION_ORDER = { header: 0, main: 1, footer: 2 } as const;

/** Structure the blueprint fixes (roles, regions, order, variants); counts and required roles are validator findings. */
function checkAgainstBlueprint(
  manifest: Manifest,
  metas: SectionMeta[],
  blueprint: Blueprint,
): Role[] {
  const problems: string[] = [];
  const bySlot = slotRoles(blueprint, manifest.vertical);
  if (!blueprint.archetypes[manifest.archetype])
    problems.push(
      `archetype "${manifest.archetype}" is not one of ${Object.keys(blueprint.archetypes).join(', ')}`,
    );
  const slots = manifest.sections.map((s) => s.slot);
  const roles = manifest.sections.map((entry, i): Role | undefined => {
    const { slot, variant } = entry;
    if (slots.indexOf(slot) !== i)
      problems.push(`slot "${slot}" appears twice`);
    const role = bySlot.get(slot);
    const spec = role ? blueprint.roles[role] : undefined;
    if (!role || !spec) {
      problems.push(
        `slot "${slot}" fills no role of the ${blueprint.family}.${blueprint.tier} blueprint for ${manifest.vertical}`,
      );
      return undefined;
    }
    if (spec.region !== metas[i].region)
      problems.push(`slot "${slot}" must live in <${spec.region}>`);
    if (spec.variants && !spec.variants.includes(variant))
      problems.push(
        `role "${role}" (${slot}) allows variant ${spec.variants.join(' | ')} in ${blueprint.tier}, not "${variant}"`,
      );
    return role;
  });
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
      .map((m, i) => ({ slot: m.slot, region: m.region, role: roles[i] }))
      .filter((m) => m.region === region);
    inRegion.forEach(({ slot, role }, i) => {
      const position = role && blueprint.roles[role]?.position;
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
  return roles.filter((r): r is Role => r !== undefined);
}

function templateMeta(
  manifest: Manifest,
  blueprint: Blueprint,
  sections: CompiledSection[],
): TemplateMeta {
  const tier = TIERS[manifest.tier];
  return {
    id: manifest.id,
    tier: manifest.tier,
    family: manifest.family,
    vertical: manifest.vertical,
    archetype: manifest.archetype,
    exclusive: tier.exclusive,
    seoProfile: tier.seoProfile,
    schemaType: blueprint.verticals[manifest.vertical].schemaType,
    editableTokens: [...tier.editableTokens],
    slots: sections.map((s) => ({
      slot: s.slot,
      variant: s.variant,
      role: s.role,
      counted: !UNCOUNTED_SLOTS.has(s.slot),
    })),
    ...(manifest.motion ? { motion: manifest.motion } : {}),
  };
}

function isRelativeAsset(src: string): boolean {
  return src !== '' && !/^([a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(src);
}

/** Points relative image refs at assets/<vertical>/<theme>/, generating art-directed placeholders for missing files. */
async function resolveImages(
  root: Element,
  vertical: string,
  theme: Theme,
  meta: SectionMeta,
  assets: Map<string, CompiledAsset>,
  assetsRoot: string,
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
    const source = resolve(assetsRoot, vertical, theme.name, name);
    if (!assets.has(name)) {
      const size = meta.placeholder ?? { width: 1200, height: 800 };
      const generated = await ensurePlaceholder(
        source,
        size.width,
        size.height,
        theme,
        vertical,
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

/** In-memory inputs for a compile that must not read or write the kit's folders (spec builds). */
export interface CompileSources {
  theme?: Theme;
  pack?: ContentPack;
  /** Root of `<vertical>/<theme>/` images; missing ones become placeholders there. */
  assetsRoot?: string;
  outDir?: string;
  /** A blueprint other than blueprints/<family>.<tier>.ts (`kit probe` lifts the variant lists). */
  blueprint?: Blueprint;
}

export async function compileManifest(
  manifest: Manifest,
  manifestFile: string | null = null,
  sources: CompileSources = {},
): Promise<CompiledTemplate> {
  const blueprint =
    sources.blueprint ?? (await loadBlueprint(manifest.family, manifest.tier));
  const theme = sources.theme ?? loadTheme(manifest.theme);
  const pack = sources.pack ?? (await loadContentPack(manifest.content));
  if (pack.vertical !== manifest.vertical) {
    throw new KitError(
      `Content pack ${manifest.content} is for "${pack.vertical}", the manifest is "${manifest.vertical}".`,
    );
  }
  const business: Business = { ...pack.business, ...manifest.business };

  const metas = await Promise.all(
    manifest.sections.map((s) => loadSectionMeta(s.slot, s.variant)),
  );
  const roles = checkAgainstBlueprint(manifest, metas, blueprint);

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
      tokens: true,
    });
    if (
      root.getAttribute('data-lz-slot') !== entry.slot ||
      root.getAttribute('data-lz-variant') !== entry.variant
    ) {
      throw new KitError(
        `${relative(KIT_ROOT, htmlFile)}: root must carry data-lz-slot="${entry.slot}" data-lz-variant="${entry.variant}".`,
      );
    }
    applyPrimitiveStyles(root, theme.primitives);
    await resolveImages(
      root,
      manifest.vertical,
      theme,
      meta,
      assets,
      sources.assetsRoot ?? paths.assets,
    );
    sections.push({
      slot: entry.slot,
      variant: entry.variant,
      role: roles[i],
      meta,
      htmlFile,
      cssFile,
      rendered: bindDemoTokens(root.outerHTML, business),
      tokenized: root.outerHTML,
      css: existsSync(cssFile) ? readFileSync(cssFile, 'utf8') : '',
    });
  }

  const headOf = (tokens: boolean): HeadContent => {
    const ctx = {
      business,
      tokens,
      source: `content/${manifest.content}.ts (head)`,
    };
    return {
      title: interpolate(manifest.head?.title ?? pack.head.title, ctx),
      description: interpolate(
        manifest.head?.description ?? pack.head.description,
        ctx,
      ),
    };
  };
  const head = headOf(false);
  const region = (r: SectionMeta['region']) =>
    sections
      .filter((s) => s.meta.region === r)
      .map((s) => s.tokenized)
      .join('');
  const sourceHtml =
    `<!DOCTYPE html><html lang="${pack.locale}"><head>${headHtml(headOf(true), theme)}</head>` +
    `<body><div class="lz-page lz-page--${manifest.tier}" data-lz-name="Página">${region('header')}` +
    `<main data-lz-name="Contenido">${region('main')}</main>${region('footer')}</div></body></html>`;

  const core = readFileSync(paths.core, 'utf8');
  const rootCss = themeRootCss(theme);
  // Primitives: only what the markup uses; legacy templates use none, so their CSS is unchanged.
  const primitives = primitiveCss(sections.map((s) => s.tokenized));
  const sourceCss = [
    rootCss,
    core,
    ...(primitives.css ? [primitives.css] : []),
    ...sections.map((s) => s.css),
  ].join('\n');

  const build = await buildProject({
    documentHtml: sourceHtml,
    css: sourceCss,
    templateId: manifest.id,
    pageName: manifest.name,
    slotNames: Object.fromEntries(sections.map((s) => [s.slot, s.meta.label])),
  });
  // The project keeps the {{lz:*}} tokens; every HTML output shows the demo data.
  const html = bindDemoTokens(build.html, business);
  const previewHtml = html.replace(
    '</head>',
    `<style>${build.css}</style></head>`,
  );

  return {
    manifest,
    meta: templateMeta(manifest, blueprint, sections),
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
    html,
    css: build.css,
    previewHtml: `${previewHtml}\n`,
    assets: [...assets.values()],
    primitives: { files: primitives.files, used: primitives.used },
    outDir: sources.outDir ?? distDir(manifest.id),
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
    role?: Role;
    html: string;
    css: string;
    rendered: string;
  }[];
  core: string;
  /** Kit-relative primitive CSS files (absent when the template uses none). */
  primitives?: string[];
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
      role: s.role,
      html: relative(KIT_ROOT, s.htmlFile),
      css: relative(KIT_ROOT, s.cssFile),
      rendered: s.rendered,
    })),
    core: relative(KIT_ROOT, paths.core),
    ...(t.primitives.files.length ? { primitives: t.primitives.files } : {}),
  };
  out('manifest.json', `${JSON.stringify(snapshot, null, 2)}\n`);
  out('template.meta.json', `${JSON.stringify(t.meta, null, 2)}\n`);
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
