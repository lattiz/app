import { describe, expect, it } from 'vitest';
import {
  dice,
  isMatch,
  layoutDistance,
  skeleton,
  MATCH_STRUCTURE,
  type Geometry,
} from '../src/design/fidelity';
import { resolvePatterns } from '../src/design/harvest/resolve';
import type { SectionPattern } from '../src/design/types';

const card = (x: number, y: number): Geometry['rects'][number] => ({
  kind: 'box',
  x,
  y,
  w: 0.4,
  h: 0.3,
});
const text = (x: number, y: number, w = 0.3): Geometry['rects'][number] => ({
  kind: 'text',
  x,
  y,
  w,
  h: 0.05,
});

/** Four cards in two columns under a centered title (the Stitch FAQ). */
const grid: Geometry = {
  w: 1280,
  h: 700,
  rects: [
    text(0.3, 0.08, 0.4),
    card(0.08, 0.3),
    card(0.52, 0.3),
    card(0.08, 0.65),
    card(0.52, 0.65),
    text(0.1, 0.35),
    text(0.54, 0.35),
  ],
};
/** The same copy as one column of full-width rows with a left title (the kit's list). */
const list: Geometry = {
  w: 1280,
  h: 900,
  rects: [
    text(0.04, 0.08, 0.3),
    ...[0.25, 0.4, 0.55, 0.7, 0.85].map((y) => ({
      kind: 'box' as const,
      x: 0.03,
      y,
      w: 0.94,
      h: 0.1,
    })),
    text(0.05, 0.28),
    text(0.05, 0.43),
  ],
};

describe('layout geometry', () => {
  it('reads the skeleton: boxes and columns', () => {
    expect(skeleton(grid)).toEqual({ boxes: 4, columns: 2 });
    expect(skeleton(list).columns).toBe(0);
  });
  it('is 0 against itself and large against a different skeleton', () => {
    expect(layoutDistance(grid, grid)).toBe(0);
    expect(layoutDistance(grid, list)).toBeGreaterThan(0.4);
  });
  it('tolerates a card that is a few pixels off', () => {
    const moved = {
      ...grid,
      rects: grid.rects.map((r) => ({ ...r, x: r.x + 0.01 })),
    };
    expect(layoutDistance(grid, moved)).toBeLessThan(MATCH_STRUCTURE);
  });
  it('is symmetric and handles empty maps', () => {
    expect(layoutDistance(grid, list)).toBe(layoutDistance(list, grid));
    expect(dice(new Uint8Array(4), new Uint8Array(4))).toBe(1);
  });
  it('needs the height to be plausible too, not only the layout', () => {
    expect(isMatch(0.05, 1.1)).toBe(true);
    expect(isMatch(0.05, 2)).toBe(false);
    expect(isMatch(0.3, 1)).toBe(false);
  });
});

describe('"already exists" is a measured verdict, not a layout guess', () => {
  const faq: SectionPattern = {
    slot: 'faq',
    layout: 'card-grid',
    ref: 'preguntas',
    columns: 2,
    items: 4,
    hasImage: false,
    hasStat: false,
    hasQuote: false,
    surface: 'flat',
    mappable: true,
  };
  const entry = (
    verdict: 'match' | 'different',
    best: string,
    structure: number,
  ) => ({
    ref: 'preguntas',
    slot: 'faq',
    theme: 't',
    measured: [
      { variant: best, structure, heightRatio: 1, match: verdict === 'match' },
    ],
    best,
    verdict,
    thresholds: {
      structure: 0.15,
      heightRatio: [0.7, 1.4] as [number, number],
    },
  });

  it('without a measurement it is a candidate to verify, and it must be rebuilt unless proven equal', () => {
    const r = resolvePatterns([faq], 'x');
    expect(r.sections[0].existing).toBeUndefined();
    expect(r.sections[0].reuse_candidate).toBe('faq/grid');
    expect(r.rebuild[0].reason).toMatch(/sin medir/);
  });
  it('a measured match is the only way to say "already exists"', () => {
    const r = resolvePatterns([faq], 'x', {
      preguntas: entry('match', 'faq/numbered-cards', 0.09),
    });
    expect(r.sections[0].existing).toBe('faq/numbered-cards');
    expect(r.rebuild).toHaveLength(0);
  });
  it('a measured difference sends it to hand reconstruction with the numbers', () => {
    const r = resolvePatterns([faq], 'x', {
      preguntas: entry('different', 'faq/grid', 0.23),
    });
    expect(r.sections[0].existing).toBeUndefined();
    expect(r.sections[0].reuse_candidate).toBeUndefined();
    expect(r.rebuild[0].reason).toMatch(
      /ninguna variante del kit se parece.*faq\/grid.*0\.23/,
    );
  });
});
