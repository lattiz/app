import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The catalog rebuilt from Stitch (tienda-caramelo-pop-bandas-01): one full-width band per product, alternating sides. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('services', 'alternating-bands');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('services', 'alternating-bands'),
    'section.html',
  );
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('services', giro, business, 'demo', {
      ...meta.sample,
      ...extra,
    }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('services', 'alternating-bands'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('services/alternating-bands', () => {
  it('renders one band per product with photo, name, description, price and order link', async () => {
    const root = await render();
    const bands = root.querySelectorAll('article.lz-services-bands__band');
    expect(bands.length).toBeGreaterThanOrEqual(4);
    for (const band of bands) {
      expect(
        band.querySelector('img')?.getAttribute('alt')?.length,
      ).toBeGreaterThan(3);
      expect(band.querySelector('.lz-services-bands__num')).not.toBeNull();
      expect(band.querySelector('h3')?.textContent?.length).toBeGreaterThan(2);
      expect(
        band.querySelector('.lz-services-bands__price')?.textContent,
      ).toMatch(/\$/);
      expect(
        band.querySelector('a.lz-services-bands__pick')?.getAttribute('href'),
      ).toMatch(/wa\.me/);
    }
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('shows chips and tag only for the products that have them', async () => {
    const root = await render();
    const bands = Array.from(root.querySelectorAll('.lz-services-bands__band'));
    expect(
      bands[0].querySelectorAll('.lz-services-bands__chips li'),
    ).toHaveLength(3);
    expect(bands[2].querySelector('.lz-services-bands__chips')).toBeNull();
  });

  it('numbers and alternates with CSS only, so neither is content', () => {
    const sheet = css();
    expect(sheet).toMatch(/counter-increment: lz-band/);
    expect(sheet).toMatch(/counter\(lz-band, decimal-leading-zero\)/);
    expect(sheet).toMatch(/nth-child\(even\)/);
    expect(sheet).toMatch(/prefers-reduced-motion/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
  });

  it('has no JS, style attribute, iframe or form', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
