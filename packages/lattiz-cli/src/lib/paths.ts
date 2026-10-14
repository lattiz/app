import { resolve } from 'node:path';

export const CLI_ROOT = resolve(import.meta.dirname, '../..');
export const REPO_ROOT = resolve(CLI_ROOT, '../..');
export const KIT = resolve(REPO_ROOT, 'packages/template-kit');

export const paths = {
  templates: resolve(KIT, 'templates'),
  dist: resolve(KIT, 'dist'),
  demoProfiles: resolve(KIT, 'demo-profiles'),
  previews: resolve(REPO_ROOT, 'apps/template-previews'),
  previewsPublic: resolve(REPO_ROOT, 'apps/template-previews/public'),
  tenantSitesApp: resolve(REPO_ROOT, 'apps/tenant-sites/app'),
  motionSrc: resolve(REPO_ROOT, 'apps/tenant-sites/lib/lz-motion/src'),
  /** Untracked: per-template state, screenshots. */
  work: resolve(REPO_ROOT, '.lattiz'),
  bases: resolve(CLI_ROOT, 'bases.json'),
} as const;

/**
 * Where builds are read from: the kit, or the `--out` folder of a proof build (`lattiz check <id>
 * --root <dir>` sets LATTIZ_BUILD_ROOT), so a template built outside the repo can be checked.
 */
const buildRoot = () =>
  process.env.LATTIZ_BUILD_ROOT ? resolve(process.env.LATTIZ_BUILD_ROOT) : KIT;

export const manifestFile = (id: string) =>
  resolve(paths.templates, `${id}.ts`);
export const distDir = (id: string) => resolve(buildRoot(), 'dist', id);
export const stateFile = (id: string) =>
  resolve(paths.work, 'state', `${id}.json`);
export const shotsDir = (id: string) => resolve(paths.work, 'shots', id);
export const demoProfileFile = (id: string) =>
  resolve(buildRoot(), 'demo-profiles', `${id}.json`);
export const themeFile = (name: string) =>
  resolve(buildRoot(), 'themes', `${name}.json`);
/** The proof build root set by `--root`, or null for the kit. */
export const externalRoot = () =>
  process.env.LATTIZ_BUILD_ROOT ? buildRoot() : null;
export const previewFile = (id: string) =>
  resolve(paths.previewsPublic, id, 'index.html');
