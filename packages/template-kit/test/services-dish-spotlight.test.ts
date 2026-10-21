import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The featured dish + short menu rebuilt from Stitch (restaurante-claveria-verde-stitch-01-01). */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('services', 'dish-spotlight');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('services', 'dish-spotlight'),
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
    resolve(sectionDir('services', 'dish-spotlight'), 'section.css'),
    'utf8',
  );
}

describe('services/dish-spotlight', () => {
  it('renders the featured dish with photo, name, price and order link', async () => {
    const root = await render();
    const feature = root.querySelector(
      'article.lz-services-dish-spotlight__feature',
    );
    expect(
      feature?.querySelector('img')?.getAttribute('alt')?.length,
    ).toBeGreaterThan(3);
    expect(feature?.querySelector('h3')?.textContent?.length).toBeGreaterThan(
      2,
    );
    expect(
      feature?.querySelector('.lz-services-dish-spotlight__price')?.textContent,
    ).toMatch(/\$/);
    expect(
      feature
        ?.querySelector('a.lz-services-dish-spotlight__cta')
        ?.getAttribute('href'),
    ).toMatch(/wa\.me/);
    expect(
      feature?.querySelectorAll('.lz-services-dish-spotlight__chips li'),
    ).toHaveLength(4);
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('renders the short menu rows and keeps badge, chips and promos optional', async () => {
    const root = await render();
    expect(
      root.querySelectorAll('.lz-services-dish-spotlight__item').length,
    ).toBeGreaterThanOrEqual(4);
    const bare = await render({
      badge: '',
      chips: [],
      promos: [],
      chipsLabel: '',
    });
    expect(bare.querySelector('.lz-services-dish-spotlight__badge')).toBeNull();
    expect(bare.querySelector('.lz-services-dish-spotlight__chips')).toBeNull();
    expect(bare.querySelector('.lz-services-dish-spotlight__promos')).toBeNull();
  });

  it('uses tokens only and no JS, style attribute, iframe or form', async () => {
    const sheet = css();
    expect(sheet).toMatch(/max-width: 992px/);
    expect(sheet).toMatch(/max-width: 480px/);
    expect(sheet).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/,
    );
    expect(
      (await render()).querySelector('script, [style], iframe, form'),
    ).toBeNull();
  });
});
