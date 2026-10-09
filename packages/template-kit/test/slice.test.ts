import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDocument } from '../src/lib/dom';
import { KIT_ROOT } from '../src/lib/paths';
import { sliceSlots } from '../src/lib/slice';

const fixtureHtml = readFileSync(
  resolve(KIT_ROOT, 'fixtures/oxido/index.html'),
  'utf8',
);

describe('sliceSlots', () => {
  it('finds every ÓXIDO slot in document order with its variant and region', () => {
    const slices = sliceSlots(parseDocument(fixtureHtml).window.document);
    expect(slices.map((s) => `${s.region}:${s.slot}/${s.variant}`)).toEqual([
      'header:navbar/urban-luxe',
      'main:hero/image-bg',
      'main:marquee/urban-luxe',
      'main:about/urban-luxe',
      'main:services/urban-luxe',
      'main:locations/urban-luxe',
      'main:team/urban-luxe',
      'main:testimonials/urban-luxe',
      'main:floating-whatsapp/urban-luxe',
      'footer:footer/urban-luxe',
    ]);
  });

  it('collects the classes used inside each slot, root included', () => {
    const hero = sliceSlots(parseDocument(fixtureHtml).window.document).find(
      (s) => s.slot === 'hero',
    );
    expect(hero?.classes.has('lz-hero')).toBe(true);
    expect(hero?.classes.has('lz-hero__overlay')).toBe(true);
    expect(hero?.classes.has('lz-footer')).toBe(false);
  });

  it('keeps nested slots inside their parent', () => {
    const doc = parseDocument(
      '<main><section data-lz-slot="a" data-lz-variant="x"><div data-lz-slot="inner"></div></section><section data-lz-slot="b"></section></main>',
    ).window.document;
    expect(sliceSlots(doc).map((s) => [s.slot, s.variant])).toEqual([
      ['a', 'x'],
      ['b', null],
    ]);
  });
});
