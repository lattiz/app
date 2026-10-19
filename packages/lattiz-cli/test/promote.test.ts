import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { harvestFolder } from '../src/design/harvest';
import {
  findCandidate,
  libraryRoot,
  nextId,
  readIndex,
  reindex,
  setStatus,
  writeJson,
} from '../src/design/library';
import { promote, type Runners } from '../src/design/promote';
import type { Runner } from '../src/design/promote/kit';
import type { Candidate } from '../src/design/types';
import { CliError } from '../src/lib/errors';

const KIT = resolve(import.meta.dirname, '../../template-kit');
const FIX = resolve(import.meta.dirname, 'fixtures/executive-vision-dental');

let lib: string;
let kit: string;

const candidate = (): Candidate => ({
  id: 'dental-executive-vision-01',
  giro: 'dental',
  source: 'stitch',
  status: 'collected',
  tags: ['glass'],
  license_ref: 'x',
  created_at: '2026-10-18T00:00:00.000Z',
  stitch: {},
});

/** A library with the fixture harvested, and a copy of the kit files promote writes. */
beforeEach(() => {
  lib = mkdtempSync(join(tmpdir(), 'design-lib-'));
  process.env.LATTIZ_DESIGN_LIBRARY = lib;
  const dir = join(lib, 'stitch/dental/dental-executive-vision-01');
  mkdirSync(dir, { recursive: true });
  cpSync(join(FIX, 'design.md'), join(dir, 'design.md'));
  cpSync(join(FIX, 'screen.html'), join(dir, 'source.html'));
  const c = candidate();
  writeJson(join(dir, 'candidate.json'), c);
  const loc = findCandidate(c.id);
  writeJson(join(dir, 'harvest.json'), harvestFolder(c, dir));
  setStatus(loc, 'harvested');
  // <tmp>/a/b/kit so the manifest's ../../apps/api path stays inside the sandbox.
  const root = mkdtempSync(join(tmpdir(), 'kit-copy-'));
  kit = join(root, 'a/b/kit');
  mkdirSync(join(kit, 'palettes'), { recursive: true });
  mkdirSync(join(kit, 'catalog'), { recursive: true });
  mkdirSync(join(kit, 'sections'), { recursive: true });
  for (const f of [
    'palettes/seeds.ts',
    'palettes/library.ts',
    'catalog/catalog.manifest.json',
  ])
    cpSync(join(KIT, f), join(kit, f));
  process.env.LATTIZ_PROMOTE_KIT = kit;
});
afterEach(() => {
  delete process.env.LATTIZ_DESIGN_LIBRARY;
  delete process.env.LATTIZ_PROMOTE_KIT;
});

const ok: Runner = () => ({ status: 0, out: '' });
const runners = (kitRun: Runner = ok): Runners => ({ kit: kitRun, lattiz: ok });
const gateError = (fn: () => unknown): string => {
  try {
    fn();
  } catch (e) {
    if (e instanceof CliError) return `${e.message} ${e.hint ?? ''}`;
    throw e;
  }
  return '';
};
const seeds = () => readFileSync(join(kit, 'palettes/seeds.ts'), 'utf8');
const base = {
  palette: true,
  fonts: false,
  section: false,
  regenerateManifest: false,
  dryRun: false,
};

describe('library flag', () => {
  it('numbers ids, filters the index and walks the status chain', () => {
    expect(nextId('dental', 'executive-vision')).toBe(
      'dental-executive-vision-02',
    );
    const loc = findCandidate('dental-executive-vision-01');
    setStatus(loc, 'shelved');
    expect(() => setStatus(loc, 'promoted')).toThrow(
      /no puede pasar a promoted/,
    );
    setStatus(loc, 'harvested');
    reindex();
    const idx = readIndex();
    expect(idx.by_status.harvested).toBe(1);
    expect(idx.candidates[0]).toMatchObject({
      harvested: true,
      tags: ['glass'],
    });
    expect(libraryRoot()).toBe(lib);
  });
});

