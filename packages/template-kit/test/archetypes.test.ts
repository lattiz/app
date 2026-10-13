import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ARCHETYPES,
  FAMILIES,
  VERTICAL_MODULES,
  archetypePage,
  familyOf,
} from '../archetypes';
import { MODULES } from '../archetypes/verticals';
import basicBlueprint from '../blueprints/service-landing.basic';
import proBlueprint from '../blueprints/service-landing.pro';
import { verticals } from '../blueprints/service-landing.shared';
import { GIROS } from '../giros';
import { EXTENDED_PALETTES } from '../palettes';
import { loadSectionMeta } from '../src/lib/load';
import { paths, sectionDir } from '../src/lib/paths';
import { STYLE_OPTIONS, type StyleKey } from '../src/lib/style';
import { fontPairById, isLegacyVariant } from '../src/spec/catalog';
import { COPY_LIMITS } from '../src/spec/copy-lint';
import { SHAPES } from '../src/spec/presets';
import { TIERS, UNCOUNTED_SLOTS, type Role } from '../src/tiers';
import type { Blueprint, ContentValue } from '../src/types';

const BLUEPRINTS: Record<'basic' | 'pro', Blueprint> = {
  basic: basicBlueprint,
  pro: proBlueprint,
};

const slotOf = (giro: string, role: string): string =>
  role === 'cta' ? 'cta' : (verticals[giro]?.slots[role as Role] ?? role);

const LIST = Object.values(ARCHETYPES);
const TIER_NAMES = ['pro', 'basic'] as const;

/** A variant may fill a role in a tier: extended by its meta.tiers, legacy by the blueprint. */
async function allowed(
  tier: 'basic' | 'pro',
  role: string,
  slot: string,
  variant: string,
): Promise<boolean> {
  if (!existsSync(sectionDir(slot, variant))) return false;
  if (!isLegacyVariant(slot, variant)) {
    const meta = await loadSectionMeta(slot, variant);
    return meta.tiers?.includes(tier) ?? false;
  }
  const listed = BLUEPRINTS[tier].roles[role as Role]?.variants;
  return (
    BLUEPRINTS[tier].roles[role as Role] !== undefined &&
    (!listed || listed.includes(variant))
  );
}

