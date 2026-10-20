import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The hero rebuilt from Stitch (tienda-caramelo-pop-bandas-01): copy on the left, arch photo with a round sticker on the right. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('hero', 'arch-sticker');
  const giro = copySource('hero', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('hero', 'arch-sticker'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('hero', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('hero', 'arch-sticker'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('hero/arch-sticker', () => {
  it('has the reference anatomy: eyebrow, one h1, text, two CTAs, trust line and arch photo', async () => {
    const root = await render();
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(
      root.querySelector('.lz-hero-arch-sticker__eyebrow')?.textContent?.length,
    ).toBeGreaterThan(3);
    expect(
      root.querySelectorAll('.lz-hero-arch-sticker__actions a'),
    ).toHaveLength(2);
    expect(
      root.querySelector('.lz-hero-arch-sticker__note')?.textContent,
    ).toMatch(/\S/);
    expect(
      root.querySelector('.lz-hero-arch-sticker__sticker')?.innerHTML,
    ).toMatch(/EE\. UU\./);
  });

  it('is the LCP image: fetchpriority high, no lazy, numeric size', async () => {
    const img = (await render()).querySelector(
      'img.lz-hero-arch-sticker__image',
    );
    expect(img?.getAttribute('fetchpriority')).toBe('high');
    expect(img?.hasAttribute('loading')).toBe(false);
    expect(img?.getAttribute('width')).toBe('1000');
    expect(img?.getAttribute('height')).toBe('1250');
  });

  it('drops the optional sticker and note when the copy has none', async () => {
    const root = await render({ sticker: '', note: '' });
    expect(root.querySelector('.lz-hero-arch-sticker__sticker')).toBeNull();
    expect(root.querySelector('.lz-hero-arch-sticker__note')).toBeNull();
  });

  it('keeps the no-JS and token-only contract', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    expect(css()).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/,
    );
  });
});
