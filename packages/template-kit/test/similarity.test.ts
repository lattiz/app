import { describe, expect, it } from 'vitest';
import { similarity, type Fingerprint } from '../src/lib/similarity';

const base: Fingerprint = {
  id: 'a',
  vertical: 'barberia',
  theme: 'urban-dark',
  fonts: 'Anton + Space Grotesk',
  pairs: ['navbar:x', 'hero:x', 'marquee:x', 'about:x', 'footer:x'],
  order: ['navbar', 'hero', 'marquee', 'about', 'footer'],
};

describe('similarity', () => {
  it('is 1 for the same composition, theme and fonts', () => {
    expect(similarity(base, { ...base, id: 'b' }).score).toBe(1);
  });

  it('weights sections, order, theme and fonts', () => {
    const other: Fingerprint = {
      ...base,
      id: 'c',
      theme: 'bone-blue',
      fonts: 'Bebas Neue + DM Sans',
      pairs: ['navbar:x', 'hero:x', 'about:x', 'footer:x'],
      order: ['navbar', 'about', 'hero', 'footer'],
    };
    const s = similarity(base, other);
    expect(s.sections).toBeCloseTo(4 / 5);
    expect(s.order).toBeCloseTo(3 / 4);
    expect(s.score).toBeCloseTo(0.5 * 0.8 + 0.1 * 0.75, 3);
  });

  it('reskinning alone (same sections and order) stays at the 0.6 limit', () => {
    expect(
      similarity(base, { ...base, id: 'd', theme: 't', fonts: 'f' }).score,
    ).toBe(0.6);
  });

  it('is 0 with nothing in common', () => {
    expect(
      similarity(base, {
        ...base,
        id: 'e',
        theme: 't',
        fonts: 'f',
        pairs: ['z:z'],
        order: ['z'],
      }).score,
    ).toBe(0);
  });
});
