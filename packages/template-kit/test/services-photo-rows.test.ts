import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** Product rows rebuilt from Stitch (restaurante-trigo-brasa-tandas-01): photo, name + price, tags. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('services', 'photo-rows');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('services', 'photo-rows'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('services', giro, business, 'demo', {
      ...meta.sample,
      ...extra,
    }),
    { business, index: '03', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('services', 'photo-rows'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('services/photo-rows', () => {
  it('renders photo cards with name, price, description and tags, plus promos', async () => {
    const root = await render();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const cards = root.querySelectorAll('li.lz-services-photo-rows__card');
    expect(cards.length).toBeGreaterThanOrEqual(3);
    for (const card of cards) {
      const img = card.querySelector('img');
      expect(img?.getAttribute('width')).toBe('400');
      expect(img?.getAttribute('height')).toBe('400');
      expect(img?.getAttribute('alt')?.length).toBeGreaterThan(3);
      expect(card.querySelector('h3')?.textContent?.length).toBeGreaterThan(2);
      expect(
        card.querySelector('.lz-services-photo-rows__price')?.textContent,
      ).toMatch(/\$/);
      expect(
        card.querySelectorAll('.lz-services-photo-rows__tag').length,
      ).toBeGreaterThan(0);
    }
    expect(
      root
        .querySelector('a.lz-services-photo-rows__promo-cta')
        ?.getAttribute('href'),
    ).toMatch(/wa\.me/);
  });

  it('drops photo, tags, intro and promos when the copy has none', async () => {
    const root = await render({
      intro: '',
      promos: [],
      prices: [
        { name: 'Concha', price: '$25', description: 'Pan dulce del día.' },
      ],
    });
    expect(root.querySelector('img')).toBeNull();
    expect(root.querySelector('.lz-services-photo-rows__tags')).toBeNull();
    expect(root.querySelector('.lz-services-photo-rows__intro')).toBeNull();
    expect(root.querySelector('.lz-services-photo-rows__promos')).toBeNull();
    expect(
      root.querySelector('.lz-services-photo-rows__name')?.textContent,
    ).toBe('Concha');
  });

  it('centers leftover cards, stays on tokens and within the CSS budget', () => {
    const sheet = css();
    expect(sheet).toMatch(/justify-content: center/);
    expect(sheet).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/,
    );
    expect(gzipSync(sheet).length).toBeLessThan(1400);
  });

  it('has no JS, style attribute, iframe or form', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
