import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The services table rebuilt from Stitch (barberia-abeto-indice-01): numbered rows between rules, one inverted featured row. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('services', 'index-table');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('services', 'index-table'), 'section.html');
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
    resolve(sectionDir('services', 'index-table'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';
const TOKENS_ONLY = /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/;

describe('services/index-table', () => {
  it('renders one numbered row per service with name, description and price', async () => {
    const root = await render();
    const rows = root.querySelectorAll('.lz-services-index-table__row');
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(
        row.querySelector('.lz-services-index-table__name')?.textContent,
      ).toMatch(/\S/);
      expect(
        row.querySelector('.lz-services-index-table__price strong')
          ?.textContent,
      ).toMatch(/\$/);
    }
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('features only the row that has a tag and drops the optional duration', async () => {
    const root = await render();
    expect(root.querySelectorAll('.lz-services-index-table__tag')).toHaveLength(
      1,
    );
    const plain = await render({
      prices: [
        { name: 'Corte', price: '$300', description: 'Corte a tijera.' },
      ],
    });
    expect(plain.querySelector('.lz-services-index-table__tag')).toBeNull();
    expect(
      plain.querySelector('.lz-services-index-table__duration'),
    ).toBeNull();
  });

  it('closes with a WhatsApp CTA only when the copy has one', async () => {
    expect(
      (await render())
        .querySelector('a.lz-services-index-table__cta')
        ?.getAttribute('href'),
    ).toMatch(/wa\.me/);
    expect(
      (await render({ cta: '' })).querySelector(
        '.lz-services-index-table__cta',
      ),
    ).toBeNull();
  });

  it('keeps the no-JS and token-only contract', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    expect(css()).not.toMatch(TOKENS_ONLY);
  });
});
