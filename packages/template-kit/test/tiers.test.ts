import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  compileFile,
  compileManifest,
  writeCompiled,
  type CompiledTemplate,
  type TemplateMeta,
} from '../src/lib/compile';
import { loadBlueprint, loadManifest } from '../src/lib/load';
import { paths } from '../src/lib/paths';
import { slotRoles } from '../src/lib/roles';
import { libraryFingerprints, targetFromCompiled } from '../src/lib/targets';
import { validateTarget, type ValidationTarget } from '../src/lib/validate';
import { COLOR_TOKENS, type Manifest } from '../src/types';
import {
  TIER_NAMES,
  TIERS,
  UNCOUNTED_SLOTS,
  countedSlots,
  tierRoles,
  type Role,
} from '../src/tiers';

const manifestFile = (id: string) => resolve(paths.templates, `${id}.ts`);

describe('tier model', () => {
  it('keeps the owner-defined ranges, limits and exclusivity', () => {
    expect(TIERS.basic).toMatchObject({
      countedMin: 6,
      countedMax: 7,
      similarityLimit: 0.85,
      seoProfile: 'basic',
      exclusive: false,
    });
    expect(TIERS.pro).toMatchObject({
      countedMin: 8,
      countedMax: 10,
      similarityLimit: 0.5,
      seoProfile: 'advanced',
      exclusive: false,
    });
  });

  it('makes the required roles fit each tier range', () => {
    const counted = (roles: readonly Role[]) =>
      roles.filter((r) => r !== 'whatsapp' && r !== 'marquee').length;
    for (const name of TIER_NAMES) {
      const tier = TIERS[name];
      expect(counted(tier.requiredRoles), name).toBeLessThanOrEqual(
        tier.countedMax,
      );
      expect(counted(tierRoles(name)), name).toBeGreaterThanOrEqual(
        tier.countedMin,
      );
      expect(tier.requiredRoles, name).toContain('whatsapp');
    }
  });

  it('proposes accent-only editing for Basic and every color + both radii for Pro', () => {
    expect(TIERS.basic.editableTokens).toEqual(['color-accent']);
    expect(TIERS.pro.editableTokens).toEqual([
      ...COLOR_TOKENS.map((t) => `color-${t}`),
      'radius-pill',
      'radius-card',
    ]);
  });

  it('does not count floating-whatsapp or marquee', () => {
    expect([...UNCOUNTED_SLOTS].sort()).toEqual([
      'floating-whatsapp',
      'marquee',
    ]);
    expect(
      countedSlots([
        'navbar',
        'hero',
        'marquee',
        'services',
        'floating-whatsapp',
        'footer',
      ]),
    ).toEqual(['navbar', 'hero', 'services', 'footer']);
  });
});

describe('blueprints and role → slot resolution', () => {
  it('allows exactly the roles each tier lists', async () => {
    for (const tier of TIER_NAMES) {
      const blueprint = await loadBlueprint('service-landing', tier);
      expect(Object.keys(blueprint.roles).sort(), tier).toEqual(
        tierRoles(tier).sort(),
      );
    }
  });

  it('resolves barbería roles to its slots', async () => {
    const pro = slotRoles(
      await loadBlueprint('service-landing', 'pro'),
      'barberia',
    );
    expect(pro.get('services')).toBe('catalog');
    expect(pro.get('gallery')).toBe('proof');
    expect(pro.get('locations')).toBe('contact');
    expect(pro.get('navbar')).toBe('header');
    expect(pro.get('floating-whatsapp')).toBe('whatsapp');
    const basic = slotRoles(
      await loadBlueprint('service-landing', 'basic'),
      'barberia',
    );
    expect(basic.has('gallery')).toBe(false);
    expect(basic.has('team')).toBe(false);
  });

  it('fails on a vertical without a role map', async () => {
    const blueprint = await loadBlueprint('service-landing', 'basic');
    expect(() => slotRoles(blueprint, 'restaurante')).toThrow(
      /no role map for vertical "restaurante"/,
    );
  });

  it('rejects slots and variants the tier does not allow', async () => {
    const basic = await loadManifest(manifestFile('barberia-base-oscuro-v1'));
    const withProContact: Manifest = {
      ...basic,
      sections: basic.sections.map((s) =>
        s.slot === 'locations'
          ? { slot: 'locations', variant: 'with-contact' }
          : s,
      ),
    };
    await expect(compileManifest(withProContact)).rejects.toThrow(
      /role "contact" \(locations\) allows variant single in basic/,
    );
    const withGallery: Manifest = {
      ...basic,
      sections: [
        ...basic.sections.slice(0, 3),
        { slot: 'gallery', variant: 'grid' },
        ...basic.sections.slice(3),
      ],
    };
    await expect(compileManifest(withGallery)).rejects.toThrow(
      /slot "gallery" fills no role of the service-landing\.basic blueprint/,
    );
  });
});

