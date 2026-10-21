import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The hero rebuilt from Stitch (barberia-abeto-indice-01): index rule, wide photo with an overlapping panel, facts strip. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('hero', 'index-panel');
  const giro = copySource('hero', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('hero', 'index-panel'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('hero', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('hero', 'index-panel'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';
const TOKENS_ONLY = /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/;

describe('hero/index-panel', () => {
  it('has the anatomy: index bar, one h1, text, WhatsApp CTA first and a facts strip', async () => {
    const root = await render();
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(
      root.querySelector('.lz-hero-index-panel__bar')?.textContent,
    ).toMatch(/\S/);
    expect(
      root.querySelector('.lz-hero-index-panel__panel a')?.getAttribute('href'),
    ).toMatch(/wa\.me/);
    expect(root.querySelectorAll('.lz-hero-index-panel__fact')).toHaveLength(3);
  });

  it('is the LCP image and a fit hero: fetchpriority high, no lazy, numeric size, data-lz-fit', async () => {
    const root = await render();
    const img = root.querySelector('img.lz-hero-index-panel__image');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
    expect(img?.hasAttribute('loading')).toBe(false);
    expect(img?.getAttribute('width')).toBe('1600');
    expect(img?.getAttribute('height')).toBe('800');
    expect(root.hasAttribute('data-lz-fit')).toBe(true);
  });

  it('drops the optional bar, secondary link and facts when the copy has none', async () => {
    const root = await render({ kicker: '', secondaryCta: '', info: [] });
    expect(root.querySelector('.lz-hero-index-panel__bar')).toBeNull();
    expect(root.querySelector('.lz-hero-index-panel__link')).toBeNull();
  });

  it('keeps the no-JS and token-only contract', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    expect(css()).not.toMatch(TOKENS_ONLY);
  });
});
