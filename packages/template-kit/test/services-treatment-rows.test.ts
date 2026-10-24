import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The treatment rows rebuilt from Stitch (clinica-cauce-etapas-menu-01): one panel, a booking CTA per row. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('services', 'treatment-rows');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('services', 'treatment-rows'), 'section.html');
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
    resolve(sectionDir('services', 'treatment-rows'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('services/treatment-rows', () => {
  it('renders one panel of rows with name, description, price and a WhatsApp booking link', async () => {
    const root = await render();
    expect(root.id).toBe('servicios');
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const rows = root.querySelectorAll('li.lz-services-treatment-rows__row');
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(
      root.querySelector('ul.lz-services-treatment-rows__panel'),
    ).not.toBeNull();
    for (const row of rows) {
      expect(row.querySelector('h3')?.textContent?.length).toBeGreaterThan(2);
      expect(
        row.querySelector('.lz-services-treatment-rows__price')?.textContent,
      ).toMatch(/\$/);
      expect(
        row
          .querySelector('a.lz-services-treatment-rows__cta')
          ?.getAttribute('href'),
      ).toMatch(/wa\.me/);
    }
    expect(
      root.querySelector('.lz-services-treatment-rows__unit')?.textContent,
    ).toMatch(/sesión/);
  });

  it('drops unit and promos when the copy has none', async () => {
    const root = await render({ unit: '', promos: [], kicker: '', intro: '' });
    expect(root.querySelector('.lz-services-treatment-rows__unit')).toBeNull();
    expect(root.querySelector('.lz-services-treatment-rows__promos')).toBeNull();
    expect(root.querySelector('.lz-services-treatment-rows__kicker')).toBeNull();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('has no numbered rows and uses theme tokens only', () => {
    const sheet = css();
    expect(sheet).not.toMatch(/counter-increment/);
    expect(sheet).toMatch(/lz-services-treatment-rows__panel/);
    expect(sheet).toMatch(/prefers-reduced-motion/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
    expect(sheet).not.toMatch(/backdrop-filter/);
  });

  it('is static: no script, form or inline style', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
