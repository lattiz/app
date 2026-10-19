import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { harvestFolder } from '../src/design/harvest';
import { findCandidate, setStatus, writeJson } from '../src/design/library';
import { promote } from '../src/design/promote';
import { kitRunner, snapshotFailures } from '../src/design/promote/kit';
import type { Candidate, Harvest } from '../src/design/types';
import { CliError } from '../src/lib/errors';

/**
 * Runs the real gates against the real kit (~2 min): opt in with LATTIZ_DESIGN_E2E=1. They write to
 * palettes/ and sections/ for a moment and always restore, so keep them off the default `test`
 * (turbo runs the kit's own tests in parallel).
 */
const KIT = resolve(import.meta.dirname, '../../template-kit');
const FIX = resolve(import.meta.dirname, 'fixtures/executive-vision-dental');
const read = (f: string) => readFileSync(join(KIT, f), 'utf8');

const setup = (mutate?: (h: Harvest) => void) => {
  const lib = mkdtempSync(join(tmpdir(), 'design-e2e-'));
  process.env.LATTIZ_DESIGN_LIBRARY = lib;
  const dir = join(lib, 'stitch/dental/dental-executive-vision-01');
  mkdirSync(dir, { recursive: true });
  cpSync(join(FIX, 'design.md'), join(dir, 'design.md'));
  cpSync(join(FIX, 'screen.html'), join(dir, 'source.html'));
  const c: Candidate = {
    id: 'dental-executive-vision-01',
    giro: 'dental',
    source: 'stitch',
    status: 'collected',
    tags: [],
    license_ref: 'x',
    created_at: '2026-10-18T00:00:00.000Z',
    stitch: {},
  };
  writeJson(join(dir, 'candidate.json'), c);
  const h = harvestFolder(c, dir);
  mutate?.(h);
  writeJson(join(dir, 'harvest.json'), h);
  const loc = findCandidate(c.id);
  setStatus(loc, 'harvested');
  return loc;
};

const base = {
  palette: false,
  fonts: false,
  section: false,
  regenerateManifest: false,
  dryRun: true,
};

describe.runIf(process.env.LATTIZ_DESIGN_E2E === '1')(
  'promote against the real kit',
  () => {
    beforeEach(() => {
      delete process.env.LATTIZ_PROMOTE_KIT;
    });
    afterEach(() => {
      delete process.env.LATTIZ_DESIGN_LIBRARY;
    });

    it('dry-run of the fixture palette passes every gate and leaves the kit byte-identical', () => {
      const files = [
        'palettes/seeds.ts',
        'palettes/library.ts',
        'catalog/catalog.manifest.json',
      ];
      const before = files.map(read);
      const r = promote(
        setup(),
        { ...base, palette: true, fonts: true },
        undefined,
      );
      expect(r.gates.palette).toContain(
        'distancia ΔE00 ≥ 15 por giro (kit:palettes)',
      );
      expect(files.map(read)).toEqual(before);
    }, 300_000);

    it('refuses a palette too close to an existing one and restores seeds.ts', () => {
      const before = read('palettes/seeds.ts');
      // pal-nopal's ground and accent, tagged for dental: ΔE00 distance 0.
      const loc = setup((h) => {
        h.palette.bg = '#F1F4EC';
        h.palette.text = '#1D261C';
        h.palette.accent = '#3E7B2E';
        delete h.palette.surface;
        delete h.palette.surface2;
      });
      let msg = '';
      try {
        promote(loc, { ...base, palette: true, dryRun: false });
      } catch (e) {
        msg = `${(e as CliError).message} ${(e as CliError).hint ?? ''}`;
      }
      expect(msg).toMatch(/distancia|kit:palettes/);
      expect(read('palettes/seeds.ts')).toBe(before);
      expect(findCandidate('dental-executive-vision-01').candidate.status).toBe(
        'harvested',
      );
    }, 300_000);

    it('a promoted test section, then reverted, leaves kit:verify-snapshot identical', () => {
      const sections = join(KIT, 'sections');
      const dirs = () =>
        readdirSync(sections).flatMap((s) =>
          readdirSync(join(sections, s)).map((v) => `${s}/${v}`),
        );
      const snapBefore = snapshotFailures(kitRunner);
      const dirsBefore = dirs();
      const r = promote(setup(), {
        ...base,
        section: true,
        pattern: 'about/quote',
      });
      expect(r.kept).toBe(false);
      expect(
        r.gates.section.some((g) => g.startsWith('kit probe about/')),
      ).toBe(true);
      expect(dirs()).toEqual(dirsBefore);
      expect(snapshotFailures(kitRunner)).toEqual(snapBefore);
    }, 600_000);
  },
);
