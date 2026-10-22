import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The gallery rebuilt from Stitch (floreria-botanical-editorial-system-01): two staggered framed columns. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('gallery', 'staggered-frames');
  const giro = copySource('gallery', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('gallery', 'staggered-frames'),
    'section.html',
  );
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
    resolve(sectionDir('gallery', 'staggered-frames'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('gallery/staggered-frames', () => {
  it('renders a framed 4:5 figure per photo with caption, tag, alt and sizes', async () => {
    const root = await render();
    expect(root.id).toBe('galeria');
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const items = root.querySelectorAll(
      'figure.lz-gallery-staggered-frames__item',
    );
    expect(items).toHaveLength(8);
    for (const item of items) {
      const img = item.querySelector('img');
      expect(img?.getAttribute('alt')?.length).toBeGreaterThan(3);
      expect(img?.getAttribute('width')).toBe('800');
      expect(img?.getAttribute('height')).toBe('1000');
      expect(item.querySelector('.lz-gallery-staggered-frames__frame')).not.toBeNull();
      expect(
        item.querySelector('.lz-gallery-staggered-frames__name')?.textContent
          ?.length,
      ).toBeGreaterThan(2);
      expect(
        item.querySelector('.lz-gallery-staggered-frames__tag')?.textContent
          ?.length,
      ).toBeGreaterThan(2);
    }
  });

  it('drops the intro and tags when the copy has none', async () => {
    const root = await render({
      intro: '',
      items: [
        {
          image: 'gallery-01.jpg',
          caption: 'Ramo',
          alt: 'Ramo de temporada en un jarrón',
        },
        {
          image: 'gallery-02.jpg',
          caption: 'Rosas',
          alt: 'Docena de rosas con follaje',
        },
      ],
    });
    expect(root.querySelector('.lz-gallery-staggered-frames__intro')).toBeNull();
    expect(root.querySelectorAll('.lz-gallery-staggered-frames__item')).toHaveLength(
      2,
    );
    expect(root.querySelector('.lz-gallery-staggered-frames__tag')).toBeNull();
  });

  it('staggers the right column with padding, not transform, and only with eight photos', () => {
    const sheet = css();
    expect(sheet).toMatch(/nth-child\(8\):last-child/);
    expect(sheet).toMatch(/nth-child\(even\)/);
    expect(sheet).toMatch(/padding-top: calc\(64px \* var\(--lz-space\)\)/);
    expect(sheet).toMatch(/aspect-ratio: 4 \/ 5/);
    expect(sheet).not.toMatch(/translateY|translate3d|scale\(/);
    expect(sheet).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/,
    );
    expect(gzipSync(sheet).length).toBeLessThan(1229);
  });

  it('has no JS, style attribute, iframe or form', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
