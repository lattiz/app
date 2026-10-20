import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The contact rebuilt from Stitch (tienda-caramelo-pop-bandas-01): channels, address and hours beside an arch photo. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('locations', 'arch-visit');
  const giro = copySource('locations', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('locations', 'arch-visit'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('locations', giro, business, 'demo', {
      ...meta.sample,
      ...extra,
    }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('locations', 'arch-visit'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('locations/arch-visit', () => {
  it('has the three channels, one address tile and one hours tile per branch', async () => {
    const root = await render();
    const actions = root.querySelectorAll(
      '.lz-locations-arch-visit__actions a',
    );
    expect(actions).toHaveLength(3);
    expect(actions[0].getAttribute('href')).toMatch(/wa\.me/);
    expect(actions[1].getAttribute('href')).toMatch(/^tel:/);
    expect(actions[2].getAttribute('href')).toMatch(/^mailto:/);
    const branches = root.querySelectorAll('.lz-locations-arch-visit__branch');
    expect(branches.length).toBeGreaterThanOrEqual(1);
    for (const branch of branches)
      expect(
        branch.querySelectorAll('.lz-locations-arch-visit__tile'),
      ).toHaveLength(2);
    expect(
      root.querySelector('.lz-locations-arch-visit__map')?.getAttribute('href'),
    ).toMatch(/^https:/);
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('paints the arch photo only when the copy has an image', async () => {
    expect((await render()).querySelector('figure')).toBeNull();
    const root = await render({
      image: 'locations.jpg',
      imageAlt: 'Fachada de la tienda',
    });
    expect(root.querySelector('figure img')?.getAttribute('alt')).toBe(
      'Fachada de la tienda',
    );
    expect(
      root.querySelector('.lz-locations-arch-visit__caption-title')
        ?.textContent,
    ).toMatch(/conocernos/);
  });

  it('has no JS, no form, no iframe and no literal colors', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    expect(css()).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/,
    );
  });
});
