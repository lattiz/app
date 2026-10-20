import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The gallery rebuilt from Stitch (tienda-caramelo-pop-bandas-01): an asymmetric mosaic of five repeating shapes. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('gallery', 'collage');
  const giro = copySource('gallery', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('gallery', 'collage'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('gallery', giro, business, 'demo', {
      ...meta.sample,
      ...extra,
    }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('gallery', 'collage'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('gallery/collage', () => {
  it('renders a figure per photo with alt text and a caption', async () => {
    const root = await render();
    const items = root.querySelectorAll('figure.lz-gallery-collage__item');
    expect(items.length).toBeGreaterThanOrEqual(5);
    for (const item of items) {
      expect(
        item.querySelector('img')?.getAttribute('alt')?.length,
      ).toBeGreaterThan(3);
      expect(
        item.querySelector('figcaption')?.textContent?.length,
      ).toBeGreaterThan(2);
    }
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('is asymmetric by CSS: five shapes that repeat, with no uniform grid', () => {
    const sheet = css();
    for (const n of ['5n + 1', '5n + 2', '5n + 4', '5n'])
      expect(sheet).toContain(`nth-child(${n})`);
    expect(sheet).toMatch(/border-radius: 50%/);
    expect(sheet).toMatch(/repeat\(12,/);
  });

  it('keeps the hover zoom behind hover/pointer and reduced-motion guards', () => {
    const sheet = css();
    expect(sheet).toMatch(/@media \(hover: hover\) and \(pointer: fine\)/);
    expect(sheet).toMatch(/prefers-reduced-motion/);
    expect(sheet).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/,
    );
  });

  it('has no JS, style attribute, iframe or form', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
