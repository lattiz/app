import { resolve } from 'node:path';

export const KIT_ROOT = resolve(import.meta.dirname, '../..');
export const REPO_ROOT = resolve(KIT_ROOT, '../..');

export const paths = {
  sections: resolve(KIT_ROOT, 'sections'),
  core: resolve(KIT_ROOT, 'core.css'),
  themes: resolve(KIT_ROOT, 'themes'),
  content: resolve(KIT_ROOT, 'content'),
  blueprints: resolve(KIT_ROOT, 'blueprints'),
  templates: resolve(KIT_ROOT, 'templates'),
  assets: resolve(KIT_ROOT, 'assets'),
  dist: resolve(KIT_ROOT, 'dist'),
} as const;

export function sectionDir(
  slot: string,
  variant: string,
  root: string = paths.sections,
): string {
  return resolve(root, slot, variant);
}

export function distDir(templateId: string): string {
  return resolve(paths.dist, templateId);
}
