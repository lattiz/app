import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import * as prettier from 'prettier';
import { KIT_ROOT, REPO_ROOT } from '../lib/paths';
import type { Role } from '../tiers';
import { CATALOG_VERSION, type Catalog } from './catalog';
import type { SpecPlan } from './compile';
import type { SpecTier } from './schema';

/**
 * `specs/<stem>.lock.json`: what the compiler resolved for each tier of a spec (palette, font pair,
 * shape, variants, archetype, catalog). `lattiz build` reads it and reuses every choice the spec
 * itself doesn't pin, so a catalog that grows later can never change a built template. A choice
 * that no longer fits (e.g. the spec now pins something that collides) fails instead of moving;
 * `lattiz spec lock <stem> --refresh` re-resolves on purpose.
 */

export interface TierLock {
  tier: SpecTier;
  /** Palette preset id, or `custom` for a spec's own palette. */
  palette: string;
  fontPair: string;
  shape: string;
  archetype: string;
  sections: { role: Role; slot: string; variant: string }[];
}

export interface SpecLock {
  lockVersion: 1;
  /** Kit-relative spec path. */
  spec: string;
  catalog: Catalog;
  catalogVersion: number;
  tiers: Record<string, TierLock>;
}

const NOTE =
  'LOCK: choices the compiler resolved for this spec. `lattiz build` reuses them so a growing catalog never changes these templates; `pnpm lattiz spec lock <stem> --refresh` re-resolves on purpose.';

/** Next to the spec: `<dir>/<stem>.lock.json`. */
export function lockPathFor(specPath: string): string {
  return resolve(
    dirname(specPath),
    `${
      specPath
        .split('/')
        .at(-1)
        ?.replace(/\.spec\.json$/, '') ?? 'spec'
    }.lock.json`,
  );
}

export function readLock(path: string): SpecLock | undefined {
  if (!existsSync(path)) return undefined;
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<SpecLock>;
    return raw.lockVersion === 1 && raw.tiers ? (raw as SpecLock) : undefined;
  } catch {
    return undefined;
  }
}

export function lockFromPlan(plan: SpecPlan, specPath: string): SpecLock {
  return {
    lockVersion: 1,
    spec: relative(KIT_ROOT, specPath),
    catalog: plan.catalog,
    catalogVersion: CATALOG_VERSION,
    tiers: Object.fromEntries(
      plan.tiers.map((t) => [
        t.id,
        {
          tier: t.tier,
          palette: t.resolved.palette,
          fontPair: t.resolved.fontPair,
          shape: t.resolved.shape,
          archetype: t.manifest.archetype,
          sections: t.sections.map((s) => ({
            role: s.role,
            slot: s.slot,
            variant: s.variant,
          })),
        },
      ]),
    ),
  };
}

/** Lock content without the catalogVersion: two locks that resolve the same choices compare equal. */
export function lockChoices(lock: SpecLock): string {
  return JSON.stringify({ catalog: lock.catalog, tiers: lock.tiers });
}

let prettierConfig: prettier.Options | null | undefined;
export async function renderLock(lock: SpecLock): Promise<string> {
  prettierConfig ??= await prettier.resolveConfig(resolve(REPO_ROOT, 'x.json'));
  return prettier.format(JSON.stringify({ $lattiz: NOTE, ...lock }), {
    ...(prettierConfig ?? {}),
    parser: 'json',
  });
}
