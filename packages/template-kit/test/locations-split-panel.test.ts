import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The contact rebuilt from Stitch (barberia-abeto-indice-01): channels and tiles on the left, framed map on the right. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('locations', 'split-panel');
  const giro = copySource('locations', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('locations', 'split-panel'), 'section.html');
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
    resolve(sectionDir('locations', 'split-panel'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';
const TOKENS_ONLY = /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/;

describe('locations/split-panel', () => {
  it('has the WhatsApp, phone and email channels, address and hours tiles', async () => {
    const root = await render();
    const panel = root.querySelector('.lz-locations-split-panel__panel');
    expect(
      panel
        ?.querySelector('a.lz-locations-split-panel__whatsapp')
        ?.getAttribute('href'),
    ).toMatch(/wa\.me/);
    expect(panel?.querySelector('a[href^="tel:"]')).not.toBeNull();
    expect(panel?.querySelector('a[href^="mailto:"]')).not.toBeNull();
    expect(
      panel?.querySelectorAll('.lz-locations-split-panel__tile'),
    ).toHaveLength(2);
  });

  it('draws a decorative plan with the branch pin and links to the directions', async () => {
    const root = await render();
    expect(root.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(
      root.querySelector('.lz-locations-split-panel__pin')?.textContent,
    ).toMatch(/\S/);
    expect(root.querySelector('iframe')).toBeNull();
    expect(
      root
        .querySelector('a.lz-locations-split-panel__directions')
        ?.getAttribute('href'),
    ).toMatch(/^https:/);
  });

  it('drops the optional kicker and hours label', async () => {
    const root = await render({ kicker: '', hoursLabel: '' });
    expect(root.querySelector('.lz-locations-split-panel__kicker')).toBeNull();
  });

  it('keeps the no-JS and token-only contract', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    expect(css()).not.toMatch(TOKENS_ONLY);
  });
});
