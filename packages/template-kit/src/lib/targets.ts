import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { KitError } from './args';
import type { CompiledTemplate, DistSnapshot } from './compile';
import { listManifestFiles, loadManifest, loadTheme, parseTheme } from './load';
import { KIT_ROOT, paths } from './paths';
import { fingerprint, type Fingerprint } from './similarity';
import { themeFileFor, type ValidationTarget } from './validate';

export function targetFromCompiled(c: CompiledTemplate): ValidationTarget {
  return {
    manifest: c.manifest,
    manifestFile: c.manifestFile,
    theme: c.theme,
    themeFile: themeFileFor(c.theme),
    coreFile: paths.core,
    sections: c.sections.map((s) => ({
      slot: s.slot,
      variant: s.variant,
      role: s.role,
      htmlFile: s.htmlFile,
      cssFile: s.cssFile,
      rendered: s.rendered,
    })),
    previewHtml: c.previewHtml,
    previewFile: resolve(c.outDir, 'index.html'),
    project: c.project,
    projectFile: resolve(c.outDir, `${c.manifest.id}.grapesjs`),
    assetNames: new Set(c.assets.map((a) => a.name)),
  };
}

function isSnapshot(value: unknown): value is DistSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.manifest === 'object' &&
    typeof v.theme === 'object' &&
    Array.isArray(v.sections) &&
    typeof v.core === 'string'
  );
}

/** Rebuilds a target from dist/<id>/ (manifest.json snapshot + compiled files). */
export function targetFromDist(dir: string): ValidationTarget {
  const snapshotFile = resolve(dir, 'manifest.json');
  if (!existsSync(snapshotFile))
    throw new KitError(
      `${snapshotFile} not found; is ${dir} a kit:compile output?`,
    );
  const raw: unknown = JSON.parse(readFileSync(snapshotFile, 'utf8'));
  if (!isSnapshot(raw))
    throw new KitError(`${snapshotFile} is not a template-kit snapshot.`);
  const theme = parseTheme(raw.theme, snapshotFile);
  const projectFile = resolve(dir, `${raw.manifest.id}.grapesjs`);
  if (!existsSync(projectFile)) throw new KitError(`${projectFile} not found.`);
  const assetsDir = resolve(dir, 'assets');
  const libraryTheme = themeFileFor(theme);
  return {
    manifest: raw.manifest,
    manifestFile: raw.manifestFile ? resolve(KIT_ROOT, raw.manifestFile) : null,
    theme,
    themeFile: existsSync(libraryTheme) ? libraryTheme : snapshotFile,
    coreFile: resolve(KIT_ROOT, raw.core),
    sections: raw.sections.map((s) => ({
      slot: s.slot,
      variant: s.variant,
      role: s.role,
      htmlFile: resolve(KIT_ROOT, s.html),
      cssFile: resolve(KIT_ROOT, s.css),
      rendered: s.rendered,
    })),
    previewHtml: readFileSync(resolve(dir, 'index.html'), 'utf8'),
    previewFile: resolve(dir, 'index.html'),
    project: JSON.parse(readFileSync(projectFile, 'utf8')),
    projectFile,
    assetNames: new Set(existsSync(assetsDir) ? readdirSync(assetsDir) : []),
  };
}

/** Fingerprints of every manifest in templates/, for the similarity gate. */
export async function libraryFingerprints(): Promise<Fingerprint[]> {
  const out: Fingerprint[] = [];
  for (const file of listManifestFiles()) {
    const manifest = await loadManifest(file);
    out.push(fingerprint(manifest, loadTheme(manifest.theme)));
  }
  return out;
}
