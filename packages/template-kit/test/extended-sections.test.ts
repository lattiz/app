import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { paths, sectionDir } from '../src/lib/paths';
import { isLegacyVariant } from '../src/spec/catalog';

/** Every variant outside the legacy catalog: the contract new variants follow (WP6). */
const EXTENDED = readdirSync(paths.sections, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((slot) =>
    readdirSync(resolve(paths.sections, slot.name), { withFileTypes: true })
      .filter((v) => v.isDirectory() && !isLegacyVariant(slot.name, v.name))
      .map((v) => [slot.name, v.name] as const),
  );

/** core.css classes at 10–12 px: new variants keep every text ≥ 14 px. */
const SMALL_CORE = ['lz-index', 'lz-chip', 'lz-sticker', 'lz-label'];

async function render(slot: string, variant: string): Promise<Element> {
  const meta = await loadSectionMeta(slot, variant);
  const giro = copySource(slot, meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir(slot, variant), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData(slot, giro, business, 'demo', meta.sample),
    { business, index: '02', source: file },
  );
}

describe.runIf(EXTENDED.length > 0)('extended variants', () => {
  it.each(EXTENDED)(
    '%s/%s declares tiers, intent and archetypes',
    async (slot, variant) => {
      const meta = await loadSectionMeta(slot, variant);
      expect(meta.tiers?.length).toBeGreaterThan(0);
      expect(meta.intent?.length).toBeGreaterThan(20);
      expect(meta.archetypes?.length).toBeGreaterThan(0);
    },
  );

  it.each(EXTENDED)(
    '%s/%s renders its root, sized images with alt and no small core text',
    async (slot, variant) => {
      const root = await render(slot, variant);
      expect(root.getAttribute('data-lz-slot')).toBe(slot);
      expect(root.getAttribute('data-lz-variant')).toBe(variant);
      expect(root.querySelector('form, script, iframe')).toBeNull();
      for (const img of root.querySelectorAll('img')) {
        expect(img.getAttribute('width')).toMatch(/^\d+$/);
        expect(img.getAttribute('height')).toMatch(/^\d+$/);
        expect(img.getAttribute('alt')?.length).toBeGreaterThan(3);
      }
      for (const cls of SMALL_CORE)
        expect(root.querySelector(`.${cls}`), cls).toBeNull();
      expect(root.querySelector('[style]')).toBeNull();
    },
  );

  it.each(EXTENDED.filter(([slot]) => slot === 'hero'))(
    '%s/%s has the only <h1>, a high-priority image and the WhatsApp CTA first',
    async (slot, variant) => {
      const root = await render(slot, variant);
      expect(root.querySelectorAll('h1').length).toBe(1);
      expect(root.hasAttribute('data-lz-fit')).toBe(true);
      expect(root.querySelector('img')?.getAttribute('fetchpriority')).toBe(
        'high',
      );
      expect(root.querySelector('a')?.getAttribute('href')).toMatch(
        /^https:\/\/wa\.me\//,
      );
    },
  );

  it.each(EXTENDED.filter(([slot]) => slot !== 'hero'))(
    '%s/%s has no <h1>',
    async (slot, variant) => {
      expect((await render(slot, variant)).querySelector('h1')).toBeNull();
    },
  );
});