describe('archetypes', () => {
  it('there are the eight of the design principles', () => {
    expect(Object.keys(ARCHETYPES).sort()).toEqual([
      'bold',
      'booking',
      'catalog',
      'editorial',
      'minimal',
      'showcase',
      'soft',
      'trust',
    ]);
  });

  it.each(LIST.map((a) => [a.id, a] as const))(
    '%s: dials, style presets, shapes, moods, giros and specimen exist',
    (_id, a) => {
      for (const d of Object.values(a.dials)) {
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(10);
      }
      for (const [k, v] of Object.entries(a.style))
        expect(
          (STYLE_OPTIONS[k as StyleKey] as readonly string[]).includes(
            v as string,
          ),
          `${k}: ${v}`,
        ).toBe(true);
      for (const shape of a.shapes) expect(SHAPES[shape], shape).toBeDefined();
      expect(a.moods.length).toBeGreaterThan(0);
      for (const g of a.giros) expect(GIROS[g], g).toBeDefined();
      expect(GIROS[a.specimen.giro]).toBeDefined();
      expect(EXTENDED_PALETTES[a.specimen.palette]).toBeDefined();
      expect(fontPairById(a.specimen.fontPair)).toBeDefined();
      // Movement > 4 has to show (principles §1); Básico never animates.
      expect(a.motion === 'editorial').toBe(a.dials.motion >= 6);
    },
  );

  for (const tier of TIER_NAMES)
    it.each(LIST.map((a) => [a.id, a] as const))(
      `%s (${tier}): every variant exists and may fill its role`,
      async (_id, a) => {
        for (const giro of a.giros)
          for (const entry of a.sections[tier])
            for (const variant of entry.variants) {
              const slot = slotOf(giro, entry.role);
              expect(
                await allowed(tier, entry.role, slot, variant),
                `${giro} ${entry.role} → ${slot}/${variant}`,
              ).toBe(true);
            }
      },
    );

  for (const tier of TIER_NAMES)
    it.each(LIST.map((a) => [a.id, a] as const))(
      `%s (${tier}): counted range, required roles, order and families`,
      (_id, a) => {
        const page = archetypePage(a, tier);
        const roles = page.map((p) => p.role);
        const slots = page.map((p) => slotOf(a.specimen.giro, p.role));
        const counted = slots.filter((s) => !UNCOUNTED_SLOTS.has(s)).length;
        expect(counted).toBeGreaterThanOrEqual(TIERS[tier].countedMin);
        expect(counted).toBeLessThanOrEqual(TIERS[tier].countedMax);
        for (const r of TIERS[tier].requiredRoles) expect(roles).toContain(r);
        expect(roles[0]).toBe('header');
        expect(roles[1]).toBe('hero');
        expect(roles.at(-2)).toBe('whatsapp');
        expect(roles.at(-1)).toBe('footer');
        const families = page
          .map((p, i) => familyOf(slots[i], p.variant))
          .filter((f) => f !== 'chrome');
        expect(families.every((f) => f !== undefined)).toBe(true);
        expect(new Set(families).size).toBeGreaterThanOrEqual(4);
        for (let i = 2; i < families.length; i += 1)
          expect(
            families.slice(i - 2, i + 1).every((f) => f === 'media-text'),
            `three image + text in a row at ${i}`,
          ).toBe(false);
      },
    );

  it('every variant folder has a composition family', () => {
    for (const slot of readdirSync(paths.sections, { withFileTypes: true }))
      if (slot.isDirectory())
        for (const v of readdirSync(resolve(paths.sections, slot.name), {
          withFileTypes: true,
        }))
          if (v.isDirectory())
            expect(
              FAMILIES[`${slot.name}/${v.name}`],
              `${slot.name}/${v.name}`,
            ).toBeDefined();
  });

  it('every extended variant is used by an archetype or a vertical module', () => {
    const used = new Set<string>();
    for (const a of LIST)
      for (const tier of TIER_NAMES)
        for (const e of a.sections[tier])
          for (const v of e.variants)
            used.add(`${slotOf(a.specimen.giro, e.role)}/${v}`);
    for (const m of Object.values(MODULES))
      for (const s of m.sections) used.add(`${s.slot}/${s.variant}`);
    for (const slot of readdirSync(paths.sections, { withFileTypes: true }))
      if (slot.isDirectory())
        for (const v of readdirSync(resolve(paths.sections, slot.name), {
          withFileTypes: true,
        }))
          if (v.isDirectory() && !isLegacyVariant(slot.name, v.name))
            expect(
              used.has(`${slot.name}/${v.name}`),
              `${slot.name}/${v.name}`,
            ).toBe(true);
  });
});

const visible = (v: ContentValue): number =>
  typeof v === 'string' ? v.replace(/<[^>]*>/g, '').length : 0;

describe('vertical modules', () => {
  it('cover every giro', () => {
    expect(Object.keys(VERTICAL_MODULES).sort()).toEqual(
      Object.keys(GIROS).sort(),
    );
  });

  it.each(Object.values(VERTICAL_MODULES).map((v) => [v.giro, v] as const))(
    '%s: archetypes and modules exist, copy fills only the module keys within limits',
    async (_giro, v) => {
      for (const a of v.archetypes) expect(ARCHETYPES[a], a).toBeDefined();
      expect(v.modules.length).toBeGreaterThanOrEqual(3);
      for (const m of v.modules) {
        const def = MODULES[m.id];
        expect(def, m.id).toBeDefined();
        for (const s of def.sections)
          for (const tier of s.tiers)
            expect(
              await allowed(tier, s.role, s.slot, s.variant),
              `${s.slot}/${s.variant}`,
            ).toBe(true);
        const keys = Object.entries(m.copy).flatMap(([slot, obj]) =>
          Object.keys(obj).map((k) => `${slot}.${k}`),
        );
        for (const k of def.keys.filter((k) => !k.endsWith('detailImage')))
          expect(keys, `${m.id} needs ${k}`).toContain(k);
        for (const [slot, obj] of Object.entries(m.copy))
          for (const [k, value] of Object.entries(obj)) {
            const path = `${slot}.${k}`;
            expect(def.keys, `${m.id} doesn't declare ${path}`).toContain(path);
            if (COPY_LIMITS[path] !== undefined)
              expect(visible(value), path).toBeLessThanOrEqual(
                COPY_LIMITS[path],
              );
          }
      }
    },
  );
});