describe('promote --palette (hermetic: fake runner, copied kit files)', () => {
  it('appends the seed, flags the candidate and records the palette id', () => {
    const loc = findCandidate('dental-executive-vision-01');
    const r = promote(loc, base, runners());
    expect(r.kept).toBe(true);
    expect(r.refs.palette).toBe('pal-clinical-eminence');
    expect(seeds()).toMatch(/'pal-clinical-eminence': \{[\s\S]*bg: '#08132a'/);
    expect(seeds()).toMatch(/\/\/ Stitch: dental-executive-vision-01/);
    expect(findCandidate(loc.candidate.id).candidate).toMatchObject({
      status: 'promoted',
      promoted: { palette: 'pal-clinical-eminence' },
    });
  });

  it('--dry-run passes the gates and leaves the files and the flag untouched', () => {
    const before = seeds();
    const loc = findCandidate('dental-executive-vision-01');
    const r = promote(loc, { ...base, dryRun: true }, runners());
    expect(r.kept).toBe(false);
    expect(seeds()).toBe(before);
    expect(findCandidate(loc.candidate.id).candidate.status).toBe('harvested');
  });

  it('rejects a palette that fails AA before touching anything', () => {
    const file = join(
      libraryRoot(),
      'stitch/dental/dental-executive-vision-01/harvest.json',
    );
    const h = JSON.parse(readFileSync(file, 'utf8'));
    h.palette.aa = { ok: false, problems: ['accent-text 2.1:1'] };
    writeFileSync(file, JSON.stringify(h));
    const before = seeds();
    const run: Runner = () => {
      throw new Error('no gate should run');
    };
    expect(() =>
      promote(findCandidate('dental-executive-vision-01'), base, runners(run)),
    ).toThrow(/AA/);
    expect(seeds()).toBe(before);
  });

  it('restores seeds.ts and keeps the flag when the distance gate fails', () => {
    const before = seeds();
    const failing: Runner = (args) =>
      args.join(' ') === 'kit:palettes --write'
        ? { status: 1, out: 'dental  ✗ 1 par(es) < 15' }
        : { status: 0, out: '' };
    const loc = findCandidate('dental-executive-vision-01');
    let error: unknown;
    try {
      promote(loc, base, runners(failing));
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(CliError);
    expect((error as CliError).message).toMatch(/kit:palettes/);
    expect(seeds()).toBe(before);
    expect(findCandidate(loc.candidate.id).candidate.status).toBe('harvested');
  });

  it('restores everything when the golden snapshot moves', () => {
    const before = seeds();
    let snapshots = 0;
    const moving: Runner = (args) =>
      args[0] === 'kit:verify-snapshot'
        ? { status: 1, out: snapshots++ === 0 ? '' : '  ✗ x: theme cambió' }
        : { status: 0, out: '' };
    expect(() =>
      promote(
        findCandidate('dental-executive-vision-01'),
        base,
        runners(moving),
      ),
    ).toThrow(/kit:verify-snapshot/);
    expect(seeds()).toBe(before);
  });

  it('tolerates a snapshot that was already red as long as it does not move', () => {
    const red: Runner = (args) =>
      args[0] === 'kit:verify-snapshot'
        ? {
            status: 1,
            out: '  ✗ a: theme cambió\n  ✗ snapshot con 1 diferencia(s)',
          }
        : { status: 0, out: '' };
    expect(
      promote(findCandidate('dental-executive-vision-01'), base, runners(red))
        .kept,
    ).toBe(true);
  });

  it('only promotes harvested candidates and needs something to promote', () => {
    const loc = findCandidate('dental-executive-vision-01');
    setStatus(loc, 'rejected');
    expect(gateError(() => promote(loc, base, runners()))).toMatch(
      /solo se promueve/,
    );
    const fresh = findCandidate('dental-executive-vision-01');
    fresh.candidate.status = 'harvested';
    expect(
      gateError(() => promote(fresh, { ...base, palette: false }, runners())),
    ).toMatch(/Indica --palette/);
  });

  it('reuses a font pair the kit already has, without writes', () => {
    const r = promote(
      findCandidate('dental-executive-vision-01'),
      { ...base, palette: false, fonts: true },
      runners(),
    );
    expect(r.refs.fonts).toBe('playfair-display+inter');
    expect(r.gates.fonts[0]).toMatch(/ya existe/);
  });

  it('keeps a section only with --regenerate-manifest, never mixed with a palette otherwise', () => {
    expect(
      gateError(() =>
        promote(
          findCandidate('dental-executive-vision-01'),
          { ...base, section: true },
          runners(),
        ),
      ),
    ).toMatch(/--regenerate-manifest/);
  });
});
