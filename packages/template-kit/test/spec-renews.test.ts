import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { KIT_ROOT } from '../src/lib/paths';
import { renewalPair, type Fingerprint } from '../src/lib/similarity';
import { libraryFingerprints } from '../src/lib/targets';
import {
  planSpec,
  specStem,
  specTargets,
  type SpecPlan,
} from '../src/spec/compile';
import { lockFromPlan, readLock, type SpecLock } from '../src/spec/lock';
import { parseSpec, type Spec } from '../src/spec/schema';

const OLD = 'barberia-la-insignia';
const specPath = (stem: string) =>
  resolve(KIT_ROOT, 'specs', `${stem}.spec.json`);
const oldSpec = (): Spec => {
  const parsed = parseSpec(JSON.parse(readFileSync(specPath(OLD), 'utf8')));
  if (!parsed.ok) throw new Error('el spec de La Insignia no es válido');
  return parsed.spec;
};
const renewal = (extra: Partial<Spec> = {}): Spec => ({
  ...oldSpec(),
  version: 2,
  renews: { spec: OLD },
  ...extra,
});
const errors = (p: Awaited<ReturnType<typeof planSpec>>) =>
  ('tiers' in p ? p.problems : p.problems).filter((x) => x.level === 'error');
const tierOf = (p: SpecPlan, tier: 'pro' | 'basico') =>
  p.tiers.find((t) => t.tier === tier)!;

describe('spec renews', () => {
  let library: Fingerprint[] = [];
  let oldLock: SpecLock;
  let scratch: string;
  beforeAll(async () => {
    library = await libraryFingerprints();
    oldLock = readLock(resolve(KIT_ROOT, 'specs', `${OLD}.lock.json`))!;
    scratch = mkdtempSync(join(tmpdir(), 'lz-renews-'));
  });
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  it('versions the twin ids and the stem', () => {
    const spec = renewal();
    expect(specTargets(spec).map((t) => t.id)).toEqual([
      'barberia-la-insignia-v2',
      'barberia-base-la-insignia-v2',
    ]);
    expect(specStem(spec)).toBe('barberia-la-insignia-v2');
    expect(specStem(oldSpec())).toBe(OLD);
    expect(
      parseSpec({
        ...oldSpec(),
        id: 'barberia-x-v2',
        idBase: undefined,
        twin: undefined,
        tier: 'pro',
        version: 2,
      }).ok,
    ).toBe(false);
  });

  it('inherits palette and font pair per tier and coexists with the template it renews', async () => {
    const plan = await planSpec(renewal(), library);
    expect(errors(plan)).toEqual([]);
    const p = plan as SpecPlan;
    for (const [tier, oldId] of [
      ['pro', 'barberia-la-insignia-v1'],
      ['basico', 'barberia-base-la-insignia-v1'],
    ] as const) {
      const t = tierOf(p, tier);
      expect(t.resolved.palette).toBe(oldLock.tiers[oldId].palette);
      expect(t.resolved.fontPair).toBe(oldLock.tiers[oldId].fontPair);
      expect(t.renews).toBe(oldId);
      expect(t.manifest.renews).toBe(oldId);
      expect(t.fingerprint.renews).toBe(oldId);
      const old = library.find((f) => f.id === oldId)!;
      expect(renewalPair(t.fingerprint, old)).toBe(true);
    }
  });

  it('without renews the old template keeps its identity to itself', async () => {
    const plain: Spec = { ...renewal(), renews: undefined };
    const plan = await planSpec(plain, library);
    const pro = 'tiers' in plan ? tierOf(plan, 'pro') : undefined;
    const old = oldLock.tiers['barberia-la-insignia-v1'];
    expect(pro?.resolved.palette).not.toBe(old.palette);
    expect(pro?.resolved.fontPair).not.toBe(old.fontPair);
    expect(
      errors(plan)
        .map((e) => e.message)
        .join('\n'),
    ).toMatch(/hero\/photo-ribbon ya lo usa otra plantilla Pro/);
  });

  it('keep limits what is inherited', async () => {
    const plan = await planSpec(
      renewal({ renews: { spec: OLD, keep: ['palette'] } }),
      library,
    );
    expect(errors(plan)).toEqual([]);
    const pro = tierOf(plan as SpecPlan, 'pro');
    expect(pro.resolved.palette).toBe(
      oldLock.tiers['barberia-la-insignia-v1'].palette,
    );
    expect(
      pro.choices.some((c) =>
        c.includes('heredada de barberia-la-insignia-v1'),
      ),
    ).toBe(true);
    expect(
      pro.choices.some(
        (c) => c.startsWith('tipografía') && c.includes('heredada'),
      ),
    ).toBe(false);
    const full = (await planSpec(renewal(), library)) as SpecPlan;
    expect(
      tierOf(full, 'pro').choices.some(
        (c) =>
          c ===
          'tipografía: "gilda-display+hanken-grotesk" (heredada de barberia-la-insignia-v1)',
      ),
    ).toBe(true);
  });

  it('builds from its own lock once the old spec is gone', async () => {
    const first = (await planSpec(renewal(), library)) as SpecPlan;
    const lock = lockFromPlan(first, specPath(`${OLD}-v2`));
    expect(lock.tiers['barberia-la-insignia-v2'].renews).toBe(
      'barberia-la-insignia-v1',
    );
    const again = await planSpec(renewal(), library, lock, {
      specsDir: scratch,
    });
    expect(errors(again)).toEqual([]);
    expect(tierOf(again as SpecPlan, 'pro').manifest.renews).toBe(
      'barberia-la-insignia-v1',
    );
  });

  it('fails without the old spec and without its own lock', async () => {
    const plan = await planSpec(renewal(), library, undefined, {
      specsDir: scratch,
    });
    expect(errors(plan).map((e) => e.path)).toContain('renews.spec');
  });

  it('rejects renewing itself or another giro', async () => {
    const self = await planSpec(
      { ...oldSpec(), renews: { spec: OLD } },
      library,
    );
    expect(errors(self)[0]?.message).toMatch(/mismo spec/);
    const other = await planSpec(
      renewal({ renews: { spec: 'restaurante-casa-rosa-mantequilla' } }),
      library,
    );
    expect(errors(other)[0]?.message).toMatch(/otro giro/);
  });
});
