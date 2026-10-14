/**
 * catalog/catalog.manifest.json: one generated, committed description of every section variant
 * (tier eligibility, content keys, anchors, fit, Motion), archetypes, palettes and font pairs, so the
 * API and the editor can read the catalog without importing the compiler.
 *
 *   pnpm --filter @lattiz/template-kit kit:manifest            (writes it)
 *   pnpm --filter @lattiz/template-kit kit:manifest --check    (exit 1 when the file is stale)
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import * as prettier from 'prettier';
import { ARCHETYPES, familyOf } from '../../archetypes';
import { verticals } from '../../blueprints/service-landing.shared';
import type {
  CatalogArchetype,
  CatalogFontPair,
  CatalogManifest,
  CatalogPalette,
  CatalogTier,
  CatalogVariant,
} from '../../catalog/types';
import { EXTENDED_FONT_PAIRS } from '../../font-pairs';
import { GIROS } from '../../giros';
import { EXTENDED_PALETTES } from '../../palettes';
import { parseArgs, runCli } from '../lib/args';
import { hueOf, parseColor } from '../lib/color';
import {
  listManifestFiles,
  loadBlueprint,
  loadManifest,
  loadSectionMeta,
} from '../lib/load';
import { KIT_ROOT, paths, REPO_ROOT, sectionDir } from '../lib/paths';
import { CATALOG_VERSION, isLegacyVariant } from '../spec/catalog';
import { allowedVariants, canonicalJson } from '../spec/compile';
import { FONT_PAIRS, type GiroPalette } from '../spec/presets';
import type { Role } from '../tiers';

export const MANIFEST_FILE = resolve(KIT_ROOT, 'catalog/catalog.manifest.json');

/** Attributes the Lattiz Motion runtime reads (apps/tenant-sites/lib/lz-motion › MOTION_ATTR_RE). */
const HOOKS = [
  'data-lz-reveal',
  'data-lz-stagger',
  'data-lz-counter',
  'data-lz-words',
  'data-lz-parallax',
  'data-lz-lightbox',
  'data-lz-compare',
  'data-lz-countdown',
  'data-lz-open-now',
];

/** The seed's slot → Motion type table and the runtime's default patterns, read from the source. */
function motionTables(): {
  types: Record<string, string>;
  patterns: Record<string, string>;
} {
  const file = resolve(REPO_ROOT, 'scripts/lib/motion-sections.ts');
  const text = readFileSync(file, 'utf8');
  const block = (name: string) => {
    const m = new RegExp(`const ${name}[^=]*=\\s*\\{([^}]*)\\}`).exec(text);
    if (!m)
      throw new Error(`${relative(REPO_ROOT, file)}: no encontré ${name}`);
    return Object.fromEntries(
      [...m[1].matchAll(/([a-z-]+):\s*'([a-z-]+)'/g)].map((x) => [x[1], x[2]]),
    );
  };
  return { types: block('SLOT_TYPES'), patterns: block('DEFAULT_PATTERN') };
}

const sorted = <T>(xs: Iterable<T>) => [...new Set(xs)].sort() as T[];

function accentHue(p: GiroPalette): number | null {
  const c = parseColor(p.colors.accent);
  const h = c ? hueOf(c) : null;
  return h && h.chroma > 0.08 ? Math.round(h.hue) : null;
}

async function variants(): Promise<CatalogVariant[]> {
  const blueprints = {
    basic: await loadBlueprint('service-landing', 'basic'),
    pro: await loadBlueprint('service-landing', 'pro'),
  };
  const roleSlots = new Map<string, Set<string>>();
  const blueprintTiers = new Map<string, Set<CatalogTier>>();
  for (const v of Object.values(verticals))
    for (const [role, slot] of Object.entries(v.slots)) {
      if (!roleSlots.has(slot)) roleSlots.set(slot, new Set());
      roleSlots.get(slot)?.add(role);
    }
  for (const tier of ['basic', 'pro'] as const) {
    const bp = blueprints[tier];
    for (const role of Object.keys(bp.roles) as Role[])
      for (const [slot, roles] of roleSlots)
        if (roles.has(role))
          for (const variant of allowedVariants(bp, role, slot, 'extended')) {
            const key = `${slot}/${variant}`;
            if (!blueprintTiers.has(key)) blueprintTiers.set(key, new Set());
            blueprintTiers.get(key)?.add(tier);
          }
  }
  const motion = motionTables();
  const out: CatalogVariant[] = [];
  const slots = readdirSync(paths.sections, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const slot of slots) {
    const names = readdirSync(resolve(paths.sections, slot), {
      withFileTypes: true,
    })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    for (const variant of names) {
      const meta = await loadSectionMeta(slot, variant);
      const htmlFile = resolve(sectionDir(slot, variant), 'section.html');
      const html = existsSync(htmlFile) ? readFileSync(htmlFile, 'utf8') : '';
      const key = `${slot}/${variant}`;
      const bpTiers = sorted(blueprintTiers.get(key) ?? []);
      const tiers = sorted(meta.tiers ?? bpTiers);
      const type = motion.types[slot];
      out.push({
        key,
        slot,
        variant,
        label: meta.label,
        region: meta.region,
        description: meta.description,
        intent: meta.intent ?? null,
        catalog: isLegacyVariant(slot, variant) ? 'legacy' : 'extended',
        tiers,
        blueprintTiers: bpTiers,
        proOnly:
          tiers.length > 0 &&
          !tiers.includes('basic') &&
          !bpTiers.includes('basic'),
        roles: sorted(roleSlots.get(slot) ?? []),
        contentKeys: meta.contentKeys,
        anchors: sorted(
          [...html.matchAll(/\sid="([a-z0-9-]+)"/g)].map((m) => m[1]),
        ),
        fit: /\sdata-lz-fit\b/.test(html),
        numbered: meta.numbered === true,
        archetypes: meta.archetypes ?? [],
        family: familyOf(slot, variant) ?? null,
        motion: type ? { type, pattern: motion.patterns[type] ?? null } : null,
        hooks: HOOKS.filter((h) => new RegExp(`\\s${h}\\b`).test(html)),
      });
    }
  }
  return out;
}

