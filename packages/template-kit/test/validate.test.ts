import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { contrastRatio, findColorLiterals, parseColor } from '../src/lib/color';
import { compileFile } from '../src/lib/compile';
import { listThemes, loadTheme } from '../src/lib/load';
import { TIERS } from '../src/tiers';
import { KIT_ROOT, paths } from '../src/lib/paths';
import {
  libraryFingerprints,
  targetFromCompiled,
  targetFromDist,
} from '../src/lib/targets';
import {
  checkTheme,
  validateTarget,
  type RuleId,
  type ValidationReport,
} from '../src/lib/validate';

describe('validator on the library templates', () => {
  const reports = new Map<string, ValidationReport>();
  beforeAll(async () => {
    const others = await libraryFingerprints();
    for (const id of [
      'barberia-oxido-v1',
      'barberia-norte-v1',
      'barberia-base-oscuro-v1',
      'barberia-base-claro-v1',
    ]) {
      const compiled = await compileFile(resolve(paths.templates, `${id}.ts`));
      reports.set(id, validateTarget(targetFromCompiled(compiled), others));
    }
  });

  it('passes the Pro (ÓXIDO, Norte) and Basic (oscuro, claro) templates in both themes', () => {
    for (const [id, report] of reports) expect(report.findings, id).toEqual([]);
  });

  it("scores similarity only within the same vertical and tier, with that tier's limit", () => {
    const pro = reports.get('barberia-norte-v1');
    expect(pro?.similarityLimit).toBe(TIERS.pro.similarityLimit);
    expect(pro?.similarity.map((s) => s.other)).toEqual(['barberia-oxido-v1']);
    expect(pro?.similarity[0].score).toBeLessThanOrEqual(0.5);

    const basic = reports.get('barberia-base-claro-v1');
    expect(basic?.similarityLimit).toBe(TIERS.basic.similarityLimit);
    expect(basic?.similarity.map((s) => s.other)).toEqual([
      'barberia-base-oscuro-v1',
    ]);
    // Same structure, different theme and fonts: a reskin on purpose.
    expect(basic?.similarity[0].score).toBe(0.6);
  });
});

describe('validator on the deliberately broken fixture', () => {
  let report: ValidationReport;
  beforeAll(async () => {
    report = validateTarget(
      targetFromDist(resolve(KIT_ROOT, 'fixtures/broken')),
      await libraryFingerprints(),
    );
  });
  const has = (rule: RuleId, pattern?: RegExp) =>
    report.findings.some(
      (f) =>
        f.rule === rule &&
        (!pattern || pattern.test(`${f.file}:${f.line ?? ''} ${f.message}`)),
    );

  it('fails every rule with the offending file', () => {
    const rules: RuleId[] = [
      'color-literal',
      'inline-style',
      'external-image',
      'slot-attrs',
      'utility-class',
      'script',
      'h1-count',
      'img-alt',
      'reduced-motion',
      'breakpoint',
      'radius-card',
      'contrast',
      'anchor',
      'project',
      'tier-count',
      'required-role',
      'whatsapp',
      'form',
      'heading-order',
      'img-size',
      'empty-link',
      'head',
      'faq-details',
    ];
    for (const rule of rules) expect(has(rule), rule).toBe(true);
  });

  it('points the tier-aware markup findings at section.html:line', () => {
    expect(has('form', /hero\/bad\/section\.html:9 /)).toBe(true);
    expect(has('heading-order', /hero\/bad\/section\.html:4 .*h1 to h4/)).toBe(
      true,
    );
    expect(has('img-size', /hero\/bad\/section\.html:5 /)).toBe(true);
    expect(has('empty-link', /hero\/bad\/section\.html:8 .*no href/)).toBe(
      true,
    );
    expect(
      has('whatsapp', /floating-whatsapp\/bad\/section\.html:2 .*wa\.me/),
    ).toBe(true);
    expect(has('faq-details', /faq\/bad\/section\.html:1 /)).toBe(true);
    expect(has('tier-count', /2 counted sections .*pro needs 8–10/)).toBe(true);
    expect(has('required-role', /pro requires role "proof"/)).toBe(true);
    expect(has('head', /needs lang/)).toBe(true);
    expect(has('head', /<title>/)).toBe(true);
    expect(has('head', /meta name="description"/)).toBe(true);
  });

  it('points CSS findings at file:line', () => {
    expect(has('color-literal', /section\.css:2 background: #ffffff/)).toBe(
      true,
    );
    expect(has('breakpoint', /section\.css:21 .*768px/)).toBe(true);
    expect(has('reduced-motion', /section\.css:9 .*lz-hero__image/)).toBe(true);
  });

  it('distinguishes Tailwind utilities from other non-BEM classes', () => {
    expect(has('utility-class', /"mt-4" looks like a Tailwind utility/)).toBe(
      true,
    );
    expect(has('utility-class', /"heroBox" is not an lz-\* BEM class/)).toBe(
      true,
    );
  });

  it('catches inline styles both in source and as GrapesJS #id rules', () => {
    expect(has('inline-style', /style=""/)).toBe(true);
    expect(has('inline-style', /#i3kd/)).toBe(true);
  });
});

describe('color rules', () => {
  it('finds literals but ignores tokens, keywords, strings and url()', () => {
    expect(findColorLiterals('1px solid rgba(0,0,0,.2)')).toEqual(['rgba(…)']);
    expect(
      findColorLiterals(
        'color-mix(in srgb, var(--lz-color-ink) 28%, transparent)',
      ),
    ).toEqual([]);
    expect(findColorLiterals('url(#red) "tomato" currentColor')).toEqual([]);
    expect(findColorLiterals('#25D366')).toEqual(['#25D366']);
    expect(findColorLiterals('white')).toEqual(['white']);
  });

  it('resolves var() and color-mix() like the browser', () => {
    const resolveVar = (n: string) =>
      n === '--lz-color-text' ? '#F4F1EA' : undefined;
    const mixed = parseColor(
      'color-mix(in srgb, var(--lz-color-text) 14%, transparent)',
      resolveVar,
    );
    expect(mixed?.r).toBeCloseTo(244);
    expect(mixed?.b).toBeCloseTo(234);
    expect(mixed?.a).toBeCloseTo(0.14);
    const white = parseColor('#fff');
    const black = parseColor('#000');
    expect(white && black && contrastRatio(white, black)).toBeCloseTo(21);
  });

  it('accepts every shipped theme and rejects oval cards', () => {
    for (const name of listThemes())
      expect(checkTheme(loadTheme(name), name), name).toEqual([]);
    const papel = loadTheme('trazo-papel');
    const oval = {
      ...papel,
      shape: { ...papel.shape, radiusCard: '48px' },
    };
    expect(checkTheme(oval, 'x').map((f) => f.rule)).toEqual(['radius-card']);
  });
});
