import { describe, expect, it } from 'vitest';
import { hueDistance } from '../src/lib/color';
import {
  SIMILARITY_WEIGHTS,
  normalizeHeadline,
  similarity,
  type Fingerprint,
} from '../src/lib/similarity';
import { TIERS } from '../src/tiers';

const base: Fingerprint = {
  id: 'a',
  vertical: 'barberia',
  tier: 'pro',
  theme: 'oxido',
  fonts: 'anton+space-grotesk',
  shape: '2px|2px|1px|none',
  hero: 'image-bg',
  services: 'price-list',
  accentHue: 13,
  headline: 'corte de lujo actitud de calle',
  pairs: [
    'navbar:x',
    'hero:image-bg',
    'marquee:x',
    'services:price-list',
    'footer:x',
  ],
  order: ['navbar', 'hero', 'marquee', 'services', 'footer'],
};

describe('similarity', () => {
  it('weights add up to 1', () => {
    const total = Object.values(SIMILARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1);
  });

  it('is 1 for the same composition, variants, theme, fonts and shape', () => {
    expect(similarity(base, { ...base, id: 'b' }).score).toBe(1);
  });

  it('a pure reskin passes Basic but fails Pro', () => {
    const reskin: Fingerprint = {
      ...base,
      id: 'c',
      theme: 't',
      fonts: 'f',
      shape: '0px|0px|3px|hard-offset',
    };
    const score = similarity(base, reskin).score;
    expect(score).toBeCloseTo(0.55);
    expect(score).toBeLessThanOrEqual(TIERS.basic.similarityLimit);
    expect(score).toBeGreaterThan(TIERS.pro.similarityLimit);
  });

  it('counts the hero and services variants on their own', () => {
    const other: Fingerprint = {
      ...base,
      id: 'd',
      theme: 't',
      fonts: 'f',
      shape: 's',
      hero: 'split',
      services: 'cards',
      pairs: [
        'navbar:x',
        'hero:split',
        'marquee:x',
        'services:cards',
        'footer:x',
      ],
    };
    const s = similarity(base, other);
    expect(s.hero).toBe(0);
    expect(s.services).toBe(0);
    expect(s.sections).toBeCloseTo(3 / 7);
    expect(s.score).toBeCloseTo(0.25 * (3 / 7) + 0.05, 2);
  });

  it('is 0 with nothing in common', () => {
    expect(
      similarity(base, {
        ...base,
        id: 'e',
        theme: 't',
        fonts: 'f',
        shape: 's',
        hero: 'h',
        services: 'v',
        pairs: ['z:z'],
        order: ['z'],
      }).score,
    ).toBe(0);
  });
});

describe('uniqueness helpers', () => {
  it('measures hue distance around the wheel', () => {
    expect(hueDistance(10, 350)).toBe(20);
    expect(hueDistance(338, 13)).toBe(35);
    expect(hueDistance(0, 180)).toBe(180);
  });

  it('normalizes headlines so markup, accents and punctuation do not hide a copy', () => {
    expect(
      normalizeHeadline(
        'Corte de <span class="lz-title__serif">lujo</span>.<br>Actitud de calle.',
      ),
    ).toBe('corte de lujo actitud de calle');
    expect(normalizeHeadline('¡CORTE de LUJO! Actitud… de calle')).toBe(
      'corte de lujo actitud de calle',
    );
    expect(normalizeHeadline('Tu corte, <em>a tiempo</em>')).toBe(
      'tu corte a tiempo',
    );
  });
});