describe('compiled Basic template', () => {
  let compiled: CompiledTemplate;
  let target: ValidationTarget;
  beforeAll(async () => {
    compiled = await compileFile(manifestFile('barberia-base-oscuro-v1'));
    target = targetFromCompiled(compiled);
  });

  const rulesOf = async (t: ValidationTarget) =>
    validateTarget(t, await libraryFingerprints()).findings.map((f) => f.rule);

  it('emits template.meta.json and leaves the .grapesjs custom object untouched', () => {
    const dir = mkdtempSync(resolve(tmpdir(), 'lz-meta-'));
    writeCompiled({ ...compiled, outDir: dir });
    const meta = JSON.parse(
      readFileSync(resolve(dir, 'template.meta.json'), 'utf8'),
    ) as TemplateMeta;
    const { slots, ...rest } = meta;
    expect(rest).toEqual({
      id: 'barberia-base-oscuro-v1',
      tier: 'basic',
      family: 'service-landing',
      vertical: 'barberia',
      archetype: 'essential',
      exclusive: false,
      seoProfile: 'basic',
      schemaType: 'BarberShop',
      editableTokens: ['color-accent'],
    });
    expect(slots.map((s) => `${s.slot}:${s.variant}`)).toEqual(
      compiled.manifest.sections.map((s) => `${s.slot}:${s.variant}`),
    );
    const role = (slot: string) => slots.find((s) => s.slot === slot);
    expect(role('navbar')?.role).toBe('header');
    expect(role('services')?.role).toBe('catalog');
    expect(role('locations')?.role).toBe('contact');
    expect(role('floating-whatsapp')).toMatchObject({
      role: 'whatsapp',
      counted: false,
    });
    expect(slots.filter((s) => s.counted).length).toBe(7);
    const project = JSON.parse(
      readFileSync(resolve(dir, 'barberia-base-oscuro-v1.grapesjs'), 'utf8'),
    ) as { custom: unknown };
    expect(project.custom).toEqual({
      projectType: 'web',
      id: 'barberia-base-oscuro-v1',
    });
  });

  it('reports a missing floating-whatsapp, required role and section count', async () => {
    const without = (slots: string[]): ValidationTarget => ({
      ...target,
      sections: target.sections.filter((s) => !slots.includes(s.slot)),
    });
    expect(await rulesOf(without(['floating-whatsapp']))).toEqual(['whatsapp']);
    const rules = await rulesOf(without(['faq', 'about']));
    expect(rules).toContain('tier-count');
    expect(rules).toContain('required-role');
  });

  it('requires the FAQ <details> to stay open for the editor', async () => {
    const closed: ValidationTarget = {
      ...target,
      sections: target.sections.map((s) =>
        s.slot === 'faq'
          ? {
              ...s,
              rendered: s.rendered.replaceAll('<details open=""', '<details'),
            }
          : s,
      ),
    };
    const findings = validateTarget(
      closed,
      await libraryFingerprints(),
    ).findings;
    expect(findings.map((f) => f.rule)).toEqual(['faq-details']);
    const faq = target.sections.find((x) => x.slot === 'faq');
    const source = readFileSync(faq?.htmlFile ?? '', 'utf8').split('\n');
    expect(findings[0].file).toBe(`sections/faq/${faq?.variant}/section.html`);
    expect(findings[0].line).toBe(
      source.findIndex((l) => l.includes('<details open')) + 1,
    );
  });
});

describe('theme ownership', () => {
  it('rejects a Pro theme on a Basic template and a Basic theme on a Pro one', async () => {
    const others = await libraryFingerprints();
    const basic = await loadManifest(manifestFile('barberia-base-claro-v1'));
    const withPro = targetFromCompiled(
      await compileManifest(
        { ...basic, theme: 'oxido' },
        manifestFile('barberia-base-claro-v1'),
      ),
    );
    const finding = validateTarget(withPro, others).findings.find(
      (f) => f.rule === 'theme-ownership',
    );
    expect(finding?.message).toMatch(/theme "oxido" belongs to pro templates/);
    expect(finding?.file).toBe('templates/barberia-base-claro-v1.ts');

    const pro = await loadManifest(manifestFile('barberia-norte-v1'));
    const withBasic = targetFromCompiled(
      await compileManifest({ ...pro, theme: 'trazo-solar' }),
    );
    expect(
      validateTarget(withBasic, others).findings.map((f) => f.rule),
    ).toContain('theme-ownership');
  });
});