/** Every variant a Básico template uses must stay Básico-eligible, or the plan guard would flag it. */
async function checkBasicTemplates(list: CatalogVariant[]): Promise<string[]> {
  const byKey = new Map(list.map((v) => [v.key, v]));
  const problems: string[] = [];
  for (const file of listManifestFiles()) {
    const m = await loadManifest(file);
    if (m.tier !== 'basic') continue;
    for (const s of m.sections) {
      const v = byKey.get(`${s.slot}/${s.variant}`);
      if (v?.proOnly)
        problems.push(
          `${m.id}: usa ${v.key}, que el manifiesto marca solo Pro`,
        );
    }
  }
  return problems;
}

function palette(
  id: string,
  p: GiroPalette & { mode?: string; mood?: string[]; affinity?: string[] },
): CatalogPalette {
  return {
    id,
    label: p.label,
    scheme: p.scheme,
    mode: p.mode ?? null,
    mood: p.mood ?? [],
    affinity: p.affinity ?? [],
    accentHue: accentHue(p),
  };
}

export async function buildManifest(): Promise<CatalogManifest> {
  const list = await variants();
  const problems = await checkBasicTemplates(list);
  if (problems.length > 0) throw new Error(problems.join('\n'));
  const archetypes: CatalogArchetype[] = Object.values(ARCHETYPES).map((a) => ({
    id: a.id,
    label: a.label,
    intent: a.intent,
    dials: a.dials,
    motion: a.motion,
    moods: a.moods,
    giros: a.giros,
    sections: { pro: a.sections.pro, basic: a.sections.basic },
  }));
  const fontPairs: CatalogFontPair[] = [
    ...Object.entries(FONT_PAIRS).map(([id, f]) => ({
      id,
      label: f.label,
      catalog: 'legacy' as const,
      mood: [],
      affinity: Object.values(GIROS)
        .filter((g) => g.fontPairs.includes(id))
        .map((g) => g.id),
    })),
    ...Object.entries(EXTENDED_FONT_PAIRS).map(([id, f]) => ({
      id,
      label: f.label,
      catalog: 'extended' as const,
      mood: f.mood,
      affinity: f.affinity,
    })),
  ];
  const body: Omit<CatalogManifest, 'contentHash'> = {
    $comment:
      'GENERATED by `pnpm --filter @lattiz/template-kit kit:manifest` from sections/, blueprints/, archetypes/, palettes/, font-pairs/ and giros/. Do not edit; types in catalog/types.ts.',
    manifestVersion: 1,
    catalogVersion: CATALOG_VERSION,
    variants: list,
    hooks: HOOKS.map((attribute) => ({ attribute, proOnly: true })),
    archetypes,
    palettes: {
      extended: Object.entries(EXTENDED_PALETTES).map(([id, p]) =>
        palette(id, p),
      ),
      giros: Object.fromEntries(
        Object.values(GIROS).map((g) => [
          g.id,
          Object.entries(g.palettes).map(([id, p]) => palette(id, p)),
        ]),
      ),
    },
    fontPairs,
    giros: Object.values(GIROS).map((g) => ({
      id: g.id,
      label: g.label,
      palettes: Object.keys(g.palettes),
      fontPairs: [...g.fontPairs],
    })),
  };
  const contentHash = createHash('sha256')
    .update(canonicalJson(body))
    .digest('hex')
    .slice(0, 16);
  const { $comment, manifestVersion, ...rest } = body;
  return { $comment, manifestVersion, contentHash, ...rest };
}

export async function renderManifest(m: CatalogManifest): Promise<string> {
  const config = await prettier.resolveConfig(resolve(REPO_ROOT, 'x.json'));
  return prettier.format(JSON.stringify(m), {
    ...(config ?? {}),
    parser: 'json',
  });
}

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2).filter((a) => a !== '--'));
  const manifest = await buildManifest();
  const text = await renderManifest(manifest);
  const where = relative(process.cwd(), MANIFEST_FILE);
  const summary = `${manifest.variants.length} variantes (${manifest.variants.filter((v) => v.proOnly).length} solo Pro), hash ${manifest.contentHash}`;
  if (flags.has('check')) {
    const current = existsSync(MANIFEST_FILE)
      ? readFileSync(MANIFEST_FILE, 'utf8')
      : '';
    if (current !== text) {
      console.error(
        `✗ ${where} no está al día con el kit; corre \`pnpm --filter @lattiz/template-kit kit:manifest\` y commitea el resultado.`,
      );
      process.exit(1);
    }
    console.log(`✓ ${where} al día: ${summary}`);
    return;
  }
  writeFileSync(MANIFEST_FILE, text);
  console.log(`✓ ${where}: ${summary}`);
}

if (process.argv[1]?.endsWith('manifest.ts')) runCli(main);
