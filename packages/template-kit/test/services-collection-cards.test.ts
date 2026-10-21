import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** Collections rebuilt from Stitch (estetica-alheli-colecciones-01): photo cards with CSS numbers. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('services', 'collection-cards');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('services', 'collection-cards'),
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
    resolve(sectionDir('services', 'collection-cards'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('services/collection-cards', () => {
  it('renders a centered header and photo cards with name, duration and price', async () => {
    const root = await render();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(
      root.querySelector('.lz-services-collection-cards__rule'),
    ).not.toBeNull();
    const cards = root.querySelectorAll(
      'article.lz-services-collection-cards__card',
    );
    expect(cards.length).toBeGreaterThanOrEqual(3);
    for (const card of cards) {
      const img = card.querySelector('img');
      expect(img?.getAttribute('width')).toBe('800');
      expect(img?.getAttribute('height')).toBe('640');
      expect(img?.getAttribute('alt')?.length).toBeGreaterThan(3);
      expect(img?.getAttribute('loading')).toBe('lazy');
      expect(
        card.querySelector('.lz-services-collection-cards__num'),
      ).not.toBeNull();
      expect(card.querySelector('h3')?.textContent?.length).toBeGreaterThan(2);
      expect(
        card.querySelector('.lz-services-collection-cards__price')?.textContent,
      ).toMatch(/\$/);
      expect(
        card.querySelector('.lz-services-collection-cards__duration')
          ?.textContent,
      ).toMatch(/min/);
      expect(
        card
          .querySelector('a.lz-services-collection-cards__hit')
          ?.getAttribute('href'),
      ).toMatch(/wa\.me/);
    }
  });

  it('drops intro, photo plate, duration and link when the copy has none', async () => {
    const root = await render({
      intro: '',
      prices: [
        {
          name: 'Minimal',
          price: '$850',
          description: 'Acabado mate sobre una base nude.',
        },
      ],
    });
    expect(root.querySelector('.lz-services-collection-cards__intro')).toBeNull();
    expect(root.querySelector('img')).toBeNull();
    expect(
      root.querySelector('.lz-services-collection-cards__num'),
    ).toBeNull();
    expect(
      root.querySelector('.lz-services-collection-cards__duration'),
    ).toBeNull();
    expect(root.querySelector('.lz-services-collection-cards__hit')).toBeNull();
  });

  it('numbers cards with CSS only and stays on theme tokens within budget', () => {
    const sheet = css();
    expect(sheet).toMatch(/counter-increment: lz-collection/);
    expect(sheet).toMatch(/counter\(lz-collection, decimal-leading-zero\)/);
    expect(sheet).toMatch(/repeat\(auto-fit, minmax\(240px, 1fr\)\)/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
    expect(gzipSync(sheet).length).toBeLessThan(1200);
  });

  it('has no JS, style attribute, iframe or form', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
